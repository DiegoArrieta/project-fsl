/*
  Warnings:

  - You are about to drop the column `proveedor_id` on the `operacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[evento_id]` on the table `operacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoEmpresa" AS ENUM ('PROVEEDOR', 'CLIENTE', 'TRANSPORTISTA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEmpresa" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('ENTREGA', 'RECEPCION', 'TRASLADO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('COMPLETA', 'PARCIAL', 'DEVOLUCION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'EN_TRANSITO', 'COMPLETADA', 'RECHAZADA');

-- AlterEnum
ALTER TYPE "TipoDocumento" ADD VALUE 'ORDEN_COMPRA_CLIENTE';

-- DropForeignKey
ALTER TABLE "operacion" DROP CONSTRAINT "operacion_proveedor_id_fkey";

-- DropIndex
DROP INDEX "operacion_proveedor_id_idx";

-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "empresa_id" UUID;

-- AlterTable
ALTER TABLE "operacion" DROP COLUMN "proveedor_id",
ADD COLUMN     "evento_id" UUID;

-- AlterTable
ALTER TABLE "operacion_proveedor" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "proveedor" ADD COLUMN     "empresa_id" UUID;

-- CreateTable
CREATE TABLE "empresa" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "tipo_empresa" "TipoEmpresa" NOT NULL,
    "contacto" VARCHAR(255),
    "direccion" VARCHAR(500),
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "estado" "EstadoEmpresa" NOT NULL DEFAULT 'ACTIVA',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "ubicacion" VARCHAR(500),
    "descripcion" TEXT,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'PLANIFICADO',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega" (
    "id" UUID NOT NULL,
    "evento_id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "empresa_receptora_id" UUID,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "tipo_entrega" "TipoEntrega" NOT NULL,
    "descripcion" TEXT,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "unidad" VARCHAR(50) NOT NULL,
    "estado" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_rut_key" ON "empresa"("rut");

-- CreateIndex
CREATE INDEX "empresa_tipo_empresa_idx" ON "empresa"("tipo_empresa");

-- CreateIndex
CREATE INDEX "empresa_estado_idx" ON "empresa"("estado");

-- CreateIndex
CREATE INDEX "empresa_nombre_idx" ON "empresa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "evento_numero_key" ON "evento"("numero");

-- CreateIndex
CREATE INDEX "evento_tipo_idx" ON "evento"("tipo");

-- CreateIndex
CREATE INDEX "evento_estado_idx" ON "evento"("estado");

-- CreateIndex
CREATE INDEX "evento_fecha_inicio_idx" ON "evento"("fecha_inicio" DESC);

-- CreateIndex
CREATE INDEX "entrega_evento_id_idx" ON "entrega"("evento_id");

-- CreateIndex
CREATE INDEX "entrega_empresa_id_idx" ON "entrega"("empresa_id");

-- CreateIndex
CREATE INDEX "entrega_empresa_receptora_id_idx" ON "entrega"("empresa_receptora_id");

-- CreateIndex
CREATE INDEX "entrega_fecha_hora_idx" ON "entrega"("fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "entrega_estado_idx" ON "entrega"("estado");

-- CreateIndex
CREATE INDEX "cliente_empresa_id_idx" ON "cliente"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "operacion_evento_id_key" ON "operacion"("evento_id");

-- CreateIndex
CREATE INDEX "proveedor_empresa_id_idx" ON "proveedor"("empresa_id");

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_empresa_receptora_id_fkey" FOREIGN KEY ("empresa_receptora_id") REFERENCES "empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor" ADD CONSTRAINT "proveedor_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "operacion_proveedor_operacion_idx" RENAME TO "operacion_proveedor_operacion_id_idx";

-- RenameIndex
ALTER INDEX "operacion_proveedor_proveedor_idx" RENAME TO "operacion_proveedor_proveedor_id_idx";

-- RenameIndex
ALTER INDEX "operacion_proveedor_unique" RENAME TO "operacion_proveedor_operacion_id_proveedor_id_key";
