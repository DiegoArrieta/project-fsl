-- Script de inicialización de base de datos
-- Ejecutar como superusuario (postgres)

-- Crear base de datos
CREATE DATABASE fsl_db;

-- Crear usuario
CREATE USER fsl_user WITH PASSWORD '1234567890';

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE fsl_db TO fsl_user;

-- Cambiar propietario de la base de datos
ALTER DATABASE fsl_db OWNER TO fsl_user;

-- Conectarse a la base de datos fsl_db y otorgar privilegios en el schema public
\c fsl_db
GRANT ALL ON SCHEMA public TO fsl_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fsl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fsl_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fsl_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fsl_user;

