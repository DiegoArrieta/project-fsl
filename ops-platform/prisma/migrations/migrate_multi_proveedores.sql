-- Migración: Operación puede tener múltiples proveedores (N:M)
-- Fecha: 2026-01-27
-- Descripción: Cambiar relación 1:N a N:M entre Operacion y Proveedor

BEGIN;

-- 1. Crear tabla intermedia operacion_proveedor
CREATE TABLE IF NOT EXISTS operacion_proveedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operacion_id UUID NOT NULL REFERENCES operacion(id) ON DELETE CASCADE,
    proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT operacion_proveedor_unique UNIQUE (operacion_id, proveedor_id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS operacion_proveedor_operacion_idx ON operacion_proveedor(operacion_id);
CREATE INDEX IF NOT EXISTS operacion_proveedor_proveedor_idx ON operacion_proveedor(proveedor_id);

-- 3. Migrar datos existentes: mover proveedor_id a tabla intermedia
INSERT INTO operacion_proveedor (operacion_id, proveedor_id, created_at)
SELECT id, proveedor_id, created_at
FROM operacion
WHERE proveedor_id IS NOT NULL
ON CONFLICT (operacion_id, proveedor_id) DO NOTHING;

-- 4. Eliminar columna proveedor_id de operacion
ALTER TABLE operacion DROP COLUMN IF EXISTS proveedor_id;

-- 5. Eliminar índice antiguo si existe
DROP INDEX IF EXISTS operacion_proveedor_idx;

COMMIT;
