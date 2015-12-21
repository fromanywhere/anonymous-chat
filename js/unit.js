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

    this.messages = {};
    this.receiveCallback = function () {};
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

    registerReceiveCallback: function (callback) {
        this.receiveCallback = callback;
    },

    sendMessage: function (message) {
        console.log(this.id, "send", message); //debug only
        this.server.send(message);
    },

    receiveMessage: function (message) {
        var decryptedMessage = cryptico.decrypt(message, this.cryptoPrivateKey).plaintext;
        var parsedMessage = JSON.parse(decryptedMessage);

        // если не мне, переслать дальше
        if (parsedMessage.recipient !== this.id) {
            this.sendMessage(parsedMessage);
        } else {
            //!console.log(this.id, "received", parsedMessage);

            // если мне
            if (parsedMessage.type === "message") {
                setTimeout(function () { // temporary
                    this.receiveCallback("received", parsedMessage.content);
                }.bind(this), 500);
            }

            // если мне, и есть инструкция по получению, выполнить
            if (parsedMessage.type === "message" && parsedMessage.callback) {
                setTimeout(function () { // temporary
                    this.sendMessage(parsedMessage.callback);
                }.bind(this), 1000);
            }

            // если мне, и информация о выполнении, проверить статус
            if (parsedMessage.type === "callback") {
                if (this.messages[parsedMessage.content] === "sent") {
                    this.messages[parsedMessage.content] = "delivered";
                    //!console.log(this.id, "delivered", parsedMessage.content);
                    this.receiveCallback("delivered", parsedMessage.content);
                }
            }
        }
    },

    sendOriginalMessage: function (messageParams) {
        var _this = this;
        var userInfo = this.server.getUnitInfo(messageParams.recipient);
        var messageHash = SHA256(messageParams.content + messageParams.timestamp);

        if (messageParams.type === "message") {
            var callbackParams = {
                recipient: _this.id,
                type: "callback",
                content: messageHash
            }

            var callbackMessage = {
                recipient: callbackParams.recipient,
                content: cryptico.encrypt(JSON.stringify(callbackParams), _this.cryptoPublicKey).cipher,
                type: callbackParams.type
            }

            messageParams.callback = this.embedMessage(callbackMessage, messageParams.recipient, _this.id);
        }

        var resultMessage = {
            recipient: messageParams.recipient,
            content: cryptico.encrypt(JSON.stringify(messageParams), userInfo.publicKey).cipher,
            type: messageParams.type
        };

        var originalMessage = this.embedMessage(resultMessage, _this.id, messageParams.recipient);

        //!console.log(_this.id, "sent", messageParams.content, messageHash, "to", messageParams.recipient);

        this.messages[messageHash] = "sent";
        this.sendMessage(originalMessage);
    },

    embedMessage: function (message, senderId, recipientId) { //recipientUnitId
        var _this = this;
        var resultMessage = message;

        // get chain
        var registeredUnits = this.server.getRegisteredUnits();
        var filteredUnits = Object.keys(registeredUnits).filter(function (value) {
            return value !== senderId && value !== recipientId;
        })

        // try to randomize
        var randomArray = window.crypto.getRandomValues(new Uint8Array(filteredUnits.length));
        var counter = 0;

        filteredUnits.sort(function(a, b) {
            return 128 - randomArray[counter++]; //128 cause Uint8Array/2
        });
        // /try to randomize

        filteredUnits.map(function (currentItem) {

            userInfo = this.server.getUnitInfo(currentItem);
            encryptedMessage = cryptico.encrypt(JSON.stringify(resultMessage), userInfo.publicKey).cipher;

            resultMessage = {
                recipient: currentItem,
                content: encryptedMessage
            }
        });

        return resultMessage;
    }
}