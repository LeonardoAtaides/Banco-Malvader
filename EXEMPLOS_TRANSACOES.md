#  Exemplos de Uso das APIs de Transação

## Índice
1. [Depósito](#-1-depósito)
2. [Saque](#-2-saque)
3. [Transferência](#-3-transferência)
4. [Extrato](#-4-extrato)

---

## 1. DEPÓSITO

### Exemplo de Sucesso

```bash
# PowerShell
$body = @{
    numero_conta = "12345678901234567890"
    valor = 500.00
    descricao = "Depósito inicial"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/deposito" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer SEU_TOKEN_AQUI"; "Content-Type" = "application/json" } `
    -Body $body
```

```javascript
// JavaScript (fetch)
const response = await fetch('http://localhost:3000/api/transacao/deposito', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    numero_conta: "12345678901234567890",
    valor: 500.00,
    descricao: "Depósito inicial"
  })
});

const data = await response.json();
console.log(data);
```

### Resposta Esperada

```json
{
  "sucesso": true,
  "mensagem": "Depósito realizado com sucesso",
  "dados": {
    "numero_conta": "12345678901234567890",
    "saldo_anterior": 1000.00,
    "valor_depositado": 500.00,
    "saldo_atual": 1500.00,
    "id_transacao": 123,
    "data_hora": "2025-11-12T10:30:00.000Z"
  }
}
```

### Erros Possíveis

```json
// Conta não encontrada
{
  "error": "Conta 99999999999999999999 não encontrada"
}

// Conta inativa
{
  "error": "Conta 12345678901234567890 está encerrada. Não é possível realizar depósitos."
}

// Valor inválido
{
  "error": "Dados inválidos",
  "detalhes": [
    {
      "path": ["valor"],
      "message": "Valor deve ser maior que zero"
    }
  ]
}
```

---

## 2. SAQUE

### Exemplo de Sucesso

```bash
# PowerShell
$body = @{
    numero_conta = "12345678901234567890"
    valor = 200.00
    descricao = "Saque no caixa eletrônico"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/saque" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer SEU_TOKEN_AQUI"; "Content-Type" = "application/json" } `
    -Body $body
```

```javascript
// JavaScript (fetch)
const response = await fetch('http://localhost:3000/api/transacao/saque', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    numero_conta: "12345678901234567890",
    valor: 200.00,
    descricao: "Saque no caixa eletrônico"
  })
});

const data = await response.json();
console.log(data);
```

### Resposta Esperada

```json
{
  "sucesso": true,
  "mensagem": "Saque realizado com sucesso",
  "dados": {
    "numero_conta": "12345678901234567890",
    "saldo_anterior": 1500.00,
    "valor_sacado": 200.00,
    "saldo_atual": 1300.00,
    "id_transacao": 124,
    "data_hora": "2025-11-12T11:00:00.000Z"
  }
}
```

### Erros Possíveis

```json
// Saldo insuficiente (conta poupança/investimento)
{
  "error": "Saldo insuficiente. Disponível: R$ 100.00 (Saldo: R$ 100.00)"
}

// Saldo insuficiente (conta corrente com limite)
{
  "error": "Saldo insuficiente. Disponível: R$ 1500.00 (Saldo: R$ 500.00 + Limite: R$ 1000.00)"
}

// Conta bloqueada
{
  "error": "Conta 12345678901234567890 está bloqueada. Não é possível realizar saques."
}
```

---

## 3. TRANSFERÊNCIA

### Exemplo de Sucesso

```bash
# PowerShell
$body = @{
    numero_conta_origem = "12345678901234567890"
    numero_conta_destino = "09876543210987654321"
    valor = 300.00
    descricao = "Pagamento aluguel"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/transferencia" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer SEU_TOKEN_AQUI"; "Content-Type" = "application/json" } `
    -Body $body
```

```javascript
// JavaScript (fetch)
const response = await fetch('http://localhost:3000/api/transacao/transferencia', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    numero_conta_origem: "12345678901234567890",
    numero_conta_destino: "09876543210987654321",
    valor: 300.00,
    descricao: "Pagamento aluguel"
  })
});

const data = await response.json();
console.log(data);
```

### Resposta Esperada

```json
{
  "sucesso": true,
  "mensagem": "Transferência realizada com sucesso",
  "dados": {
    "origem": {
      "numero_conta": "12345678901234567890",
      "saldo_anterior": 1300.00,
      "saldo_atual": 1000.00
    },
    "destino": {
      "numero_conta": "09876543210987654321",
      "saldo_anterior": 500.00,
      "saldo_atual": 800.00
    },
    "valor_transferido": 300.00,
    "id_transacao": 125,
    "data_hora": "2025-11-12T11:30:00.000Z"
  }
}
```

### Erros Possíveis

```json
// Contas iguais
{
  "error": "Dados inválidos",
  "detalhes": [
    {
      "path": ["numero_conta_destino"],
      "message": "Conta de origem e destino não podem ser iguais"
    }
  ]
}

