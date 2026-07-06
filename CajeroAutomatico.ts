import { createInterface, Interface } from 'node:readline/promises';
import { EventEmitter } from 'node:events';
import { Cuenta } from './Cuenta';
import { DatosCuenta, OPCION_MENU, OPCION_OPREACION } from './types';

export class CajeroAutomatico extends EventEmitter {
  private cuentas: Cuenta[] = [];
  private cacheAutenticacion: Map<string, Cuenta> = new Map<string, Cuenta>();

  constructor() {
    super();
    const cuentasIniciales: DatosCuenta[] = [
      { numeroCuenta: '1001', pin: '1111', titular: 'Andres Perez', saldo: 1500.0 },
      { numeroCuenta: '2002', pin: '2222', titular: 'Carla Miranda', saldo: 800.0 },
    ];

    for (const cuentaData of cuentasIniciales) {
      this.cuentas.push(
        new Cuenta(
          cuentaData.numeroCuenta,
          cuentaData.pin,
          cuentaData.titular,
          cuentaData.saldo
        )
      );
    }
  }

  public async iniciar(): Promise<void> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });

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
          case OPCION_MENU.AccederCuenta:
            await this.autenticarYOperar(rl);
            break;
          case OPCION_MENU.Salir:
            salir = true;
            console.log('Gracias por usar el cajero.');
            break;
          default:
            console.log('Opcion invalida.');
            break;
        }
      }
    } finally {
      rl.close();
    }
  }

  private async autenticarYOperar(rl: Interface): Promise<void> {
    const numero = await this.pedirTexto(rl, 'Ingrese numero de cuenta: ');
    const pin = await this.pedirTexto(rl, 'Ingrese PIN: ');

    const cuenta = this.autenticarConCache(numero, pin);
    if (!cuenta) {
      return;
    }

    if (cuenta.estaBloqueada()) {
      this.emit('cuentaBloqueada', { titular: cuenta.getTitular() });
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
        case OPCION_OPREACION.ConsultarSaldo:
          this.consultarSaldo(cuenta);
          break;
        case OPCION_OPREACION.Depositar:
          await this.depositar(cuenta, rl);
          break;
        case OPCION_OPREACION.Transferir:
          await this.transferir(cuenta, rl);
          break;
        case OPCION_OPREACION.Retirar:
          await this.retirar(cuenta, rl);
          break;
        case OPCION_OPREACION.CerrarSesion:
          sesionActiva = false;
          this.emit('sesionCerrada');
          break;
        default:
          console.log('Opcion invalida.');
      }
    }
  }

  private autenticarConCache(numero: string, pin: string): Cuenta | null {
    const cuenta = this.cuentas.find((item) => item.getNumeroCuenta() === numero);

    if (!cuenta) {
      this.emit('autenticacionFallida', { numero });
      return null;
    }

    if (cuenta.estaBloqueada()) {
      this.emit('cuentaBloqueada', { titular: cuenta.getTitular() });
      return null;
    }

    const clave = `${numero}:${pin}`;
    if (this.cacheAutenticacion.has(clave)) {
      const cuentaCacheada = this.cacheAutenticacion.get(clave)!;
      this.emit('autenticacionExitosa', cuentaCacheada);
      return cuentaCacheada;
    }

    if (!cuenta.validarPin(pin)) {
      this.emit('autenticacionFallida', { numero });
      return null;
    }

    this.cacheAutenticacion.set(clave, cuenta);
    this.emit('autenticacionExitosa', cuenta);
    return cuenta;
  }

  private consultarSaldo(cuenta: Cuenta): void {
    const resultado = cuenta.consultarSaldo();

    if (resultado.estado === 'error') {
      this.emit('operacionInvalida', { tipo: 'consulta', razon: resultado.mensaje });
      return;
    }

    this.emit('saldoConsultado', { titular: cuenta.getTitular(), saldo: resultado.valor });
  }

  private async depositar(cuenta: Cuenta, rl: Interface): Promise<void> {
    const monto = await this.pedirDecimal(rl, 'Ingrese monto a depositar: $');

    if (monto === null) {
      this.emit('operacionInvalida', { tipo: 'deposito', razon: 'monto no válido' });
      return;
    }

    const resultado = cuenta.depositar(monto);

    if (resultado.estado === 'error') {
      this.emit('operacionInvalida', { tipo: 'deposito', razon: resultado.mensaje });
      return;
    }

    this.emit('depositoRealizado', { titular: cuenta.getTitular(), monto, nuevoSaldo: resultado.valor });
    this.emit('movimientoRegistrado', { titular: cuenta.getTitular(), tipo: 'deposito', monto });

    if (resultado.valor < 100) {
      this.emit('saldoBajo', { titular: cuenta.getTitular(), saldo: resultado.valor, umbral: 100 });
    }
  }

  private async transferir(cuentaOrigen: Cuenta, rl: Interface): Promise<void> {
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

    const resultado = cuentaOrigen.transferir(monto, cuentaDestino);

    if (resultado.estado === 'error') {
      this.emit('operacionInvalida', { tipo: 'transferencia', razon: resultado.mensaje });
      return;
    }

    this.emit('transferenciaRealizada', {
      origen: cuentaOrigen.getTitular(),
      destino: cuentaDestino.getTitular(),
      monto,
      nuevoSaldoOrigen: resultado.valor.nuevoSaldoOrigen,
      comision: resultado.valor.comision,
    });
    this.emit('movimientoRegistrado', { titular: cuentaOrigen.getTitular(), tipo: 'transferencia', monto });

    if (resultado.valor.nuevoSaldoOrigen < 100) {
      this.emit('saldoBajo', { titular: cuentaOrigen.getTitular(), saldo: resultado.valor.nuevoSaldoOrigen, umbral: 100 });
    }
  }

  private async retirar(cuenta: Cuenta, rl: Interface): Promise<void> {
    const monto = await this.pedirDecimal(rl, 'Ingrese monto a retirar: $');

    if (monto === null) {
      this.emit('operacionInvalida', { tipo: 'retiro', razon: 'monto no válido' });
      return;
    }

    const resultado = cuenta.retirar(monto);

    if (resultado.estado === 'error') {
      this.emit('operacionInvalida', { tipo: 'retiro', razon: resultado.mensaje });
      return;
    }

    this.emit('retiroRealizado', { titular: cuenta.getTitular(), monto, nuevoSaldo: resultado.valor });
    this.emit('movimientoRegistrado', { titular: cuenta.getTitular(), tipo: 'retiro', monto });

    if (resultado.valor < 100) {
      this.emit('saldoBajo', { titular: cuenta.getTitular(), saldo: resultado.valor, umbral: 100 });
    }
  }

  private async pedirTexto(rl: Interface, mensaje: string): Promise<string> {
    return rl.question(mensaje);
  }

  private async pedirEntero(rl: Interface, mensaje: string): Promise<number | null> {
    const valor = await rl.question(mensaje);
    const numero = Number.parseInt(valor, 10);
    return Number.isNaN(numero) ? null : numero;
  }

  private async pedirDecimal(rl: Interface, mensaje: string): Promise<number | null> {
    const valor = await rl.question(mensaje);
    const numero = Number.parseFloat(valor);
    return Number.isNaN(numero) ? null : numero;
  }
}
