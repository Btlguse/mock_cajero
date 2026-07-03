"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CajeroAutomatico_1 = require("./CajeroAutomatico");
async function main() {
    const cajero = new CajeroAutomatico_1.CajeroAutomatico();
    // === LISTENERS PARA EVENTOS ===
    cajero.on('autenticacionExitosa', (cuenta) => {
        console.log(`\nBienvenido ${cuenta.getTitular()}`);
    });
    cajero.on('autenticacionFallida', (datos) => {
        console.log('Numero de cuenta o PIN incorrectos.');
    });
    cajero.on('saldoConsultado', (datos) => {
        console.log(`Saldo actual: $${datos.saldo}`);
    });
    cajero.on('depositoRealizado', (datos) => {
        console.log(`Deposito exitoso. Nuevo saldo: $${datos.nuevoSaldo}`);
    });
    cajero.on('transferenciaRealizada', (datos) => {
        console.log(`Transferencia exitosa. Nuevo saldo: $${datos.nuevoSaldoOrigen}`);
    });
    cajero.on('retiroRealizado', (datos) => {
        console.log(`Retiro exitoso. Nuevo saldo: $${datos.nuevoSaldo}`);
    });
    cajero.on('operacionInvalida', (datos) => {
        console.log(`[${datos.tipo}] ${datos.razon}`);
    });
    cajero.on('sesionCerrada', () => {
        console.log('Sesion cerrada.');
    });
    await cajero.iniciar();
}
main().catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
});
