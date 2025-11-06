# 🤖 Chat IA - Banco Malvader

Assistente virtual inteligente que responde dúvidas dos clientes **100% localmente** (sem enviar dados para fora).

---

## 🚀 Instalação Rápida (5 minutos)

### 1️⃣ Instalar Ollama

Abra o PowerShell e execute:

```powershell
winget install Ollama.Ollama
```

### 2️⃣ Baixar o Modelo de IA

```powershell
ollama pull llama3.2:1b
```

> ⏱️ **Aguarde 2-3 minutos** - Download de ~1GB

### 3️⃣ Configurar Banco de Dados

```powershell
npx prisma migrate dev
npx prisma generate
```

### 4️⃣ Pronto! Testar

```powershell
npm run dev
```

Acesse: http://localhost:3000/Cliente/Menu e clique no botão 💬 no canto inferior direito.

---

## ❓ Problemas Comuns

### ⚠️ Erro: "Model requires more system memory"

**Causa**: Pouca RAM disponível (modelo precisa de ~4GB)

**Solução**:
1. Feche Chrome/Edge e outros programas pesados
2. Reinicie o computador
3. Tente novamente

Se ainda der erro, force uso de CPU apenas:
```powershell
# Feche o Ollama atual (ícone da bandeja)
# Abra PowerShell como Administrador:
$env:OLLAMA_NUM_GPU = "0"
ollama serve
```

---

### 🐌 Chat muito lento

**Normal!** Primeira mensagem demora 10-30 segundos (modelo carregando na memória).

Próximas mensagens: 3-5 segundos.

**Dica**: Use modelo maior se tiver 8GB+ RAM:
```powershell
ollama pull qwen2.5:3b
```

Depois altere em `.env`:
```
OLLAMA_MODEL="qwen2.5:3b"
```

---

## 🔐 Funcionalidades

✅ **Privacidade**: Roda 100% local (nada enviado para internet)  
✅ **Segurança**: Detecta e bloqueia dados sensíveis (CPF, senhas)  
✅ **Histórico**: Conversas salvas no banco de dados  
✅ **Grátis**: Sem API keys, sem custos

---

## 📊 Modelos Disponíveis

| Modelo | RAM Necessária | Velocidade | Qualidade | Instalar |
|--------|----------------|------------|-----------|----------|
| **llama3.2:1b** | 4GB | Rápido | ⭐⭐ | `ollama pull llama3.2:1b` |
| qwen2.5:3b | 8GB | Médio | ⭐⭐⭐⭐ | `ollama pull qwen2.5:3b` |
| mistral:7b | 16GB | Lento | ⭐⭐⭐⭐⭐ | `ollama pull mistral:7b` |

> 💡 **Padrão**: llama3.2:1b (funciona em qualquer PC básico)

---

## �️ Como Funciona (Técnico)

```
Usuário digita mensagem
    ↓
src/components/ai-chat.tsx (Frontend)
    ↓
POST /api/ai/chat (Backend)
    ↓
src/lib/ai/client.ts (Wrapper Ollama)
    ↓
Ollama Local (http://localhost:11434)
    ↓
Resposta da IA
    ↓
Salvo no banco (prisma: chat_session/chat_message)
```

**Arquivos principais**:
- `src/components/ai-chat.tsx` - Interface do chat
- `src/app/api/ai/chat/route.ts` - API endpoint
- `src/lib/ai/client.ts` - Cliente Ollama
- `prisma/schema.prisma` - Tabelas: chat_session, chat_message

---

## 📝 Uso no Código

```tsx
import AIChat from "@/components/ai-chat";

// Em qualquer página:
const [showChat, setShowChat] = useState(false);
const token = "seu-jwt-token"; // Pegar do login

return (
  <>
    <button onClick={() => setShowChat(true)}>💬 Assistente</button>
    {showChat && <AIChat token={token} onClose={() => setShowChat(false)} />}
  </>
);
```

---

## � Atualizar Modelo

```powershell
# Ver modelos instalados
ollama list

# Remover modelo antigo
ollama rm llama3.2:3b

# Instalar modelo novo
ollama pull qwen2.5:3b
```

Depois altere `.env`:
```
OLLAMA_MODEL="qwen2.5:3b"
```

---

## ⚙️ Configurações Avançadas (Opcional)

Edite `.env`:

```bash
# URL do Ollama (padrão: localhost)
OLLAMA_BASE_URL="http://localhost:11434"

# Modelo a usar
OLLAMA_MODEL="llama3.2:1b"
```

Para limitar uso de memória, edite `src/lib/ai/client.ts`:

```typescript
options: {
  num_ctx: 2048,      // Contexto (menor = menos RAM)
  num_predict: 256,   // Máx tokens resposta
  temperature: 0.7,   // Criatividade (0-1)
}
```

---

## 📞 Suporte

- **Erro de instalação**: Verifique se tem 4GB+ RAM livre
- **Ollama não inicia**: Reinicie o PC (instala como serviço Windows)
- **Chat não aparece**: Verifique se está logado como cliente

---

**Licença**: Mesma do projeto principal
