// Здесь опишем «сервер», через который будут ходить сообщения до реализации p2p

function Server() {
    this.units = {};
}

Server.prototype = {

    registerUnit: function (unit) {
        console.log("regiser", unit);
        this.units[unit.id] = unit;
    },

    getRegisteredUnits: function () {
        return this.units;
    },

    send: function (unitId, message) {
        this.units[unitId].receiveCallback(message);
    }
}