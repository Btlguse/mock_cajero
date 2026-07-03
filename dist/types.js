"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcionOperacion = exports.OpcionMenuPrincipal = void 0;
var OpcionMenuPrincipal;
(function (OpcionMenuPrincipal) {
    OpcionMenuPrincipal[OpcionMenuPrincipal["AccederCuenta"] = 1] = "AccederCuenta";
    OpcionMenuPrincipal[OpcionMenuPrincipal["Salir"] = 2] = "Salir";
})(OpcionMenuPrincipal || (exports.OpcionMenuPrincipal = OpcionMenuPrincipal = {}));
var OpcionOperacion;
(function (OpcionOperacion) {
    OpcionOperacion[OpcionOperacion["ConsultarSaldo"] = 1] = "ConsultarSaldo";
    OpcionOperacion[OpcionOperacion["Depositar"] = 2] = "Depositar";
    OpcionOperacion[OpcionOperacion["Transferir"] = 3] = "Transferir";
    OpcionOperacion[OpcionOperacion["Retirar"] = 4] = "Retirar";
    OpcionOperacion[OpcionOperacion["CerrarSesion"] = 5] = "CerrarSesion";
})(OpcionOperacion || (exports.OpcionOperacion = OpcionOperacion = {}));
