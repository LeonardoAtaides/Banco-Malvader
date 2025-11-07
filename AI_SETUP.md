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

**Para PCs com pouca RAM (4-8GB):**
```powershell
ollama pull tinyllama
```
> ⏱️ **Aguarde 1-2 minutos** - Download de ~637MB

**Para PCs com mais RAM (8GB+):**
```powershell
ollama pull llama3.2:1b
```
> ⏱️ **Aguarde 2-3 minutos** - Download de ~1.3GB (melhor qualidade)

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

**Causa**: Pouca RAM disponível

**Solução 1 - Usar modelo mais leve (RECOMENDADO):**
```powershell
ollama pull tinyllama
```

Depois altere em `.env`:
```
OLLAMA_MODEL="tinyllama"
```

Reinicie o servidor Next.js.

**Solução 2 - Forçar modo CPU-only:**
```powershell
# Feche o Ollama atual (ícone da bandeja)
Stop-Process -Name ollama -Force -ErrorAction SilentlyContinue

# Configurar CPU-only permanentemente:
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '0', 'User')

# Reiniciar Ollama
Start-Process "ollama"
```

**Solução 3 - Liberar memória:**
1. Feche Chrome/Edge e outros programas pesados
2. Reinicie o computador
3. Tente novamente

---

### 🐌 Chat muito lento

**Normal!** Primeira mensagem demora 10-30 segundos (modelo carregando na memória).

Próximas mensagens: 3-5 segundos.

---

## 📊 Comparação de Modelos

| Modelo | Tamanho | RAM Necessária | Qualidade | Recomendado Para |
|--------|---------|----------------|-----------|------------------|
| `tinyllama` | 637MB | 1-1.5GB | ⭐⭐⭐ Razoável | PCs com 4-6GB RAM |
| `llama3.2:1b` | 1.3GB | 2-3GB | ⭐⭐⭐⭐ Boa | PCs com 8GB+ RAM |
| `phi3:mini` | 2.2GB | 3-4GB | ⭐⭐⭐⭐⭐ Excelente | PCs com 16GB+ RAM |

**Para trocar de modelo:**
```powershell
# Remover modelo atual
ollama rm tinyllama

# Instalar novo modelo
ollama pull llama3.2:1b

# Atualizar .env
# OLLAMA_MODEL="llama3.2:1b"
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
