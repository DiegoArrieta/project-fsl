# PRD - Product Requirements Document
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Versión:** 1.0  
**Fecha:** 2026-01-15  
**Estado:** En revisión  
**Product Owner:** Forestal Santa Lucía SpA  
**Equipo:** Desarrollo de Software  

---

## Tabla de Contenidos

1. [Visión del Producto](#1-visión-del-producto)
2. [Problema y Oportunidad](#2-problema-y-oportunidad)
3. [Objetivos del Producto](#3-objetivos-del-producto)
4. [Usuarios y Personas](#4-usuarios-y-personas)
5. [Casos de Uso Principales](#5-casos-de-uso-principales)
6. [Funcionalidades Core](#6-funcionalidades-core)
7. [Priorización y Roadmap](#7-priorización-y-roadmap)
8. [Métricas de Éxito](#8-métricas-de-éxito)
9. [Alcance y Limitaciones](#9-alcance-y-limitaciones)
10. [Riesgos y Dependencias](#10-riesgos-y-dependencias)

---

## 1. Visión del Producto

### 1.1 Declaración de Visión

**"Un sistema web simple y personal que centraliza todas las operaciones comerciales de FSL, proporcionando orden, control y certeza operativa mediante alertas automáticas y trazabilidad completa de documentos y pagos."**

### 1.2 Propuesta de Valor

El sistema permite a FSL:

- **Centralizar** todas sus operaciones comerciales en un solo lugar
- **Automatizar** la detección de documentos faltantes y pendientes
- **Visualizar** el estado completo de cada operación de un vistazo
- **Generar** órdenes de compra profesionales en PDF para proveedores
- **Calcular** automáticamente márgenes de rentabilidad por operación
- **Trazar** toda la documentación y pagos asociados a cada operación

### 1.3 Diferenciadores Clave

- **Operación Unificada**: Integra venta al cliente y compra al proveedor en una sola entidad
- **Alertas Proactivas**: El sistema avisa automáticamente qué falta, no requiere búsqueda manual
- **Enfoque en Control Operativo**: No es contabilidad, es control práctico del día a día
- **Simplicidad**: Interfaz simple, un solo usuario, sin complejidad innecesaria

---

## 2. Problema y Oportunidad

### 2.1 Problema Actual

**Situación:** FSL gestiona sus operaciones comerciales usando Excel, WhatsApp y documentos físicos dispersos.

**Dolor Principal:**
- No hay visibilidad clara de qué operaciones están abiertas
- No se sabe automáticamente qué documentos faltan
- Requiere buscar manualmente en múltiples archivos y conversaciones
- No hay alertas de pagos pendientes
- No hay cálculo automático de márgenes por operación
- Las órdenes de compra se generan manualmente

**Impacto:**
- Tiempo perdido buscando información
- Riesgo de olvidar documentos o pagos pendientes
- Falta de trazabilidad clara
- Dificultad para tomar decisiones operativas informadas

### 2.2 Oportunidad

**Solución:** Un sistema web centralizado que:
- Registra todas las operaciones en un solo lugar
- Detecta automáticamente qué falta
- Muestra pendientes de forma clara y accionable
- Genera documentos profesionales (OC en PDF)
- Calcula márgenes automáticamente

**Beneficio Esperado:**
- Reducción del 80% del tiempo en búsqueda de información
- Eliminación de documentos olvidados
- Visibilidad completa del estado operativo
- Mejor control financiero con cálculo de márgenes

---

## 3. Objetivos del Producto

### 3.1 Objetivos de Negocio

| Objetivo | Métrica | Meta |
|----------|---------|------|
| **Reducir tiempo de búsqueda** | Tiempo promedio para encontrar información de operación | < 30 segundos |
| **Eliminar documentos faltantes** | % de operaciones con documentos completos | 100% |
| **Mejorar visibilidad** | Tiempo para identificar pendientes | < 10 segundos |
| **Automatizar generación de OC** | Tiempo para generar OC a proveedor | < 2 minutos |

### 3.2 Objetivos de Usuario

- **Poder ver todas las operaciones abiertas** en un solo lugar
- **Saber automáticamente qué falta** sin tener que revisar manualmente
- **Generar órdenes de compra profesionales** rápidamente
- **Ver márgenes de rentabilidad** por operación automáticamente
- **Tener trazabilidad completa** de documentos y pagos

### 3.3 Objetivos Técnicos

- Sistema web responsive (uso principal en desktop)
- Interfaz simple e intuitiva
- Carga rápida (< 2 segundos)
- Datos seguros y respaldados
- Fácil de mantener y extender

---

## 4. Usuarios y Personas

### 4.1 Usuario Principal

**Persona: Gerente de Operaciones / Dueño de FSL**

- **Rol:** Único usuario del sistema en la fase inicial
- **Responsabilidades:**
  - Registrar todas las operaciones comerciales
  - Gestionar documentos (subir, verificar)
  - Registrar pagos y cobros
  - Generar órdenes de compra a proveedores
  - Monitorear pendientes y alertas
- **Necesidades:**
  - Sistema simple, sin curva de aprendizaje pronunciada
  - Acceso rápido a información
  - Alertas claras de pendientes
  - Generación rápida de documentos
- **Frustraciones Actuales:**
  - Buscar información en múltiples lugares
  - Olvidar documentos o pagos
  - No tener visibilidad clara del estado operativo

### 4.2 Usuarios Futuros (Fuera de MVP)

- **Contador/Asistente:** Para registro de documentos y pagos
- **Cliente:** Portal de consulta de sus operaciones (futuro)
- **Proveedor:** Portal de consulta de OC recibidas (futuro)

---

## 5. Casos de Uso Principales

### 5.1 Casos de Uso Core (MVP)

#### CU-01: Registrar Operación de Venta Unificada
**Actor:** Gerente de Operaciones  
**Precondición:** Usuario autenticado  
**Flujo Principal:**
1. Usuario selecciona "Nueva Operación" → Tipo "Venta Directa"
2. Ingresa cliente, proveedor (obligatorio), OC del cliente
3. Agrega productos con precios de venta y compra
4. Sistema calcula automáticamente márgenes
5. Usuario guarda operación
6. Sistema genera número de operación (OP-2026-00001)

**Resultado:** Operación creada con venta y compra unificadas, márgenes calculados

---

#### CU-02: Generar Orden de Compra a Proveedor
**Actor:** Gerente de Operaciones  
**Precondición:** Operación de venta creada  
**Flujo Principal:**
1. Usuario selecciona "Generar OC" desde la operación o módulo de OC
2. Ingresa proveedor, productos, cantidades, precios
3. Usuario presiona "Generar PDF"
4. Sistema genera número secuencial (OC-2026-00001)
5. Sistema crea PDF profesional
6. Usuario descarga PDF para enviar al proveedor

**Resultado:** OC generada en PDF, asociada a la operación, lista para enviar

---

#### CU-03: Ver Pendientes y Alertas
**Actor:** Gerente de Operaciones  
**Precondición:** Existen operaciones con documentos o pagos pendientes  
**Flujo Principal:**
1. Usuario accede al dashboard
2. Sistema muestra:
   - Operaciones con documentos faltantes
   - Operaciones con pagos pendientes
   - Operaciones con certificados faltantes
3. Usuario hace clic en una alerta
4. Sistema lleva a la operación específica

**Resultado:** Usuario identifica rápidamente qué requiere atención

---

#### CU-04: Subir Documento a Operación
**Actor:** Gerente de Operaciones  
**Precondición:** Operación creada  
**Flujo Principal:**
1. Usuario abre detalle de operación
2. Selecciona "Adjuntar Documento"
3. Selecciona tipo de documento (Guía, Factura, Certificado, etc.)
4. Sube archivo (PDF o imagen)
5. Completa información adicional (número, fecha, datos de transporte si aplica)
6. Sistema valida y guarda documento
7. Sistema actualiza estado documental automáticamente

**Resultado:** Documento asociado, estado actualizado, alerta resuelta si aplica

---

#### CU-05: Registrar Pago o Cobro
**Actor:** Gerente de Operaciones  
**Precondición:** Operación creada  
**Flujo Principal:**
1. Usuario abre detalle de operación
2. Selecciona "Registrar Pago"
3. Selecciona tipo (Cobro a Cliente, Pago a Proveedor, Pago de Flete)
4. Ingresa monto, fecha, método, referencia
5. Sistema guarda pago
6. Sistema actualiza estado financiero automáticamente

**Resultado:** Pago registrado, estado financiero actualizado, alerta resuelta si aplica

---

#### CU-06: Ver Resumen Financiero de Operación
**Actor:** Gerente de Operaciones  
**Precondición:** Operación de venta con precios de venta y compra  
**Flujo Principal:**
1. Usuario abre detalle de operación de venta
2. Sistema muestra:
   - Total Venta
   - Total Compra
   - Margen Bruto
   - Margen Porcentual
   - Cobros registrados
   - Pagos registrados

**Resultado:** Usuario ve rentabilidad de la operación de un vistazo

---

### 5.2 Casos de Uso Secundarios (V1.1+)

- CU-07: Registrar Factoring
- CU-08: Generar Reporte de Operaciones
- CU-09: Buscar Operación por Número
- CU-10: Cerrar Operación con Observación

---

## 6. Funcionalidades Core

### 6.1 Módulo de Operaciones (P0 - Crítico)

**Descripción:** Registro unificado de operaciones comerciales que integra venta y compra.

**Funcionalidades:**
- ✅ Crear operación (Compra, Venta Directa, Venta con Comisión)
- ✅ Operación unificada: venta y compra en una sola entidad
- ✅ Ingresar productos con precios de venta y compra
- ✅ Cálculo automático de márgenes
- ✅ Editar operación (si no está cerrada)
- ✅ Ver detalle completo de operación
- ✅ Listar operaciones con filtros
- ✅ Buscar por número de operación

**Criterios de Aceptación:**
- Usuario puede crear operación de venta con cliente y proveedor
- Sistema calcula márgenes automáticamente
- Usuario puede ver totales de venta, compra y margen
- Operaciones se listan con estados claros

---

### 6.2 Módulo de Órdenes de Compra (P0 - Crítico)

**Descripción:** Generación de órdenes de compra profesionales en PDF para proveedores.

**Funcionalidades:**
- ✅ Crear orden de compra
- ✅ Generar PDF con número secuencial (OC-2026-00001)
- ✅ Descargar PDF generado
- ✅ Asociar OC a operación existente
- ✅ Listar OC con filtros
- ✅ Cambiar estado de OC (Enviada, Recibida, Cancelada)

**Criterios de Aceptación:**
- Usuario puede generar OC en PDF en menos de 2 minutos
- PDF tiene formato profesional con datos completos
- OC se asocia automáticamente a operación
- Número secuencial se genera automáticamente

---

### 6.3 Módulo de Documentos (P0 - Crítico)

**Descripción:** Gestión y control de documentos asociados a operaciones.

**Funcionalidades:**
- ✅ Subir documento (PDF, JPG, PNG)
- ✅ Asociar documento a operación
- ✅ Ver documentos de operación
- ✅ Descargar/visualizar documento
- ✅ Detección automática de documentos faltantes
- ✅ Alertas visuales de documentos obligatorios faltantes

**Criterios de Aceptación:**
- Usuario puede subir documento en menos de 30 segundos
- Sistema detecta automáticamente qué documentos faltan
- Alertas son claras y accionables
- Estado documental se actualiza automáticamente

---

### 6.4 Módulo de Pagos (P0 - Crítico)

**Descripción:** Registro de pagos a proveedores, cobros a clientes y fletes.

**Funcionalidades:**
- ✅ Registrar cobro a cliente
- ✅ Registrar pago a proveedor
- ✅ Registrar pago de flete
- ✅ Ver historial de pagos de operación
- ✅ Calcular totales pagados/cobrados
- ✅ Alertas de pagos pendientes

**Criterios de Aceptación:**
- Usuario puede registrar pago en menos de 1 minuto
- Sistema calcula totales automáticamente
- Estado financiero se actualiza automáticamente
- Alertas muestran pagos pendientes claramente

---

### 6.5 Dashboard de Pendientes (P0 - Crítico)

**Descripción:** Vista centralizada de todas las alertas y pendientes.

**Funcionalidades:**
- ✅ Mostrar operaciones con documentos faltantes
- ✅ Mostrar operaciones con pagos pendientes
- ✅ Mostrar operaciones con certificados faltantes
- ✅ Resumen de operaciones abiertas/cerradas
- ✅ Accesos rápidos a acciones comunes

**Criterios de Aceptación:**
- Usuario identifica pendientes en menos de 10 segundos
- Alertas son claras y priorizadas
- Clic en alerta lleva directamente a la operación
- Dashboard carga en menos de 2 segundos

---

### 6.6 Módulo de Contactos (P1 - Alta)

**Descripción:** Gestión básica de proveedores y clientes.

**Funcionalidades:**
- ✅ Crear proveedor/cliente
- ✅ Editar contacto
- ✅ Listar contactos
- ✅ Activar/desactivar contacto
- ✅ Validación de RUT

**Criterios de Aceptación:**
- Usuario puede crear contacto en menos de 2 minutos
- RUT se valida automáticamente
- Contactos se pueden buscar fácilmente

---

### 6.7 Módulo de Factoring (P1 - Alta)

**Descripción:** Control de facturas factorizadas.

**Funcionalidades:**
- ✅ Registrar factoring de factura
- ✅ Ver operaciones factorizadas
- ✅ Reporte de factoring utilizado

**Criterios de Aceptación:**
- Usuario puede registrar factoring asociado a operación
- Sistema muestra factoring utilizado por período

---

### 6.8 Módulo de Reportes (P2 - Media)

**Descripción:** Reportes simples de operaciones y pendientes.

**Funcionalidades:**
- ✅ Reporte de operaciones por período
- ✅ Reporte de pendientes
- ✅ Exportar a Excel/CSV

**Criterios de Aceptación:**
- Usuario puede generar reporte en menos de 5 segundos
- Reportes son claros y útiles

---

## 7. Priorización y Roadmap

### 7.1 Fase MVP (Semanas 1-4)

**Objetivo:** Sistema funcional con operaciones, documentos, alertas y OC.

**Entregables:**
- ✅ Módulo de Operaciones (unificadas)
- ✅ Módulo de Órdenes de Compra (generación PDF)
- ✅ Módulo de Documentos (subida y control)
- ✅ Dashboard de Pendientes
- ✅ Módulo de Contactos básico
- ✅ Autenticación con Auth.js (NextAuth.js v5) y seguridad básica
- ✅ Hash seguro de contraseñas con bcrypt (salt rounds: 10)

**Criterio de Éxito MVP:**
- Usuario puede registrar operación completa
- Usuario puede generar OC en PDF
- Sistema detecta documentos faltantes
- Dashboard muestra pendientes claramente

---

### 7.2 Fase V1.1 (Semanas 5-6)

**Objetivo:** Completar control financiero y factoring.

**Entregables:**
- ✅ Módulo de Pagos completo
- ✅ Módulo de Factoring
- ✅ Cálculo de márgenes mejorado
- ✅ Estados financieros avanzados

**Criterio de Éxito V1.1:**
- Usuario puede registrar todos los tipos de pagos
- Sistema calcula márgenes correctamente
- Factoring se registra y reporta

---

### 7.3 Fase V1.2 (Semanas 7-8)

**Objetivo:** Mejoras de UX y reportes.

**Entregables:**
- ✅ Módulo de Reportes
- ✅ Búsquedas mejoradas
- ✅ Mejoras de UX basadas en feedback
- ✅ Exportación de datos

**Criterio de Éxito V1.2:**
- Usuario puede generar reportes útiles
- Búsqueda es rápida y efectiva
- UX es intuitiva y agradable

---

## 8. Métricas de Éxito

### 8.1 Métricas de Adopción

| Métrica | Meta | Medición |
|---------|------|----------|
| **Tiempo de registro de operación** | < 5 minutos | Promedio de tiempo desde inicio hasta guardado |
| **Tiempo de generación de OC** | < 2 minutos | Tiempo desde creación hasta PDF descargado |
| **Tiempo de identificación de pendientes** | < 10 segundos | Tiempo desde login hasta ver pendientes |
| **Tasa de uso diario** | > 80% | % de días laborales con al menos 1 acción |

### 8.2 Métricas de Calidad

| Métrica | Meta | Medición |
|---------|------|----------|
| **Operaciones con documentos completos** | > 95% | % de operaciones cerradas con todos los docs |
| **Pagos registrados correctamente** | 100% | % de pagos sin errores |
| **OC generadas correctamente** | 100% | % de OC con PDF válido |
| **Tiempo de carga de dashboard** | < 2 segundos | Tiempo promedio de carga |

### 8.3 Métricas de Valor

| Métrica | Meta | Medición |
|---------|------|----------|
| **Reducción de tiempo de búsqueda** | > 80% | Comparación antes/después |
| **Documentos olvidados** | 0 | Número de documentos faltantes al cerrar |
| **Satisfacción del usuario** | > 4/5 | Encuesta de satisfacción |

---

## 9. Alcance y Limitaciones

### 9.1 In-Scope (Incluido)

✅ **Operaciones comerciales unificadas** (venta + compra)  
✅ **Generación de OC en PDF**  
✅ **Gestión de documentos** (subida, visualización, control)  
✅ **Control de pagos** (cobros, pagos, fletes)  
✅ **Alertas automáticas** de pendientes  
✅ **Dashboard de pendientes**  
✅ **Gestión básica de contactos**  
✅ **Factoring**  
✅ **Reportes simples**  
✅ **Cálculo automático de márgenes**  

### 9.2 Out-of-Scope (Excluido)

❌ **Contabilidad formal** (no es sistema contable)  
❌ **Facturación electrónica** (se emite externamente)  
❌ **Multiusuario y roles** (sistema personal en MVP)  
❌ **Mobile-first** (uso principal en desktop)  
❌ **BI avanzado** (solo reportes simples)  
❌ **Integraciones externas** (no necesarias en MVP)  
❌ **Gestión de bodega** (FSL no tiene stock físico)  
❌ **Envío automático de OC por email** (descarga manual)  

### 9.3 Limitaciones Conocidas

- **Un solo usuario** en la fase inicial
- **Sin integración con sistemas externos** (SII, bancos, etc.)
- **Reportes básicos** (no análisis avanzado)
- **Sin app móvil** (solo web responsive)

---

## 10. Riesgos y Dependencias

### 10.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Problemas con generación de PDF** | Media | Alta | Usar librería probada, testing exhaustivo |
| **Performance con muchos documentos** | Baja | Media | Optimización de queries, paginación |
| **Pérdida de datos** | Baja | Crítica | Backups automáticos diarios |

### 10.2 Riesgos de Producto

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Cambio de requerimientos** | Media | Media | Documentación clara, iteraciones cortas |
| **Baja adopción** | Baja | Alta | UX simple, onboarding guiado |
| **Complejidad no esperada** | Media | Media | MVP enfocado, priorización clara |

### 10.3 Dependencias

- **Acceso a datos históricos** (si se requiere migración)
- **Definición de datos de FSL** (RUT, dirección, logo para PDF)
- **Feedback continuo del usuario** para ajustes

---

## 11. Definición de "Hecho" (Definition of Done)

Una funcionalidad se considera "Hecho" cuando:

- ✅ Código implementado y revisado
- ✅ Tests unitarios pasando
- ✅ Documentación actualizada
- ✅ Validado con usuario
- ✅ Desplegado en ambiente de producción
- ✅ Sin bugs críticos conocidos

---

## 12. Próximos Pasos

1. **Validar PRD** con stakeholders
2. **Priorizar funcionalidades** del MVP
3. **Crear historias de usuario** detalladas
4. **Iniciar desarrollo** del MVP
5. **Seguimiento semanal** de progreso

---

## Anexos

### A. Referencias

- [SDD - Spec Driven Development Document](./SDD-forestal-santa-lucia.md)
- [UI-SPEC - UI Specification Document](./UI-SPEC.md)
- [API-SPEC - API Specification Document](./API-SPEC.md)
- [DATABASE-SCHEMA - Database Schema](./DATABASE-SCHEMA.md)

### B. Glosario

- **FSL**: Forestal Santa Lucía SpA
- **OC**: Orden de Compra
- **Operación Unificada**: Operación que integra venta al cliente y compra al proveedor
- **Margen Bruto**: Diferencia entre total venta y total compra
- **Estado Documental**: Indica si todos los documentos obligatorios están presentes
- **Estado Financiero**: Indica el avance financiero (PENDIENTE, FACTURADA, PAGADA, CERRADA)

---

**Documento preparado por:** Equipo de Desarrollo  
**Última actualización:** 2026-01-15  
**Próxima revisión:** Al finalizar MVP

