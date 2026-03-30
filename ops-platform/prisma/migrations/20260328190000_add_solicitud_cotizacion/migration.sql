-- CreateEnum
CREATE TYPE "EstadoSolicitudCotizacion" AS ENUM ('BORRADOR', 'ENVIADO', 'CERRADO');

-- AlterEnum
ALTER TYPE "TipoSecuencia" ADD VALUE 'SOLICITUD_COTIZACION';

-- CreateTable
CREATE TABLE "solicitud_cotizacion" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoSolicitudCotizacion" NOT NULL DEFAULT 'BORRADOR',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "solicitud_cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_cotizacion_linea" (
    "id" UUID NOT NULL,
    "solicitud_cotizacion_id" UUID NOT NULL,
    "tipo_pallet_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_cotizacion_linea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_cotizacion_numero_key" ON "solicitud_cotizacion"("numero");

-- CreateIndex
CREATE INDEX "solicitud_cotizacion_proveedor_id_idx" ON "solicitud_cotizacion"("proveedor_id");

-- CreateIndex
CREATE INDEX "solicitud_cotizacion_fecha_idx" ON "solicitud_cotizacion"("fecha" DESC);

-- CreateIndex
CREATE INDEX "solicitud_cotizacion_estado_idx" ON "solicitud_cotizacion"("estado");

-- CreateIndex
CREATE INDEX "solicitud_cotizacion_linea_solicitud_cotizacion_id_idx" ON "solicitud_cotizacion_linea"("solicitud_cotizacion_id");

-- CreateIndex
CREATE INDEX "solicitud_cotizacion_linea_tipo_pallet_id_idx" ON "solicitud_cotizacion_linea"("tipo_pallet_id");

-- AddForeignKey
ALTER TABLE "solicitud_cotizacion" ADD CONSTRAINT "solicitud_cotizacion_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cotizacion_linea" ADD CONSTRAINT "solicitud_cotizacion_linea_solicitud_cotizacion_id_fkey" FOREIGN KEY ("solicitud_cotizacion_id") REFERENCES "solicitud_cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cotizacion_linea" ADD CONSTRAINT "solicitud_cotizacion_linea_tipo_pallet_id_fkey" FOREIGN KEY ("tipo_pallet_id") REFERENCES "tipo_pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
