import { fallo, exito, Resultado, validarMonto } from './validaciones';
import { validarTransferencia } from './reglasTransferencias';
import { calcularComision } from './reglasComisiones';
import { Movimiento } from './types';

export class Cuenta {
  private movimientos: Movimiento[] = [];
  private intentosFallidos = 0;
  private bloqueadaHasta: Date | null = null;

  constructor(
    private numeroCuenta: string,
    private pin: string,
    private titular: string,
    private saldo: number
  ) {}

  public getNumeroCuenta(): string {
    return this.numeroCuenta;
  }

  public getPin(): string {
    return this.pin;
  }

  public getTitular(): string {
    return this.titular;
  }

  public getSaldo(): number {
    return this.saldo;
  }

  public setSaldo(saldo: number): void {
    this.saldo = saldo;
  }

  public getMovimientos(): Movimiento[] {
    return [...this.movimientos];
  }

  public estaBloqueada(): boolean {
    if (!this.bloqueadaHasta) {
      return false;
    }

    if (this.bloqueadaHasta <= new Date()) {
      this.bloqueadaHasta = null;
      this.intentosFallidos = 0;
      return false;
    }

    return true;
  }

  public validarPin(pin: string): boolean {
    if (this.estaBloqueada()) {
      return false;
    }

    if (pin !== this.pin) {
      this.intentosFallidos += 1;

      if (this.intentosFallidos >= 3) {
        this.bloqueadaHasta = new Date(Date.now() + 5 * 60 * 1000);
        this.intentosFallidos = 0;
      }

      return false;
    }

    this.intentosFallidos = 0;
    return true;
  }

  public depositar(monto: number): Resultado<number> {
    const resultadoMonto = validarMonto(monto);

    if (resultadoMonto.estado === 'error') {
      this.registrarMovimiento('deposito', 0, 'rechazado', resultadoMonto.mensaje);
      return resultadoMonto;
    }

    this.saldo += resultadoMonto.valor;
    this.registrarMovimiento('deposito', resultadoMonto.valor, 'completado', 'Deposito realizado');

    return exito(this.saldo);
  }

  public retirar(monto: number): Resultado<number> {
    const resultadoMonto = validarMonto(monto);

    if (resultadoMonto.estado === 'error') {
      this.registrarMovimiento('retiro', 0, 'rechazado', resultadoMonto.mensaje);
      return resultadoMonto;
    }

    if (this.saldo < resultadoMonto.valor) {
      this.registrarMovimiento('retiro', resultadoMonto.valor, 'rechazado', 'saldo insuficiente');
      return fallo('saldo insuficiente');
    }

    this.saldo -= resultadoMonto.valor;
    this.registrarMovimiento('retiro', resultadoMonto.valor, 'completado', 'Retiro realizado');

    return exito(this.saldo);
  }

  public transferir(
    monto: number,
    cuentaDestino: Cuenta
  ): Resultado<{ nuevoSaldoOrigen: number; nuevoSaldoDestino: number; comision: number }> {
    const resultadoTransferencia = validarTransferencia(monto, this.saldo);

    if (resultadoTransferencia.estado === 'error') {
      this.registrarMovimiento('transferencia', 0, 'rechazado', resultadoTransferencia.mensaje);
      return resultadoTransferencia as Resultado<{ nuevoSaldoOrigen: number; nuevoSaldoDestino: number; comision: number }>;
    }

    const comision = calcularComision(resultadoTransferencia.valor);
    const total = resultadoTransferencia.valor + comision;

    if (this.saldo < total) {
      this.registrarMovimiento('transferencia', resultadoTransferencia.valor, 'rechazado', 'saldo insuficiente');
      return fallo('saldo insuficiente');
    }

    this.saldo -= total;
    cuentaDestino.aplicarDepositoInterno(resultadoTransferencia.valor);
    this.registrarMovimiento('transferencia', resultadoTransferencia.valor, 'completado', `Transferencia enviada a ${cuentaDestino.getTitular()}`);

    return exito({
      nuevoSaldoOrigen: this.saldo,
      nuevoSaldoDestino: cuentaDestino.getSaldo(),
      comision,
    });
  }

  public consultarSaldo(): Resultado<number> {
    this.registrarMovimiento('consulta', 0, 'completado', 'Saldo consultado');
    return exito(this.saldo);
  }

  private aplicarDepositoInterno(monto: number): void {
    this.saldo += monto;
    this.registrarMovimiento('transferencia', monto, 'completado', 'Transferencia recibida');
  }

  private registrarMovimiento(
    tipo: Movimiento['tipo'],
    monto: number,
    estado: Movimiento['estado'],
    descripcion?: string
  ): void {
    this.movimientos.push({
      tipo,
      monto,
      fecha: new Date().toLocaleString('es-ES'),
      estado,
      descripcion,
    });
  }
}
