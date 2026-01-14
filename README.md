# 🌲 Sistema de Gestión Operativa - Forestal Santa Lucía SpA

Sistema web para la gestión de compra, venta y trazabilidad de pallets.

> **Modelo de negocio:** Intermediación comercial. FSL compra a proveedores y vende a clientes. Los pallets viajan **directamente del proveedor al cliente final** (sin bodega propia).

---

## 📋 Estado del Proyecto

| Fase | Estado | Fecha |
|------|--------|-------|
| Análisis y SDD | ✅ Completado (v2.1) | 12/01/2026 |
| Validación con cliente | ✅ Completado (100%) | 12/01/2026 |
| Diseño de Base de Datos | ✅ Completado | 12/01/2026 |
| Especificación de UI | ✅ Completado | 12/01/2026 |
| Especificación de API | ✅ Completado | 12/01/2026 |
| Desarrollo MVP | 🔜 Por iniciar | - |

---

## 📁 Documentación del Proyecto

Toda la especificación técnica está disponible en la carpeta `/docs`:

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [📘 SDD - Especificación Funcional](docs/SDD-forestal-santa-lucia.md) | Requisitos, reglas de negocio, flujos y modelo de dominio | ✅ v2.1 |
| [🗄️ Database Schema](docs/DATABASE-SCHEMA.md) | Diseño de base de datos, tablas, relaciones, índices | ✅ v1.0 |
| [🎨 UI Specification](docs/UI-SPEC.md) | Diseño de interfaz, vistas, componentes, flujos de usuario | ✅ v1.0 |
| [🔌 API Specification](docs/API-SPEC.md) | Endpoints REST, request/response, validaciones | ✅ v1.0 |
| [✅ Ficha de Validación](docs/FICHA-VALIDACION-FINAL.md) | Supuestos validados y decisiones tácticas | ✅ Firmado |
| [❓ Preguntas Abiertas](docs/PREGUNTAS-ABIERTAS.md) | Preguntas resueltas y pendientes | ✅ 100% |

### Estructura de Documentación

```
docs/
├── SDD-forestal-santa-lucia.md    # Especificación funcional completa
├── DATABASE-SCHEMA.md             # Diseño conceptual de BD (Prisma-ready)
├── UI-SPEC.md                     # Especificación de interfaz de usuario
├── API-SPEC.md                    # Especificación de endpoints REST
├── FICHA-VALIDACION-FINAL.md      # Validación de alcance con cliente
└── PREGUNTAS-ABIERTAS.md          # Registro de preguntas y respuestas
```

---

## 🎯 Alcance del MVP

### Funcionalidades Core

- ✅ **Operaciones unificadas** (compras, ventas, comisiones)
- ✅ **Control documental** con alertas de documentos faltantes
- ✅ **Registro de pagos** (cobros, pagos a proveedores, fletes)
- ✅ **Factoring** para facturas de venta
- ✅ **Dashboard de pendientes** (qué falta, qué requiere atención)
- ✅ **Gestión de contactos** (proveedores y clientes)
- ✅ **Reportes simples** (operaciones, pendientes, por contacto)

### Documentos Soportados

- Orden de Compra
- Guía de Despacho / Recepción
- Factura
- Certificado NIMF-15

### Tipos de Pallet

| Código | Nombre | Certificación |
|--------|--------|---------------|
| PV | Pallet Verde | No |
| PR | Pallet Rústico | No |
| PC | Pallet Certificado | NIMF-15 |

---

## 🚫 Fuera de Alcance (Fase 1)

- ❌ Facturación electrónica (SII)
- ❌ Contabilidad formal
- ❌ Aplicación móvil
- ❌ Multiusuario con roles
- ❌ Integraciones externas
- ❌ Gestión de bodega (no aplica)
- ❌ BI avanzado / dashboards complejos

---

## 🔧 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14 (App Router) | Full-stack en un proyecto |
| **UI** | shadcn/ui + Tailwind CSS | Componentes modernos |
| **Backend** | Next.js API Routes | API REST integrada |
| **Base de Datos** | PostgreSQL | Relacional, robusto |
| **ORM** | Prisma | Type-safe, migraciones |
| **Auth** | NextAuth.js v5 | Simple, integrado |
| **Storage** | Supabase Storage / S3 | Documentos adjuntos |
| **Hosting** | Vercel | Deploy automático |

---

## 📊 Modelo de Datos (Resumen)

```
┌──────────────┐         ┌──────────────┐
│  Proveedor   │────┐    │   Cliente    │
└──────────────┘    │    └──────────────┘
                    │           │
                    └─────┬─────┘
                          ▼
                  ┌──────────────┐
                  │  Operacion   │ ← Entidad central
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Documento   │ │    Pago      │ │  Factoring   │
└──────────────┘ └──────────────┘ └──────────────┘
```

Ver detalle completo en: [📘 Database Schema](docs/DATABASE-SCHEMA.md)

---

## 🔌 API (Resumen)

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| Auth | 4 | Login, logout, sesión, password |
| Dashboard | 1 | Resumen de pendientes |
| Operaciones | 6 | CRUD + cerrar operación |
| Documentos | 4 | Upload, download, eliminar |
| Pagos | 4 | CRUD de pagos |
| Factoring | 4 | CRUD de factoring |
| Contactos | 10 | Proveedores y clientes |
| Reportes | 4 | Operaciones, pendientes, exportar |

**Total: 35 endpoints** | Ver detalle en: [🔌 API Specification](docs/API-SPEC.md)

---

## 🎨 Interfaz de Usuario (Resumen)

| Vista | Propósito |
|-------|-----------|
| Dashboard | Centro de control, pendientes, acciones rápidas |
| Operaciones | Lista, crear, detalle con tabs |
| Documentos | Upload dentro de operación |
| Pagos | Registro dentro de operación |
| Contactos | Proveedores y clientes |
| Reportes | Consultas y exportación |

Ver wireframes y flujos en: [🎨 UI Specification](docs/UI-SPEC.md)

---

## 📝 Próximos Pasos

### Fase 1: Setup (1-2 días)
- [ ] Crear proyecto Next.js 14
- [ ] Configurar Prisma + PostgreSQL
- [ ] Configurar shadcn/ui
- [ ] Implementar autenticación

### Fase 2: Core (2 semanas)
- [ ] CRUD Operaciones
- [ ] Upload de documentos
- [ ] Dashboard de pendientes
- [ ] Gestión de contactos

### Fase 3: Financiero (1 semana)
- [ ] Registro de pagos
- [ ] Factoring
- [ ] Estados financieros

### Fase 4: Polish (3-5 días)
- [ ] Reportes y exportación
- [ ] Loading/Error states
- [ ] Testing básico
- [ ] Deploy a producción

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Líneas de especificación | ~4,000 |
| Tablas de BD | 9 |
| Endpoints API | 35 |
| Vistas UI | 11 |
| Tiempo estimado MVP | 3-4 semanas |

---

## 👥 Equipo

| Rol | Responsable |
|-----|-------------|
| Product Owner | Forestal Santa Lucía |
| Arquitectura | Definido |
| Desarrollo | Por asignar |
| QA | Por asignar |

---

## 📄 Licencia

Proyecto privado - Forestal Santa Lucía SpA © 2026

---

*Última actualización: 12 de enero de 2026*
