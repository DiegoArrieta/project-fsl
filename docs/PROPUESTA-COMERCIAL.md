# Propuesta Comercial
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Documento:** Propuesta de Servicios de Desarrollo de Software  
**Versión:** 1.0  
**Fecha:** 14 de enero de 2026  
**Validez:** 30 días desde la fecha de emisión  

---

## 1. Datos del Proveedor

| Campo | Detalle |
|-------|---------|
| **Profesional** | [Diego Arrieta M.] |
| **Especialidad** | Lead Software Engineer |
| **Contacto** | [diego@355labs.cl] |
| **Teléfono** | [+56 9 5011 8000] |

---

## 2. Datos del Cliente

| Campo | Detalle |
|-------|---------|
| **Empresa** | Forestal Santa Lucía SpA |
| **RUT** | [A completar] |
| **Contacto** | [A completar] |
| **Proyecto** | Sistema de Gestión Operativa |

---

## 3. Resumen Ejecutivo

### 3.1 Contexto

Forestal Santa Lucía SpA requiere un sistema web para centralizar y controlar sus operaciones comerciales de compra y venta de pallets, reemplazando el uso actual de Excel, WhatsApp y documentos físicos.

### 3.2 Alcance del Proyecto

El sistema permitirá:

- ✅ Registrar operaciones comerciales (compras, ventas, comisiones)
- ✅ Gestionar documentos asociados (OC, guías, facturas, certificados NIMF-15)
- ✅ Alertar automáticamente sobre documentos y pagos pendientes
- ✅ Controlar pagos a proveedores, cobros a clientes y fletes
- ✅ Administrar factoring de facturas
- ✅ Generar reportes básicos de operaciones y pendientes

### 3.3 Especificación Completada

Se ha completado una especificación técnica exhaustiva que incluye:

| Documento | Contenido |
|-----------|-----------|
| SDD (v2.1) | Requisitos funcionales, reglas de negocio, flujos |
| Database Schema | 9 tablas, relaciones, índices |
| UI Specification | 11 vistas, wireframes, componentes |
| API Specification | 35 endpoints REST documentados |

---

## 4. Alcance del Proyecto

### 4.1 Fase 1: Setup e Infraestructura
- Configuración proyecto Next.js 14
- Setup Prisma + PostgreSQL (Supabase/Railway)
- Configuración shadcn/ui + Tailwind CSS
- Implementación NextAuth.js v5
- Configuración storage para documentos
- Deploy inicial a Vercel

### 4.2 Fase 2: Desarrollo Core
- Modelo de datos Prisma (migraciones)
- API REST completa (35 endpoints):
  - Operaciones (CRUD + cerrar)
  - Documentos (upload, download, eliminar)
  - Pagos y Factoring
  - Proveedores y Clientes
  - Reportes
- Interfaz de usuario completa:
  - Dashboard con pendientes
  - Gestión de operaciones (lista, crear, editar, detalle)
  - Gestión de contactos
  - Sistema de alertas
  - Reportes básicos y exportación

### 4.3 Fase 3: Testing y Ajustes
- Testing funcional básico
- Validación de flujos completos
- Corrección de bugs
- Mejoras de UX (loading states, empty states, validaciones)

### 4.4 Fase 4: Deploy y Entrega
- Configuración producción
- Seed data inicial
- Documentación técnica y manual de uso
- Capacitación al usuario
- Ajustes post-deploy

**Tiempo calendario estimado:** 2-3 semanas

---

## 6. Propuesta Económica

### Precio Fijo del Proyecto

| Concepto | Valor |
|----------|-------|
| **Desarrollo completo MVP** | **UF 47.5** |
| **Equivalente aproximado (UF $38.000)** | **$1.805.000 CLP** |

**Incluye:**
- ✅ Todas las funcionalidades especificadas en el SDD v2.1
- ✅ Sistema completo funcionando en producción
- ✅ Hasta 15% de ajustes sobre lo especificado
- ✅ 30 días de garantía post-entrega (bugs)
- ✅ 1 hora de capacitación al usuario
- ✅ Documentación técnica y manual de uso
- ✅ Código fuente completo y repositorio Git

