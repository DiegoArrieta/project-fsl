/**
 * Script para ejecutar triggers SQL para las nuevas tablas
 * Ejecutar después de la migración add_empresa_evento_entrega
 * 
 * Uso: npx tsx scripts/ejecutar-triggers-nuevas-tablas.ts
 * O: npm run db:triggers (si tsx está instalado)
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Ejecutando triggers para nuevas tablas...')
  console.log('📋 Tablas: empresa, evento, entrega\n')

  try {
    // Leer el archivo SQL
    const sqlPath = join(process.cwd(), 'prisma/migrations/add_empresa_evento_entrega_triggers.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Dividir en statements (separados por ;)
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

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
        } catch (error: any) {
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

