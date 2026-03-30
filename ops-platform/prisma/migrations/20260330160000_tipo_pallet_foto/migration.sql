-- AlterTable
ALTER TABLE "tipo_pallet" ADD COLUMN     "foto_key" VARCHAR(500),
ADD COLUMN     "foto_nombre" VARCHAR(255),
ADD COLUMN     "foto_content_type" VARCHAR(100),
ADD COLUMN     "foto_size" INTEGER;
