-- AlterTable
ALTER TABLE "operacion_linea" ADD COLUMN     "presupuesto_linea_id" UUID;

-- CreateIndex
CREATE INDEX "operacion_linea_presupuesto_linea_id_idx" ON "operacion_linea"("presupuesto_linea_id");

-- AddForeignKey
ALTER TABLE "operacion_linea" ADD CONSTRAINT "operacion_linea_presupuesto_linea_id_fkey" FOREIGN KEY ("presupuesto_linea_id") REFERENCES "presupuesto_linea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
