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
