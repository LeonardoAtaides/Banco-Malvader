#  Banco Malvader

Sistema bancário completo desenvolvido com Next.js e MySQL.

---

##  Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
# Crie o .env com suas credenciais MySQL:
DATABASE_URL="mysql://root:senha@localhost:3306/banco_malvader"

# 3. Criar banco de dados

Crie o banco de dados SQL no local correto que suas credenciais do .env indicam

Logo após:
npx prisma db pull                # Sincronizar schema
npx prisma generate               # Gerar client

# 4. Rodar projeto
npm run dev
```

Acesse: http://localhost:3000

---

##  Comandos Úteis

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
```

---

##  Estrutura do Banco

O banco está usando **SQL nativo** com:
- ✅ Triggers automáticos (saldo, validações)
- ✅ Procedures (alterar senha, calcular score)
- ✅ Functions (gerar número conta, Luhn check)
- ✅ Views (resumo contas, movimentações)

**Arquivo**: `database/schema.sql` (contém tudo)  
**ORM**: Prisma (apenas para queries, não para migrations)

---

##  Estrutura

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
│   │   └── navbar.tsx    # Navegação
│   └── lib/              # Utilitários
│       ├── auth.ts       # Autenticação JWT
│       └── prisma.ts     # Cliente Prisma
└── public/               # Arquivos estáticos
```


---

##  Troubleshooting

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

**Erro: "Cannot find module @prisma/client"**
```bash
npx prisma generate
```

**Porta 3000 em uso**
```bash
PORT=3001 npm run dev
```

---

##  Licença

