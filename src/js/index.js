(function() {

var version = '0.0.11';
var api = new ripple.RippleAPI();
var mnemonic = new Mnemonic("english");
var seed = null;
var bip32RootKey = null;
var bip32ExtendedKey = null;
var network = bitcoinjs.bitcoin.networks.bitcoin;
var phraseChangeTimeoutEvent = null;
var generationProcesses = [];
var timer;
var explorer = 'https://bithomp.com/explorer/';
var blobQR = new QRCode(document.getElementById("blobQR"), {
  width : 256,
  height : 256,
  useSVG: true
});
var submitUrlQR = new QRCode(document.getElementById("submitUrlQR"), {
  width : 100,
  height : 100,
  useSVG: true
});

var DOM = {};
DOM.termsFields = $('.terms');
DOM.termsButton = $('#terms_button');
DOM.agreedTermsFields = $('.terms-agreed');
DOM.switchOnline = $('#switch_online');
DOM.switchOffline = $('#switch_offline');
DOM.offlineFields = $('.offline-fields');
DOM.serverFields = $('.server');
DOM.server = $('#server');
DOM.serverNotConnectedFields = $('.server-not-connected');
DOM.serverConnect = $('#server_connect');
DOM.serverFeedback = $('#server_feedback');
DOM.chooseWallet = $('#choose-wallet-type');
DOM.switchSecret = $('#switch_secret');
DOM.switchMnemonic = $('#switch_mnemonic');
DOM.mnemonicFields = $('.mnemonic');
DOM.phrase = $("#phrase");
DOM.secretFields = $('.secret');
DOM.secret = $('#secret');
DOM.secretHidden = $('#secret_hidden');
DOM.mnemonic = $('#phrase');
DOM.feedback = $('#feedback');
DOM.address = $('#address');
DOM.privkey = $('#privkey');
DOM.pubkey = $('#pubkey');
DOM.addressFeedback = $('#account_feedback');
DOM.setAddressFields = $('.set-address');
DOM.setAddress = $('#set_address');
DOM.signAddressFields = $('.sign-address');
DOM.signAddress = $('#sign_address');
DOM.signAddressFeedback = $('#sign_address_feedback');
DOM.readyToSignFields = $('#ready-to-sign');
DOM.switchPayment = $('#switch_payment');
DOM.switchTrustline = $('#switch_trustline');
DOM.switchEscrow = $('#switch_escrow');
DOM.switchSettings = $('#switch_settings');
DOM.paymentFields = $('.payment-fields');
DOM.paymentRecipient = $('#payment_recipient');
DOM.paymentDestinationTag = $('#payment_destination_tag');
DOM.paymentAmount = $('#payment_amount');
DOM.paymentCurrency = $('#payment_currency');
DOM.paymentCounterparty = $('#payment_counterparty');
DOM.paymentButtonPay = $('#payment_pay');
DOM.trustlineFields = $('.trustline-fields');
DOM.trustlineCurrency = $('#trustline_currency');
DOM.trustlineCounterparty = $('#trustline_counterparty');
DOM.trustlineLimit = $('#trustline_limit');
DOM.trustlineButtonAdd = $('#trustline_add');
DOM.trustlineButtonRemove = $('#trustline_remove');
DOM.escrowFields = $('.escrow-fields');
DOM.escrowOwner = $('#escrow_owner');
DOM.escrowSequence = $('#escrow_sequence');
DOM.escrowButtonExecute = $('#escrow_execute');
DOM.escrowButtonCancel = $('#escrow_cancel');
DOM.fee = $('#fee');
DOM.sequence = $('#sequence');
DOM.memo = $('#memo');
DOM.txFeedback = $('#tx_feedback');
DOM.txBlob = $('#txBlob');
DOM.thisYear = $('#thisYear');
DOM.settingsFields = $('.settings-fields');
DOM.settingsDomain = $('#settings_domain');
DOM.settingsEmail = $('#settings_email');
DOM.settingsMessageKey = $('#settings_messageKey');
DOM.settingsRegularKey = $('#settings_regularKey');
DOM.settingsButtonSet = $('#settings_set');
DOM.settingsButtonUnset = $('#settings_unset');
DOM.settingsDomainFields = $('.settings-domain');
DOM.settingsGravatarFields = $('.settings-gravatar');
DOM.settingsMessageKeyFields = $('.settings-messageKey');
DOM.settingsRegularKeyFields = $('.settings-regularKey');
DOM.settingsRequireDestinationTagFields = $('.settings-requireDestinationTag');
DOM.settingsDisallowIncomingXRPFields = $('.settings-disallowIncomingXRP');
DOM.settingsDefaultRippleFields = $('.settings-defaultRipple');
DOM.settingsDisableMasterKeyFields = $('.settings-disableMasterKey');
DOM.version = $('#version');
DOM.submitLink = $('#submit-link');
DOM.settingsSelect = $('#select_settings');

function init() {
  thisYear();
  DOM.termsButton.on("click", termsAgreed);
  DOM.phrase.on("input", delayedPhraseChanged);
  hideValidationError();
  DOM.switchOnline.on("click", switchOnline);
  DOM.switchOffline.on("click", switchOffline);
  setAddress();
  switchOnline();
  switchOffline();
  DOM.serverConnect.on("click", serverConnect);
  DOM.switchSecret.on("click", switchSecret);
  DOM.switchMnemonic.on("click", switchMnemonic);
  DOM.secret.on("input focusout", secretChanged);
  DOM.secretHidden.on("click", secretHiddenClicked);
  switchSecret();
  switchMnemonic();
  DOM.switchPayment.on("click", switchPayment);
  switchPayment();
  DOM.switchTrustline.on("click", switchTrustline);
  switchTrustline();
  DOM.switchEscrow.on("click", switchEscrow);
  switchEscrow();
  DOM.switchSettings.on("click", switchSettings);
  switchSettings();
  DOM.setAddress.on("click", setAddress);
  DOM.signAddress.on("input", signAddressChanged);
  DOM.paymentButtonPay.on("click", paymentButtonPayClicked);
  DOM.trustlineButtonAdd.on("click", trustlineButtonAddClicked);
  DOM.trustlineButtonRemove.on("click", trustlineButtonRemoveClicked);
  DOM.escrowButtonExecute.on("click", escrowButtonExecuteClicked);
  DOM.escrowButtonCancel.on("click", escrowButtonCancelClicked);
  DOM.settingsButtonSet.on("click", settingsButtonSetClicked);
  DOM.settingsButtonUnset.on("click", settingsButtonUnsetClicked);
  DOM.txBlob.on("click", txBlobClicked);
  DOM.paymentAmount.on("keydown", paymentAmountChanged);
  DOM.trustlineLimit.on("keydown", trustlineLimitChanged);
  DOM.fee.on("keydown", feeChanged);
  DOM.settingsSelect.on("change", settingsSelected);
  settingsSelected();

  showVersion();
}

function settingsSelected() {
  var selectedSetting = DOM.settingsSelect.val();
  if (selectedSetting == 'domain') {
    DOM.settingsGravatarFields.hide();
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsDomainFields.show();
  } else if (selectedSetting == 'gravatar') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsGravatarFields.show();
  } else if (selectedSetting == 'messageKey') {
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsMessageKeyFields.show();
  } else if (selectedSetting == 'regularKey') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsRegularKeyFields.show();
  } else if (selectedSetting == 'requireDestinationTag') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.show();
  } else if (selectedSetting == 'disallowIncomingXRP') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsDisallowIncomingXRPFields.show();
  } else if (selectedSetting == 'defaultRipple') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDisableMasterKeyFields.hide();
    DOM.settingsDefaultRippleFields.show();
  } else if (selectedSetting == 'disableMasterKey') {
    DOM.settingsMessageKeyFields.hide();
    DOM.settingsDomainFields.hide();
    DOM.settingsGravatarFields.hide();
    DOM.settingsRegularKeyFields.hide();
    DOM.settingsRequireDestinationTagFields.hide();
    DOM.settingsDisallowIncomingXRPFields.hide();
    DOM.settingsDefaultRippleFields.hide();
    DOM.settingsDisableMasterKeyFields.show();
  }
  eraseTXresults();
}

