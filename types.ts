export interface DatosCuenta {
  numeroCuenta: string;
  pin: string;
  titular: string;
  saldo: number;
}

export interface Movimiento {
  tipo: 'deposito' | 'retiro' | 'transferencia' | 'consulta';
  monto: number;
  fecha: string;
  estado: 'completado' | 'rechazado';
  descripcion?: string;
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
