import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // Actualiza la BD y obtiene el usuario actualizado
    const user = body; // placeholder
    return NextResponse.json(
      { ok: true, user },
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e.message ?? "Error al actualizar" },
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
