const crypto = require("crypto");
const EC = require("elliptic").ec;
const ellipticCipherName = "p384";
const ecdhCipherName = "secp384r1";

class AppleCrypto {
	static generateKeys() {
		const ec = new EC(ellipticCipherName);
		const keyPair = ec.genKeyPair();

		return {
			public: Buffer.from(keyPair.getPublic("hex"), "hex").toString("base64"),
			private: Buffer.from(keyPair.getPrivate("hex"), "hex").toString("base64")
		};
	}

	static generateNonce(b64size = 32) {
		const binarySize = Math.trunc(b64size * 6 / 8);
		return crypto.randomBytes(binarySize).toString("base64");
	}

	static KDFX963(inbyteX, sharedData, keyLength, hashFunction = "sha256", hashLength = 32) {
		let k = keyLength / hashLength;
		k = Math.trunc(Math.ceil(k));
		sharedData = Buffer.from(sharedData, "base64");

		let accStr = "";
		for (let i = 1; i < k + 1; i++) {
			let h = crypto.createHash(hashFunction);
			h.update(inbyteX);
			h.update(AppleCrypto.ITOSP(i, 4));
			h.update(sharedData);
			accStr += h.digest().toString("hex");
		}
		return Buffer.from(accStr.slice(0, keyLength * 2), "hex");
	}

	static ITOSP(longInt, length) {
		let hexString = longInt.toString(16);
		hexString = hexString.padStart(length * 2, "0");
		return AppleCrypto.unhexlify(hexString);
	}

	static unhexlify(hexString) {
		let result = "";
		for (let i = 0; i < hexString.length; i += 2) {
			result += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
		}
		return result;
	}

	static validateKeyPair(privateKey, publicKey) {
		const ec = new EC(ellipticCipherName);
		try {
			ec.keyPair({
				priv: Buffer.from(privateKey, "base64"),
				pub: Buffer.from(publicKey, "base64")
			});
		} catch (e) {
			if (e.message === "Unknown point format") {
				throw new Error("Invalid key pair");
			}
		}
	}

	static createEphemeralPublicKey(keyBuffer) {
		try {
			const ec = new EC(ellipticCipherName);
			const key = ec.keyFromPublic(keyBuffer.toString("hex"), "hex");
			return Buffer.from(key.getPublic().encode("hex"), "hex");
		} catch (e) {
			if (e.message === "Unknown point format") {
				throw new Error("Wrong argument: encryptedMessage");
			}
		}
	}

	static computeSecretSharedKey(Private, ephemeralPublicEcKey) {
		const ecdh = crypto.createECDH(ecdhCipherName);
		try {
			ecdh.setPrivateKey(Buffer.from(Private, "base64"));
		} catch (e) {
			if (e.message === "Private key is not valid for specified curve.") {
				throw new Error("Wrong argument: Private");
			}
		}
		return ecdh.computeSecret(ephemeralPublicEcKey);
	}

	static decrypt(encryptedMessage, privateKey, publicKey) {
		AppleCrypto.validateKeyPair(privateKey, publicKey);

		const token = Buffer.from(encryptedMessage, "base64");
		const ephemeralPubkey = token.slice(0, 97);
		const encryptedData = token.slice(97, token.length - 16);
		const encryptionTag = token.slice(token.length - 16);

		const ephemeralPublicEcKey = AppleCrypto.createEphemeralPublicKey(ephemeralPubkey);
		const shared = AppleCrypto.computeSecretSharedKey(privateKey, ephemeralPublicEcKey);

		const payload = AppleCrypto.KDFX963(
			shared,
			ephemeralPublicEcKey.toString("base64"),
			48
		);
		const derivedKey = payload.slice(0, 32);
		const initializationVector = payload.slice(payload.length - 16);

		const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, initializationVector);
		decipher.setAuthTag(encryptionTag);
		let decrypted = decipher.update(encryptedData, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	}
}

module.exports = AppleCrypto;
