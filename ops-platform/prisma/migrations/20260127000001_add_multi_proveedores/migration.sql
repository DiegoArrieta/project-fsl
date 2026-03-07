-- Migración: Operación puede tener múltiples proveedores (N:M)
-- Fecha: 2026-01-27
-- Descripción: Cambiar relación 1:N a N:M entre Operacion y Proveedor

-- 0. Asegurar extensión uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Eliminar vistas que dependen de operacion.proveedor_id
DROP VIEW IF EXISTS v_operaciones_pendientes CASCADE;
DROP VIEW IF EXISTS v_operaciones_margenes CASCADE;

-- 2. Crear tabla intermedia operacion_proveedor
CREATE TABLE IF NOT EXISTS "operacion_proveedor" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "operacion_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operacion_proveedor_pkey" PRIMARY KEY ("id")
);

-- 3. Crear índices
CREATE INDEX "operacion_proveedor_operacion_idx" ON "operacion_proveedor"("operacion_id");
CREATE INDEX "operacion_proveedor_proveedor_idx" ON "operacion_proveedor"("proveedor_id");
CREATE UNIQUE INDEX "operacion_proveedor_unique" ON "operacion_proveedor"("operacion_id", "proveedor_id");

-- 4. Migrar datos existentes: SALTADO (ya se ejecutó en intento anterior)
-- La columna proveedor_id ya fue eliminada

-- 5. Nota: La columna proveedor_id ya fue eliminada en intento anterior

-- 6. Agregar foreign keys
ALTER TABLE "operacion_proveedor" ADD CONSTRAINT "operacion_proveedor_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "operacion_proveedor" ADD CONSTRAINT "operacion_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Recrear vista v_operaciones_pendientes (actualizada para múltiples proveedores)
CREATE OR REPLACE VIEW v_operaciones_pendientes AS
SELECT 
    o.id,
    o.numero,
    o.tipo,
    o.fecha,
    o.estado_documental,
    o.estado_financiero,
    STRING_AGG(p.razon_social, ', ' ORDER BY p.razon_social) AS proveedores,
    c.razon_social AS cliente,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id AND d.es_obligatorio = true) AS docs_obligatorios,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id) AS docs_presentes,
    (SELECT COALESCE(SUM(monto), 0) FROM pago pg WHERE pg.operacion_id = o.id) AS total_pagado
FROM operacion o
LEFT JOIN operacion_proveedor op ON o.id = op.operacion_id
LEFT JOIN proveedor p ON op.proveedor_id = p.id
LEFT JOIN cliente c ON o.cliente_id = c.id
WHERE o.estado_financiero != 'CERRADA'
GROUP BY o.id, o.numero, o.tipo, o.fecha, o.estado_documental, o.estado_financiero, c.razon_social;

-- 8. Recrear vista v_operaciones_margenes (sin cambios, no usa proveedor_id)
CREATE OR REPLACE VIEW v_operaciones_margenes AS
SELECT 
    o.id,
    o.numero,
    o.tipo,
    o.fecha,
    COALESCE(SUM(ol.cantidad * ol.precio_venta_unitario), 0) AS total_venta,
    COALESCE(SUM(ol.cantidad * ol.precio_compra_unitario), 0) AS total_compra,
    COALESCE(SUM(ol.cantidad * ol.precio_venta_unitario), 0) - 
    COALESCE(SUM(ol.cantidad * ol.precio_compra_unitario), 0) AS margen_bruto,
    CASE 
        WHEN COALESCE(SUM(ol.cantidad * ol.precio_venta_unitario), 0) > 0 THEN
            ((COALESCE(SUM(ol.cantidad * ol.precio_venta_unitario), 0) - 
              COALESCE(SUM(ol.cantidad * ol.precio_compra_unitario), 0)) / 
             COALESCE(SUM(ol.cantidad * ol.precio_venta_unitario), 0)) * 100
        ELSE 0
    END AS margen_porcentual
FROM operacion o
LEFT JOIN operacion_linea ol ON o.id = ol.operacion_id
WHERE o.tipo IN ('VENTA_DIRECTA', 'VENTA_COMISION')
GROUP BY o.id, o.numero, o.tipo, o.fecha;

