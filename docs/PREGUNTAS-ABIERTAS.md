# Preguntas Abiertas para Validación con Cliente

**Proyecto:** Sistema de Gestión Operativa - Forestal Santa Lucía SpA  
**Versión:** 2.0  
**Fecha:** 2026-01-12  
**Estado:** Mayoría de preguntas críticas resueltas ✅  

---

## 📊 Estado General

| Categoría | Total | Resueltas ✅ | Pendientes ⏳ |
|-----------|-------|-------------|--------------|
| Preguntas Críticas | 8 | 7 | 1 |
| Preguntas Importantes | 6 | 5 | 1 |
| Preguntas Operativas | 3 | 0 | 3 |
| **TOTAL** | **17** | **12 (71%)** | **5 (29%)** |

> **Nota v2.0:** La mayoría de preguntas críticas fueron respondidas durante las sesiones de validación del cliente. Las pendientes son **no bloqueantes** para iniciar desarrollo del MVP.

---

## ✅ Preguntas Resueltas (v2.0)

### 1. Modelo de Operación

- [x] **P1.1** ¿Existe una bodega física propia donde se almacenan los pallets?
  - ✅ **RESPONDIDA:** No hay bodega física. Los pallets viajan directamente del proveedor al cliente.
  - **Modelo confirmado:** Intermediación comercial
  - **Impacto:** No hay gestión de stock físico, solo disponibilidad comercial

- [x] **P1.2** ¿El sistema debe distinguir visualmente entre tipos de negocio (compra, venta, comisión)?
  - ✅ **RESPONDIDA:** No, el cliente prefiere modelo mental único
  - **Decisión:** Todo es una "Operación", el tipo es interno
  - **Impacto:** Simplifica UI dramáticamente

- [x] **P1.3** ¿Se necesita control de disponibilidad complejo (compras vs ventas)?
  - ✅ **RESPONDIDA:** No, el cliente busca orden y certeza, no optimización
  - **Decisión:** Control simple de qué está completo y qué falta
  - **Impacto:** Se elimina módulo de stock calculado

### 2. Usuarios y Roles

- [x] **P2.1** ¿Cuántas personas usarán el sistema?
  - ✅ **RESPONDIDA:** Una persona (dueño/administrador)
  - **Decisión:** Sistema personal sin roles diferenciados en MVP
  - **Impacto:** Se elimina gestión de usuarios y permisos

- [x] **P2.2** ¿Se necesita aplicación móvil?
  - ✅ **RESPONDIDA:** No, uso principal desde computador
  - **Decisión:** Web responsive suficiente
  - **Impacto:** Priorizar diseño desktop

### 3. Complejidad del Sistema

- [x] **P3.1** ¿Se requieren reportes financieros avanzados?
  - ✅ **RESPONDIDA:** No, reportes simples son suficientes
  - **Decisión:** Reportes básicos de operaciones, pendientes y pagos
  - **Impacto:** No se construye BI avanzado

- [x] **P3.2** ¿Se necesitan búsquedas avanzadas y filtros complejos?
  - ✅ **RESPONDIDA:** No, búsqueda simple suficiente
  - **Decisión:** Búsqueda por número, filtros básicos
  - **Impacto:** UI más simple

### 4. Control Documental

- [x] **P4.1** ¿Es importante el control de documentos?
  - ✅ **RESPONDIDA:** Sí, es el corazón del sistema
  - **Decisión:** Sistema debe alertar documentos faltantes automáticamente
  - **Impacto:** Módulo de documentos es CORE

- [x] **P4.2** ¿Los pallets certificados requieren documentación adicional (NIMF-15)?
  - ✅ **RESPONDIDA:** Sí, certificados son obligatorios para pallets certificados
  - **Decisión:** Sistema detecta automáticamente cuando falta certificado
  - **Impacto:** Regla de negocio para documentos obligatorios

### 5. Aspectos Financieros

- [x] **P5.1** ¿Se requiere control de pagos y factoring?
  - ✅ **RESPONDIDA:** Sí, es importante registrar pagos, cobros y factoring
  - **Decisión:** Módulo de pagos y factoring incluido en MVP
  - **Impacto:** Entidades Pago y Factoring son parte del core

- [x] **P5.2** ¿El sistema debe calcular márgenes automáticamente?
  - ✅ **RESPONDIDA:** No, precios son informativos
  - **Decisión:** Precios opcionales, no hay cálculos automáticos
  - **Impacto:** Simplicidad financiera

- [x] **P5.3** ¿Se necesita integración con sistema contable?
  - ✅ **RESPONDIDA:** No, no es un sistema contable
  - **Decisión:** Solo control operativo, contabilidad es externa
  - **Impacto:** No hay integración contable en MVP

---

## ⏳ Preguntas Pendientes (No Bloqueantes)

Las siguientes preguntas pueden resolverse durante las primeras iteraciones de uso real:

### 6. Guías y Documentos

