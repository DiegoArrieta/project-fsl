// Script de seed alternativo usando Node.js directamente
// Ejecutar con: node prisma/seed.js

require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcrypt')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  console.log('📦 Creando categorías y países de pallet...')
  const catVerde = await prisma.categoriaPallet.upsert({
    where: { codigo: 'VERDE' },
    update: {},
    create: {
      codigo: 'VERDE',
      nombre: 'Pallet Verde',
      descripcion: 'Pallet de madera sin tratamiento',
      activo: true,
    },
  })
  const catCepillado = await prisma.categoriaPallet.upsert({
    where: { codigo: 'CEPILLADO' },
    update: {},
    create: {
      codigo: 'CEPILLADO',
      nombre: 'Cepillado',
      descripcion: 'Pallet con acabado cepillado',
      activo: true,
    },
  })
  const catCert = await prisma.categoriaPallet.upsert({
    where: { codigo: 'CERTIFICADO' },
    update: {},
    create: {
      codigo: 'CERTIFICADO',
      nombre: 'Certificado',
      descripcion: 'Pallet con tratamiento fitosanitario NIMF-15',
      activo: true,
    },
  })

  const paisCl = await prisma.pais.upsert({
    where: { codigoIso: 'CL' },
    update: {},
    create: { codigoIso: 'CL', nombre: 'Chile', activo: true },
  })
  const paisUs = await prisma.pais.upsert({
    where: { codigoIso: 'US' },
    update: {},
    create: { codigoIso: 'US', nombre: 'Estados Unidos', activo: true },
  })

  const paisesChileYUs = { deleteMany: {}, create: [{ paisId: paisCl.id }, { paisId: paisUs.id }] }

  console.log('📦 Creando tipos de pallet...')
  const tipoPV = await prisma.tipoPallet.upsert({
    where: { categoriaId_codigo: { categoriaId: catVerde.id, codigo: 'PV' } },
    update: { dimensiones: '1200×1000 mm', paises: paisesChileYUs },
    create: {
      categoriaId: catVerde.id,
      codigo: 'PV',
      nombre: 'Pallet Verde',
      descripcion: 'Pallet de madera sin tratamiento',
      dimensiones: '1200×1000 mm',
      requiereCertificacion: false,
      activo: true,
      paises: { create: [{ paisId: paisCl.id }, { paisId: paisUs.id }] },
    },
  })

  const tipoPR = await prisma.tipoPallet.upsert({
    where: { categoriaId_codigo: { categoriaId: catCepillado.id, codigo: 'PR' } },
    update: { dimensiones: '1200×1000 mm', paises: paisesChileYUs },
    create: {
      categoriaId: catCepillado.id,
      codigo: 'PR',
      nombre: 'Pallet Rústico',
      descripcion: 'Pallet de madera con acabado básico',
      dimensiones: '1200×1000 mm',
      requiereCertificacion: false,
      activo: true,
      paises: { create: [{ paisId: paisCl.id }, { paisId: paisUs.id }] },
    },
  })

  const tipoPC = await prisma.tipoPallet.upsert({
    where: { categoriaId_codigo: { categoriaId: catCert.id, codigo: 'PC' } },
    update: { dimensiones: '1200×1000 mm', paises: paisesChileYUs },
    create: {
      categoriaId: catCert.id,
      codigo: 'PC',
      nombre: 'Pallet Certificado',
      descripcion: 'Pallet con tratamiento fitosanitario NIMF-15',
      dimensiones: '1200×1000 mm',
      requiereCertificacion: true,
      activo: true,
      paises: { create: [{ paisId: paisCl.id }, { paisId: paisUs.id }] },
    },
  })

  console.log('✅ Tipos de pallet creados:', { tipoPV, tipoPR, tipoPC })

  // 2. Crear usuario admin
  console.log('👤 Creando usuario admin...')
  const passwordHash = await bcrypt.hash('admin123', 10)
  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@forestalsantalucia.cl' },
    update: {},
    create: {
      email: 'admin@forestalsantalucia.cl',
      nombre: 'Administrador',
      passwordHash,
      activo: true,
    },
  })

  console.log('✅ Usuario admin creado:', usuarioAdmin.email)

  // 3. Crear proveedor de ejemplo
  console.log('🏭 Creando proveedor de ejemplo...')
  const proveedor = await prisma.proveedor.upsert({
    where: { rut: '77442030-4' },
    update: {},
    create: {
      rut: '77442030-4', // RUT sin puntos, solo con guión
      razonSocial: 'FORESTAL ANDES LIMITADA',
      nombreFantasia: 'Forestal Andes',
      direccion: 'Camino Freire a Barros Arana KM.2',
      comuna: 'Freire',
      ciudad: 'Temuco',
      telefono: '45-2378200',
      email: 'administracion@forestalandes.cl',
      activo: true,
    },
  })

  console.log('✅ Proveedor creado:', proveedor.razonSocial)

  // 4. Crear cliente de ejemplo
  console.log('🏢 Creando cliente de ejemplo...')
  const cliente = await prisma.cliente.upsert({
    where: { rut: '76123456-7' },
    update: {},
    create: {
      rut: '76123456-7', // RUT sin puntos, solo con guión
      razonSocial: 'CERMAQ CHILE S.A.',
      nombreFantasia: 'Cermaq',
      direccion: 'Puerto Montt',
      comuna: 'Puerto Montt',
      ciudad: 'Puerto Montt',
      activo: true,
    },
  })

  console.log('✅ Cliente creado:', cliente.razonSocial)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

