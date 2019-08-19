import * as vscode from 'vscode';
import { EncryptedProvider } from './encryptedProvider';

export async function activate(context: vscode.ExtensionContext) {	
	const encrypt = vscode.commands.registerCommand('rencrypt.encryptFile', async () => {
		console.log('encryptFile command executed');
		await fullEncryptProcess();
	});
	const decrypt = vscode.commands.registerCommand('rencrypt.decryptFile', async () => {
		console.log('decryptFile command executed');
		await fullDecryptProcess();
	});
	const onTheFly = vscode.workspace.registerTextDocumentContentProvider('rencrypt', new EncryptedProvider());
	vscode.window.onDidChangeActiveTextEditor(async editor => {
		console.log('onDidChangeActiveTextEditor', editor);
		if (!editor) {
			return;
		}
		await openPreview(editor.document.uri);
	});
	context.subscriptions.push(encrypt, decrypt, onTheFly);
}

async function openPreview(uri: vscode.Uri) {
	if (!uri.fsPath.endsWith('.renc')) {
		return;
	}
	const newUri = uri.with({scheme: 'rencrypt'});
	await vscode.window.showTextDocument(newUri, { preview: true });
}

async function fullDecryptProcess() {
	try {
		const path = await doTheThing(EncryptedProvider.decryptFile);
		vscode.window.showInformationMessage('decryption complete');
		editorSwap(path);
	} catch (e) {
		vscode.window.showErrorMessage((e as Error).message);
	}
}

async function fullEncryptProcess() {
	try {
		const path = await doTheThing(EncryptedProvider.encryptFile, true);
		vscode.window.showInformationMessage('encryption complete');
		editorSwap(path);
	} catch (e) {
		vscode.window.showErrorMessage((e as Error).message);
	}
}

export async function promptForPassword(prompt: string = 'Password for file'): Promise<string | null> {
	let pass = await vscode.window.showInputBox({
		password: true,
		prompt,
	});
	return pass || null;
}

function getPath(): string | undefined {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		throw new Error('Unable to find active text editor\nyou may need to click the "edit anyway" link');
	}
	return activeEditor.document.uri.fsPath;
}

async function promptForDecrypt(): Promise<boolean> {
	let response = await vscode.window.showInputBox({
		prompt: 'Do you want to decrypt this file?',
		value: 'Yes'
	});
	if (response && response.toLowerCase().startsWith('y')) {
		return true;
	} else {
		return false;
	}
}
type ThingCallback = (path: string, password: string) => Promise<void>;
async function doTheThing(callback: ThingCallback, confirmPW: boolean = false): Promise<string> {
	const filePath = getPath();
	const password = await promptForPassword();
	if (!password) {
		throw new Error('A password is required');
	}
	if (!filePath) {
		throw new Error('unable to find path for current document');
	}
	if (confirmPW) {
		const pw2 = await promptForPassword('Confirm Password');
		if (pw2 !== password) {
			throw new Error('Passwords do not match');
		}
	}
	await callback(filePath, password);
	return filePath;
}

async function editorSwap(path: string) {
	if (!vscode.window.activeTextEditor) {
		return;
	}
	if (!path) {
		return;
	}
	const viewColumn = vscode.window.activeTextEditor.viewColumn;
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	const newPath = updatedFileName(path);
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	const relPath = vscode.workspace.asRelativePath(newPath);
	let files = await vscode.workspace.findFiles(relPath);
	if (files.length < 1) {
		return;
	}
	await vscode.window.showTextDocument(files[0], {preserveFocus: false, viewColumn,});
}

export function updatedFileName(path: string) {
	if (path.endsWith('.renc')) {
		return path.substr(0, path.length - 5);
	}
	return `${path}.renc`;
}

export function deactivate() {}
