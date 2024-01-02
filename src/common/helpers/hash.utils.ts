import * as argon2 from 'argon2';
import CryptoJS from 'crypto-js';

export class HashUtils {
  public static async hashPassword(password: string) {
    return await argon2.hash(password, { type: argon2.argon2id });
  }

  public static async comparePassword(
    password: string,
    passwordToCompare: string,
  ) {
    return await argon2.verify(password, passwordToCompare);
  }

  public static async AESEncrypt(string: string, key: string) {
    return await CryptoJS.AES.encrypt(string, key).toString();
  }

  public static async AESDecrypt(string: string, key: string) {
    return await CryptoJS.AES.decrypt(string, key).toString(CryptoJS.enc.Utf8);
  }
}
