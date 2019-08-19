import * as wasm from 'rinja';
import * as fs from 'fs';
import * as vscode from 'vscode';

import {promptForPassword, updatedFileName} from './extension';

export class EncryptedProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;
    constructor() {
        this.onDidChange(async (uri) => this.saved(uri));
    }
    async saved(uri: vscode.Uri): Promise<void> {
        console.log('saved', uri);
    }
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string | undefined> {
        try {
            const pw = await promptForPassword();
            if (!pw) {
                return;
            }
            return EncryptedProvider.decryptOnTheFly(uri.fsPath, pw);
        } catch (e) {
            console.error(e);
        }
    }
    static async encryptFile(path: string, key: string): Promise<void> {
        let contents = await EncryptedProvider.readPath(path);
        let encrypted = wasm.encrypt(contents, key);
        if (!encrypted) {
            throw new Error('failed to encrypt contents');
        }
        await EncryptedProvider.writePath(updatedFileName(path), encrypted);
        await EncryptedProvider.removePath(path);
    }

    static async decryptFile(path: string, key: string): Promise<void> {
        const contents = await EncryptedProvider.decryptOnTheFly(path, key);
        await EncryptedProvider.writePath(updatedFileName(path), contents);
        await EncryptedProvider.removePath(path);
    }

    static async decryptOnTheFly(path: string, key: string): Promise<string> {
        let contents = await EncryptedProvider.readPath(path) as Uint8Array;
        let decypted = wasm.decrypt(contents, key);
        if (!decypted) {
            throw new Error('failed to decrypt contents');
        }
        return decypted;
    }

    static async readPath(path: string): Promise<Uint8Array> {
        return new Promise((r, j) => {
            fs.readFile(path, (err, buf) => {
                if (err) {
                    return j(err);
                }
                return r(new Uint8Array(buf.buffer));
            });
        });
    }

    static async writePath(path: string, data: Uint8Array | string): Promise<void> {
        return new Promise((r, j) => {
            fs.writeFile(path, data, err => {
                if (err) {
                    return j(err);
                }
                return r();
            });
        });
    }

    static async removePath(path: string): Promise<void> {
        return new Promise((r, j) => {
            fs.unlink(path, e => {
                if (e) {
                    return j(e);
                }
                return r();
            });
        });
    }
}