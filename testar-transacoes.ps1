# 🧪 Script de Teste das APIs de Transação
# Execute: .\testar-transacoes.ps1

Write-Host "🏦 BANCO MALVADER - Teste de Transações" -ForegroundColor Cyan
Write-Host "=" * 50

# Configurações
$baseUrl = "http://localhost:3000"
$token = "SEU_TOKEN_AQUI"  # ⚠️ SUBSTITUA PELO TOKEN REAL APÓS LOGIN

# Verificar se o token foi configurado
if ($token -eq "SEU_TOKEN_AQUI") {
    Write-Host "⚠️  ATENÇÃO: Configure o token primeiro!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Faça login para obter o token:" -ForegroundColor White
    Write-Host '   $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth" -Method POST -Body ''{"cpf":"12345678901","senha":"sua_senha"}'' -ContentType "application/json"' -ForegroundColor Gray
    Write-Host '   $token = $login.token' -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Edite este arquivo e substitua SEU_TOKEN_AQUI pelo token" -ForegroundColor White
    Write-Host ""
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "📝 Digite o número da conta para teste:" -ForegroundColor Yellow
$numeroConta = Read-Host "Número da conta"

if ([string]::IsNullOrWhiteSpace($numeroConta)) {
    Write-Host "❌ Número da conta não pode ser vazio!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=" * 50
Write-Host ""

# Menu de testes
function Show-Menu {
    Write-Host "Escolha um teste:" -ForegroundColor Cyan
    Write-Host "1. 💰 Depósito"
    Write-Host "2. 💸 Saque"
    Write-Host "3. 🔄 Transferência"
    Write-Host "4. 📊 Extrato"
    Write-Host "5. 🧪 Teste Completo (Depósito + Saque + Transferência + Extrato)"
    Write-Host "0. ❌ Sair"
    Write-Host ""
}

function Test-Deposito {
    Write-Host "💰 TESTE DE DEPÓSITO" -ForegroundColor Green
    Write-Host "-" * 50
    
    $valor = Read-Host "Valor do depósito (ex: 500.00)"
    
    $body = @{
        numero_conta = $numeroConta
        valor = [decimal]$valor
        descricao = "Teste de depósito via script"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/transacao/deposito" -Method POST -Headers $headers -Body $body
        
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host "Saldo anterior: R$ $($response.dados.saldo_anterior)" -ForegroundColor White
        Write-Host "Valor depositado: R$ $($response.dados.valor_depositado)" -ForegroundColor Yellow
        Write-Host "Saldo atual: R$ $($response.dados.saldo_atual)" -ForegroundColor Green
        Write-Host "ID Transação: $($response.dados.id_transacao)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $_.Exception.Response | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
    
    Write-Host ""
}

function Test-Saque {
    Write-Host "💸 TESTE DE SAQUE" -ForegroundColor Yellow
    Write-Host "-" * 50
    
    $valor = Read-Host "Valor do saque (ex: 200.00)"
    
    $body = @{
        numero_conta = $numeroConta
        valor = [decimal]$valor
        descricao = "Teste de saque via script"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/transacao/saque" -Method POST -Headers $headers -Body $body
        
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host "Saldo anterior: R$ $($response.dados.saldo_anterior)" -ForegroundColor White
        Write-Host "Valor sacado: R$ $($response.dados.valor_sacado)" -ForegroundColor Yellow
        Write-Host "Saldo atual: R$ $($response.dados.saldo_atual)" -ForegroundColor Green
        Write-Host "ID Transação: $($response.dados.id_transacao)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Test-Transferencia {
    Write-Host "🔄 TESTE DE TRANSFERÊNCIA" -ForegroundColor Cyan
    Write-Host "-" * 50
    
    $contaDestino = Read-Host "Número da conta DESTINO"
    $valor = Read-Host "Valor da transferência (ex: 100.00)"
    
    $body = @{
        numero_conta_origem = $numeroConta
        numero_conta_destino = $contaDestino
        valor = [decimal]$valor
        descricao = "Teste de transferência via script"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/transacao/transferencia" -Method POST -Headers $headers -Body $body
        
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "ORIGEM ($($response.dados.origem.numero_conta)):" -ForegroundColor White
        Write-Host "  Saldo anterior: R$ $($response.dados.origem.saldo_anterior)" -ForegroundColor Gray
        Write-Host "  Saldo atual: R$ $($response.dados.origem.saldo_atual)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "DESTINO ($($response.dados.destino.numero_conta)):" -ForegroundColor White
        Write-Host "  Saldo anterior: R$ $($response.dados.destino.saldo_anterior)" -ForegroundColor Gray
        Write-Host "  Saldo atual: R$ $($response.dados.destino.saldo_atual)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Valor transferido: R$ $($response.dados.valor_transferido)" -ForegroundColor Cyan
        Write-Host "ID Transação: $($response.dados.id_transacao)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Test-Extrato {
    Write-Host "📊 TESTE DE EXTRATO" -ForegroundColor Magenta
    Write-Host "-" * 50
    
    $limite = Read-Host "Limite de transações (padrão: 10)"
    if ([string]::IsNullOrWhiteSpace($limite)) { $limite = 10 }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/transacao/extrato?numero_conta=$numeroConta&limite=$limite" -Method GET -Headers $headers
        
        Write-Host "✅ EXTRATO OBTIDO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "CONTA: $($response.conta.numero_conta) ($($response.conta.tipo_conta))" -ForegroundColor White
        Write-Host "Saldo Atual: R$ $($response.conta.saldo_atual)" -ForegroundColor Green
        Write-Host "Status: $($response.conta.status)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "TRANSAÇÕES (Total: $($response.paginacao.total_transacoes)):" -ForegroundColor Cyan
        Write-Host "-" * 50
        
        foreach ($t in $response.extrato) {
            $cor = if ($t.operacao -eq "CRÉDITO") { "Green" } else { "Yellow" }
            Write-Host "[$($t.tipo)] $($t.data_hora)" -ForegroundColor Gray
            Write-Host "  Operação: $($t.operacao) | Valor: R$ $($t.valor)" -ForegroundColor $cor
            Write-Host "  Descrição: $($t.descricao)" -ForegroundColor White
            if ($t.conta_origem) { Write-Host "  Origem: $($t.conta_origem)" -ForegroundColor DarkGray }
            if ($t.conta_destino) { Write-Host "  Destino: $($t.conta_destino)" -ForegroundColor DarkGray }
            Write-Host ""
        }
    } catch {
        Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Test-Completo {
    Write-Host "🧪 TESTE COMPLETO" -ForegroundColor Magenta
    Write-Host "-" * 50
    Write-Host ""
    
    Write-Host "1️⃣ Depositando R$ 1000.00..." -ForegroundColor Cyan
    $body1 = @{ numero_conta = $numeroConta; valor = 1000.00; descricao = "Teste completo - Depósito" } | ConvertTo-Json
    try {
        $dep = Invoke-RestMethod -Uri "$baseUrl/api/transacao/deposito" -Method POST -Headers $headers -Body $body1
        Write-Host "   ✅ Depósito OK! Saldo: R$ $($dep.dados.saldo_atual)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    Start-Sleep -Seconds 1
    
    Write-Host ""
    Write-Host "2️⃣ Sacando R$ 200.00..." -ForegroundColor Cyan
    $body2 = @{ numero_conta = $numeroConta; valor = 200.00; descricao = "Teste completo - Saque" } | ConvertTo-Json
    try {
        $saq = Invoke-RestMethod -Uri "$baseUrl/api/transacao/saque" -Method POST -Headers $headers -Body $body2
        Write-Host "   ✅ Saque OK! Saldo: R$ $($saq.dados.saldo_atual)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    Start-Sleep -Seconds 1
    
    Write-Host ""
    Write-Host "3️⃣ Consultando extrato..." -ForegroundColor Cyan
    try {
        $ext = Invoke-RestMethod -Uri "$baseUrl/api/transacao/extrato?numero_conta=$numeroConta&limite=5" -Method GET -Headers $headers
        Write-Host "   ✅ Extrato OK! Total de transações: $($ext.paginacao.total_transacoes)" -ForegroundColor Green
        Write-Host "   📊 Saldo final: R$ $($ext.conta.saldo_atual)" -ForegroundColor Yellow
    } catch {
        Write-Host "   ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎉 TESTE COMPLETO FINALIZADO!" -ForegroundColor Green
    Write-Host ""
}

# Loop do menu
do {
    Show-Menu
    $opcao = Read-Host "Opção"
    Write-Host ""
    
    switch ($opcao) {
        "1" { Test-Deposito }
        "2" { Test-Saque }
        "3" { Test-Transferencia }
        "4" { Test-Extrato }
        "5" { Test-Completo }
        "0" { 
            Write-Host "👋 Até logo!" -ForegroundColor Cyan
            break 
        }
        default { Write-Host "⚠️ Opção inválida!" -ForegroundColor Red }
    }
    
} while ($opcao -ne "0")
