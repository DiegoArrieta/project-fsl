require('dotenv').config({ path: '.env.local' })

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://fsl_user:1234567890@localhost:5432/fsl_db?schema=public',
  },
}

