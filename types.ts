export interface DatosCuenta {
  numeroCuenta: string;
  pin: string;
  titular: string;
  saldo: number;
}

export enum OPCION_MENU {
  AccederCuenta = 1,
  Salir = 2,
}

export enum OPCION_OPREACION {
  ConsultarSaldo = 1,
  Depositar = 2,
  Transferir = 3,
  Retirar = 4,
  CerrarSesion = 5,
}