// Conta destino não encontrada
{
  "error": "Conta de destino 99999999999999999999 não encontrada"
}

// Saldo insuficiente
{
  "error": "Saldo insuficiente na conta de origem. Disponível: R$ 100.00 (Saldo: R$ 100.00)"
}
```

---

## 4. EXTRATO

### Exemplo Básico

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/extrato?numero_conta=12345678901234567890" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer SEU_TOKEN_AQUI" }
```

```javascript
// JavaScript (fetch)
const response = await fetch(
  'http://localhost:3000/api/transacao/extrato?numero_conta=12345678901234567890',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_AQUI'
    }
  }
);

const data = await response.json();
console.log(data);
```

### Exemplos com Filtros

```bash
# Com paginação
Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/extrato?numero_conta=12345678901234567890&limite=10&pagina=2"

# Filtrar por tipo
Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/extrato?numero_conta=12345678901234567890&tipo_transacao=DEPOSITO"

# Filtros combinados
Invoke-RestMethod -Uri "http://localhost:3000/api/transacao/extrato?numero_conta=12345678901234567890&tipo_transacao=TRANSFERENCIA&limite=20&pagina=1"
```

### Resposta Esperada

```json
{
  "sucesso": true,
  "conta": {
    "numero_conta": "12345678901234567890",
    "tipo_conta": "CORRENTE",
    "saldo_atual": 1000.00,
    "status": "ATIVA"
  },
  "extrato": [
    {
      "id": 125,
      "tipo": "TRANSFERENCIA",
      "data_hora": "2025-11-12T11:30:00.000Z",
      "valor": 300.00,
      "descricao": "Pagamento aluguel",
      "operacao": "DÉBITO",
      "conta_origem": "12345678901234567890",
      "conta_destino": "09876543210987654321"
    },
    {
      "id": 124,
      "tipo": "SAQUE",
      "data_hora": "2025-11-12T11:00:00.000Z",
      "valor": 200.00,
      "descricao": "Saque no caixa eletrônico",
      "operacao": "DÉBITO",
      "conta_origem": "12345678901234567890",
      "conta_destino": null
    },
    {
      "id": 123,
      "tipo": "DEPOSITO",
      "data_hora": "2025-11-12T10:30:00.000Z",
      "valor": 500.00,
      "descricao": "Depósito inicial",
      "operacao": "CRÉDITO",
      "conta_origem": null,
      "conta_destino": "12345678901234567890"
    }
  ],
  "paginacao": {
    "pagina_atual": 1,
    "limite_por_pagina": 50,
    "total_transacoes": 3,
    "total_paginas": 1
  }
}
```

### Parâmetros da URL

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|---------|-----------|
| `numero_conta` | string | Sim | - | Número da conta |
| `limite` | number | Não | 50 | Itens por página (máx: 100) |
| `pagina` | number | Não | 1 | Número da página |
| `tipo_transacao` | enum | Não | - | DEPOSITO, SAQUE, TRANSFERENCIA, TAXA, RENDIMENTO |

### Erros Possíveis

```json
// Conta não encontrada
{
  "error": "Conta 99999999999999999999 não encontrada"
}

// Parâmetros inválidos
{
  "error": "Parâmetros inválidos",
  "detalhes": [
    {
      "path": ["limite"],
      "message": "Number must be less than or equal to 100"
    }
  ]
}
```

---

## Como Obter o Token

O token JWT é retornado ao fazer login. Exemplo:

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cpf: "12345678901",
    senha: "sua_senha"
  })
});

const { token } = await loginResponse.json();
// Use este token nas requisições: Authorization: Bearer {token}
```

---

## Testando no Postman/Insomnia

1. **Criar Collection**: `Banco Malvader - Transações`
2. **Adicionar variável**: `{{token}}` e `{{base_url}}`
3. **Configurar headers globais**:
   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```

---

## Cenários de Teste Recomendados

### Casos de Sucesso
- [ ] Depósito em conta ativa
- [ ] Saque com saldo suficiente
- [ ] Transferência entre contas ativas
- [ ] Extrato com e sem filtros

### Casos de Erro
- [ ] Depósito em conta encerrada
- [ ] Saque com saldo insuficiente
- [ ] Transferência para mesma conta
- [ ] Extrato de conta inexistente

### Segurança
- [ ] Requisição sem token
- [ ] Token inválido
- [ ] Valores negativos
- [ ] Campos obrigatórios faltando

---

## Dicas

1. **Sempre valide o token primeiro** - Teste com token inválido para ver o erro
2. **Use valores decimais corretamente** - `500.00` não `500`
3. **Contas correntes têm limite** - Saldo disponível = saldo + limite
4. **Extrato mostra DÉBITO/CRÉDITO** - Facilita entender o fluxo de dinheiro
5. **Paginação evita sobrecarga** - Máximo 100 itens por página

---

**Pronto para testar!** 🚀 Qualquer dúvida, verifique os logs do servidor (`npm run dev`).
