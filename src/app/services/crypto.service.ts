import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private passphrase = 'Ll4mk4sUnP3rU2025$';
  private cachedKeyPromise: Promise<CryptoKey> | null = null;

  constructor() { }

  private async getKey(): Promise<CryptoKey> {
    if (this.cachedKeyPromise) return this.cachedKeyPromise;
    const init = (async () => {
      const enc = new TextEncoder();
      const passKey = enc.encode(this.passphrase);
      const baseKey = await crypto.subtle.importKey('raw', passKey, 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode('salt-para-app'), iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      return key;
    })();
    this.cachedKeyPromise = init;
    return init;
  }

  private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async encrypt(plain: string): Promise<string> {
    try {
      const key = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const data = enc.encode(plain);
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
      const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.byteLength);
      return this.arrayBufferToBase64Url(combined.buffer);
    } catch (err) {
      return this.fallbackEncrypt(plain);
    }
  }

  async decrypt(token: string): Promise<string> {
    try {
      const combinedBuf = this.base64UrlToArrayBuffer(token);
      const combined = new Uint8Array(combinedBuf);
      if (combined.length > 12) {
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const key = await this.getKey();
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        const dec = new TextDecoder();
        return dec.decode(decrypted);
      }
      return this.fallbackDecrypt(token);
    } catch (err) {
      try {
        return this.fallbackDecrypt(token);
      } catch (err2) {
        throw err;
      }
    }
  }

  private fallbackEncrypt(plain: string): string {
    const enc = new TextEncoder();
    const data = enc.encode(plain);
    const keyBytes = enc.encode(this.passphrase || '');
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      out[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return this.arrayBufferToBase64Url(out.buffer);
  }

  private fallbackDecrypt(token: string): string {
    const buf = this.base64UrlToArrayBuffer(token);
    const bytes = new Uint8Array(buf);
    const keyBytes = new TextEncoder().encode(this.passphrase || '');
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(out.buffer);
  }
}
