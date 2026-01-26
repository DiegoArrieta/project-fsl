import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // 1. Crear tipos de pallet
  console.log('📦 Creando tipos de pallet...')
  const tipoPV = await prisma.tipoPallet.upsert({
    where: { codigo: 'PV' },
    update: {},
    create: {
      codigo: 'PV',
      nombre: 'Pallet Verde',
      descripcion: 'Pallet de madera sin tratamiento',
      requiereCertificacion: false,
      activo: true,
    },
  })

  const tipoPR = await prisma.tipoPallet.upsert({
    where: { codigo: 'PR' },
    update: {},
    create: {
      codigo: 'PR',
      nombre: 'Pallet Rústico',
      descripcion: 'Pallet de madera con acabado básico',
      requiereCertificacion: false,
      activo: true,
    },
  })

  const tipoPC = await prisma.tipoPallet.upsert({
    where: { codigo: 'PC' },
    update: {},
    create: {
      codigo: 'PC',
      nombre: 'Pallet Certificado',
      descripcion: 'Pallet con tratamiento fitosanitario NIMF-15',
      requiereCertificacion: true,
      activo: true,
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
    where: { rut: '77.442.030-4' },
    update: {},
    create: {
      rut: '77.442.030-4',
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
    where: { rut: '76.123.456-7' },
    update: {},
    create: {
      rut: '76.123.456-7',
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