**Ventajas del precio fijo:**
- 💰 **Costo cerrado:** Sin sorpresas, precio definitivo
- 📊 **Presupuesto claro:** Sabes exactamente cuánto pagarás
- ⚡ **Riesgo asumido:** El proveedor asume el riesgo de estimación
- 🔍 **Enfoque en resultado:** Pago por entregable, no por tiempo

> *Este precio fijo cubre todo el desarrollo del MVP según la especificación aprobada. Cambios de alcance significativos (mayores al 15%) requerirán cotización adicional.*

---

## 7. Condiciones de Pago

### Estructura de Pagos (Precio Fijo)

**Distribución:**
- **40% anticipo** al inicio del proyecto (UF 19 ≈ $722.000 CLP)
- **30% al completar Fase 2** - Core funcionando (UF 14.25 ≈ $541.500 CLP)
- **30% a la entrega final** y aprobación (UF 14.25 ≈ $541.500 CLP)

**Cronograma de pagos:**
1. **Inicio:** 40% (UF 19) - Al firmar contrato
2. **Hito intermedio:** 30% (UF 14.25) - Al tener sistema core funcionando (dashboard, operaciones, documentos)
3. **Entrega final:** 30% (UF 14.25) - Al completar testing, deploy y capacitación

**Forma de pago:**
- Transferencia bancaria
- Pago a 7 días desde la emisión de factura
- Facturación según hitos alcanzados

> *Los pagos están vinculados a hitos concretos del proyecto, garantizando que el avance esté alineado con los desembolsos.*

---

## 8. Entregables

| # | Entregable | Formato |
|---|------------|---------|
| 1 | Código fuente completo | Repositorio Git privado |
| 2 | Base de datos configurada | PostgreSQL en la nube |
| 3 | Sistema desplegado en producción | Vercel + Supabase/Railway |
| 4 | Documentación técnica | Markdown en repositorio |
| 5 | Manual de uso básico | PDF / Notion |
| 6 | Credenciales de acceso | Documento cifrado |

---

## 9. Stack Tecnológico Incluido

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend | Next.js API Routes (REST) |
| Base de Datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | NextAuth.js v5 |
| Storage | Supabase Storage o AWS S3 |
| Hosting | Vercel (frontend) |
| DB Hosting | Supabase o Railway |

---

## 10. Exclusiones (No Incluido)

El presente presupuesto **NO incluye**:

| Exclusión | Nota |
|-----------|------|
| ❌ Facturación electrónica (SII) | Requiere integración separada |
| ❌ Integraciones con sistemas externos | APIs de terceros |
| ❌ Aplicación móvil nativa | Solo web responsive |
| ❌ Multiusuario con roles complejos | Sistema single-user |
| ❌ Soporte post-garantía | Cotizar aparte |
| ❌ Costos de hosting | Cliente asume (~$15-30 USD/mes) |
| ❌ Dominio personalizado | Cliente asume (~$15 USD/año) |
| ❌ Cambios de alcance significativos | Requieren cotización adicional |

---

## 11. Garantía y Soporte

### 11.1 Período de Garantía (Incluido)

- **Duración:** 30 días calendario desde la entrega
- **Cobertura:** Corrección de bugs y errores del desarrollo
- **No cubre:** Cambios de funcionalidad, nuevos requerimientos

### 11.2 Soporte Post-Garantía (Opcional)

| Plan | Horas/mes | Valor mensual |
|------|-----------|---------------|
| Básico | 4 hrs | UF 5 |
| Estándar | 8 hrs | UF 9 |
| Premium | 16 hrs | UF 16 |

> *Horas no utilizadas no se acumulan. Contrato mínimo 3 meses.*

---

## 12. Cronograma Propuesto

```
Semana 1  ████████████████████ Setup + Core completo
Semana 2  ████████████████████ Contactos + Financiero + Reportes
Semana 3  ████████████         Polish + Deploy + Entrega
```

