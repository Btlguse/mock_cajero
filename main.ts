import { CajeroAutomatico } from './CajeroAutomatico';
import { Cuenta } from './Cuenta';

async function main(): Promise<void> {
  const cajero = new CajeroAutomatico();

  // === LISTENERS PARA EVENTOS ===

  cajero.on('autenticacionExitosa', (cuenta: Cuenta) => {
    console.log(`\nBienvenido ${cuenta.getTitular()}`);
  });

  cajero.on('autenticacionFallida', (datos: { numero: string }) => {
    console.log('Numero de cuenta o PIN incorrectos.');
  });

  cajero.on('saldoConsultado', (datos: { titular: string; saldo: number }) => {
    console.log(`Saldo actual: $${datos.saldo}`);
  });

  cajero.on('depositoRealizado', (datos: { titular: string; monto: number; nuevoSaldo: number }) => {
    console.log(`Deposito exitoso. Nuevo saldo: $${datos.nuevoSaldo}`);
  });

  cajero.on('transferenciaRealizada', (datos: { origen: string; destino: string; monto: number; nuevoSaldoOrigen: number; comision: number }) => {
    console.log(`Transferencia exitosa. Nuevo saldo: $${datos.nuevoSaldoOrigen} (comision: $${datos.comision})`);
  });

  cajero.on('retiroRealizado', (datos: { titular: string; monto: number; nuevoSaldo: number }) => {
    console.log(`Retiro exitoso. Nuevo saldo: $${datos.nuevoSaldo}`);
  });

  cajero.on('operacionInvalida', (datos: { tipo: string; razon: string }) => {
    console.log(`[${datos.tipo}] ${datos.razon}`);
  });

  cajero.on('movimientoRegistrado', (datos: { titular: string; tipo: string; monto: number }) => {
    console.log(`[Auditoria] ${datos.titular} realizo ${datos.tipo} por $${datos.monto}`);
  });

  cajero.on('saldoBajo', (datos: { titular: string; saldo: number; umbral: number }) => {
    console.log(`Alerta: ${datos.titular} tiene saldo bajo ($${datos.saldo}) por debajo de $${datos.umbral}`);
  });

  cajero.on('cuentaBloqueada', (datos: { titular: string }) => {
    console.log(`Cuenta bloqueada temporalmente para ${datos.titular}.`);
  });

  cajero.on('sesionCerrada', () => {
    console.log('Sesion cerrada.');
  });

  await cajero.iniciar();
}

main().catch((error: unknown) => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
