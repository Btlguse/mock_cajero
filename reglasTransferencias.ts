import { Resultado, fallo, validarMonto } from './validaciones';

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
