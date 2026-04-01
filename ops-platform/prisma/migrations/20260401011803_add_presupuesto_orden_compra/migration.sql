-- AlterTable
ALTER TABLE "orden_compra" ADD COLUMN     "presupuesto_id" UUID;

-- AlterTable
ALTER TABLE "orden_compra_linea" ADD COLUMN     "presupuesto_linea_id" UUID;

-- CreateIndex
CREATE INDEX "orden_compra_presupuesto_id_idx" ON "orden_compra"("presupuesto_id");

-- CreateIndex
CREATE INDEX "orden_compra_linea_presupuesto_linea_id_idx" ON "orden_compra_linea"("presupuesto_linea_id");

-- AddForeignKey
ALTER TABLE "orden_compra" ADD CONSTRAINT "orden_compra_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_linea" ADD CONSTRAINT "orden_compra_linea_presupuesto_linea_id_fkey" FOREIGN KEY ("presupuesto_linea_id") REFERENCES "presupuesto_linea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
