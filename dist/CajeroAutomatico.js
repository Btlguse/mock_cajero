"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajeroAutomatico = void 0;
const promises_1 = require("node:readline/promises");
const node_events_1 = require("node:events");
const Cuenta_1 = require("./Cuenta");
const types_1 = require("./types");
class CajeroAutomatico extends node_events_1.EventEmitter {
    constructor() {
        super();
        this.cuentas = [];
        this.cacheAutenticacion = new Map();
        const cuentasIniciales = [
            { numeroCuenta: '1001', pin: '1111', titular: 'Andres Perez', saldo: 1500.0 },
            { numeroCuenta: '2002', pin: '2222', titular: 'Carla Miranda', saldo: 800.0 },
        ];
        for (const cuentaData of cuentasIniciales) {
            this.cuentas.push(new Cuenta_1.Cuenta(cuentaData.numeroCuenta, cuentaData.pin, cuentaData.titular, cuentaData.saldo));
        }
    }
    async iniciar() {
        const rl = (0, promises_1.createInterface)({ input: process.stdin, output: process.stdout });
        try {
            let salir = false;
            while (!salir) {
                console.log('\n=== CAJERO AUTOMATICO ===');
                console.log('1. Acceder a cuenta');
                console.log('2. Salir');
                const opcion = await this.pedirEntero(rl, 'Seleccione opcion: ');
                if (opcion === null) {
                    console.log('Opcion invalida.');
                    continue;
                }
                switch (opcion) {
                    case types_1.OpcionMenuPrincipal.AccederCuenta:
                        await this.autenticarYOperar(rl);
                        break;
                    case types_1.OpcionMenuPrincipal.Salir:
                        salir = true;
                        console.log('Gracias por usar el cajero.');
                        break;
                    default:
                        console.log('Opcion invalida.');
                        break;
                }
            }
        }
        finally {
            rl.close();
        }
    }
    async autenticarYOperar(rl) {
        const numero = await this.pedirTexto(rl, 'Ingrese numero de cuenta: ');
        const pin = await this.pedirTexto(rl, 'Ingrese PIN: ');
        const cuenta = this.autenticarConCache(numero, pin);
        if (!cuenta) {
            return;
        }
        let sesionActiva = true;
        while (sesionActiva) {
            console.log('\n--- MENU DE OPERACIONES ---');
            console.log('1. Consultar saldo');
            console.log('2. Depositar');
            console.log('3. Transferir');
            console.log('4. Retirar');
            console.log('5. Cerrar sesion');
            const op = await this.pedirEntero(rl, 'Seleccione opcion: ');
            if (op === null) {
                console.log('Opcion invalida.');
                continue;
            }
            switch (op) {
                case types_1.OpcionOperacion.ConsultarSaldo:
                    this.consultarSaldo(cuenta);
                    break;
                case types_1.OpcionOperacion.Depositar:
                    await this.depositar(cuenta, rl);
                    break;
                case types_1.OpcionOperacion.Transferir:
                    await this.transferir(cuenta, rl);
                    break;
                case types_1.OpcionOperacion.Retirar:
                    await this.retirar(cuenta, rl);
                    break;
                case types_1.OpcionOperacion.CerrarSesion:
                    sesionActiva = false;
                    this.emit('sesionCerrada');
                    break;
                default:
                    console.log('Opcion invalida.');
            }
        }
    }
    autenticarConCache(numero, pin) {
        const clave = `${numero}:${pin}`;
        if (this.cacheAutenticacion.has(clave)) {
            const cuenta = this.cacheAutenticacion.get(clave);
            this.emit('autenticacionExitosa', cuenta);
            return cuenta;
        }
        const cuenta = this.cuentas.find((c) => c.getNumeroCuenta() === numero && c.getPin() === pin);
        if (cuenta) {
            this.cacheAutenticacion.set(clave, cuenta);
            this.emit('autenticacionExitosa', cuenta);
            return cuenta;
        }
        this.emit('autenticacionFallida', { numero });
        return null;
    }
    consultarSaldo(cuenta) {
        const saldo = cuenta.getSaldo();
        this.emit('saldoConsultado', { titular: cuenta.getTitular(), saldo });
    }
    async depositar(cuenta, rl) {
        const monto = await this.pedirDecimal(rl, 'Ingrese monto a depositar: $');
        if (monto === null) {
            this.emit('operacionInvalida', { tipo: 'deposito', razon: 'monto no válido' });
            return;
        }
        if (monto <= 0) {
            this.emit('operacionInvalida', { tipo: 'deposito', razon: 'monto debe ser positivo' });
            return;
        }
        cuenta.setSaldo(cuenta.getSaldo() + monto);
        this.emit('depositoRealizado', { titular: cuenta.getTitular(), monto, nuevoSaldo: cuenta.getSaldo() });
    }
    async transferir(cuentaOrigen, rl) {
        const numeroDestino = await this.pedirTexto(rl, 'Ingrese numero de cuenta destino: ');
        const cuentaDestino = this.cuentas.find((item) => item.getNumeroCuenta() === numeroDestino);
        if (!cuentaDestino) {
            this.emit('operacionInvalida', { tipo: 'transferencia', razon: 'cuenta destino no existe' });
            return;
        }
        const monto = await this.pedirDecimal(rl, 'Ingrese monto a transferir: $');
        if (monto === null) {
            this.emit('operacionInvalida', { tipo: 'transferencia', razon: 'monto no válido' });
            return;
        }
        if (monto <= 0) {
            this.emit('operacionInvalida', { tipo: 'transferencia', razon: 'monto debe ser positivo' });
            return;
        }
        if (cuentaOrigen.getSaldo() < monto) {
            this.emit('operacionInvalida', { tipo: 'transferencia', razon: 'saldo insuficiente' });
            return;
        }
        cuentaOrigen.setSaldo(cuentaOrigen.getSaldo() - monto);
        cuentaDestino.setSaldo(cuentaDestino.getSaldo() + monto);
        this.emit('transferenciaRealizada', {
            origen: cuentaOrigen.getTitular(),
            destino: cuentaDestino.getTitular(),
            monto,
            nuevoSaldoOrigen: cuentaOrigen.getSaldo(),
        });
    }
    async retirar(cuenta, rl) {
        const monto = await this.pedirDecimal(rl, 'Ingrese monto a retirar: $');
        if (monto === null) {
            this.emit('operacionInvalida', { tipo: 'retiro', razon: 'monto no válido' });
            return;
        }
        if (monto <= 0) {
            this.emit('operacionInvalida', { tipo: 'retiro', razon: 'monto debe ser positivo' });
            return;
        }
        if (cuenta.getSaldo() < monto) {
            this.emit('operacionInvalida', { tipo: 'retiro', razon: 'saldo insuficiente' });
            return;
        }
        cuenta.setSaldo(cuenta.getSaldo() - monto);
        this.emit('retiroRealizado', { titular: cuenta.getTitular(), monto, nuevoSaldo: cuenta.getSaldo() });
    }
    async pedirTexto(rl, mensaje) {
        return rl.question(mensaje);
    }
    async pedirEntero(rl, mensaje) {
        const valor = await rl.question(mensaje);
        const numero = Number.parseInt(valor, 10);
        return Number.isNaN(numero) ? null : numero;
    }
    async pedirDecimal(rl, mensaje) {
        const valor = await rl.question(mensaje);
        const numero = Number.parseFloat(valor);
        return Number.isNaN(numero) ? null : numero;
    }
}
exports.CajeroAutomatico = CajeroAutomatico;
