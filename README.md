# Recrypt

A VSCode extension that will encrypt a file making it password protected. This also allows for previewing a decrypted version as plaintext.

## Usage
### Commands
* `>Encrypt Current File`
  * This will create a new file with the encrypted contents
  * It will delete the original file
  * The new file will be saved with a `.renc` file extension
* `>Decrypt Current File`
  * This will create a new file with the decrypted contents
  * It will delete the encrypted file
  * The new file will have the same name as the original
### Preview
When you open a file with a `.renc` file extension, you will be prompted for a password, if you provide the correct password a readonly preview of the contents will be displayed
> Note: vscode will probably tell you that the `.renc` file was saved with an unknown encoding. To get the process to work you would need to click the 