-- CreateTable
CREATE TABLE "contacto_persona" (
    "id" UUID NOT NULL,
    "proveedor_id" UUID,
    "cliente_id" UUID,
    "nombre" VARCHAR(255) NOT NULL,
    "cargo" VARCHAR(150),
    "email" VARCHAR(255),
    "telefono" VARCHAR(30),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "contacto_persona_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacto_persona" ADD CONSTRAINT "contacto_persona_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacto_persona" ADD CONSTRAINT "contacto_persona_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "contacto_persona_proveedor_id_idx" ON "contacto_persona"("proveedor_id");

-- CreateIndex
CREATE INDEX "contacto_persona_cliente_id_idx" ON "contacto_persona"("cliente_id");

-- Exactamente un padre: proveedor XOR cliente
ALTER TABLE "contacto_persona" ADD CONSTRAINT "contacto_persona_parent_chk" CHECK (
  ("proveedor_id" IS NOT NULL AND "cliente_id" IS NULL)
  OR
  ("proveedor_id" IS NULL AND "cliente_id" IS NOT NULL)
);
