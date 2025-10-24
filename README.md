#  Banco Malvader
Acho lindo esse momento
### Manual

1. **Configure o Backend**:
   ```bash
   cd backend
   npm install
   # Configure o arquivo .env com suas credenciais MySQL
   npm run dev
   ```

2. **Configure o Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Banco de dados**:
   ```bash
   cd backend
   npx prisma db pull
   npx prisma generate
   ```

 4. **Explicação breve do que tem no back**:
 Conexão com BD e Prisma:
Configuração do cliente/DB em config.database.
Esquema do Prisma em schema.prisma.
Dependências em package.json.
Autenticação:
Controlador de autenticação: authController.login / authController.
Serviço de autenticação: services.authService.
Middleware de proteção de rota: middleware.auth.
Rotas principais:
Ponto de agregação das rotas: routes.index.
Rotas específicas: agencias.ts, auth.ts, clientes.ts, contas.ts, funcionarios.ts, dashboard.ts, relatorios.ts, transacoes.ts, usuarios.ts.
Lógica de negócio e validações:
Serviço de contas: services.contaService.
Utilitários e validadores: auth.ts, validators.ts.
Tratamento de erros:
Middleware de erro: middleware.errorHandler.
Tipos compartilhados em index.ts e banco.ts.