- [ ] **P6.1** ¿Existe un formato legal específico para guías propias de FSL?
  - **Prioridad:** 🟡 Media
  - **Cuándo resolverla:** Si el cliente necesita emitir guías propias
  - **Impacto:** Diseño de template de impresión
  - **Alternativa:** Usar formato estándar chileno genérico
  - Respuesta: _________________________________

### 7. Operación Inicial

- [ ] **P7.1** ¿Existe un correlativo actual de operaciones que deba continuarse?
  - **Prioridad:** 🟢 Baja
  - **Cuándo resolverla:** Antes de go-live (puede ser OP-2026-00001)
  - **Impacto:** Número inicial de secuencia
  - Respuesta: _________________________________

- [ ] **P7.2** ¿Se desea cargar operaciones históricas o empezar desde cero?
  - **Prioridad:** 🟢 Baja
  - **Cuándo resolverla:** Durante pruebas iniciales
  - **Impacto:** Migración de datos (si aplica)
  - **Recomendación:** Empezar desde fecha de corte (más simple)
  - Respuesta: _________________________________

### 8. Casos Especiales

- [ ] **P8.1** ¿Se manejan devoluciones de clientes? ¿Con qué frecuencia?
  - **Prioridad:** 🟢 Baja
  - **Cuándo resolverla:** Si surge el caso en operación real
  - **Impacto:** Flujo de devolución (futura extensión)
  - **Alternativa:** Registrar como nueva operación inversa
  - Respuesta: _________________________________

- [ ] **P8.2** ¿Hay entregas parciales frecuentes?
  - **Prioridad:** 🟢 Baja
  - **Cuándo resolverla:** Observar durante primeras semanas de uso
  - **Impacto:** Campo `cantidad_entregada` en líneas de producto
  - **Nota:** El modelo ya soporta entregas parciales
  - Respuesta: _________________________________

---

## 📝 Supuestos Asumidos (Validar si es incorrecto)

Los siguientes supuestos se asumen como válidos basándose en el nuevo enfoque del cliente. **Si alguno es incorrecto, favor notificar para ajustar:**

| # | Supuesto | Riesgo si es incorrecto |
|---|----------|------------------------|
| 1 | Volumen de operaciones es bajo-medio (< 50/mes) | Bajo - Sistema escala bien |
| 2 | No hay flujos de aprobación necesarios | Bajo - Se puede agregar después |
| 3 | Todos los documentos se pueden digitalizar (PDF/imagen) | Medio - Validar formatos aceptables |
| 4 | No se requiere firma digital dentro del sistema | Bajo - Se puede agregar después |
| 5 | Un documento puede adjuntarse una sola vez por tipo | Bajo - Se permite múltiples si se necesita |
| 6 | La coordinación con proveedores es informal (teléfono/WhatsApp) | Bajo - Informativo solamente |
| 7 | No hay necesidad de geolocalización de entregas | Bajo - No es prioridad |
| 8 | El sistema no necesita funcionar offline | Medio - Requiere conectividad |

---

## 🎯 Preguntas para Fase 2 (Post-MVP)

Estas preguntas pueden esperar hasta después del MVP:

1. **Notificaciones:** ¿Se desean notificaciones por email de pendientes?
2. **Plantillas:** ¿Hay operaciones que se repiten y se beneficiarían de plantillas?
3. **Portal clientes:** ¿Los clientes necesitarían consultar sus operaciones online?
4. **Reportes avanzados:** ¿Qué análisis adicionales serían útiles?
5. **Integraciones:** ¿Qué sistemas externos podrían necesitar conectarse?

---

## 📌 Acciones Recomendadas

### Para el Cliente:
1. ✅ Revisar preguntas pendientes (sección ⏳)
2. ✅ Validar supuestos asumidos (sección 📝)
3. ✅ Preparar ejemplos de documentos actuales (guías, facturas, OC)
4. ✅ Definir número inicial de correlativo de operaciones

### Para el Equipo de Desarrollo:
1. ✅ **LISTO PARA INICIAR MVP** - Preguntas críticas resueltas
2. ⏳ Validar supuestos con cliente en reunión de kick-off
3. ⏳ Crear prototipos de UI para validar con cliente
4. ⏳ Definir formato de guías propias en iteración 2 (si es necesario)

---

## 💡 Notas del Cliente

```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

## ✍️ Validación

| Rol | Nombre | Aprobación | Fecha |
|-----|--------|------------|-------|
| Cliente/Dueño | | ☐ Apruebo iniciar MVP | ___/___/2026 |
| Arquitecto | | ✅ Preguntas críticas resueltas | 12/01/2026 |

---

## 📊 Comparativa v1.0 vs v2.0

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| Preguntas críticas sin responder | 8 | 1 |
| Preguntas bloqueantes | 5 | 0 |
| Claridad del alcance | 60% | 95% |
| Listo para desarrollo | ❌ No | ✅ Sí |

---

*Documento actualizado basado en SDD v2.0 - 12/01/2026*

*Las preguntas pendientes son **no bloqueantes** y pueden resolverse durante el desarrollo iterativo del MVP.*
