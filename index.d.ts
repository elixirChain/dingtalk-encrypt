/**
 * 回调事件消息体加解密
 * @see https://open.dingtalk.com/document/orgapp-server/callback-event-message-body-encryption-and-decryption
 */
 export class DingTalkEncryptor {
  static token: string;
  static encodingAesKey: string;
  static corpIdOrSuiteKey: string;

  /**
   * 构造加解密对象
   * @param token 固定串，随机值
   * @param encodingAesKey 加密密钥，可随机获取（getRandomEncodingAesKey）
   * @param corpIdOrSuiteKey 服务商 id 或 key
   */
  constructor(token: string, encodingAesKey: string, corpIdOrSuiteKey: string);
  
  /**
   * 加密
   * @param random 随机串
   * @param plainText 未加密消息串
   * @return 加密串
   */
  encrypt(random: string, plainText: string): string;

  /**
   * 解密
   * @param encrypted 待解密串
   * @return 解密串
   */
  decrypt(encrypted: string): string;

  /**
   * 计算签名
   */
  getSignature(token: string, timestamp: string, nonce: string, encrypt: string): string;

  /**
   * 获取加密响应对象（回调函数用）
   * @param plaintext 
   * @param timeStamp 
   * @param nonce 
   */
  getEncryptedMap(plaintext: string, timeStamp: string, nonce: string): string;

  /**
   * 解密回调数据
   * - 校验消息签名等
   * @param msgSignature 
   * @param timeStamp 
   * @param nonce 
   * @param encryptMsg 
   */
  getDecryptMsg(msgSignature: string, timeStamp: string, nonce: string, encryptMsg: string): string;
}
