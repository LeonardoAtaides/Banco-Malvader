# 🏦 Banco Malvader

Sistema bancário completo com chat IA integrado.

---

## 🚀 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Edite .env com suas credenciais MySQL:
# DATABASE_URL="mysql://root:senha@localhost:3306/banco_malvader"

# 3. Criar banco de dados (escolha UMA opção):

# OPÇÃO A: Usar SQL direto (recomendado se já tem o schema.sql)
mysql -u root -p < database/schema.sql

# OPÇÃO B: Usar Prisma migrations
npx prisma migrate deploy
npx prisma generate

# 4. Instalar Ollama (Chat IA - opcional)
winget install Ollama.Ollama
ollama pull llama3.2:1b

# 5. Rodar projeto
npm run dev
```

Acesse: http://localhost:3000

---

## 📋 Comandos Úteis

```bash
# Banco de dados
mysql -u root -p banco_malvader   # Acessar MySQL
npx prisma db pull                # Atualizar schema.prisma com mudanças do MySQL
npx prisma generate               # Gerar Prisma Client
npx prisma studio                 # Visualizar dados (GUI)

# Desenvolvimento
npm run dev                  # Servidor desenvolvimento
npm run build               # Build produção
npm start                   # Rodar produção

# Chat IA
ollama list                 # Ver modelos instalados
ollama pull [modelo]        # Baixar modelo
```

---

## 💾 Estrutura do Banco

O banco está usando **SQL nativo** com:
- ✅ Triggers automáticos (saldo, validações)
- ✅ Procedures (alterar senha, calcular score)
- ✅ Functions (gerar número conta, Luhn check)
- ✅ Views (resumo contas, movimentações)

**Arquivo**: `database/schema.sql` (contém tudo)  
**ORM**: Prisma (apenas para queries, não para migrations)

---

## 🗂️ Estrutura

```
├── prisma/
│   ├── schema.prisma       # Definição banco de dados
│   └── migrations/         # Histórico de mudanças
├── src/
│   ├── app/               # Páginas e rotas Next.js
│   │   ├── api/          # API endpoints
│   │   ├── Cliente/      # Área do cliente
│   │   └── Funcionario/  # Área do funcionário
│   ├── components/        # Componentes React
│   │   ├── ai-chat.tsx   # Chat IA
│   │   └── navbar.tsx    # Navegação
│   └── lib/              # Utilitários
│       ├── auth.ts       # Autenticação JWT
│       ├── prisma.ts     # Cliente Prisma
│       └── ai/           # Cliente Ollama
└── public/               # Arquivos estáticos
```

---

## 🤖 Chat IA

Ver instruções completas em: **[AI_SETUP.md](./AI_SETUP.md)**

**Requisitos**: 4GB RAM livre  
**Modelo padrão**: llama3.2:1b (local, grátis)

---

## 🔧 Troubleshooting

**Erro: "Table doesn't exist"**
```bash
# Recrie o banco:
mysql -u root -p < database/schema.sql
# Depois atualize o Prisma:
npx prisma db pull
npx prisma generate
```

**Erro: "Database is not in sync"**
```bash
# Se mudou algo no MySQL, puxe as mudanças:
npx prisma db pull
npx prisma generate
```

**Erro: "Model requires more memory" (Chat IA)**
```bash
# Feche programas pesados e tente novamente
# Ou force CPU-only:
$env:OLLAMA_NUM_GPU = "0"
ollama serve
```

**Porta 3000 em uso**
```bash
PORT=3001 npm run dev
```

**Erro: "Cannot find module @prisma/client"**
```bash
npx prisma generate
```
```bash
PORT=3001 npm run dev
```

---

## 📝 Licença

