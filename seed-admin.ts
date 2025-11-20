import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('admin123', 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { role: 'ADMIN' },
        create: {
            email: 'admin@example.com',
            name: 'Administrador',
            password,
            role: 'ADMIN',
            level: 'MASTER',
        },
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
