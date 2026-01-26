-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('COMPRA', 'VENTA_DIRECTA', 'VENTA_COMISION');

-- CreateEnum
CREATE TYPE "EstadoDocumental" AS ENUM ('INCOMPLETA', 'COMPLETA');

-- CreateEnum
CREATE TYPE "EstadoFinanciero" AS ENUM ('PENDIENTE', 'FACTURADA', 'PAGADA', 'CERRADA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('ORDEN_COMPRA', 'GUIA_DESPACHO', 'GUIA_RECEPCION', 'FACTURA', 'CERTIFICADO_NIMF15', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('PAGO_PROVEEDOR', 'COBRO_CLIENTE', 'PAGO_FLETE', 'PAGO_COMISION');

-- CreateEnum
CREATE TYPE "EstadoOC" AS ENUM ('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id" UUID NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "nombre_fantasia" VARCHAR(255),
    "direccion" VARCHAR(500),
    "comuna" VARCHAR(100),
    "ciudad" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "nombre_fantasia" VARCHAR(255),
    "direccion" VARCHAR(500),
    "comuna" VARCHAR(100),
    "ciudad" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_pallet" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "requiere_certificacion" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operacion" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "fecha" DATE NOT NULL,
    "proveedor_id" UUID,
    "cliente_id" UUID,
    "estado_documental" "EstadoDocumental" NOT NULL DEFAULT 'INCOMPLETA',
    "estado_financiero" "EstadoFinanciero" NOT NULL DEFAULT 'PENDIENTE',
    "direccion_entrega" VARCHAR(500),
    "orden_compra_cliente" VARCHAR(50),
    "orden_compra_generada_id" UUID,
    "observaciones" TEXT,
    "observacion_cierre" TEXT,
    "fecha_cierre" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "operacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operacion_linea" (
    "id" UUID NOT NULL,
    "operacion_id" UUID NOT NULL,
    "tipo_pallet_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidad_entregada" INTEGER NOT NULL DEFAULT 0,
    "cantidad_danada" INTEGER NOT NULL DEFAULT 0,
    "precio_unitario" DECIMAL(12,2),
    "precio_venta_unitario" DECIMAL(12,2),
    "precio_compra_unitario" DECIMAL(12,2),
    "descripcion_producto" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operacion_linea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento" (
    "id" UUID NOT NULL,
    "operacion_id" UUID NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "numero_documento" VARCHAR(50),
    "fecha_documento" DATE,
    "archivo_url" VARCHAR(500) NOT NULL,
    "archivo_nombre" VARCHAR(255) NOT NULL,
    "archivo_tipo" VARCHAR(50) NOT NULL,
    "archivo_size" INTEGER NOT NULL,
    "es_obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "chofer_nombre" VARCHAR(100),
    "chofer_rut" VARCHAR(12),
    "vehiculo_patente" VARCHAR(10),
    "transportista" VARCHAR(255),
    "cantidad_documento" INTEGER,
    "cantidad_danada" INTEGER,
    "uploaded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" UUID NOT NULL,
    "operacion_id" UUID NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "metodo_pago" VARCHAR(50),
    "referencia" VARCHAR(100),
    "banco" VARCHAR(100),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factoring" (
    "id" UUID NOT NULL,
    "operacion_id" UUID NOT NULL,
    "empresa_factoring" VARCHAR(255) NOT NULL,
    "fecha_factoring" DATE NOT NULL,
    "monto_factura" DECIMAL(12,2) NOT NULL,
    "monto_adelantado" DECIMAL(12,2) NOT NULL,
    "comision_factoring" DECIMAL(12,2),
    "fecha_vencimiento" DATE,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_compra" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "fecha_entrega" DATE,
    "direccion_entrega" VARCHAR(500),
    "observaciones" TEXT,
    "operacion_id" UUID,
    "estado" "EstadoOC" NOT NULL DEFAULT 'BORRADOR',
    "pdf_generado" BOOLEAN NOT NULL DEFAULT false,
    "pdf_url" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_compra_linea" (
    "id" UUID NOT NULL,
    "orden_compra_id" UUID NOT NULL,
    "tipo_pallet_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2),
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_compra_linea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_activo_idx" ON "usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_rut_key" ON "proveedor"("rut");

-- CreateIndex
CREATE INDEX "proveedor_activo_idx" ON "proveedor"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_rut_key" ON "cliente"("rut");

-- CreateIndex
CREATE INDEX "cliente_activo_idx" ON "cliente"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_pallet_codigo_key" ON "tipo_pallet"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "operacion_numero_key" ON "operacion"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "operacion_orden_compra_generada_id_key" ON "operacion"("orden_compra_generada_id");

-- CreateIndex
CREATE INDEX "operacion_tipo_idx" ON "operacion"("tipo");

-- CreateIndex
CREATE INDEX "operacion_fecha_idx" ON "operacion"("fecha" DESC);

-- CreateIndex
CREATE INDEX "operacion_proveedor_id_idx" ON "operacion"("proveedor_id");

-- CreateIndex
CREATE INDEX "operacion_cliente_id_idx" ON "operacion"("cliente_id");

-- CreateIndex
CREATE INDEX "operacion_estado_documental_idx" ON "operacion"("estado_documental");

-- CreateIndex
CREATE INDEX "operacion_estado_financiero_idx" ON "operacion"("estado_financiero");

-- CreateIndex
CREATE INDEX "operacion_orden_compra_generada_id_idx" ON "operacion"("orden_compra_generada_id");

-- CreateIndex
CREATE INDEX "operacion_created_at_idx" ON "operacion"("created_at" DESC);

-- CreateIndex
CREATE INDEX "operacion_linea_operacion_id_idx" ON "operacion_linea"("operacion_id");

-- CreateIndex
CREATE INDEX "operacion_linea_tipo_pallet_id_idx" ON "operacion_linea"("tipo_pallet_id");

-- CreateIndex
CREATE INDEX "operacion_linea_operacion_id_tipo_pallet_id_idx" ON "operacion_linea"("operacion_id", "tipo_pallet_id");

-- CreateIndex
CREATE INDEX "documento_operacion_id_idx" ON "documento"("operacion_id");

-- CreateIndex
CREATE INDEX "documento_tipo_idx" ON "documento"("tipo");

-- CreateIndex
CREATE INDEX "documento_numero_documento_idx" ON "documento"("numero_documento");

-- CreateIndex
CREATE INDEX "documento_operacion_id_es_obligatorio_idx" ON "documento"("operacion_id", "es_obligatorio");

-- CreateIndex
CREATE INDEX "documento_uploaded_at_idx" ON "documento"("uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "pago_operacion_id_idx" ON "pago"("operacion_id");

-- CreateIndex
CREATE INDEX "pago_tipo_idx" ON "pago"("tipo");

-- CreateIndex
CREATE INDEX "pago_fecha_pago_idx" ON "pago"("fecha_pago" DESC);

-- CreateIndex
CREATE INDEX "pago_operacion_id_tipo_idx" ON "pago"("operacion_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "factoring_operacion_id_key" ON "factoring"("operacion_id");

-- CreateIndex
CREATE INDEX "factoring_empresa_factoring_idx" ON "factoring"("empresa_factoring");

-- CreateIndex
CREATE INDEX "factoring_fecha_vencimiento_idx" ON "factoring"("fecha_vencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "orden_compra_numero_key" ON "orden_compra"("numero");

-- CreateIndex
CREATE INDEX "orden_compra_proveedor_id_idx" ON "orden_compra"("proveedor_id");

-- CreateIndex
CREATE INDEX "orden_compra_fecha_idx" ON "orden_compra"("fecha" DESC);

-- CreateIndex
CREATE INDEX "orden_compra_operacion_id_idx" ON "orden_compra"("operacion_id");

-- CreateIndex
CREATE INDEX "orden_compra_estado_idx" ON "orden_compra"("estado");

-- CreateIndex
CREATE INDEX "orden_compra_linea_orden_compra_id_idx" ON "orden_compra_linea"("orden_compra_id");

-- CreateIndex
CREATE INDEX "orden_compra_linea_tipo_pallet_id_idx" ON "orden_compra_linea"("tipo_pallet_id");

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_orden_compra_generada_id_fkey" FOREIGN KEY ("orden_compra_generada_id") REFERENCES "orden_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion_linea" ADD CONSTRAINT "operacion_linea_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion_linea" ADD CONSTRAINT "operacion_linea_tipo_pallet_id_fkey" FOREIGN KEY ("tipo_pallet_id") REFERENCES "tipo_pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factoring" ADD CONSTRAINT "factoring_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra" ADD CONSTRAINT "orden_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra" ADD CONSTRAINT "orden_compra_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_linea" ADD CONSTRAINT "orden_compra_linea_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "orden_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_linea" ADD CONSTRAINT "orden_compra_linea_tipo_pallet_id_fkey" FOREIGN KEY ("tipo_pallet_id") REFERENCES "tipo_pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
