-- Catálogo de empresas de factoring y FK desde factoring

CREATE TABLE "empresa_factoring" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "rut" VARCHAR(12),
    "contacto" VARCHAR(255),
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "empresa_factoring_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "empresa_factoring_activo_idx" ON "empresa_factoring"("activo");
CREATE INDEX "empresa_factoring_nombre_idx" ON "empresa_factoring"("nombre");

-- Una fila por cada nombre distinto usado en factoring (si hay datos)
INSERT INTO "empresa_factoring" ("id", "nombre", "activo", "created_at", "updated_at")
SELECT gen_random_uuid(), d.nombre, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT TRIM("empresa_factoring") AS nombre FROM "factoring") AS d;

ALTER TABLE "factoring" ADD COLUMN "empresa_factoring_id" UUID;

UPDATE "factoring" AS f
SET "empresa_factoring_id" = e.id
FROM "empresa_factoring" AS e
WHERE TRIM(f."empresa_factoring") = e."nombre";

ALTER TABLE "factoring" ALTER COLUMN "empresa_factoring_id" SET NOT NULL;

DROP INDEX "factoring_empresa_factoring_idx";

ALTER TABLE "factoring" DROP COLUMN "empresa_factoring";

ALTER TABLE "factoring" ADD CONSTRAINT "factoring_empresa_factoring_id_fkey" FOREIGN KEY ("empresa_factoring_id") REFERENCES "empresa_factoring"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "factoring_empresa_factoring_id_idx" ON "factoring"("empresa_factoring_id");
