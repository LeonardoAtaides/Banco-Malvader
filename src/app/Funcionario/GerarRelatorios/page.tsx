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
    agencia: "Todas",
  });

  // ---------------------------
  //   DADOS DO RELATÓRIO (FAKE)
  // ---------------------------
  const dadosRelatorio = [
    { titulo: "Total de Transações", valor: "1247" },
    { titulo: "Volume Total Movimentado", valor: "R$ 2.450.000,00" },
    { titulo: "Média por Transação", valor: "R$ 1.964,63" },
    { titulo: "Agência Com Maior Movimento", valor: "Agência 0001" },
  ];

  const tabelaMovimentacoes = [
    { descricao: "Depósito", tipo: "Entrada", valor: "R$ 500,00", data: "01/01/2025" },
    { descricao: "PIX Enviado", tipo: "Saída", valor: "R$ 150,00", data: "02/01/2025" },
    { descricao: "Bônus", tipo: "Entrada", valor: "R$ 20,00", data: "03/01/2025" },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenSelect(null);
  };

  // ---------------------------
  //      GERAR PDF
  // ---------------------------
  const gerarPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    doc.setFont("Helvetica", "normal");

    doc.setFontSize(20);
    doc.text("Relatório Financeiro", 40, 40);

    doc.setFontSize(12);
    doc.text(`Período: ${formData.dataInicio || "..."} até ${formData.dataFim || "..."}`, 40, 65);
    doc.text(`Tipo de Relatório: ${formData.tipoRelatorio}`, 40, 85);
    doc.text(`Tipo de Transação: ${formData.transacao}`, 40, 105);
    doc.text(`Agência: ${formData.agencia}`, 40, 125);

    autoTable(doc, {
      startY: 150,
      head: [["Indicador", "Valor"]],
      body: dadosRelatorio.map((item) => [item.titulo, item.valor]),
      styles: {
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.5,
        fontSize: 11,
      },
      headStyles: {
        fillColor: [230, 230, 230],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [["Descrição", "Tipo", "Valor", "Data"]],
      body: tabelaMovimentacoes.map((item) => [
        item.descricao,
        item.tipo,
        item.valor,
        item.data,
      ]),
      styles: {
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.5,
        fontSize: 11,
      },
      headStyles: {
        fillColor: [230, 230, 230],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save("relatorio.pdf");
  };

  // -----------------------------------------------------
  //     🔴 VALIDAÇÃO — ALERT NATIVO SEM ALTERAR LAYOUT
  // -----------------------------------------------------
  const validarCampos = () => {
    if (!formData.dataInicio || !formData.dataFim) {
      alert("Preencha a Data de Início e a Data de Fim antes de gerar o relatório.");
      return false;
    }

    return true;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#012E4B] to-[#064F75] text-white flex flex-col relative">

      {/* Cabeçalho */} 
      <div className="px-5 py-5 relative">
        <button className="absolute top-5 left-5" onClick={() => router.back()}>
          <X className="w-7 h-7" />
        </button>

        <h1 className="pt-10 text-center text-2xl font-bold">
          Gerar Relatórios
        </h1>
      </div>

      {/* FORM */}
      <div className="px-6 mt-6 flex flex-col gap-5">

        {/* Tipo de Relatório */}
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

        {/* Tipo Transação */}
        <div className="relative">
          <label className="text-sm text-white/70">Tipo de Transação</label>

          <div
            className="w-full border-b border-white/40 flex justify-between items-center cursor-pointer py-1"
            onClick={() =>
              setOpenSelect(openSelect === "transacao" ? null : "transacao")
            }
          >
            <span>{formData.transacao}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${openSelect === "transacao" ? "rotate-180" : ""}`}
            />
          </div>

          {openSelect === "transacao" && (
            <div className="absolute z-30 w-full mt-1 bg-[#013452] border border-white/20 rounded-md shadow-md">
              {["Todas", "Depósito", "Saque", "Transferência"].map((item) => (
                <div
                  key={item}
                  onClick={() => handleChange("transacao", item)}
                  className="px-3 py-2 text-sm flex justify-between cursor-pointer hover:bg-white/10"
                >
                  <span>{item}</span>
                  {formData.transacao === item && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agência */}
        <div className="relative">
          <label className="text-sm text-white/70">Agência</label>

          <div
            className="w-full border-b border-white/40 flex justify-between items-center cursor-pointer py-1"
            onClick={() =>
              setOpenSelect(openSelect === "agencia" ? null : "agencia")
            }
          >
            <span>{formData.agencia}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${openSelect === "agencia" ? "rotate-180" : ""}`}
            />
          </div>

          {openSelect === "agencia" && (
            <div className="absolute z-30 w-full mt-1 bg-[#013452] border border-white/20 rounded-md shadow-md">
              {["Todas", "001", "002"].map((item) => (
                <div
                  key={item}
                  onClick={() => handleChange("agencia", item)}
                  className="px-3 py-2 text-sm flex justify-between cursor-pointer hover:bg-white/10"
                >
                  <span>{item}</span>
                  {formData.agencia === item && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão Gerar */}
        <button
          className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
          onClick={() => {
            if (validarCampos()) {
              setShowReport(true);
            }
          }}
        >
          Gerar Relatório
        </button>
      </div>

      {/* RELATÓRIO VISUAL */}
      {showReport && (
        <div className="mt-10 w-full px-6 pb-10">
          <div className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-5 backdrop-blur">
            {dadosRelatorio.map((item, index) => (
              <div key={index}>
                <p className="text-white/70 text-sm">{item.titulo}</p>
                <p className="text-sm font-semibold mb-2">{item.valor}</p>

                {index !== dadosRelatorio.length - 1 && (
                  <div className="w-full h-[1px] bg-white/20 mb-3"></div>
                )}
              </div>
            ))}
          </div>

          {/* Botão PDF */}
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={gerarPDF}
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
