import { PrismaClient } from '@prisma/client'
import { compare, hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'apprentice@example.com'
    const password = 'password123'

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('User found:', user)

    const isValid = await compare(password, user.password)
    console.log('Password valid:', isValid)

    const newHash = await hash(password, 12)
    console.log('New hash would be:', newHash)
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
