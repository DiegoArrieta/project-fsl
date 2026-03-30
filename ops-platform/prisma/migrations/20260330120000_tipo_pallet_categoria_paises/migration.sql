-- CreateTable
CREATE TABLE "categoria_pallet" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "categoria_pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pais" (
    "id" UUID NOT NULL,
    "codigo_iso" CHAR(2) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_pallet_codigo_key" ON "categoria_pallet"("codigo");

-- CreateIndex
CREATE INDEX "categoria_pallet_activo_idx" ON "categoria_pallet"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "pais_codigo_iso_key" ON "pais"("codigo_iso");

-- CreateIndex
CREATE INDEX "pais_activo_idx" ON "pais"("activo");

-- AlterTable
ALTER TABLE "tipo_pallet" ADD COLUMN "categoria_id" UUID,
ADD COLUMN "dimensiones" VARCHAR(200),
ADD COLUMN "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

INSERT INTO "categoria_pallet" ("id", "codigo", "nombre", "descripcion", "activo", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'VERDE', 'Pallet Verde', 'Pallet de madera sin tratamiento', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'CEPILLADO', 'Cepillado', 'Pallet con acabado cepillado', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'CERTIFICADO', 'Certificado', 'Pallet con tratamiento fitosanitario NIMF-15', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "pais" ("id", "codigo_iso", "nombre", "activo", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'CL', 'Chile', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'US', 'Estados Unidos', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "tipo_pallet" SET "categoria_id" = (SELECT "id" FROM "categoria_pallet" WHERE "codigo" = 'VERDE' LIMIT 1) WHERE "codigo" = 'PV';
UPDATE "tipo_pallet" SET "categoria_id" = (SELECT "id" FROM "categoria_pallet" WHERE "codigo" = 'CEPILLADO' LIMIT 1) WHERE "codigo" = 'PR';
UPDATE "tipo_pallet" SET "categoria_id" = (SELECT "id" FROM "categoria_pallet" WHERE "codigo" = 'CERTIFICADO' LIMIT 1) WHERE "codigo" = 'PC';

UPDATE "tipo_pallet" SET "dimensiones" = '1200×1000 mm' WHERE "dimensiones" IS NULL;

ALTER TABLE "tipo_pallet" ALTER COLUMN "categoria_id" SET NOT NULL;

DROP INDEX IF EXISTS "tipo_pallet_codigo_key";

CREATE UNIQUE INDEX "tipo_pallet_categoria_id_codigo_key" ON "tipo_pallet"("categoria_id", "codigo");

CREATE INDEX "tipo_pallet_categoria_id_idx" ON "tipo_pallet"("categoria_id");

ALTER TABLE "tipo_pallet" ADD CONSTRAINT "tipo_pallet_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "tipo_pallet_pais" (
    "tipo_pallet_id" UUID NOT NULL,
    "pais_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_pallet_pais_pkey" PRIMARY KEY ("tipo_pallet_id","pais_id")
);

CREATE INDEX "tipo_pallet_pais_pais_id_idx" ON "tipo_pallet_pais"("pais_id");

ALTER TABLE "tipo_pallet_pais" ADD CONSTRAINT "tipo_pallet_pais_tipo_pallet_id_fkey" FOREIGN KEY ("tipo_pallet_id") REFERENCES "tipo_pallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tipo_pallet_pais" ADD CONSTRAINT "tipo_pallet_pais_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "tipo_pallet_pais" ("tipo_pallet_id", "pais_id", "created_at")
SELECT tp."id", p."id", CURRENT_TIMESTAMP
FROM "tipo_pallet" tp
CROSS JOIN "pais" p
WHERE p."codigo_iso" = 'CL';
