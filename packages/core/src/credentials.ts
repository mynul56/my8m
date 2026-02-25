import crypto from 'crypto';

export class CredentialManager {
    private algorithm = 'aes-256-gcm';
    private secretKey: Buffer;

    constructor(encryptionKey: string) {
        if (!encryptionKey || encryptionKey.length !== 32) {
            throw new Error('CredentialManager requires a 32-character AES encryption key.');
        }
        this.secretKey = Buffer.from(encryptionKey, 'utf-8');
    }

    /**
     * Encrypts a JSON payload securely using AES-256-GCM.
     * Returns a base64 string formatted as: iv:authTag:encryptedData
     */
    encrypt(data: Record<string, any>): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv) as crypto.CipherGCM;

        const jsonString = JSON.stringify(data);
        let encrypted = cipher.update(jsonString, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts a payload previously encrypted by this manager.
     */
    decrypt(encryptedPayload: string): Record<string, any> {
        const parts = encryptedPayload.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted payload format. Expected iv:authTag:encryptedData');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    }
}
