-- Remove solicitudes de cotización a proveedor
DROP TABLE IF EXISTS "solicitud_cotizacion_linea";
DROP TABLE IF EXISTS "solicitud_cotizacion";

DROP TYPE IF EXISTS "EstadoSolicitudCotizacion";

DELETE FROM "document_sequence" WHERE "tipo"::text = 'SOLICITUD_COTIZACION';

ALTER TYPE "TipoSecuencia" RENAME TO "TipoSecuencia_old";

CREATE TYPE "TipoSecuencia" AS ENUM ('PRESUPUESTO', 'OPERACION', 'ORDEN_COMPRA');

ALTER TABLE "document_sequence" ALTER COLUMN "tipo" TYPE "TipoSecuencia" USING ("tipo"::text::"TipoSecuencia");

DROP TYPE "TipoSecuencia_old";
