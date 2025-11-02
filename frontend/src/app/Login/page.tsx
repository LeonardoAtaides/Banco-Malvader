"use client";

import { useState } from "react";
import Intro from "@/components/intro";
import { User, Users, LogOut } from "lucide-react";

export default function LoginFuncionario() {
  const [showIntro, setShowIntro] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState<"cliente" | "funcionario" | null>(null);

  const handleIntroFinish = () => setShowIntro(false);

  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 w-full h-full z-50">
          <Intro onFinish={handleIntroFinish} />
        </div>
      )}

      <main className="bg-gradient-to-b from-[#012E4B] to-[#064F75] min-h-screen w-full flex flex-col justify-between">
        {/* Conteúdo do topo */}
        <div className="flex flex-col items-center pt-10">
          <img src="/assets/Logo.png" alt="Logo" className="w-8 h-8" />

          {!showLogin ? (
            <>
              <div className="text-center font-bold text-xl uppercase pt-10">
                <h2>
                  Bem-vindo! <br />
                  <span className="text-[15px] font-bold">
                    É um prazer ter você com a gente.
                  </span>
                </h2>
              </div>

              <p className="pt-20 text-center text-[15px] font-bold w-50">
                Faça login e desfrute do melhor do nosso banco!
              </p>
            </>
          ) : loginType === "cliente" ? (
            <form className="pt-14 w-[80%] max-w-xs flex flex-col gap-6 text-white">

            <div className="justify-center flex mb-10 font-bold">
              <h2 className="w-50">Acesse e conheça tudo que podemos oferecer</h2>
            </div>

              <div>
                <label className="block text-sm mb-1">CPF</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-white/50 outline-none p-2"
                  placeholder="Digite seu CPF"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-white/50 outline-none p-2"
                  placeholder="Digite sua senha"
                />
              </div>

              <button
                type="submit"
                className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
              >
                Acessar
              </button>
            </form>
          ) : loginType === "funcionario" ? (
            <form className="pt-14 w-[80%] max-w-xs flex flex-col gap-6 text-white">

              <div className="justify-center flex mb-10 font-bold">
                <h2 className="w-70 text-center">Olá Prezado, bem vindo de volta! Bom expediente</h2>
              </div>

              <div>
                <label className="block text-sm mb-1">CPF</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-white/50 outline-none p-2"
                  placeholder="Digite seu CPF"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-white/50 outline-none p-2"
                  placeholder="Digite sua senha"
                />
              </div>

              <button
                type="submit"
                className="border border-white/60 bg-white/10 rounded-[10px] py-2 mt-6 font-bold hover:bg-white/90 hover:text-[#012E4B] transition"
              >
                Acessar
              </button>
            </form>
          ) : null}
        </div>

        {/* Menu fixado no rodapé */}
        <div className="flex justify-center gap-5 pb-2">
          <button
            onClick={() => {
              setShowLogin(true);
              setLoginType("cliente");
            }}
            className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center"
          >
            <User className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Cliente</p>
          </button>

          <button
            onClick={() => {
              setShowLogin(true);
              setLoginType("funcionario");
            }}
            className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center"
          >
            <Users className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Funcionário</p>
          </button>

          <button
            onClick={() => {
              setShowLogin(false);
              setLoginType(null);
            }}
            className="w-[110px] h-[90px] border border-white/50 rounded-[10px] flex flex-col items-center justify-center text-center"
          >
            <LogOut className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Sair</p>
          </button>
        </div>
      </main>
    </>
  );
}
