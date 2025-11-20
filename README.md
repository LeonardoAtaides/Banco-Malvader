# 🏦 Banco Malvader

Sistema bancário completo desenvolvido com arquitetura moderna, focado em segurança e escalabilidade. O projeto simula operações reais de um banco digital, incluindo áreas distintas para clientes e funcionários, gestão de contas e transações financeiras.

##  Índice

- [Descrição](#-descrição)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)

##  Descrição

O **Banco Malvader** é uma aplicação web Fullstack que utiliza o poder do **Next.js 14 (App Router)** integrado ao **MySQL** via **Prisma ORM**. O sistema gerencia autenticação segura via JWT, múltiplos tipos de contas bancárias (Corrente, Poupança, Investimento) e hierarquia de usuários.

## Observações

O **Banco Malvader** foi desenvolvido com foco em dispositivos móveis. Para garantir a melhor experiência ao utilizar o sistema, recomendamos acessar através de um simulador de smartphone, seja Android ou iPhone.

Uma boa opção é utilizar a extensão do Chrome que simula telas mobile:  
[Mobile Simulator Responsivo](https://chromewebstore.google.com/detail/mobile-simulator-responsi/ckejmhbmlajgoklhgbapkiccekfoccmk?hl=pt)

##  Tecnologias Utilizadas

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS (se aplicável)
- **Backend:** Next.js API Routes (Serverless)
- **Banco de Dados:** MySQL 8.0+
- **ORM:** Prisma Client
- **Autenticação:** JWT (JSON Web Tokens) & Bcrypt
- **Gerenciamento de Pacotes:** NPM

##  Funcionalidades

###  Área do Cliente
- **Operações Financeiras:** Depósitos, Saques e Transferências entre contas.
- **Consultas:** Visualização de Saldo, Extrato detalhado e Limite disponível.
- **Gestão:** Edição de perfil e dados cadastrais.

###  Área do Funcionário
- **Gestão de Contas:** Abertura e encerramento de contas (Corrente, Poupança, Investimento).
- **Administrativo:** Alteração de limites de crédito e cadastro de novos funcionários.
- **Relatórios:** Geração de relatórios de movimentações, inadimplência e desempenho.

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [MySQL](https://www.mysql.com/) (v8.0 ou superior)
- [MySQL Workbench](https://www.mysql.com/products/workbench/) (para gerenciamento visual do banco)
- Git

##  Instalação e Configuração

### 1. Clone o repositório
```bash
git clone [https://github.com/seu-usuario/Banco-Malvader.git](https://github.com/seu-usuario/Banco-Malvader.git)
cd Banco-Malvader
2. Instale as dependências
Bash

npm install
3. Configuração de Ambiente (.env)
Crie um arquivo .env na raiz do projeto e configure as variáveis abaixo.

Nota: A JWT_SECRET é a chave privada para assinar os tokens de sessão. Em produção, use uma string longa e aleatória.

Snippet de código

# Conexão com o Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco_malvader"

# Segurança
JWT_SECRET="sua-chave-secreta-aqui-123"

# Ambiente
NODE_ENV="development"
4. Configuração do Banco de Dados (Via Workbench)
Para facilitar a configuração, o script do banco está incluído no projeto.

Abra o MySQL Workbench.

Conecte-se ao seu servidor local.

Vá em File > Open SQL Script e selecione o arquivo de banco de dados (ex: database/schema.sql ou o .txt fornecido).

Execute todo o script (ícone de raio ⚡) para criar o Schema e as Tabelas.

5. Sincronizar Prisma
Após criar o banco no Workbench, sincronize o ORM do projeto:

Bash

# Puxa a estrutura do banco para o schema do Prisma
npx prisma db pull

# Gera o cliente TypeScript do Prisma
npx prisma generate
6. Executar o Projeto
Bash

npm run dev
O sistema estará acessível em: http://localhost:3000