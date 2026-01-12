# Sistema de Gestión Operativa - Forestal Santa Lucía SpA

Sistema web para la gestión de compra, venta y trazabilidad de pallets.

> **Modelo de negocio:** Intermediación comercial. FSL compra a proveedores y vende a clientes. Los pallets viajan **directamente del proveedor al cliente final** (no hay bodega propia).

## 📋 Estado del Proyecto

| Fase | Estado |
|------|--------|
| Análisis y SDD | ✅ Completado (v1.1) |
| Validación con cliente | ⏳ En progreso |
| Desarrollo MVP | 🔜 Por iniciar |

## 📁 Estructura de Documentación

```
docs/
├── SDD-forestal-santa-lucia.md   # Documento principal de especificación
└── PREGUNTAS-ABIERTAS.md         # Preguntas pendientes para el cliente
```

## 🎯 Alcance del MVP

- Registro de compras a proveedores
- Registro de ventas a clientes  
- Coordinación de entregas directas (proveedor → cliente)
- Registro de guías de despacho (principalmente del proveedor)
- Control de disponibilidad comercial por tipo de pallet
- Trazabilidad de operaciones
- Gestión básica de usuarios

## 🚫 Fuera de Alcance (Fase 1)

- Facturación electrónica
- Contabilidad
- Aplicación móvil
- Integraciones con sistemas externos
- Gestión de bodega (no aplica al modelo actual)

## 📊 Entidades Principales

- **Proveedores**: Empresas que venden pallets a FSL (y entregan directo al cliente)
- **Clientes**: Empresas que compran pallets a FSL
- **Tipos de Pallet**: Verde, Rústico, Certificado
- **Órdenes de Compra**: Compras a proveedores (suma disponibilidad)
- **Órdenes de Venta**: Ventas a clientes (resta disponibilidad)
- **Guías de Despacho**: Documentos que amparan entregas directas

## 🔧 Stack Tecnológico (Propuesto)

- **Frontend**: Next.js 14 + React + shadcn/ui
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js

## 📝 Próximos Pasos

1. [ ] Validar preguntas abiertas con el cliente
2. [ ] Definir fecha de inicio de desarrollo
3. [ ] Configurar entorno de desarrollo
4. [ ] Crear estructura base del proyecto
5. [ ] Implementar módulo de autenticación
6. [ ] Implementar CRUD de entidades maestras

## 👥 Equipo

| Rol | Responsable |
|-----|-------------|
| Product Owner | Por definir |
| Desarrollo | Por definir |
| QA | Por definir |

---

*Última actualización: 2026-01-09*