| Hito | Fecha Estimada | Entregable |
|------|----------------|------------|
| Kick-off | Día 1 | Setup completado |
| Demo intermedia | Semana 1 (día 5) | Core funcionando |
| Beta | Semana 2 (día 10) | Sistema completo |
| Go-live | Semana 3 | Producción |

---

## 13. Supuestos y Dependencias

Para cumplir los plazos estimados, se asume:

1. ✅ **Especificación cerrada** - Los documentos SDD, DB, UI, API están aprobados
2. ✅ **Feedback oportuno** - Respuestas del cliente en máximo 24-48 hrs
3. ✅ **Accesos proporcionados** - Credenciales de servicios cloud cuando se soliciten
4. ✅ **Sin cambios de alcance** - Cambios mayores se cotizan aparte
5. ✅ **Un solo usuario inicial** - Sistema single-user según especificación

---

## 14. Términos y Condiciones

### 14.1 Propiedad Intelectual
- El código fuente será propiedad del **cliente** una vez pagado en su totalidad
- El proveedor puede reutilizar componentes genéricos no específicos del negocio

### 14.2 Confidencialidad
- Toda información del negocio del cliente se tratará como confidencial
- El proveedor no divulgará detalles del proyecto sin autorización escrita

### 14.3 Cancelación
- El cliente puede cancelar con 7 días de aviso
- Se factura el trabajo realizado hasta la fecha de cancelación
- Los anticipos no son reembolsables

### 14.4 Cambios de Alcance
- Cambios menores (< 5% del esfuerzo) se absorben sin costo adicional
- Cambios mayores requieren cotización y aprobación por escrito
- Cambios pueden afectar el cronograma

---

## 15. Resumen de la Propuesta

| Concepto | Detalle |
|----------|---------|
| **Modalidad** | Precio fijo (proyecto cerrado) |
| **Valor total** | UF 47.5 |
| **Equivalente CLP** | ~$1.805.000 (UF $38.000) |
| **Tiempo de entrega** | 2-3 semanas |
| **Anticipo** | 40% (UF 19) |
| **Pagos** | Por hitos (3 pagos) |
| **Garantía** | 30 días post-entrega |

**Ventajas:**
- ✅ Precio cerrado sin sorpresas
- ✅ Pago por hitos concretos
- ✅ Riesgo asumido por el proveedor
- ✅ Enfoque en resultado, no en tiempo

---

## 16. Próximos Pasos

Para proceder con el proyecto:

1. **Revisar y aprobar** esta propuesta comercial
2. **Firmar contrato** de servicios profesionales
3. **Realizar anticipo** del 40% (UF 19 ≈ $722.000 CLP)
4. **Kick-off meeting** para alinear expectativas y accesos
5. **Inicio de desarrollo** con entregas por hitos

---

## 17. Firma y Aceptación

### Proveedor

| Campo | Detalle |
|-------|---------|
| Nombre | [Tu Nombre] |
| Cargo | Ingeniero de Software Senior |
| Fecha | _________________ |
| Firma | _________________ |

### Cliente

| Campo | Detalle |
|-------|---------|
| Nombre | _________________ |
| Cargo | _________________ |
| Empresa | Forestal Santa Lucía SpA |
| Fecha | _________________ |
| Firma | _________________ |
| Aprobación propuesta | [ ] Aprobada |

---

## Anexos

- **Anexo A:** SDD - Especificación Funcional (v2.1)
- **Anexo B:** Database Schema
- **Anexo C:** UI Specification
- **Anexo D:** API Specification

*Los anexos forman parte integral de esta propuesta y definen el alcance del trabajo.*

---

> **Nota:** Los valores en UF se calculan al valor del día de emisión de factura.  
> Los valores en CLP son referenciales considerando UF = $38.000.  
> Esta propuesta tiene validez de 30 días desde su emisión.

---

*Documento generado el 14 de enero de 2026*

