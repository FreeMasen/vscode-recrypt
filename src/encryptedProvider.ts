import { exec } from 'child_process';
export class EncryptedProvider {

    static async encryptFile(path: string, key: string): Promise<string> {
        console.log('executing ccrypt');
        const args = `-e -K ${key} ${path}`;
        return this.runCcrypt(args);
    }

    static async decryptFile(path: string, key: string): Promise<string> {
        const args = `-d -K ${key} ${path}`;
        return this.runCcrypt(args);
    }

    static async runCcrypt(args: string): Promise<string> {
        return new Promise((r, j) => {
            exec(`ccrypt ${args}`, (e, stdErr, stdOut) => {
                console.error(stdErr);
                if (e) {
                    return j(e);
                }
                console.log(stdOut);
                return r();
            });
        });
    }
}