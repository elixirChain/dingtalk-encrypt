# dingtalk-encrypt
DingTalk Encrypt Node Version.  
Refer to [Java version](https://github.com/opendingtalk/eapp-corp-project.git): 

**Issues:** It's your turn!

# Usage
## this repository
- git clone
- npm install
- run 'EncryptTest.js' for main APIs.

## npm module
- npm install dingtalk-encrypt
- use APIs as follows Doc.

# API Doc
- Need constants:
> TOKEN - Random str for signature, unrestricted, such as "123456".  
  ENCODING_AES_KEY - Secret key for callback data, random 43 characters of [a-z, A-Z, 0-9].  
  CORP_ID - DingTalk corpId from the [Official OA](oa.dingtalk.com).  

- Main APIs([Usage Example](https://open-doc.dingtalk.com/microapp/serverapi2/lo5n6i)):
  - getEncryptedMap
  - getDecryptMsg
  - getSignature
  - encrypt
  - decrypt

# Thanks To
- [Authors of crypto-js](https://github.com/brix/crypto-js)
- [Authors of eapp-corp-project](https://github.com/opendingtalk/eapp-corp-project)