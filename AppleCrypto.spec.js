const assert = require("assert");
const AppleCrypto = require("./AppleCrypto");

(async () => {
	try {
		const decryptedMessage = await AppleCrypto.decrypt(
			"BDiRKNnPiPUb5oala31nkmCaXMB0iyWy3Q93p6fN7vPxEQSUlFVsInkJzPBBqmW1FUIY1KBA3BQb3W3Qv4akZ8kblqbmvupE/EJzPKbROZFBNvxpvVOHHgO2qadmHAjHSmnxUuxrpKxopWnOgyhzUx+mBUTao0pcEgqZFw0Y/qZIJPf1KusCMlz5TAhpjsw=",
			"pX/BvdXXUdpC79mW/jWi10Z6PJb5SBY2+aqkR/qYOjqgakKsqZFKnl0kz10Ve+BP",
			"BNY+I93aHVkXnNWKVLdrMJLXpQ1BsyHYoiv6UNi4rDUsRx3sNNhW8FNy9yUwxYprAwwfj1ZkoJ61Fs+SwjIbGPtXi52arvSbPglyBN4uAxtP3VP3LCP4JtSEjdgsgsretA=="
		);
		assert.strictEqual(decryptedMessage, "xXTi32iZwrQ6O8Sy6r1isKwF6Ff1Py");

		const nonce = AppleCrypto.generateNonce();
		assert.strictEqual(nonce.length, 32);
		assert.strictEqual(Buffer.from(nonce, "base64").byteLength, 24);

		const keyPair = AppleCrypto.generateKeys();
		assert.strictEqual(keyPair.public.length, 132);
		assert.strictEqual(Buffer.from(keyPair.public, "base64").byteLength, 97);
		assert.strictEqual(keyPair.private.length, 64);
		assert.strictEqual(Buffer.from(keyPair.private, "base64").byteLength, 48);

		console.log("Testing finished");
	} catch (e) {
		console.log(e.message);
		console.log(e.stack);

		process.exit(1);
	}
})();
