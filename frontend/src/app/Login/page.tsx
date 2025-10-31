"use client";

import { useState } from "react";
import Intro from "@/components/intro";

export default function Login() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroFinish = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 w-full h-full z-50">
          <Intro onFinish={handleIntroFinish} />
        </div>
      )}
      <main className="bg-gradient-to-b from-[#012E4B] to-[#064F75] min-h-screen w-full">
        {/* Conteúdo da página */}
      </main>
    </>
  );
}
