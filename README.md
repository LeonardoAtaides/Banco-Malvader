#  Banco Malvader
Lobo tirou a capa
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
   npx prisma db pull
   npx prisma generate
   ```