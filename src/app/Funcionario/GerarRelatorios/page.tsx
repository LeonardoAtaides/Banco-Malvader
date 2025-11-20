"use client";

import React, { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GerarRelatorio() {
  const router = useRouter();
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const [formData, setFormData] = useState({
    tipoRelatorio: "Movimentações Recentes",
    dataInicio: "",
    dataFim: "",
    transacao: "Todas",
  });

  const [dadosResumoContas, setDadosResumoContas] = useState<any[]>([]);
  const [dadosMovimentacoes, setDadosMovimentacoes] = useState<any[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenSelect(null);

    if (field === "tipoRelatorio") {
      if (value === "Resumo de Contas") {
        buscarResumoContas();
        setShowReport(true);
      } else {
        setShowReport(false);
      }
    }
  };

  const buscarResumoContas = async () => {
    try {
      const res = await fetch("/api/funcionario/relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoRelatorio: "resumo_contas" }),
      });
      const data = await res.json();
      if (data.sucesso) {
        const r = data.data;
        const formatado = [
          { titulo: "Total de Contas Ativas", valor: r.totalContas },
          ...Object.entries(r.totalPorTipo).map(([tipo, qtd]) => ({
            titulo: `Contas ${tipo.toUpperCase()}`,
            valor: qtd,
          })),
          { titulo: "Saldo Total do Banco", valor: `R$ ${r.saldoTotal.toLocaleString()}` },
          { titulo: "Saldo Médio por Conta", valor: `R$ ${r.saldoMedio.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        ];
        setDadosResumoContas(formatado);
      }
    } catch (err) {
      console.error("Erro ao buscar resumo de contas:", err);
    }
  };

  const buscarMovimentacoes = async () => {
    try {
      const body: any = {
        tipoRelatorio: "movimentacoes",
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        tipoTransacao: "", 
      };

      const res = await fetch("/api/funcionario/relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.sucesso) {
        let transacoes = data.data;

     
        if (formData.transacao !== "Todas") {
          transacoes = transacoes.filter(
            (t: any) => t.tipo.toLowerCase() === formData.transacao.toLowerCase()
          );
        }

        const totalTransacoes = transacoes.length;
        const volumeTotal = transacoes.reduce((acc: number, t: any) => acc + t.valor, 0);
        const media = totalTransacoes > 0 ? volumeTotal / totalTransacoes : 0;


        const formatado = [
          ["Total de Transações", totalTransacoes],
          ["Volume Total Movimentado", `R$ ${volumeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
          ["Média por Transação", `R$ ${media.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ];

        setDadosMovimentacoes(formatado);
        setShowReport(true);
      }
    } catch (err) {
      console.error("Erro ao buscar movimentações:", err);
    }
  };

  const gerarPDFResumo = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(20);
    doc.text("Resumo de Contas", 40, 40);
    autoTable(doc, {
      startY: 80,
      head: [["Indicador", "Valor"]],
      body: dadosResumoContas.map((item) => [item.titulo, item.valor]),
      styles: { textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.5, fontSize: 11 },
      headStyles: { fillColor: [230, 230, 230] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save("resumo_contas.pdf");
  };

  const gerarPDFMovimentacoes = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(20);
    doc.text("Movimentações Recentes", 40, 40);
    autoTable(doc, {
      startY: 80,
      head: [["Indicador", "Valor"]],
      body: dadosMovimentacoes, 
      styles: { textColor: [0, 0, 0], lineColor: [180, 180, 180], lineWidth: 0.5, fontSize: 11 },
      headStyles: { fillColor: [230, 230, 230] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save("movimentacoes.pdf");
  };

  const validarCampos = () => {
    if (formData.tipoRelatorio === "Resumo de Contas") return true;
    if (!formData.dataInicio || !formData.dataFim) {
      alert("Preencha a Data de Início e a Data de Fim antes de gerar o relatório.");
      return false;
    }
    return true;
  };

  const gerarRelatorio = () => {
    if (!validarCampos()) return;
    if (formData.tipoRelatorio === "Resumo de Contas") {
      buscarResumoContas();
    } else {
      buscarMovimentacoes();
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">
      {/* Header */}
      <div className="px-5 py-5 relative">
        <button className="absolute top-5 left-5" onClick={() => router.back()}>
          <X className="w-7 h-7" />
        </button>
        <h1 className="pt-10 text-center text-2xl font-bold">Gerar Relatórios</h1>
      </div>

      {/* Form */}
      <div className="px-6 mt-6 flex flex-col gap-5">
        {/* Tipo Relatório */}
        <div className="relative">
          <label className="text-sm text-white/70">Tipo de Relatório</label>
          <div
            className="w-full border-b border-white/40 flex justify-between items-center cursor-pointer py-1"
            onClick={() =>
              setOpenSelect(openSelect === "tipoRelatorio" ? null : "tipoRelatorio")
            }
          >
            <span>{formData.tipoRelatorio}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${openSelect === "tipoRelatorio" ? "rotate-180" : ""}`}
            />
          </div>
          {openSelect === "tipoRelatorio" && (
            <div className="absolute z-30 w-full mt-1 bg-[#013452] border border-white/20 rounded-md shadow-md">
              {["Movimentações Recentes", "Resumo de Contas"].map((item) => (
                <div
                  key={item}
                  onClick={() => handleChange("tipoRelatorio", item)}
                  className="px-3 py-2 text-sm flex justify-between cursor-pointer hover:bg-white/10"
                >
                  <span>{item}</span>
                  {formData.tipoRelatorio === item && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campos somente de movimentações */}
        {formData.tipoRelatorio !== "Resumo de Contas" && (
          <>
            {/* Datas */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-white/70">Data Início</label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleChange("dataInicio", e.target.value)}
                  className="w-full border-b border-white/40 text-white bg-transparent outline-none py-1"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Data Fim</label>
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => handleChange("dataFim", e.target.value)}
                  className="w-full border-b border-white/40 text-white bg-transparent outline-none py-1"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>


            {/* Botão Gerar */}
            <button
              className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
              onClick={gerarRelatorio}
            >
              Gerar Relatório
            </button>
          </>
        )}
      </div>

      {/* Visualização do Relatório */}
      {showReport && (
        <div className="mt-10 w-full px-6 pb-10">
          <div className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-5 backdrop-blur">
            {(formData.tipoRelatorio === "Resumo de Contas" ? dadosResumoContas : dadosMovimentacoes).map(
              (item, index, arr) => (
                <div key={index}>
                  <p className="text-white/70 text-sm">{item[0] || item.titulo}</p>
                  <p className="text-sm font-semibold mb-2">{item[1] || item.valor}</p>
                  {index !== (formData.tipoRelatorio === "Resumo de Contas" ? dadosResumoContas.length : dadosMovimentacoes.length) - 1 && (
                    <div className="w-full h-[1px] bg-white/20 mb-3"></div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="w-full flex justify-center mt-6">
            <button
              onClick={formData.tipoRelatorio === "Resumo de Contas" ? gerarPDFResumo : gerarPDFMovimentacoes}
              className="px-6 py-2 border border-white/60 rounded-full bg-white/10 font-semibold hover:bg-white/90 hover:text-[#012E4B] transition"
            >
              Exportar para PDF
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
