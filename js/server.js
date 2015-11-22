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

    getUnitInfo: function (unitId) {
        return this.units[unitId];
    },

    send: function (unitId, message) {
    //console.log(unitId, message);
        this.units[unitId].receiveCallback(message);
    }
}