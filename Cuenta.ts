export class Cuenta {
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
}
