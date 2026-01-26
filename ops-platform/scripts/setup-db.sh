#!/bin/bash

# Script de configuración de base de datos
# Ejecutar desde la raíz del proyecto: bash scripts/setup-db.sh

echo "🌲 Configurando base de datos para Forestal Santa Lucía..."

# Verificar si PostgreSQL está corriendo
if ! pg_isready -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL no está corriendo. Por favor inicia PostgreSQL primero."
    exit 1
fi

echo "📦 Creando base de datos y usuario..."

# Ejecutar script SQL
psql -U postgres -f prisma/init-db.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de datos y usuario creados exitosamente"
else
    echo "⚠️  Puede que la base de datos o usuario ya existan. Continuando..."
fi

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo "✅ Migraciones ejecutadas exitosamente"
else
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi

echo "🌱 Ejecutando seed (datos iniciales)..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Seed ejecutado exitosamente"
else
    echo "⚠️  Error al ejecutar seed. Puede que los datos ya existan."
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📝 Credenciales por defecto:"
echo "   Email: admin@forestalsantalucia.cl"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANTE: Cambia estas credenciales en producción."

