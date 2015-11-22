//Здесь опишем класс узла сети

function Unit(name) {
    this.id = name; //temporary
    this.cryptoGenerationKey = name; //temporary
    this.cryptoBits = 512;
    this.cryptoPrivateKey = null;
    this.cryptoPublicKey = null;

    this.server = server; // global

    this.generateCryptoKeys();
    this.registerUnit();
}

Unit.prototype = {

    generateCryptoKeys: function () {
        this.cryptoPrivateKey = cryptico.generateRSAKey(this.cryptoGenerationKey, this.cryptoBits);
        this.cryptoPublicKey = cryptico.publicKeyString(this.cryptoPrivateKey);
    },

    registerUnit: function (server) {
        var _this = this;

        _this.server.registerUnit({
            id: _this.id,
            publicKey: _this.cryptoPublicKey,
            receiveCallback: function (message) {
                var receivedMessage = _this.receiveMessage(message);
                console.log(_this.id, "received", receivedMessage);
            }
        });
    },

    sendMessage: function (message) {
        var userInfo = this.server.getUnitInfo(message.adresat);
        var encryptedMessage = cryptico.encrypt(message.text, userInfo.publicKey).cipher;

        console.log(this.id, "send", message); //debug only

        this.server.send(
            message.adresat,
            encryptedMessage
        );
    },

    receiveMessage: function (message) {
        var decryptedMessage = cryptico.decrypt(message, this.cryptoPrivateKey).plaintext;
        return decryptedMessage;
    },

    generateChain: function (server) {
        return null;
    }
}