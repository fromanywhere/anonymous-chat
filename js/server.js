// Здесь опишем «сервер», через который будут ходить сообщения до реализации p2p

function Server() {
    this.units = {};
}

Server.prototype = {

    registerUnit: function (unit) {
        this.units[unit.id] = unit;
    },

    getRegisteredUnits: function () {
        return this.units;
    },

    getUnitInfo: function (unitId) {
        return this.units[unitId];
    },

    send: function (message) {
        this.units[message.recipient].receiveCallback(message.content);
    }
}