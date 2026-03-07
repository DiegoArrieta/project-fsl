/**
 * Script para ejecutar triggers SQL para las nuevas tablas
 * Ejecutar después de la migración add_empresa_evento_entrega
 * 
 * Uso: node scripts/ejecutar-triggers-nuevas-tablas.js
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { readFileSync } = require('fs')
const { join } = require('path')

// Configurar Prisma con adapter pg (igual que en db.ts)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function main() {
  console.log('🔧 Ejecutando triggers para nuevas tablas...')
  console.log('📋 Tablas: empresa, evento, entrega\n')

  try {
    // Leer el archivo SQL
    const sqlPath = join(process.cwd(), 'prisma/migrations/add_empresa_evento_entrega_triggers.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Dividir en statements (separados por ;)
    // Filtrar comentarios y líneas vacías
    const statements = sql
      .split(';')
      .map((s) => {
        // Eliminar comentarios de línea
        return s
          .split('\n')
          .filter((line) => !line.trim().startsWith('--') && line.trim().length > 0)
          .join('\n')
          .trim()
      })
      .filter((s) => s.length > 0 && s.toUpperCase().includes('CREATE TRIGGER'))

    console.log(`📝 Encontrados ${statements.length} triggers para ejecutar\n`)

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement)
          // Extraer nombre del trigger del statement
          const triggerMatch = statement.match(/CREATE TRIGGER (\w+)/i)
          const triggerName = triggerMatch ? triggerMatch[1] : `Trigger ${i + 1}`
          console.log(`✅ ${triggerName} creado correctamente`)
        } catch (error) {
          // Si el trigger ya existe, continuar
          if (error.message?.includes('already exists') || error.code === '42P07') {
            const triggerMatch = statement.match(/CREATE TRIGGER (\w+)/i)
            const triggerName = triggerMatch ? triggerMatch[1] : `Trigger ${i + 1}`
            console.log(`⚠️  ${triggerName} ya existe, omitiendo...`)
          } else {
            console.error(`❌ Error al ejecutar statement ${i + 1}:`, error.message)
            throw error
          }
        }
      }
    }

    console.log('\n✅ Todos los triggers ejecutados correctamente!')
  } catch (error) {
    console.error('\n❌ Error al ejecutar triggers:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

