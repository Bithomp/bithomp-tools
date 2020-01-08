# Bithomp Tools

A tool to sign (and submit) simple transactions for xrp accounts, you can use secret or mnemonic.

## Online Version

https://bithomp.github.io/bithomp-tools/

## Standalone offline version

Download `index.html`

Open the file in a browser by double clicking it.

This can be compiled from source using the command `python compile.py`

## Usage

Choose a type of transaction: Payment, Trustline, Escrow, Settings

Choose a tool mode: Online or Offline

Enter your secret or a mnemonic (24 recovery words from your Hard Wallet)

Fill in data in the requested fields.

Submit the data and wait for a result.

## Making changes

Please do not make modifications to `index.html`, since they will
be overwritten by `compile.py`.

Make changes in `src/*`.

Changes are applied during release using the command `python compile.py`, so
please do not commit changes to `index.html`


## Offline Usage

You can use this tool without having to be online.

Download the file from the repository - https://github.com/Bithomp/bithomp-tools
This project is 100% open-source code

## Open-source

This project is 100% open-source code

Get the source code from the repository - https://github.com/Bithomp/bithomp-tools

## Libraries

BIP39 libraries - https://github.com/iancoleman/bip39 (basex, levenshtein, jQuery, sjcl, jsBIP39, BitcoinJS)

Lodash - https://github.com/lodash/lodash

ripple-lib*  - https://github.com/ripple/ripple-lib

qrcode - https://github.com/KeeeX/qrcodejs

bithompHW - https://github.com/Bithomp/bithompHW

* - modified (few extra lines added)

## Credits

https://twitter.com/mraburn, for writing a post how to use this tools in offline mode:
https://xrpcommunity.blog/bithomp-tools-using-offline-mode/

https://twitter.com/nixerffm, for testing and reporting issues on Escrow implementation.

## License

2018 Octillion S.A. All Rights Reserved

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

Please refer to the software license for more details.

https://github.com/Bithomp/bithomp-tools/blob/master/LICENSE
