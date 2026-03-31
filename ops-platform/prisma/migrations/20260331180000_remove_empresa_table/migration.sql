-- Elimina tabla empresa; entregas pasan a datos de origen/receptor en texto;
-- cliente y proveedor pierden empresa_id opcional.

ALTER TABLE "entrega" ADD COLUMN "origen_razon_social" VARCHAR(255);
ALTER TABLE "entrega" ADD COLUMN "origen_rut" VARCHAR(12);
ALTER TABLE "entrega" ADD COLUMN "receptor_razon_social" VARCHAR(255);
ALTER TABLE "entrega" ADD COLUMN "receptor_rut" VARCHAR(12);

UPDATE "entrega" AS e
SET
  "origen_razon_social" = o."nombre",
  "origen_rut" = o."rut"
FROM "empresa" AS o
WHERE e."empresa_id" = o."id";

UPDATE "entrega" AS e
SET
  "receptor_razon_social" = r."nombre",
  "receptor_rut" = r."rut"
FROM "empresa" AS r
WHERE e."empresa_receptora_id" IS NOT NULL
  AND e."empresa_receptora_id" = r."id";

UPDATE "entrega"
SET "origen_razon_social" = '—'
WHERE "origen_razon_social" IS NULL;

UPDATE "entrega"
SET "origen_rut" = '—'
WHERE "origen_rut" IS NULL OR TRIM("origen_rut") = '';

ALTER TABLE "entrega" ALTER COLUMN "origen_razon_social" SET NOT NULL;
ALTER TABLE "entrega" ALTER COLUMN "origen_rut" SET NOT NULL;

ALTER TABLE "entrega" DROP CONSTRAINT IF EXISTS "entrega_empresa_id_fkey";
ALTER TABLE "entrega" DROP CONSTRAINT IF EXISTS "entrega_empresa_receptora_id_fkey";

DROP INDEX IF EXISTS "entrega_empresa_id_idx";
DROP INDEX IF EXISTS "entrega_empresa_receptora_id_idx";

ALTER TABLE "entrega" DROP COLUMN IF EXISTS "empresa_id";
ALTER TABLE "entrega" DROP COLUMN IF EXISTS "empresa_receptora_id";

ALTER TABLE "cliente" DROP CONSTRAINT IF EXISTS "cliente_empresa_id_fkey";
DROP INDEX IF EXISTS "cliente_empresa_id_idx";
ALTER TABLE "cliente" DROP COLUMN IF EXISTS "empresa_id";

ALTER TABLE "proveedor" DROP CONSTRAINT IF EXISTS "proveedor_empresa_id_fkey";
DROP INDEX IF EXISTS "proveedor_empresa_id_idx";
ALTER TABLE "proveedor" DROP COLUMN IF EXISTS "empresa_id";

DROP TRIGGER IF EXISTS update_empresa_updated_at ON "empresa";

DROP TABLE IF EXISTS "empresa";

DROP TYPE IF EXISTS "EstadoEmpresa";
DROP TYPE IF EXISTS "TipoEmpresa";
