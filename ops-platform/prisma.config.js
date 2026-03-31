/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS config cargado por Prisma CLI */
const fs = require('fs')
const path = require('path')

const envLocal = path.join(__dirname, '.env.local')
if (fs.existsSync(envLocal)) {
  // En Docker el migrate one-shot no incluye .env.local; DATABASE_URL viene del entorno.
  require('dotenv').config({ path: envLocal })
}

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://fsl_user:1234567890@localhost:5432/fsl_db?schema=public',
  },
}

