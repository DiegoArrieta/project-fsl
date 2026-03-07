# Instrucciones para Ejecutar Triggers SQL

## Archivo SQL
El archivo con los triggers está en:
```
ops-platform/prisma/migrations/add_empresa_evento_entrega_triggers.sql
```

## Opción 1: Usando psql (Recomendado)

```bash
# Conectarse a tu base de datos PostgreSQL
psql -h localhost -U tu_usuario -d tu_base_de_datos

# O si tienes DATABASE_URL en .env.local:
# Extraer la URL y usar:
psql "postgresql://usuario:password@host:puerto/database"

# Una vez conectado, ejecutar:
\i prisma/migrations/add_empresa_evento_entrega_triggers.sql

# O copiar y pegar el contenido del archivo SQL directamente
```

## Opción 2: Usando el script Node.js

```bash
cd ops-platform

# Primero, generar Prisma Client (si no lo has hecho):
npx prisma generate

# Luego ejecutar el script:
node scripts/ejecutar-triggers-nuevas-tablas.js

# O usando npm:
npm run db:triggers
```

## Opción 3: Ejecutar SQL directamente

Puedes copiar y pegar el siguiente SQL en tu cliente de base de datos (pgAdmin, DBeaver, etc.):

```sql
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
```

## Verificar que los triggers se crearon

```sql
-- Ver todos los triggers de las nuevas tablas
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('empresa', 'evento', 'entrega')
ORDER BY event_object_table, trigger_name;
```

## Nota Importante

La función `update_updated_at_column()` debe existir antes de ejecutar los triggers. Esta función fue creada en la migración inicial (`20260126020742_initial/functions.sql`). Si no existe, ejecuta primero:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

