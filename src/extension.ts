import * as vscode from 'vscode';
import { EncryptedProvider } from './encryptedProvider';

export function activate(context: vscode.ExtensionContext) {
	const encrypt = vscode.commands.registerCommand('extension.encryptFile', async () => {
		console.log('encryptFile command executed');
		try {
			const password = await promptForPassword();
			console.log('captured password');
			if (!password) {
				return;
			}
			const filePath = getPath();
			console.log('captured filePath', filePath);
			if (!filePath) {
				vscode.window.showErrorMessage('unable to find path for current document');
				return;
			}

			await EncryptedProvider.encryptFile(filePath, password);
			vscode.window.showInformationMessage('encryption complete');
		} catch (e) {
			vscode.window.showErrorMessage(e.toString());
		}
		console.log('complete');
	});
	vscode
	const decrypt = vscode.commands.registerCommand('extension.decryptFile', async () => {
		console.log('decryptFile command executed');
		try {
			const password = await promptForPassword();
			if (!password) {
				
				return;
			}
			await EncryptedProvider.decryptFile('', password);
			vscode.window.showInformationMessage('encryption complete');

		} catch (e) {
			vscode.window.showErrorMessage(e.toString());
		}

	});
	context.subscriptions.push(encrypt, decrypt);
}

async function promptForPassword(): Promise<string | null> {
	let pass = await vscode.window.showInputBox({
		password: true,
		prompt: 'Ccrypt Password for file',
	});
	if (!pass) {
		vscode.window.showErrorMessage('Passwords are required to use ccrypt');
		return null;
	}
	return pass;
}

function getPath(): string | undefined {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		console.error('no active text editor');
		return;
	}
	return activeEditor.document.uri.fsPath
}

async function promptForDecrypt(): Promise<boolean> {
	let response = await vscode.window.showInputBox({
		prompt: 'Do you want to decrypt this file?',
		value: 'Yes'
	});
	if (response && response === 'Yes') {
		return true;
	} else {
		return false;
	}
}

export function deactivate() {}
