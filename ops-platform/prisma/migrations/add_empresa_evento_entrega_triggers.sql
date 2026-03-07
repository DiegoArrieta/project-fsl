-- Triggers para updated_at en nuevas tablas: empresa, evento, entrega
-- Ejecutar después de la migración add_empresa_evento_entrega

-- ============================================
-- TRIGGERS PARA updated_at (Nuevas Tablas)
-- ============================================

-- Trigger para empresa
CREATE TRIGGER update_empresa_updated_at
    BEFORE UPDATE ON empresa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para evento
CREATE TRIGGER update_evento_updated_at
    BEFORE UPDATE ON evento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para entrega
CREATE TRIGGER update_entrega_updated_at
    BEFORE UPDATE ON entrega
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

