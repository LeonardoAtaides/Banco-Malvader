"use client";

import React, { useState } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Confirmacaof from "@/components/confirmacao";

export default function AberturaConta() {
  const router = useRouter();
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estados para campos dinâmicos
  const [taxaManutencao, setTaxaManutencao] = useState("");
  const [limite, setLimite] = useState("");
  const [taxaRendimento, setTaxaRendimento] = useState("");
  const [valorMinimo, setValorMinimo] = useState("");
  const [perfilRisco, setPerfilRisco] = useState("MEDIO");

  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    tipoConta: "Conta Corrente (CC)",
    vencimento: "Dia 5",
    endereco: "",
  });

  // Função para formatar valores monetários
  const formatarMoeda = (valor: string): string => {
    let value = valor.replace(/\D/g, "");
    
    if (value === "") return "";
    
    const number = Number(value) / 100;
    
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para lidar com mudanças em campos monetários
  const handleMoedaChange = (valor: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const formatado = formatarMoeda(valor);
    setter(formatado);
  };

  // Função para abrir conta - VERSÃO OTIMIZADA
  const abrirConta = async () => {
    setCarregando(true);
    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
        return;
      }

      // Preparar dados para API baseados no tipo de conta
      const dadosBase = {
        nome: formData.nome.trim(),
        data_nascimento: formData.nascimento,
        cpf: CPF.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        endereco: formData.endereco.trim(),
        tipoConta: formData.tipoConta,
        vencimento: formData.vencimento,
      };

      // Adicionar campos específicos por tipo de conta - CORRIGIDO
      let dadosEspecificos: any = {};
      
      switch (formData.tipoConta) {
        case "Conta Corrente (CC)":
          dadosEspecificos = {
            taxa: taxaManutencao || "R$ 25,00",
            limite: limite || "R$ 1.000,00"
          };
          break;
        
        case "Conta Poupança (CP)":
          dadosEspecificos = {
            taxaRendimento: taxaRendimento || "0.05"
          };
          break;
        
        case "Conta Investimento (CI)":
          dadosEspecificos = {
            valorMinimo: valorMinimo || "R$ 100,00",
            taxaRendimento: taxaRendimento || "0.08", // CORREÇÃO: usa taxaRendimento em vez de taxaRendimentoBase
            perfilRisco: perfilRisco
          };
          break;
      }

      const dadosParaAPI = { ...dadosBase, ...dadosEspecificos };

      // Validações finais
      const cpfLimpo = CPF.replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        alert('CPF inválido. Deve conter 11 dígitos.');
        setCarregando(false);
        return;
      }

      console.log('📤 Enviando dados para API:', dadosParaAPI);

      const response = await fetch('/api/funcionario/abrirconta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaAPI)
      });

      const resultado = await response.json();
      console.log('📥 Resposta da API:', resultado);

      if (response.ok) {
        console.log('✅ Conta aberta com sucesso:', resultado);
        setConfirmacaoAberta(true);
      } else {
        console.error('❌ Erro na API:', resultado);
        
        // Tratamento específico de erros
        if (response.status === 409) {
          alert("CPF já cadastrado no sistema. Verifique os dados.");
        } else if (response.status === 401) {
          alert("Sessão expirada. Faça login novamente.");
          router.push('/login');
        } else if (response.status === 400) {
          alert(resultado.error || "Dados inválidos. Verifique os campos.");
        } else if (response.status === 404) {
          alert("Agência não encontrada. Contate o administrador.");
        } else {
          alert(resultado.error || resultado.details || 'Erro interno ao abrir conta');
        }
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenSelect(null);
    
    // Resetar campos específicos quando mudar o tipo de conta
    if (name === "tipoConta") {
      setTaxaManutencao("");
      setLimite("");
      setTaxaRendimento("");
      setValorMinimo("");
      setPerfilRisco("MEDIO");
    }
  };

  const handleConfirmar = () => {
    // Validações básicas
    if (
      !formData.nome.trim() ||
      !formData.nascimento ||
      !formData.tipoConta.trim() ||
      !CPF.trim() ||
      !telefone.trim() ||
      !formData.endereco.trim()
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validações específicas por tipo de conta
    switch (formData.tipoConta) {
      case "Conta Corrente (CC)":
        if (!taxaManutencao) {
          alert("Por favor, preencha a taxa de manutenção.");
          return;
        }
        if (!limite) {
          alert("Por favor, preencha o limite da conta.");
          return;
        }
        break;
      
      case "Conta Investimento (CI)":
        if (!valorMinimo) {
          alert("Por favor, preencha o valor mínimo para investimento.");
          return;
        }
        if (!taxaRendimento) {
          alert("Por favor, preencha a taxa de rendimento.");
          return;
        }
        break;
      
      case "Conta Poupança (CP)":
        if (!taxaRendimento) {
          alert("Por favor, preencha a taxa de rendimento.");
          return;
        }
        break;
    }

    // Validar CPF
    const cpfLimpo = CPF.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      alert("CPF inválido. Deve conter 11 dígitos.");
      return;
    }

    // Validar telefone
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      alert("Telefone inválido. Deve conter 10 ou 11 dígitos.");
      return;
    }

    // Validar data de nascimento
    const dataNascimento = new Date(formData.nascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mesDiff = hoje.getMonth() - dataNascimento.getMonth();
    const diaDiff = hoje.getDate() - dataNascimento.getDate();
    
    if (idade < 18 || (idade === 18 && (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)))) {
      alert("O cliente deve ser maior de 18 anos.");
      return;
    }

    if (dataNascimento > hoje) {
      alert("Data de nascimento não pode ser futura.");
      return;
    }

    // Chama diretamente a função de abertura de conta
    abrirConta();
  };

  // Renderizar campos específicos baseados no tipo de conta
  const renderCamposEspecificos = () => {
    switch (formData.tipoConta) {
      case "Conta Corrente (CC)":
        return (
          <>
            {/* Limite */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Limite da Conta *</label>
              <input
                type="text"
                value={limite}
                onChange={(e) => handleMoedaChange(e.target.value, setLimite)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
                placeholder="R$ 1.000,00"
                disabled={carregando}
              />
              <p className="text-xs text-white/50 mt-1">Valor do limite do cheque especial</p>
            </div>

            {/* Vencimento */}
            <div className="relative">
              <label className="block text-sm text-white/70 mb-1">Data de Vencimento *</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer py-1"
                onClick={() => !carregando && setOpenSelect(openSelect === "vencimento" ? null : "vencimento")}
              >
                <span>{formData.vencimento}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform ${
                    openSelect === "vencimento" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "vencimento" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-lg border border-white/20 overflow-hidden">
                  {["Dia 5", "Dia 10", "Dia 15", "Dia 20"].map((dia) => (
                    <div
                      key={dia}
                      onClick={() => handleChange("vencimento", dia)}
                      className={`px-3 py-2 text-sm flex justify-between items-center hover:bg-white/10 cursor-pointer transition-colors ${
                        formData.vencimento === dia ? "text-white bg-white/20" : "text-white/80"
                      }`}
                    >
                      <span>{dia}</span>
                      {formData.vencimento === dia && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-white/50 mt-1">Dia do vencimento da fatura</p>
            </div>

            {/* Taxa de Manutenção */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Taxa de Manutenção *</label>
              <input
                type="text"
                value={taxaManutencao}
                onChange={(e) => handleMoedaChange(e.target.value, setTaxaManutencao)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
                placeholder="R$ 25,00"
                disabled={carregando}
              />
              <p className="text-xs text-white/50 mt-1">Taxa mensal de manutenção da conta</p>
            </div>
          </>
        );

      case "Conta Poupança (CP)":
        return (
          <>
            {/* Taxa de Rendimento */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Taxa de Rendimento (% ao ano) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="20.00"
                value={taxaRendimento}
                onChange={(e) => setTaxaRendimento(e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
                placeholder="5.00"
                disabled={carregando}
              />
              <p className="text-xs text-white/50 mt-1">Taxa de rendimento anual da poupança</p>
            </div>
          </>
        );

      case "Conta Investimento (CI)":
        return (
          <>
            {/* Perfil de Risco */}
            <div className="relative">
              <label className="block text-sm text-white/70 mb-1">Perfil de Risco *</label>
              <div
                className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer py-1"
                onClick={() => !carregando && setOpenSelect(openSelect === "perfilRisco" ? null : "perfilRisco")}
              >
                <span>
                  {perfilRisco === "BAIXO" && "🟢 Baixo"}
                  {perfilRisco === "MEDIO" && "🟡 Médio"}
                  {perfilRisco === "ALTO" && "🔴 Alto"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white transition-transform ${
                    openSelect === "perfilRisco" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openSelect === "perfilRisco" && (
                <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-lg border border-white/20 overflow-hidden">
                  {[
                    { value: "BAIXO", label: "🟢 Baixo", desc: "Rendimentos menores, mais segurança" },
                    { value: "MEDIO", label: "🟡 Médio", desc: "Equilíbrio entre risco e retorno" },
                    { value: "ALTO", label: "🔴 Alto", desc: "Maiores riscos, potenciais ganhos altos" }
                  ].map((perfil) => (
                    <div
                      key={perfil.value}
                      onClick={() => setPerfilRisco(perfil.value)}
                      className={`px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors ${
                        perfilRisco === perfil.value ? "text-white bg-white/20" : "text-white/80"
                      }`}
                    >
                      <div className="text-sm font-medium">{perfil.label}</div>
                      <div className="text-xs text-white/60">{perfil.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-white/50 mt-1">Define a estratégia de investimento</p>
            </div>

            {/* Valor Mínimo */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Valor Mínimo para Investimento *</label>
              <input
                type="text"
                value={valorMinimo}
                onChange={(e) => handleMoedaChange(e.target.value, setValorMinimo)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
                placeholder="R$ 100,00"
                disabled={carregando}
              />
              <p className="text-xs text-white/50 mt-1">Valor mínimo para aplicar em investimentos</p>
            </div>

            {/* Taxa de Rendimento */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Taxa de Rendimento Base (% ao ano) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="20.00"
                value={taxaRendimento}
                onChange={(e) => setTaxaRendimento(e.target.value)}
                className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
                placeholder="8.00"
                disabled={carregando}
              />
              <p className="text-xs text-white/50 mt-1">Taxa de rendimento anual base</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Máscara para o Input de CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 

    // Aplica a máscara
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{0,3}).*/, "$1.$2");
    }

    setCPF(value);
  };

  // Máscara para o Input de Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    // Aplica a máscara dinamicamente
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else {
      value = value.replace(/^(\d{0,2}).*/, "($1");
      if (value === "(") value = "";
    }

    setTelefone(value);
  };

  // Fechar dropdown quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenSelect(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (confirmacaoAberta) {
    return (
      <Confirmacaof
        mensagemLoading="Abrindo Conta"
        mensagemSuccess="Conta Aberta com Sucesso!"
        tempoLoading={2000}
        onComplete={() => router.push("/Funcionario")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">
      {/* Cabeçalho */}
      <div className="px-5 py-5">
        <button
          className="absolute top-5 left-5 hover:text-white/70 transition disabled:opacity-50 z-20"
          onClick={() => router.back()}
          disabled={carregando}
        >
          <X className="w-7 h-7" />
        </button>

        <h1 className="pt-12 text-center text-2xl font-bold">
          Abertura de Conta
        </h1>

        {/* FORMULÁRIO DE DADOS */}
        <div className="px-3 mt-8 flex flex-col gap-6 mb-28">
          {/* Nome */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Nome Completo *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full bg-transparent border-b border-white/50 text-white outline-none text-sm py-1 placeholder-white/40"
              placeholder="Digite o nome completo"
              disabled={carregando}
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Data de Nascimento *</label>
            <input
              type="date"
              value={formData.nascimento}
              onChange={(e) => handleChange("nascimento", e.target.value)}
              className="w-full border-b border-white/50 outline-none text-white bg-transparent py-1"
              style={{ colorScheme: "dark" }}
              disabled={carregando}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Tipo de conta */}
          <div className="relative">
            <label className="block text-sm text-white/70 mb-1">Tipo de Conta *</label>
            <div
              className="w-full border-b border-white/50 flex justify-between items-center cursor-pointer py-1"
              onClick={(e) => {
                e.stopPropagation();
                !carregando && setOpenSelect(openSelect === "tipoConta" ? null : "tipoConta");
              }}
            >
              <span>{formData.tipoConta}</span>
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform ${
                  openSelect === "tipoConta" ? "rotate-180" : ""
                }`}
              />
            </div>

            {openSelect === "tipoConta" && (
              <div className="absolute z-20 w-full mt-1 bg-[#012E4B] rounded-md shadow-lg border border-white/20 overflow-hidden">
                {[
                  { value: "Conta Corrente (CC)", desc: "Para transações diárias" },
                  { value: "Conta Poupança (CP)", desc: "Para economizar com rendimento" },
                  { value: "Conta Investimento (CI)", desc: "Para aplicar em investimentos" }
                ].map((tipo) => (
                  <div
                    key={tipo.value}
                    onClick={() => handleChange("tipoConta", tipo.value)}
                    className={`px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors ${
                      formData.tipoConta === tipo.value ? "text-white bg-white/20" : "text-white/80"
                    }`}
                  >
                    <div className="text-sm font-medium">{tipo.value}</div>
                    <div className="text-xs text-white/60">{tipo.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm text-white/70 mb-1">CPF *</label>
            <input
              type="text"
              required
              value={CPF}
              maxLength={14}
              onChange={handleCPFChange}
              className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
              placeholder="000.000.000-00"
              disabled={carregando}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Telefone *</label>
            <input
              type="text"
              required
              value={telefone}
              onChange={handleTelefoneChange}
              className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
              placeholder="(00) 00000-0000"
              disabled={carregando}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Endereço Completo *</label>
            <input
              type="text"
              placeholder="Rua, número, complemento..."
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              className="w-full bg-transparent border-b border-white/50 text-white outline-none py-1 placeholder-white/40"
              disabled={carregando}
            />
          </div>

          {/* CAMPOS ESPECÍFICOS DINÂMICOS */}
          {renderCamposEspecificos()}
        </div>
      </div>

      {/* Botão flutuante */}
      <button
        className="fixed bottom-6 right-6 bg-white/10 border border-white/50 rounded-full p-3 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed z-10 backdrop-blur-sm"
        onClick={handleConfirmar}
        disabled={carregando}
      >
        {carregando ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Check className="w-6 h-6 text-white" />
        )}
      </button>
    </main>
  );
}