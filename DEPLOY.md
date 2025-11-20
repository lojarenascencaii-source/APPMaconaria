# Guia de Deploy - App Maçonaria

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel (gratuita)
- Conta no Neon (PostgreSQL gratuito)

---

## 🗄️ Passo 1: Configurar Banco de Dados (Neon)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Clique em "Create Project"
3. Escolha:
   - **Region**: US East (ou mais próximo)
   - **PostgreSQL Version**: 16
4. Copie a **Connection String** que aparece
   - Formato: `postgresql://user:pass@host/dbname`
5. Guarde essa string, você vai precisar!

---

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Preparar Repositório GitHub

1. Crie um repositório no GitHub
2. No terminal, execute:

```bash
cd "/Users/milan/Documents/App Maçonaria"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### 2.2 Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

**Variáveis Obrigatórias:**
```
DATABASE_URL = [Cole a connection string do Neon]
NEXTAUTH_SECRET = [Gere com: openssl rand -base64 32]
NEXTAUTH_URL = https://seu-app.vercel.app
```

5. Clique em "Deploy"

---

## 🌱 Passo 3: Criar Usuário Administrador

Após o deploy, execute o seed:

1. No Vercel, vá em seu projeto
2. Clique na aba "Settings" → "Functions"
3. Ou execute localmente conectado ao banco de produção:

```bash
npm run db:seed
```

**Credenciais do Admin:**
- 📧 Email: `admin@maconica.com`
- 🔑 Senha: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## ✅ Passo 4: Verificar

1. Acesse seu app: `https://seu-app.vercel.app`
2. Faça login com as credenciais do admin
3. Altere a senha em "Meus Dados"
4. Configure o SMTP em "Configuração de Email"

---

## 🔧 Comandos Úteis

```bash
# Rodar localmente
npm run dev

# Fazer seed do banco
npm run db:seed

# Push schema para o banco
npm run db:push

# Build para produção
npm run build
```

---

## 📝 Notas

- O plano gratuito do Vercel permite deploys ilimitados
- O Neon oferece 0.5GB de storage gratuito
- Cada push no GitHub faz deploy automático
- Logs estão disponíveis no painel do Vercel

---

## 🆘 Problemas Comuns

**Erro de conexão com banco:**
- Verifique se a `DATABASE_URL` está correta no Vercel
- Certifique-se que o banco Neon está ativo

**Build falha:**
- Verifique os logs no Vercel
- Certifique-se que `prisma generate` rodou

**Não consegue fazer login:**
- Execute o seed: `npm run db:seed`
- Verifique se o usuário foi criado no banco