function feeChanged(e) {
  replaceCommas(e);
}

function trustlineLimitChanged(e) {
  replaceCommas(e);
}

function paymentAmountChanged(e) {
  replaceCommas(e);
}

function replaceCommas(e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
       // Allow: Ctrl/cmd+A
      (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
       // Allow: Ctrl/cmd+C
      (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
       // Allow: Ctrl/cmd+X
      (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
       // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
           // let it happen, don't do anything
           return;
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
  }
}

function txBlobClicked() {
  DOM.txBlob.select();
}

function showSignedTX(signed) {
  DOM.txFeedback.html('<br>Transaction signed.<div class="note">Scan the QR or copy the transaction blob (in the grey box) and submit it on the page you\'ve already opened.</div>');
  var tx = JSON.stringify(signed);
  DOM.txBlob.val(tx);
  blobQR.makeCode(tx);
}

function showVersion() {
  DOM.version.html('v. ' + version);
}

function addLoadingState(element) {
  var buttonValue = element.html();
  element.html('<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div>');
  element.addClass('spinner');
  return buttonValue;
}

function settingsButtonSetClicked() {
  settings('set');
}

function settingsButtonUnsetClicked() {
  settings('unset');
}

function settings(action) {
  eraseTXresults();
  var secret = signingSecret(); //secret or keypair json (pub + priv)
  var account = signingAddress();

  if (!secret || !account) return;

  var memos = txMemos();

  var settings = {
    memos: memos
  };

  var selectedSetting = DOM.settingsSelect.val();

  if (selectedSetting == 'domain') {
    if (action == 'set') {
      var domain = DOM.settingsDomain.val();
      domain = domain.trim();
      domain = String(domain).toLowerCase();

      if (domain == '') {
        DOM.txFeedback.html('Enter a domain name');
        DOM.settingsDomain.focus();
        return;
      }

      if (!validateDomain(domain)) {
        DOM.txFeedback.html('Error: Invalid domain name');
        DOM.settingsDomain.focus();
        return;
      }

      settings.domain = domain;
    } else {
      settings.domain = "";
    }

  } else if (selectedSetting == 'gravatar') {
    if (action == 'set') {
      var email = DOM.settingsEmail.val();
      email = String(email.trim());

      if (email == '') {
        DOM.txFeedback.html('Enter a gravar email');
        DOM.settingsEmail.focus();
        return;
      }

      if (!validateEmail(email)) {
        DOM.txFeedback.html('Error: Invalid email address');
        DOM.settingsEmail.focus();
        return;
      }

      var emailHash = calcMD5(email);
      emailHash = String(emailHash).toUpperCase();
      settings.emailHash = emailHash;
    } else {
      settings.emailHash = null;
    }
  } else if (selectedSetting == 'messageKey') {
    if (action == 'set') {
      var messageKey = DOM.settingsMessageKey.val();
      messageKey = messageKey.trim();

      if (messageKey == '') {
        DOM.txFeedback.html('Enter a message key');
        DOM.settingsMessageKey.focus();
        return;
      }

      messageKey = String(messageKey).toUpperCase();
      DOM.settingsMessageKey.val(messageKey);

      if (!isHex(messageKey)) {
        DOM.txFeedback.html('<span class="orange">Error: Invalid format of the message key (Must be HEX)</span>');
        DOM.settingsMessageKey.focus();
        return;
      }

      if (messageKey.length != 66) {
        DOM.txFeedback.html('<span class="orange">Error: The key must 66 characters</span>');
        DOM.settingsMessageKey.focus();
        return;
      }

      settings.messageKey = messageKey;
    } else {
      settings.messageKey = '';
    }
  } else if (selectedSetting == 'regularKey') {
    if (action == 'set') {
      var regularKey = DOM.settingsRegularKey.val();
      regularKey = regularKey.trim();

      if (regularKey == '') {
        DOM.txFeedback.html('Enter a regular key');
        DOM.settingsRegularKey.focus();
        return;
      }

      if (!isValidAddress(regularKey)) {
        DOM.txFeedback.html('Error: Invalid Regular Key');
        DOM.settingsRegularKey.focus();
        return;
      }

      settings.regularKey = regularKey;
    } else {
      settings.regularKey = null;
    }
  } else if (selectedSetting == 'requireDestinationTag') {
    if (action == 'set') {
      settings.requireDestinationTag = true;
    } else {
      settings.requireDestinationTag = false;
    }
  } else if (selectedSetting == 'disallowIncomingXRP') {
    if (action == 'set') {
      settings.disallowIncomingXRP = true;
    } else {
      settings.disallowIncomingXRP = false;
    }
  } else if (selectedSetting == 'defaultRipple') {
    if (action == 'set') {
      settings.defaultRipple = true;
    } else {
      settings.defaultRipple = false;
    }
  } else if (selectedSetting == 'disableMasterKey') {
    if (action == 'set') {
      settings.disableMasterKey = true;
    }
  }

  var fee = txFee();
  if (!fee) {
    DOM.fee.focus();
    return;
  }

  if (DOM.switchOnline.is(':checked')) {
    //show error if not activated
    settingsUpdateOnline(secret, account, settings, fee, action);
  } else {
    var sequence = txSequence(account);
    if (!sequence) return;
    settingsUpdateOffline(secret, account, settings, fee, sequence);
  } 
}

function settingsUpdateOnline(secret, account, settings, fee, action) {
  if (api.isConnected()) {
    if (action == 'set') {
      var buttonElement = DOM.settingsButtonSet;
    } else {
      var buttonElement = DOM.settingsButtonUnset;
    }
    var buttonValue = addLoadingState(buttonElement);

    api.prepareSettings(account, settings, {fee: fee}).then(function(tx) {
      var signed = api.sign(tx.txJSON, secret);
      api.submit(
        signed.signedTransaction
      ).then(function(result) {
        //signed.id //hash
        DOM.txFeedback.html(result.resultMessage + "<br><a href='" + explorer + signed.id + "' target='_blank'>Check on bithomp in 5 sec.</a>");
        buttonElement.html(buttonValue);
      }).catch(function (error) {
        DOM.txFeedback.html('submit: ' + error.message);
        console.log(error);
        buttonElement.html(buttonValue);
      })
    }).catch(function (error) {
      DOM.txFeedback.html('prepareSettings: ' + error.message);
      console.log(error);
      buttonElement.html(buttonValue);
    })
  }
}

function settingsUpdateOffline(secret, account, settings, fee, sequence) {
  api.prepareSettings(account, settings, {fee: fee, sequence: sequence, maxLedgerVersion: null}).then(function(tx) {
    var signed = api.sign(tx.txJSON, secret);
    showSignedTX(signed);
    //hash signed.id
  }).catch(function (error) {
    DOM.txFeedback.html('prepareSettings: ' + error.message);
    console.log(error);
  });
}

function escrowButtonCancelClicked() {
  eraseTXresults();
  var secret = signingSecret(); //secret or keypair json (pub + priv)
  var account = signingAddress();

  if (!secret || !account) return;

  var owner = DOM.escrowOwner.val();
  owner = owner.trim();

  if (!owner) {
    DOM.txFeedback.html('Error: Please fill in the owner of your escrow');
    DOM.escrowOwner.focus();
    return;
  }

  if (!isValidAddress(owner)) {
    DOM.txFeedback.html('Error: Invalid escrow owner address');
    DOM.escrowOwner.focus();
    return;
  }

  var escrowSequence = DOM.escrowSequence.val();
  escrowSequence = parseInt(escrowSequence);

  if (!escrowSequence || escrowSequence < 0) {
    DOM.txFeedback.html('Enter Sequence (#) of the escrow, try to find it here: <br><a href="' + explorer + owner + '" target="_blank" class="small">' + explorer + owner + '</a>');
    DOM.escrowSequence.focus();
    return;
  }

  var fee = txFee();
  if (!fee) {
    DOM.fee.focus();
    return;
  }

  var memos = txMemos();

  if (DOM.switchOnline.is(':checked')) {
    //show error if not activated
    escrowCancelOnline(secret, account, owner, escrowSequence, fee, memos);
  } else {
    var sequence = txSequence(account);
    if (!sequence) return;
    escrowCancelOffline(secret, account, owner, escrowSequence, fee, memos, sequence);
  }
}

function escrowCancelOnline(secret, account, owner, escrowSequence, fee, memos) {
  if (api.isConnected()) {
    var buttonValue = addLoadingState(DOM.escrowButtonCancel);
    var escrowCancellation = {
      owner: owner,
      escrowSequence: escrowSequence,
      memos: memos
    };

    api.prepareEscrowCancellation(account, escrowCancellation, {fee: fee}).then(function(tx) {
      var signed = api.sign(tx.txJSON, secret);
      api.submit(
        signed.signedTransaction
      ).then(function(result) {
        //signed.id //hash
        DOM.txFeedback.html(result.resultMessage + "<br><a href='" + explorer + signed.id + "' target='_blank'>Check on bithomp in 5 sec.</a>");
        DOM.escrowButtonCancel.html(buttonValue);
      }).catch(function (error) {
        DOM.txFeedback.html('submit: ' + error.message);
        console.log(error);
        DOM.escrowButtonCancel.html(buttonValue);
      })
    }).catch(function (error) {
      DOM.txFeedback.html('prepareEscrowCancellation: ' + error.message);
      console.log(error);
      DOM.escrowButtonCancel.html(buttonValue);
    })
  }
}

function escrowCancelOffline(secret, account, owner, escrowSequence, fee, memos, sequence) {
  var escrowCancellation = {
    owner: owner,
    escrowSequence: escrowSequence,
    memos: memos
  };

  api.prepareEscrowCancellation(account, escrowCancellation, {fee: fee, sequence: sequence, maxLedgerVersion: null}).then(function(tx) {
    var signed = api.sign(tx.txJSON, secret);
    showSignedTX(signed);
    //hash signed.id
  }).catch(function (error) {
    DOM.txFeedback.html('prepareEscrowCancellation: ' + error.message);
    console.log(error);
  });
}

function escrowButtonExecuteClicked() {
  eraseTXresults();
  var secret = signingSecret(); //secret or keypair json (pub + priv)
  var account = signingAddress();

  if (!secret || !account) return;

  var owner = DOM.escrowOwner.val();
  owner = owner.trim();

  if (!owner) {
    DOM.txFeedback.html('Error: Please fill in the owner of your escrow');
    DOM.escrowOwner.focus();
    return;
  }

  if (!isValidAddress(owner)) {
    DOM.txFeedback.html('Error: Invalid escrow owner address');
    DOM.escrowOwner.focus();
    return;
  }

  var escrowSequence = DOM.escrowSequence.val();
  escrowSequence = parseInt(escrowSequence);

  if (!escrowSequence || escrowSequence < 0) {
    DOM.txFeedback.html('Enter Sequence (#) of the escrow, try to find it here: <br><a href="' + explorer + owner + '" target="_blank">' + explorer + owner + '</a>');
    DOM.escrowSequence.focus();
    return;
  }

  var fee = txFee();
  if (!fee) {
    DOM.fee.focus();
    return;
  }

  var memos = txMemos();

  if (DOM.switchOnline.is(':checked')) {
    //show error if not activated
    escrowExecuteOnline(secret, account, owner, escrowSequence, fee, memos);
  } else {
    var sequence = txSequence(account);
    if (!sequence) return;
    escrowExecuteOffline(secret, account, owner, escrowSequence, fee, memos, sequence);
  }
}

function escrowExecuteOnline(secret, account, owner, escrowSequence, fee, memos) {
  if (api.isConnected()) {
    var buttonValue = addLoadingState(DOM.escrowButtonExecute);
    var escrowExecution = {
      owner: owner,
      escrowSequence: escrowSequence,
      memos: memos
    };

    api.prepareEscrowExecution(account, escrowExecution, {fee: fee}).then(function(tx) {
      var signed = api.sign(tx.txJSON, secret);
      api.submit(
        signed.signedTransaction
      ).then(function(result) {
        //signed.id //hash
        DOM.txFeedback.html(result.resultMessage + "<br><a href='" + explorer + signed.id + "' target='_blank'>Check on bithomp in 5 sec.</a>");
        DOM.escrowButtonExecute.html(buttonValue);
      }).catch(function (error) {
        DOM.txFeedback.html('submit: ' + error.message);
        console.log(error);
        DOM.escrowButtonExecute.html(buttonValue);
      })
    }).catch(function (error) {
      DOM.txFeedback.html('prepareEscrowExecution: ' + error.message);
      console.log(error);
      DOM.escrowButtonExecute.html(buttonValue);
    })
  }
}

function escrowExecuteOffline(secret, account, owner, escrowSequence, fee, memos, sequence) {
  var escrowExecution = {
    owner: owner,
    escrowSequence: escrowSequence,
    memos: memos
  };

  api.prepareEscrowExecution(account, escrowExecution, {fee: fee, sequence: sequence, maxLedgerVersion: null}).then(function(tx) {
    var signed = api.sign(tx.txJSON, secret);
    showSignedTX(signed);
    //hash signed.id
  }).catch(function (error) {
    DOM.txFeedback.html('prepareEscrowExecution: ' + error.message);
    console.log(error);
  });
}

function trustlineButtonAddClicked() {
  eraseTXresults();
  trustline('add');
}

function trustlineButtonRemoveClicked() {
  eraseTXresults();
  trustline('remove');
}

function trustline(action) {
  var secret = signingSecret(); //secret or keypair json (pub + priv)
  var account = signingAddress();

  if (!secret || !account) return;

  var currency = DOM.trustlineCurrency.val();
  currency = currency.trim().toUpperCase();

  if (!currency || currency.lenght > 3) {
    DOM.txFeedback.html('Incorrect currency: empty or wrong format');
    DOM.trustlineCurrency.focus();
    return;
  }

  var counterparty = DOM.trustlineCounterparty.val();
  counterparty = counterparty.trim();

  if (!counterparty) {
    DOM.txFeedback.html('Please fill in the counterparty.');
    DOM.trustlineCounterparty.focus();
    return;
  }

  if (!isValidAddress(counterparty)) {
    DOM.txFeedback.html('Error: invalid counterparty address.');
    DOM.trustlineCounterparty.focus();
    return;
  } 

  var limit = DOM.trustlineLimit.val();
  limit = limit.trim();

  if (action == 'remove') {
    limit = "0";
  } else {
    if (!limit || limit < 0) {
      DOM.txFeedback.html('The trustline limit must be greater than 0');
      DOM.trustlineLimit.focus();
      return;
    }
  }

  var fee = txFee();
  if (!fee) {
    DOM.fee.focus();
    return;
  }

  var memos = txMemos();

  if (DOM.switchOnline.is(':checked')) {
    //show error if not activated
    trustlineOnline(secret, account, currency, counterparty, limit, fee, memos, action);
  } else {
    var sequence = txSequence(account);
    if (!sequence) return;
    trustlineOffline(secret, account, currency, counterparty, limit, fee, memos, sequence);
  }

}

function trustlineOffline(secret, account, currency, counterparty, limit, fee, memos, sequence) {
  var trustline = {
    currency: currency,
    counterparty: counterparty,
    limit: limit,
    ripplingDisabled: true,
    memos: memos
  };

  api.prepareTrustline(account, trustline, {fee: fee, sequence: sequence, maxLedgerVersion: null}).then(function(tx) {
    var signed = api.sign(tx.txJSON, secret);
    showSignedTX(signed);
    //hash signed.id
  }).catch(function (error) {
    DOM.txFeedback.html('prepareTrustline: ' + error.message);
    console.log(error);
  });
}

function trustlineOnline(secret, account, currency, counterparty, limit, fee, memos, action) {
  if (api.isConnected()) {
    if (action == 'add') {
      var buttonElement = DOM.trustlineButtonAdd;
    } else {
      var buttonElement = DOM.trustlineButtonRemove;
    }
    var buttonValue = addLoadingState(buttonElement);

    var trustline = {
      currency: currency,
      counterparty: counterparty,
      limit: limit,
      ripplingDisabled: true,
      memos: memos
    };

    api.prepareTrustline(account, trustline, {fee: fee}).then(function(tx) {
      var signed = api.sign(tx.txJSON, secret);
      api.submit(
        signed.signedTransaction
      ).then(function(result) {
        //signed.id //hash
        DOM.txFeedback.html(result.resultMessage + "<br><a href='" + explorer + account + "' target='_blank'>Check on bithomp in 5 sec.</a>");
        buttonElement.html(buttonValue);
      }).catch(function (error) {
        DOM.txFeedback.html('submit: ' + error.message);
        console.log(error);
        buttonElement.html(buttonValue);
      })
    }).catch(function (error) {
      DOM.txFeedback.html('prepareTrustline: ' + error.message);
      console.log(error);
      buttonElement.html(buttonValue);
    })
  }
}

function eraseTXresults() {
  DOM.txFeedback.html('');
  DOM.txBlob.val('');
  blobQR.clear();
}

function paymentButtonPayClicked() {
  eraseTXresults();
  var secret = signingSecret(); //secret or keypair json (pub + priv)
  var account = signingAddress();

  if (!secret || !account) return;

  var recipient = DOM.paymentRecipient.val();
  recipient = recipient.trim();

  if (!recipient) {
    DOM.txFeedback.html('Error: Please fill in the recipient of your payment!');
    DOM.paymentRecipient.focus();
    return;
  }

  if (!isValidAddress(recipient)) {
    DOM.txFeedback.html('Error: Invalid recipient address');
    DOM.paymentRecipient.focus();
    return;
  }

  if (recipient == account) {
    DOM.txFeedback.html("Error: You're trying to send payment to yourself...");
    DOM.paymentRecipient.focus();
    return;
  }

  var destinationTag = DOM.paymentDestinationTag.val();
  destinationTag = parseInt(destinationTag);

  var amount = DOM.paymentAmount.val();
  amount = amount.trim();

  if (!amount || amount < 0) {
    DOM.txFeedback.html('Please fill in the amount you want to send!');
    DOM.paymentAmount.focus();
    return;
  }
  amount = String(amount);

  var currency = DOM.paymentCurrency.val();
  currency = currency.trim().toUpperCase();

  if (!currency || currency.lenght > 3) {
    DOM.txFeedback.html('Incorrect currency: empty or wrong format');
    DOM.paymentCurrency.focus();
    return;
  }

  var counterparty = DOM.paymentCounterparty.val();
  counterparty = counterparty.trim();

  if (currency != 'XRP' && !counterparty) {
    DOM.txFeedback.html('Please fill in the counterparty.');
    DOM.paymentCounterparty.focus();
    return;
  }

  if (counterparty != '' && !isValidAddress(counterparty)) {
    DOM.txFeedback.html('Error: invalid counterparty address.');
    DOM.paymentCounterparty.focus();
    return;
  } 

  var fee = txFee();
  if (!fee) {
    DOM.fee.focus();
    return;
  }

  var memos = txMemos();

  if (DOM.switchOnline.is(':checked')) {
    //show error if not activated
    //check if destination tag is required
    //check if can accept XRP
    paymentOnline(secret, account, recipient, destinationTag, amount, currency, counterparty, fee, memos);
  } else {
    var sequence = txSequence(account);
    if (!sequence) return;
    paymentOffline(secret, account, recipient, destinationTag, amount, currency, counterparty, fee, memos, sequence);
  }
}

function signingSecret() {
  if (!isValidAddress(DOM.address.val())) {
    DOM.txFeedback.html('Invalid address');
    return false;
  }

  if (DOM.switchSecret.is(':checked')) {
    var secret = DOM.secret.val();
    secret = secret.trim();
    if (!isValidSecret(secret)) {
      DOM.txFeedback.html('Invalid secret');
      return false;
    } else {
      return secret;
    }
  }

  if (DOM.switchMnemonic.is(':checked')) {
    var pubkey = DOM.pubkey.val();
    var privkey = DOM.privkey.val();
    if (pubkey == '' || privkey == '') {
      DOM.txFeedback.html('pubkey or/and privkey are missing');
      return false;
    } else {
      privkey = "00" + privkey.toUpperCase();
      pubkey = pubkey.toUpperCase();
      return {privateKey: privkey, publicKey: pubkey}
    }
  }
}

function submitLink() {
  var address = signingAddress();
  var url = 'https://bithomp.com/submit/' + address;
  DOM.submitLink.html('<a href="' + url + '" target="_blank">' + url + '</a>');
  submitUrlQR.makeCode(url);
}

function signingAddress() {
  var address = DOM.address.val();
  var signAddress = DOM.signAddress.val();
  signAddress = signAddress.trim();

  if (DOM.setAddress.is(':checked')) {
    if (!isValidAddress(signAddress)) {
      DOM.txFeedback.html('Invalid signing address');
      return false;
    } else {
      return signAddress;
    }
  } else {
    return address;
  }
}

function txSequence(account) {
  var sequence = DOM.sequence.val();
  sequence = parseInt(sequence);
  if (!sequence) {
    DOM.txFeedback.html('Please fill in the <b>Next sequence</b>.');
    DOM.sequence.focus();
    return false;
  }
  if (sequence < 1) {
    DOM.txFeedback.html('Error: Incorrect sequence.');
    DOM.sequence.focus();
    return false;
  }
  return sequence;
}

function txFee() {
  var fee = DOM.fee.val();
  fee = fee.trim();
  if (Number(fee) > 1) {
    DOM.txFeedback.html('The fee is too high!');
    return false;
  }
  return fee;
}

function txMemos() {
  var memo = DOM.memo.val();
  memo = memo.trim();

  var memos = [];

  var toolVersion = 'Bithomp tool v. ' + version;

  var clientMemo = {
    type: 'client',
    format: 'plain/text',
    data: toolVersion
  };

  if (memo != '') {
    memos[0] = {
      type: 'Memo',
      format: 'plain/text',
      data: memo
    };
    memos[1] = clientMemo;
  } else {
    memos[0] = clientMemo;
  }
  return memos;
}

function paymentOffline(secret, account, recipient, destinationTag, amount, currency, counterparty, fee, memos, sequence) {
  var payment = {
    source: {
      address: account,
      maxAmount: {
        value: amount,
        currency: currency
      }
    },
    destination: {
      address: recipient,
      amount: {
        value: amount,
        currency: currency
      }
    },
    memos: memos
  };

  if (currency != 'XRP') {
    payment.source.maxAmount.counterparty = counterparty;
    payment.destination.amount.counterparty = counterparty;
  }

  if (destinationTag)
    payment.destination.tag = destinationTag;

  api.preparePayment(account, payment, {fee: fee, sequence: sequence, maxLedgerVersion: null}).then(function(tx) {
    var signed = api.sign(tx.txJSON, secret);
    showSignedTX(signed);
    //hash signed.id
  }).catch(function (error) {
    DOM.txFeedback.html('preparePayment: ' + error.message);
    console.log(error);
  })
}

function paymentOnline(secret, account, recipient, destinationTag, amount, currency, counterparty, fee, memos) {
  if (api.isConnected()) {
    var buttonValue = addLoadingState(DOM.paymentButtonPay);
    var payment = {
      source: {
        address: account,
        maxAmount: {
          value: amount,
          currency: currency
        }
      },
      destination: {
        address: recipient,
        amount: {
          value: amount,
          currency: currency
        }
      },
      memos: memos
    };

    if (currency != 'XRP') {
      payment.source.maxAmount.counterparty = counterparty;
      payment.destination.amount.counterparty = counterparty;
    }

    if (destinationTag)
      payment.destination.tag = destinationTag;

    api.preparePayment(account, payment, {fee: fee}).then(function(tx) {
      var signed = api.sign(tx.txJSON, secret);
      api.submit(
        signed.signedTransaction
      ).then(function(result) {
        DOM.txFeedback.html(result.resultMessage + "<br><a href='" + explorer + signed.id + "' target='_blank'>Check on bithomp in 5 sec.</a>");
        DOM.paymentButtonPay.html(buttonValue);
      }).catch(function (error) {
        DOM.txFeedback.html('submit: ' + error.message);
        console.log(error);
        DOM.paymentButtonPay.html(buttonValue);
      })
    }).catch(function (error) {
      DOM.txFeedback.html('preparePayment: ' + error.message);
      console.log(error);
      DOM.paymentButtonPay.html(buttonValue);
    })
  }
}

function validateRegularKey() {
  if (DOM.setAddress.is(':checked')) {
    var address = DOM.address.val();
    var signAddress = DOM.signAddress.val();
    signAddress = signAddress.trim();

    if (address == '' || signAddress == '') {
      return;
    }

    if (signAddress == address) {
      DOM.signAddressFeedback.html("Address is the same, just uncheck the checkbox.");
      return;
    }

    if (api.isConnected()) {
      api.getSettings(signAddress).then(function(info) {
        if (info && !info.regularKey) {
          DOM.signAddressFeedback.html("<a href='" + explorer + signAddress + "' target='_blank'>Address</a> doesn't have a set regular key.");
          return;
        } else if (info.regularKey == address) {
          DOM.readyToSignFields.show();
          return;
        } else {
          DOM.signAddressFeedback.html("<a href='" + explorer + signAddress + "' target='_blank'>Address</a> has a different regular key.");
          return;
        }
      }).catch(function (error) {
        if (error.message == 'actNotFound') {
          DOM.signAddressFeedback.html('This account is not activated yet. <a href="https://bithomp.com/activation/' + signAddress + '" target="_blank">Activate</a>');
        } else if (error.message == 'instance.address does not conform to the "address" format') {
          DOM.signAddressFeedback.html('Incorrect address');
        } else {
          DOM.signAddressFeedback.html('getSettings: ' + error.message);
          console.log(error);
        }
        return;
      })
    } else {
      DOM.signAddressFeedback.html('Disconected from a Web Socket...');
      return;
    }
  }
}

function isValidAddress(address) {
  return api.isValidAddress(address);
}

function signAddressChanged() {
  submitLink();
  if (DOM.setAddress.is(':checked')) {
    DOM.readyToSignFields.hide();
    var signAddress = DOM.signAddress.val();
    signAddress = signAddress.trim();

    var address = DOM.address.val();
    address = address.trim();

    DOM.signAddressFeedback.html("");

    if (signAddress == '') {
      DOM.signAddressFeedback.html("Please enter the address.");
      return;
    }

    if (signAddress == address) {
      DOM.signAddressFeedback.html("Address is the same, just uncheck the checkbox.");
      return;
    }

    if (!isValidAddress(signAddress)) {
      DOM.signAddressFeedback.html("Error: Invalid address");
      return;
    }

    if (DOM.switchOffline.is(':checked')) {
      DOM.readyToSignFields.show();
    } else {
      validateRegularKey();
      addressFeedback();
    }
  }
}

function setAddress() {
  if (DOM.setAddress.is(':checked')) {
    DOM.signAddressFields.show();
    DOM.addressFeedback.hide();
  } else {
    DOM.signAddressFields.hide();
    DOM.addressFeedback.show();
    DOM.readyToSignFields.show();
  }
  signAddressChanged();
}

function checkBalance(accountDOM, feedbackFieldDOM) {
  var account = accountDOM.val();
  if (DOM.switchOnline.is(':checked') && account != '') {
    if (api.isConnected()) {
      api.getAccountInfo(account).then(function(info) {
        var available = info.xrpBalance - 20 - (5 * info.ownerCount);
        var n = 6;
        if (available > 9999999) {
          n = 0;
        } else if (available > 999999) {
          n = 1;
        } else if (available > 99999) {
          n = 2;
        } else if (available > 9999) {
          n = 3;
        } else if (available > 999) {
          n = 4;
        } else if (available > 99) {
          n = 5;
        }
        var p = Math.pow(10, n);
        available = Math.floor(available * p) / p;
        var balance = Math.floor(info.xrpBalance * p) / p;
        if (available < 0) available = 0;
        feedbackFieldDOM.html("Balance: " + balance + " XRP; You can spend: " + available + " XRP");
        if (DOM.setAddress.is(':checked')) {
          validateRegularKey();
        } else {
          DOM.readyToSignFields.show();
        }
      }).catch(function (error) {
        if (error.message == 'actNotFound') {
          feedbackFieldDOM.html('This account is not activated yet. <a href="https://bithomp.com/activation/' + account + '" target="_blank">Activate</a>');
        } else if (error.message == 'instance.address does not conform to the "address" format') {
          feedbackFieldDOM.html('Incorrect address');
        } else {
          feedbackFieldDOM.html('getAccountInfo: ' + error.message);
          console.log(error);
        }
        DOM.readyToSignFields.hide();
      })
    }
  }
}

function addressFeedback() {
  if (DOM.switchOnline.is(':checked')) {
    if (DOM.setAddress.is(':checked')) {
      checkBalance(DOM.signAddress, DOM.signAddressFeedback);
    } else {
      checkBalance(DOM.address, DOM.addressFeedback);
    }
  } else {
    DOM.readyToSignFields.show();
  }
}

function thisYear() {
  var d = new Date();
  var n = d.getFullYear();
  DOM.thisYear.html(" - " + n);
}

function termsAgreed() {
  DOM.termsButton.fadeOut("slow");
  DOM.termsFields.fadeOut("slow", function() {
    DOM.agreedTermsFields.fadeIn("slow");
  });
}

function secretHiddenClicked() {
  DOM.secretHidden.hide();
  DOM.secret.show();
  DOM.secret.focus();
}

function serverConnect() {
  var node = DOM.server.val();
  DOM.serverFeedback.html('Connecting to: ' + node);
  api = new ripple.RippleAPI({server: node});

  api.on('error', function(errorCode, errorMessage) {
    DOM.serverFeedback.html(errorCode + ': ' + errorMessage);
    switchOnline();
  });
  api.on('connected', function() {
    DOM.serverFeedback.html('Connected to: ' + node);
    DOM.chooseWallet.show();
    DOM.serverNotConnectedFields.hide();
    addressFeedback();
    signAddressChanged();
  });
  api.on('disconnected', function(code) {
    DOM.serverFeedback.html('Disconnected, code: ' + code);
    switchOnline();
  });

  api.connect().catch(function(err) {
    DOM.serverFeedback.html('Error: ' + err);
  });
}

function switchOffline() {
  if (DOM.switchOffline.is(':checked')) {
    DOM.serverFields.hide();
    if (api.isConnected()) {
      api.disconnect();
    }
    api = new ripple.RippleAPI();
    DOM.chooseWallet.show();
    DOM.offlineFields.show();
    eraseTXresults();
  }
}

function switchOnline() {
  if (DOM.switchOnline.is(':checked')) {
    DOM.serverFields.show();
    DOM.chooseWallet.hide();
    DOM.serverNotConnectedFields.show();
    DOM.offlineFields.hide();
    eraseTXresults();
  }
}

function switchPayment() {
  if (DOM.switchPayment.is(':checked')) {
    DOM.trustlineFields.hide();
    DOM.escrowFields.hide();
    DOM.settingsFields.hide();
    DOM.paymentFields.show();
    eraseTXresults();
  }
}

function switchTrustline() {
  if (DOM.switchTrustline.is(':checked')) {
    DOM.paymentFields.hide();
    DOM.escrowFields.hide();
    DOM.settingsFields.hide();
    DOM.trustlineFields.show();
    eraseTXresults();
  }
}

function switchEscrow() {
  if (DOM.switchEscrow.is(':checked')) {
    DOM.paymentFields.hide();
    DOM.trustlineFields.hide();
    DOM.settingsFields.hide();
    DOM.escrowFields.show();
    eraseTXresults();
  }
}

function switchSettings() {
  if (DOM.switchSettings.is(':checked')) {
    DOM.paymentFields.hide();
    DOM.trustlineFields.hide();
    DOM.escrowFields.hide();
    DOM.settingsFields.show();
    eraseTXresults();
  }
}

function showAddress(address) {
  return 'Address: <a href="' + explorer + address + '" target="_blank">' + address + '</a>';
}

function isValidSecret(secret) {
  try {
    api.keypair.deriveKeypair(secret);
    return true;
  }
  catch (err) {
    return false;
  }
}

function secretChanged() {
  eraseTXresults();
  var secret = DOM.secret.val();
  secret = secret.trim();

  DOM.address.val("");
  DOM.addressFeedback.html("");
  DOM.pubkey.val("");
  DOM.privkey.val("");
  DOM.readyToSignFields.hide();
  DOM.setAddressFields.hide();

  if (secret != '') {
    if (isValidSecret(secret)) {
      var key = api.keypair.deriveKeypair(secret);
      var pub = api.keypair.deriveAddress(key.publicKey);
      DOM.feedback.html(showAddress(pub));
      DOM.address.val(pub);
      DOM.setAddressFields.show();
      DOM.secret.hide();
      addressFeedback();
      signAddressChanged();
      DOM.secretHidden.show();
      submitLink();
    } else {
      DOM.feedback.html('invalid secret');
    }
  } else {
    DOM.feedback.html('');
  }
}

function switchSecret() {
  if (DOM.switchSecret.is(':checked')) {
    DOM.mnemonicFields.hide();
    DOM.secretFields.show();
    secretChanged();
  }
}

function switchMnemonic() {
  if (DOM.switchMnemonic.is(':checked')) {
    DOM.secretFields.hide();
    DOM.mnemonicFields.show();
    delayedPhraseChanged();
  }
}

/* mnemonic starts */
function delayedPhraseChanged() {
  eraseTXresults();
  hideValidationError();
  seed = null;
  bip32RootKey = null;
  bip32ExtendedKey = null;
  clearAddressesList();
  showPending();
  submitLink();
  if (phraseChangeTimeoutEvent != null) {
    clearTimeout(phraseChangeTimeoutEvent);
  }
  phraseChangeTimeoutEvent = setTimeout(phraseChanged, 400);
}

function phraseChanged() {
  showPending();
  var phrase = DOM.phrase.val();
  var errorText = findPhraseErrors(phrase);
  if (errorText) {
    showValidationError(errorText);
    return;
  }
  // Calculate and display
  calcBip32RootKeyFromSeed(phrase);
  calcForDerivationPath();
}

function calcForDerivationPath() {
  clearAddressesList();
  showPending();
  var derivationPath = "m/44'/144'/0'/0";
  bip32ExtendedKey = calcBip32ExtendedKey(derivationPath);
  displayAddresses();
}

function displayAddresses() {
  generationProcesses.push(new (function() {
    var rows = [];

    this.stop = function() {
      for (var i=0; i<rows.length; i++) {
        rows[i].shouldGenerate = false;
      }
    }

    rows.push(new TableRow(0));
  })());
}

function TableRow(index) {
  var self = this;
  this.shouldGenerate = true;

  function init() {
    calculateValues();
  }

  function calculateValues() {
    setTimeout(function() {
      if (!self.shouldGenerate) {
        return;
      }
      // derive HDkey for this row of the table
      var key = "NA";
      key = bip32ExtendedKey.derive(index);
      var keyPair = key.keyPair;
      // get address
      var address = keyPair.getAddress().toString();
      // get privkey
      var hasPrivkey = !key.isNeutered();
      var privkey = "NA";
      if (hasPrivkey) {
          privkey = keyPair.toWIF(network);
      }
      // get pubkey
      var pubkey = keyPair.getPublicKeyBuffer().toString('hex');
      //var indexText = "m/44'/144'/0'/0/" + index;

      //for ripple
      privkey = window.basex('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz').decode(privkey).toString("hex").slice(2,66);
      address = window.basex('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz').encode(
        window.basex('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz').decode(address)
      );

      DOM.feedback.html(showAddress(address));
      DOM.address.val(address);
      DOM.setAddressFields.show();
      DOM.pubkey.val(pubkey);
      DOM.privkey.val(privkey);
      addressFeedback();
      signAddressChanged();
    }, 50)
  }

  init();
}

function calcBip32ExtendedKey(path) {
  // Check there's a root key to derive from
  if (!bip32RootKey) {
    return bip32RootKey;
  }
  var extendedKey = bip32RootKey;
  // Derive the key from the path
  var pathBits = path.split("/");
  for (var i=0; i<pathBits.length; i++) {
    var bit = pathBits[i];
    var index = parseInt(bit);
    if (isNaN(index)) {
      continue;
    }
    var hardened = bit[bit.length-1] == "'";
    var isPriv = !(extendedKey.isNeutered());
    var invalidDerivationPath = hardened && !isPriv;
    if (invalidDerivationPath) {
      extendedKey = null;
    }
    else if (hardened) {
      extendedKey = extendedKey.deriveHardened(index);
    }
    else {
      extendedKey = extendedKey.derive(index);
    }
  }
  return extendedKey
}

function calcBip32RootKeyFromSeed(phrase) {
  seed = mnemonic.toSeed(phrase, '');
  bip32RootKey = bitcoinjs.bitcoin.HDNode.fromSeedHex(seed, network);
}

function findPhraseErrors(phrase) {
  // Preprocess the words
  phrase = mnemonic.normalizeString(phrase);
  var words = phraseToWordArray(phrase);
  // Detect blank phrase
  if (words.length == 0) {
    return "Blank mnemonic";
  }
  // Check each word
  for (var i=0; i<words.length; i++) {
    var word = words[i];
    if (WORDLISTS["english"].indexOf(word) == -1) {
      //console.log("Finding closest match to " + word);
      var nearestWord = findNearestWord(word);
      return word + " not in wordlist, did you mean " + nearestWord + "?";
    }
  }
  // Check the words are valid
  var properPhrase = wordArrayToPhrase(words);
  var isValid = mnemonic.check(properPhrase);
  if (!isValid) {
    return "Invalid mnemonic";
  }
  return false;
}

// TODO look at jsbip39 - mnemonic.joinWords
function wordArrayToPhrase(words) {
  var phrase = words.join(" ");
  return phrase;
}

function findNearestWord(word) {
  var words = WORDLISTS["english"];
  var minDistance = 99;
  var closestWord = words[0];
  for (var i=0; i<words.length; i++) {
    var comparedTo = words[i];
    if (comparedTo.indexOf(word) == 0) {
      return comparedTo;
    }
    var distance = Levenshtein.get(word, comparedTo);
    if (distance < minDistance) {
      closestWord = comparedTo;
      minDistance = distance;
    }
  }
  return closestWord;
}

// TODO look at jsbip39 - mnemonic.splitWords
function phraseToWordArray(phrase) {
  var words = phrase.split(/\s/g);
  var noBlanks = [];
  for (var i=0; i<words.length; i++) {
    var word = words[i];
    if (word.length > 0) {
      noBlanks.push(word);
    }
  }
  return noBlanks;
}

function showPending() {
  DOM.feedback.html("Calculating...");
  DOM.addressFeedback.html("");
}

function showValidationError(errorText) {
  DOM.feedback.html(errorText);
  DOM.addressFeedback.html("");
}

function hideValidationError() {
  DOM.feedback.html("");
  DOM.addressFeedback.html("");
}

function clearAddressesList() {
  DOM.address.val("");
  DOM.setAddressFields.hide();
  DOM.addressFeedback.val("");
  DOM.privkey.val("");
  DOM.pubkey.val("");
  DOM.readyToSignFields.hide();
  stopGenerating();
}

function stopGenerating() {
  while (generationProcesses.length > 0) {
    var generation = generationProcesses.shift();
    generation.stop();
  }
}
/* mnemonic ends */

/* md5 starts */

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Copyright (C) Paul Johnston 1999 - 2000.
 * Updated by Greg Holt 2000 - 2001.
 * See http://pajhome.org.uk/site/legal.html for details.
 */

/*
 * Convert a 32-bit number to a hex string with ls-byte first
 */
var hex_chr = "0123456789abcdef";
function rhex(num)
{
  str = "";
  for(j = 0; j <= 3; j++)
    str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
           hex_chr.charAt((num >> (j * 8)) & 0x0F);
  return str;
}

/*
 * Convert a string to a sequence of 16-word blocks, stored as an array.
 * Append padding bits and the length, as described in the MD5 standard.
 */
function str2blks_MD5(str)
{
  nblk = ((str.length + 8) >> 6) + 1;
  blks = new Array(nblk * 16);
  for(i = 0; i < nblk * 16; i++) blks[i] = 0;
  for(i = 0; i < str.length; i++)
    blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
  blks[i >> 2] |= 0x80 << ((i % 4) * 8);
  blks[nblk * 16 - 2] = str.length * 8;
  return blks;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
 * to work around bugs in some JS interpreters.
 */
function add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * These functions implement the basic operation for each round of the
 * algorithm.
 */
function cmn(q, a, b, x, s, t)
{
  return add(rol(add(add(a, q), add(x, t)), s), b);
}
function ff(a, b, c, d, x, s, t)
{
  return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function gg(a, b, c, d, x, s, t)
{
  return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function hh(a, b, c, d, x, s, t)
{
  return cmn(b ^ c ^ d, a, b, x, s, t);
}
function ii(a, b, c, d, x, s, t)
{
  return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Take a string and return the hex representation of its MD5.
 */
function calcMD5(str)
{
  x = str2blks_MD5(str);
  a =  1732584193;
  b = -271733879;
  c = -1732584194;
  d =  271733878;

  for(i = 0; i < x.length; i += 16)
  {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;

    a = ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i+10], 17, -42063);
    b = ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = ff(d, a, b, c, x[i+13], 12, -40341101);
    c = ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = ff(b, c, d, a, x[i+15], 22,  1236535329);    

    a = gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = gg(c, d, a, b, x[i+11], 14,  643717713);
    b = gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = gg(c, d, a, b, x[i+15], 14, -660478335);
    b = gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = gg(b, c, d, a, x[i+12], 20, -1926607734);
    
    a = hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = hh(b, c, d, a, x[i+14], 23, -35309556);
    a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = hh(d, a, b, c, x[i+12], 11, -421815835);
    c = hh(c, d, a, b, x[i+15], 16,  530742520);
    b = hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i+10], 15, -1051523);
    b = ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = ii(d, a, b, c, x[i+15], 10, -30611744);
    c = ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = add(a, olda);
    b = add(b, oldb);
    c = add(c, oldc);
    d = add(d, oldd);
  }
  return rhex(a) + rhex(b) + rhex(c) + rhex(d);
}

/* md5 ends */

/* select element starts */
$('select').each(function(){
  var $this = $(this), numberOfOptions = $(this).children('option').length;

  $this.addClass('select-hidden'); 
  $this.wrap('<div class="select"></div>');
  $this.after('<div class="select-styled"></div>');

  var $styledSelect = $this.next('div.select-styled');
  $styledSelect.text($this.children('option').eq(0).text());

  var $list = $('<ul />', {
    'class': 'select-options'
  }).insertAfter($styledSelect);

  for (var i = 0; i < numberOfOptions; i++) {
    $('<li />', {
      text: $this.children('option').eq(i).text(),
      rel: $this.children('option').eq(i).val()
    }).appendTo($list);
  }

  var $listItems = $list.children('li');

  $styledSelect.click(function(e) {
    e.stopPropagation();
    $('div.select-styled.active').not(this).each(function(){
      $(this).removeClass('active').next('ul.select-options').hide();
    });
    $(this).toggleClass('active').next('ul.select-options').toggle();
  });

  $listItems.click(function(e) {
    e.stopPropagation();
    $styledSelect.text($(this).text()).removeClass('active');
    $this.val($(this).attr('rel'));
    $this.trigger('change');
    $list.hide();
    //console.log($this.val());
  });

  $(document).click(function() {
    $styledSelect.removeClass('active');
    $list.hide();
  });
});
/* select element ends */

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateDomain(domain) { 
  var re = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/; 
  return re.test(domain);
}

function isHex(h) {
  var re = /[0-9A-Fa-f]/g;
  return re.test(h);
}

init();

})();