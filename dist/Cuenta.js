"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cuenta = void 0;
class Cuenta {
    constructor(numeroCuenta, pin, titular, saldo) {
        this.numeroCuenta = numeroCuenta;
        this.pin = pin;
        this.titular = titular;
        this.saldo = saldo;
    }
    getNumeroCuenta() {
        return this.numeroCuenta;
    }
    getPin() {
        return this.pin;
    }
    getTitular() {
        return this.titular;
    }
    getSaldo() {
        return this.saldo;
    }
    setSaldo(saldo) {
        this.saldo = saldo;
    }
}
exports.Cuenta = Cuenta;
