"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-semibold">Algo salió mal</h2>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded bg-violet-600 px-4 py-2 text-white"
        >
          Recargar
        </button>
        <Link
          href="/"
          className="rounded border px-4 py-2"
        >
          Inicio
        </Link>
      </div>
    </div>
  );
}
