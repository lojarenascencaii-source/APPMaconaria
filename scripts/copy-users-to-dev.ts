import { PrismaClient } from '@prisma/client'

// Conexão com o banco de PRODUÇÃO
const prodPrisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_aT1JtBNWugF9@ep-winter-haze-acor6kc1-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
        }
    }
})

// Conexão com o banco de DESENVOLVIMENTO
const devPrisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_aT1JtBNWugF9@ep-sparkling-mouse-acg7jiiv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
        }
    }
})

async function copyUsersToDevDatabase() {
    try {
        console.log('🔄 Iniciando cópia de usuários da PRODUÇÃO para DESENVOLVIMENTO...\n')

        // 1. Buscar todos os usuários da produção
        const prodUsers = await prodPrisma.user.findMany()
        console.log(`✅ Encontrados ${prodUsers.length} usuários na PRODUÇÃO`)

        // 2. Buscar todas as atividades da produção
        const prodActivities = await prodPrisma.activity.findMany()
        console.log(`✅ Encontradas ${prodActivities.length} atividades na PRODUÇÃO`)

        // 3. Copiar atividades para desenvolvimento (necessário para as relações)
        console.log('\n📋 Copiando atividades...')
        for (const activity of prodActivities) {
            await devPrisma.activity.upsert({
                where: { id: activity.id },
                update: {},
                create: {
                    id: activity.id,
                    name: activity.name,
                    description: activity.description,
                    createdAt: activity.createdAt,
                    updatedAt: activity.updatedAt
                }
            })
        }
        console.log(`✅ ${prodActivities.length} atividades copiadas`)

        // 4. Copiar usuários para desenvolvimento
        console.log('\n👥 Copiando usuários...')
        for (const user of prodUsers) {
            await devPrisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    role: user.role,
                    level: user.level,
                    initiationDate: user.initiationDate,
                    phone: user.phone,
                    resetToken: user.resetToken,
                    resetTokenExpiry: user.resetTokenExpiry,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            })
            console.log(`  ✓ ${user.name} (${user.role})`)
        }

        console.log(`\n✅ ${prodUsers.length} usuários copiados com sucesso!`)
        console.log('\n🎉 Cópia concluída! O banco de DESENVOLVIMENTO agora tem os mesmos usuários da PRODUÇÃO.')
        console.log('⚠️  Lembre-se: as SENHAS são as mesmas da produção.')

    } catch (error) {
        console.error('❌ Erro ao copiar usuários:', error)
    } finally {
        await prodPrisma.$disconnect()
        await devPrisma.$disconnect()
    }
}

copyUsersToDevDatabase()
