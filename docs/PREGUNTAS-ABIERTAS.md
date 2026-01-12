# Preguntas Abiertas para Validación con Cliente

**Proyecto:** Sistema de Gestión Operativa - Forestal Santa Lucía SpA  
**Fecha:** 2026-01-09  
**Estado:** Pendiente de respuestas  

---

## Instrucciones

Estas preguntas deben ser respondidas por el cliente **antes de iniciar el desarrollo** para evitar retrabajo y asegurar que el sistema se ajuste a la operación real.

Marcar con ✅ cuando esté respondida.

---

## 🔴 Preguntas Críticas (Bloqueantes)

### 1. Modelo de Operación

- [x] **P1.1** ¿Existe una bodega física propia donde se almacenan los pallets?
  - ✅ **RESPONDIDA:** No hay bodega física. Los pallets viajan directamente del proveedor al cliente.
  - Modelo confirmado: **Intermediación comercial**

- [ ] **P1.2** ¿Cuál es el criterio para usar guía propia de FSL vs pasar la guía del proveedor al cliente?
  - Opciones posibles:
    - a) Siempre se emite guía propia
    - b) Depende del cliente (algunos exigen guía de FSL)
    - c) Depende de si pasa por bodega o va directo
    - d) Otro: _________________________________
  - Respuesta: _________________________________

- [ ] **P1.3** ¿Existe un correlativo actual de guías propias que debe continuarse?
  - Si existe: ¿Cuál es el último número usado? _____________
  - Formato actual: _________________________________

### 2. Guía de Despacho

- [ ] **P2.1** ¿Qué datos debe llevar obligatoriamente la guía propia impresa?
  - Marcar los que apliquen:
    - [ ] RUT y razón social de FSL (emisor)
    - [ ] RUT y razón social del cliente (destinatario)
    - [ ] Dirección de origen
    - [ ] Dirección de destino
    - [ ] Nombre del chofer
    - [ ] RUT del chofer
    - [ ] Patente del vehículo
    - [ ] Fecha y hora
    - [ ] Detalle de productos (tipo, cantidad)
    - [ ] Otros: _________________________________

- [ ] **P2.2** ¿Existe un formato físico preimpreso de guías propias actualmente?
  - Respuesta: _________________________________

---

## 🟡 Preguntas Importantes (Afectan diseño)

### 3. Aspectos Comerciales

- [ ] **P3.1** ¿El sistema debe registrar precios de compra y venta?
  - Opciones:
    - a) Sí, es importante para control de rentabilidad
    - b) No, solo interesa control de cantidades/stock
    - c) Opcional (poder ingresarlo pero no obligatorio)
  - Respuesta: _________________________________

- [ ] **P3.2** ¿Los clientes emiten órdenes de compra formales o son pedidos informales (teléfono, WhatsApp)?
  - Respuesta: _________________________________

### 4. Operación Diaria

- [ ] **P4.1** ¿Cómo se confirma actualmente que una entrega fue realizada correctamente?
  - Opciones:
    - a) Firma del cliente en guía física
    - b) Timbre de recepción
    - c) Confirmación verbal/WhatsApp
    - d) No hay confirmación formal
    - e) Otro: _________________________________
  - Respuesta: _________________________________

- [ ] **P4.2** ¿Son frecuentes las entregas parciales? (ej: piden 500, se entregan 300 hoy y 200 mañana)
  - Respuesta: _________________________________

- [ ] **P4.3** ¿Existen devoluciones de clientes? ¿Con qué frecuencia?
  - Respuesta: _________________________________

### 5. Pallets Certificados

- [ ] **P5.1** ¿Los pallets certificados requieren documentación adicional (certificados NIMF-15, tratamiento fitosanitario)?
  - Respuesta: _________________________________

- [ ] **P5.2** ¿Se debe poder adjuntar esta documentación en el sistema?
  - Respuesta: _________________________________

---

## 🟢 Preguntas Operativas (Para dimensionar)

### 6. Volumen y Usuarios

- [ ] **P6.1** ¿Cuántas operaciones (compras + ventas) se realizan aproximadamente por día/semana?
  - Respuesta: _________________________________

- [ ] **P6.2** ¿Cuántas personas usarán el sistema?
  - Administradores: _____
  - Operadores: _____

- [ ] **P6.3** ¿Desde dónde se usará el sistema? (oficina, terreno, ambos)
  - Respuesta: _________________________________

### 7. Datos Iniciales

- [x] **P7.1** ~~¿Se conoce el stock actual de cada tipo de pallet?~~
  - ✅ **NO APLICA:** No hay stock físico (modelo intermediación)
  - El sistema arrancará registrando operaciones desde cero o desde fecha de corte

- [ ] **P7.2** ¿Se desea migrar histórico de operaciones anteriores o empezar desde cero?
  - Respuesta: _________________________________

- [ ] **P7.3** ¿Existen compras ya realizadas (pendientes de entregar a clientes) que deban cargarse al inicio?
  - Respuesta: _________________________________

---

## Espacio para Notas Adicionales

```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

## Firma de Validación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Cliente/Dueño | | | |
| Project Manager | | | |

---

*Documento generado automáticamente desde el SDD v1.0*

