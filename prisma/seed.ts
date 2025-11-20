import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Activities
  const activities = [
    "Sessão de Loja",
    "Visitas Outras Lojas",
    "Visitas Capítulo Demolay",
    "Apresentação de Trabalhos",
    "Seminário",
    "Visitas a Instituições Filantrópicas",
    "Telhamento",
    "1ª Instrução",
    "2ª Instrução",
    "3ª Instrução",
    "4ª Instrução",
    "5ª Instrução"
  ]

  console.log('📝 Creating activities...')
  for (const name of activities) {
    await prisma.activity.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('✅ Activities created')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@maconica.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await hash('admin123', 10)

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@maconica.com',
      password: hashedPassword,
      role: 'ADMIN',
      level: 'MASTER',
      phone: null,
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('📧 Email: admin@maconica.com')
  console.log('🔑 Senha: admin123')
  console.log('═══════════════════════════════════════')
  console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
