export type Resultado<T> =
  | { estado: 'exito'; valor: T }
  | { estado: 'error'; mensaje: string };

export function exito<T>(valor: T): Resultado<T> {
  return { estado: 'exito', valor };
}

export function fallo<T>(mensaje: string): Resultado<T> {
  return { estado: 'error', mensaje };
}

export function validarMonto(monto: number): Resultado<number> {
  if (!Number.isFinite(monto)) {
    return fallo('monto no válido');
  }

  if (monto <= 0) {
    return fallo('monto debe ser positivo');
  }

  return exito(monto);
}

export function validarTransferencia(monto: number, saldo: number): Resultado<number> {
  const montoValido = validarMonto(monto);

  if (montoValido.estado === 'error') {
    return montoValido;
  }

  if (saldo < montoValido.valor) {
    return fallo('saldo insuficiente');
  }

  return montoValido;
}

export function calcularComision(monto: number): number {
  return monto > 500 ? 5 : 0;
}
