/*
  Warnings:

  - A unique constraint covering the columns `[presupuesto_id]` on the table `operacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('BORRADOR', 'ENVIADO', 'ACEPTADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoSecuencia" AS ENUM ('PRESUPUESTO', 'OPERACION', 'ORDEN_COMPRA');

-- AlterTable
ALTER TABLE "operacion" ADD COLUMN     "presupuesto_id" UUID;

-- CreateTable
CREATE TABLE "presupuesto" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "ciudad" VARCHAR(100),
    "direccion" VARCHAR(500),
    "observaciones" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'BORRADOR',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuesto_linea" (
    "id" UUID NOT NULL,
    "presupuesto_id" UUID NOT NULL,
    "tipo_pallet_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presupuesto_linea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequence" (
    "id" UUID NOT NULL,
    "tipo" "TipoSecuencia" NOT NULL,
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "presupuesto_numero_key" ON "presupuesto"("numero");

-- CreateIndex
CREATE INDEX "presupuesto_cliente_id_idx" ON "presupuesto"("cliente_id");

-- CreateIndex
CREATE INDEX "presupuesto_fecha_idx" ON "presupuesto"("fecha" DESC);

-- CreateIndex
CREATE INDEX "presupuesto_linea_presupuesto_id_idx" ON "presupuesto_linea"("presupuesto_id");

-- CreateIndex
CREATE INDEX "presupuesto_linea_tipo_pallet_id_idx" ON "presupuesto_linea"("tipo_pallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequence_tipo_year_key" ON "document_sequence"("tipo", "year");

-- CreateIndex
CREATE UNIQUE INDEX "operacion_presupuesto_id_key" ON "operacion"("presupuesto_id");

-- CreateIndex
CREATE INDEX "operacion_presupuesto_id_idx" ON "operacion"("presupuesto_id");

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuesto" ADD CONSTRAINT "presupuesto_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuesto_linea" ADD CONSTRAINT "presupuesto_linea_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuesto_linea" ADD CONSTRAINT "presupuesto_linea_tipo_pallet_id_fkey" FOREIGN KEY ("tipo_pallet_id") REFERENCES "tipo_pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
