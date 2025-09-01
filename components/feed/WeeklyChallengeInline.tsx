"use client";
import { useEffect, useState } from "react";

const KEY_PREFIX = "crunevo.weeklyChallenge.dismissed.";

export default function WeeklyChallengeInline() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const key = KEY_PREFIX + getYearWeekKey();
    const dismissed = typeof window !== "undefined" && localStorage.getItem(key);
    setHidden(!!dismissed);
  }, []);

  if (hidden) return null;

  const close = () => {
    const key = KEY_PREFIX + getYearWeekKey();
    localStorage.setItem(key, "1");
    setHidden(true);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 relative">
      <button
        aria-label="Cerrar"
        onClick={close}
        className="absolute right-3 top-3 rounded-md p-1 hover:bg-muted"
      >
        ✕
      </button>
      <h3 className="text-sm font-semibold">Desafío semanal</h3>
      <p className="text-sm text-muted-foreground">
        Sube 3 apuntes esta semana y gana 500 Crolars extra.
      </p>
    </div>
  );
}

function getYearWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}
