# Caso de Uso Real: Procesamiento de un Pago

Este documento describe un flujo de procesamiento de un pago utilizando diferentes paradigmas y patrones arquitectónicos para construir un sistema escalable, mantenible y desacoplado.

---

## Flujo General

```
Transacción de Pago
        │
        ▼
1. Carga Extrema (Reactivo)
        │
        ▼
2. Autorización (AOP)
        │
        ▼
3. Reglas de Negocio (POO)
        │
        ▼
4. Cálculo y Manejo de Fallas (Programación Funcional + ROP)
        │
        ▼
5. Desacoplamiento mediante Eventos
```

---

# 1. Carga Extrema (Reactivo)

La aplicación recibe una gran cantidad de solicitudes simultáneas.

### Objetivo

Soportar altos niveles de concurrencia sin agotar la memoria ni bloquear los hilos de ejecución.

### Descripción

- Recibe aproximadamente **10.000 solicitudes por segundo**.
- La carga se administra mediante mecanismos de **Backpressure**.
- El sistema evita colapsar la memoria controlando el flujo de datos.

### Paradigma utilizado

- Programación Reactiva

---

# 2. Autorización (AOP)

Antes de ejecutar la lógica del negocio, la solicitud pasa por un interceptor transversal.

### Objetivo

Centralizar las responsabilidades comunes sin contaminar la lógica del negocio.

### Descripción

Un interceptor transversal realiza las siguientes tareas:

- Valida el token **JWT**.
- Inicia el proceso de auditoría.
- Solo después permite acceder a la lógica de negocio.

### Paradigma utilizado

- Aspect Oriented Programming (AOP)

---

# 3. Reglas de Negocio (POO)

Una vez autorizada la solicitud, comienza el procesamiento del dominio.

### Objetivo

Representar correctamente las entidades del negocio y proteger su estado interno.

### Descripción

Se instancia la entidad **Factura**, verificando su estado interno.

Ejemplo:

```text
Factura
Estado = Pendiente
```

Las reglas de negocio son ejecutadas sobre dicha entidad antes de continuar con el procesamiento.

### Paradigma utilizado

- Programación Orientada a Objetos (POO)

---

# 4. Cálculo y Manejo de Fallas (Programación Funcional + ROP)

Las operaciones matemáticas y las decisiones del flujo se implementan mediante funciones puras.

### Objetivo

Realizar cálculos sin efectos secundarios y manejar errores sin utilizar excepciones.

### Descripción

Las funciones puras realizan operaciones como:

- Cálculo de impuestos.
- Validaciones.
- Transformaciones de datos.

Si la tarjeta es rechazada:

- El flujo se desvía hacia una ruta de error.
- No se lanzan excepciones.
- Se utiliza un enfoque basado en resultados (Railway Oriented Programming - ROP).

### Paradigmas utilizados

- Programación Funcional
- Railway Oriented Programming (ROP)

---

# 5. Desacoplamiento mediante Eventos

Cuando el pago finaliza correctamente, el sistema comunica el resultado mediante eventos.

### Objetivo

Reducir el acoplamiento entre servicios.

### Descripción

Después de completar exitosamente la transacción:

- Se publica un evento llamado **PagoCompletado**.
- El evento es enviado al bus de datos.
- Otros servicios, como el servicio de envíos, consumen el evento de manera independiente.

### Paradigma utilizado

- Arquitectura Orientada a Eventos

---

# Resumen de Tecnologías y Paradigmas

| Etapa | Paradigma | Responsabilidad |
|--------|-----------|-----------------|
| Carga Extrema | Programación Reactiva | Manejo eficiente de altas cargas mediante Backpressure |
| Autorización | AOP | Validación de JWT y auditoría transversal |
| Reglas de Negocio | POO | Modelado de entidades y lógica del dominio |
| Cálculo y Fallas | Programación Funcional + ROP | Funciones puras y manejo de errores sin excepciones |
| Desacoplamiento | Eventos | Comunicación asíncrona entre servicios |

---

# Flujo Completo

```text
Solicitud de Pago
        │
        ▼
Recepción Reactiva
        │
        ▼
Interceptor AOP
        │
        ├── Validar JWT
        ├── Auditoría
        ▼
Dominio (Factura)
        │
        ▼
Funciones Puras
        │
        ├── Calcular impuestos
        ├── Validaciones
        ├── Tarjeta aceptada
        │        │
        │        ▼
        │   Publicar Evento
        │        │
        │        ▼
        │ Servicio de Envíos
        │
        └── Tarjeta rechazada
                 │
                 ▼
           Ruta de Error (ROP)
```