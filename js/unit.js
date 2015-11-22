//Здесь опишем класс узла сети

function Unit(name) {
    this.id = name; //temporary
    this.cryptoGenerationKey = name; //temporary
    this.cryptoBits = 512;
    this.cryptoPrivateKey = null;
    this.cryptoPublicKey = null;

    this.generateCryptoKeys();
    this.registerUnit(server); // global
}

Unit.prototype = {

    generateCryptoKeys: function () {
        this.cryptoPrivateKey = cryptico.generateRSAKey(this.cryptoGenerationKey, this.cryptoBits);
        this.cryptoPublicKey = cryptico.publicKeyString(this.cryptoPrivateKey);
    },

    registerUnit: function (server) {
        var _this = this;

        server.registerUnit({
            id: _this.id,
            publicKey: _this.cryptoPublicKey,
            receiveCallback: function (message) {
                var receivedMessage = _this.receiveMessage(message);
                console.log("receive", receivedMessage);
            }
        });
    },

    sendMessage: function (userPublicKey, message) {
        var encryptedMessage = cryptico.encrypt(message, userPublicKey).cipher;
        return encryptedMessage;
    },

    receiveMessage: function (message) {
        var decryptedMessage = cryptico.decrypt(message, this.cryptoPrivateKey).plaintext;
        return decryptedMessage;
    },

    generateChain: function (server) {
        return null;
    }
}