import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id_conta");
        if (!id) return NextResponse.json({ error: "id_conta required" }, { status: 400 });

        const cc = await prisma.conta_corrente.findUnique({
            where: { id_conta: Number(id) }
        });

        if (!cc) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
        return NextResponse.json({ limite: cc.limite });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_conta, limite } = body;
        if (!id_conta || limite == null) return NextResponse.json({ error: "id_conta e limite obrigatórios" }, { status: 400 });

        const updated = await prisma.conta_corrente.update({
            where: { id_conta: Number(id_conta) },
            data: { limite: Number(limite) }
        });

        return NextResponse.json({ sucesso: true, limite: updated.limite });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}