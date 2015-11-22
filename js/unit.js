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
                _this.receiveMessage(message);
            }
        });
    },

    sendMessage: function (message) {

        console.log(this.id, "send", message); //debug only

        this.server.send(
            message.adresat,
            message.text
        );
    },

    receiveMessage: function (message) {
        var decryptedMessage = cryptico.decrypt(message, this.cryptoPrivateKey).plaintext;
        var parsedMessage = JSON.parse(decryptedMessage);

        if (parsedMessage.adresat !== this.id) {
            //console.log(this.id, "resend", parsedMessage.adresat, parsedMessage.text);
            this.sendMessage(parsedMessage);
        } else {
            console.log(this.id, "received", parsedMessage.text);
        }
    },

    sendOriginalMessage: function (message) {
        var chain = this.generateChain(message.adresat);
        var userInfo = this.server.getUnitInfo(message.adresat);

        var resultMessage = {
            adresat: message.adresat,
            text: cryptico.encrypt(JSON.stringify(message), userInfo.publicKey).cipher
        };

        chain.map(function (currentItem) {

            userInfo = this.server.getUnitInfo(currentItem);
            encryptedMessage = cryptico.encrypt(JSON.stringify(resultMessage), userInfo.publicKey).cipher;

            resultMessage = {
                adresat: currentItem,
                text: encryptedMessage
            }
        });

        this.sendMessage(resultMessage);
    },

    generateChain: function (adresatUnitId) {
        var _this = this;

        var registeredUnits = this.server.getRegisteredUnits();
        var filteredUnits = Object.keys(registeredUnits).filter(function (value) {
            return value !== _this.id && value !== adresatUnitId;
        })

        // try to randomize
        var randomArray = window.crypto.getRandomValues(new Uint8Array(filteredUnits.length));
        var counter = 0;

        filteredUnits.sort(function(a, b) {
            return 128 - randomArray[counter++]; //128 cause Uint8Array/2
        });
        // /try to randomize

        return filteredUnits;
    }
}