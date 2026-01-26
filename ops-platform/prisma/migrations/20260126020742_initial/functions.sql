-- Funciones SQL para números secuenciales y triggers
-- Ejecutar después de la migración inicial

-- ============================================
-- FUNCIONES PARA NÚMEROS SECUENCIALES
-- ============================================

-- Función para generar número de operación (OP-YYYY-NNNNN)
CREATE OR REPLACE FUNCTION generar_numero_operacion()
RETURNS VARCHAR(20) AS $$
DECLARE
    anio VARCHAR(4);
    siguiente INTEGER;
    nuevo_numero VARCHAR(20);
BEGIN
    anio := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 9 FOR 5) AS INTEGER)
    ), 0) + 1
    INTO siguiente
    FROM operacion
    WHERE numero LIKE 'OP-' || anio || '-%';
    
    nuevo_numero := 'OP-' || anio || '-' || LPAD(siguiente::TEXT, 5, '0');
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de orden de compra (OC-YYYY-NNNNN)
CREATE OR REPLACE FUNCTION generar_numero_orden_compra()
RETURNS VARCHAR(20) AS $$
DECLARE
    anio VARCHAR(4);
    siguiente INTEGER;
    nuevo_numero VARCHAR(20);
BEGIN
    anio := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 4 FOR 5) AS INTEGER)
    ), 0) + 1
    INTO siguiente
    FROM orden_compra
    WHERE numero LIKE 'OC-' || anio || '-%';
    
    nuevo_numero := 'OC-' || anio || '-' || LPAD(siguiente::TEXT, 5, '0');
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS PARA updated_at
-- ============================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para operacion
CREATE TRIGGER update_operacion_updated_at
    BEFORE UPDATE ON operacion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para proveedor
CREATE TRIGGER update_proveedor_updated_at
    BEFORE UPDATE ON proveedor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para cliente
CREATE TRIGGER update_cliente_updated_at
    BEFORE UPDATE ON cliente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para orden_compra
CREATE TRIGGER update_orden_compra_updated_at
    BEFORE UPDATE ON orden_compra
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Operaciones con Pendientes
CREATE OR REPLACE VIEW v_operaciones_pendientes AS
SELECT 
    o.id,
    o.numero,
    o.tipo,
    o.fecha,
    o.estado_documental,
    o.estado_financiero,
    p.razon_social AS proveedor,
    c.razon_social AS cliente,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id AND d.es_obligatorio = true) AS docs_obligatorios,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id) AS docs_presentes,
    (SELECT COALESCE(SUM(monto), 0) FROM pago pg WHERE pg.operacion_id = o.id) AS total_pagado
FROM operacion o
LEFT JOIN proveedor p ON o.proveedor_id = p.id
LEFT JOIN cliente c ON o.cliente_id = c.id
WHERE o.estado_financiero != 'CERRADA';

-- Vista: Operaciones con Márgenes Calculados
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

-- Vista: Resumen Dashboard
CREATE OR REPLACE VIEW v_dashboard_resumen AS
SELECT
    (SELECT COUNT(*) FROM operacion WHERE estado_documental = 'INCOMPLETA') AS docs_faltantes,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero = 'FACTURADA') AS pagos_pendientes,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero NOT IN ('CERRADA')) AS operaciones_abiertas,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero = 'CERRADA' AND fecha_cierre >= CURRENT_DATE - INTERVAL '30 days') AS cerradas_30dias,
    (SELECT COUNT(*) FROM orden_compra WHERE estado = 'BORRADOR') AS oc_borrador,
    (SELECT COUNT(*) FROM orden_compra WHERE estado = 'ENVIADA') AS oc_enviadas;

