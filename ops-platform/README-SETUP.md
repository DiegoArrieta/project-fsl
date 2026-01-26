# Setup de Base de Datos

## 1. Crear Base de Datos y Usuario

Ejecuta el siguiente comando como superusuario de PostgreSQL:

```bash
psql -U postgres -f prisma/init-db.sql
```

O ejecuta manualmente los comandos SQL:

```sql
CREATE DATABASE fsl_db;
CREATE USER fsl_user WITH PASSWORD '1234567890';
GRANT ALL PRIVILEGES ON DATABASE fsl_db TO fsl_user;
ALTER DATABASE fsl_db OWNER TO fsl_user;
```

Luego conecta a la base de datos y otorga permisos en el schema public:

```bash
psql -U postgres -d fsl_db
```

```sql
GRANT ALL ON SCHEMA public TO fsl_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fsl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fsl_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fsl_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fsl_user;
```

## 2. Ejecutar Migraciones

```bash
npm run db:migrate
```

Esto creará todas las tablas, índices y relaciones según el schema de Prisma.

## 3. Ejecutar Seed (Datos Iniciales)

```bash
npm run db:seed
```

Esto creará:
- Tipos de pallet (PV, PR, PC)
- Usuario admin (email: admin@forestalsantalucia.cl, password: admin123)
- Proveedor de ejemplo
- Cliente de ejemplo

## 4. Verificar Conexión

Puedes verificar que todo funciona ejecutando:

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en tu navegador donde podrás ver y editar los datos.

## Variables de Entorno

El archivo `.env.local` ya está configurado con:
- `DATABASE_URL`: Conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Secret para Auth.js
- `NEXTAUTH_URL`: URL de la aplicación

## Credenciales por Defecto

- **Usuario Admin**: admin@forestalsantalucia.cl
- **Contraseña**: admin123

**⚠️ IMPORTANTE**: Cambia estas credenciales en producción.

