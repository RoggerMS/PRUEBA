import Link from "next/link";

export function UserMiniCard({
  user,
}: {
  user: { name: string; username: string; level: number; xp: number; xpToNext: number };
}) {
  const pct = Math.min(100, Math.round((user.xp / user.xpToNext) * 100));
  return (
    <Link
      href={`/@${user.username}`}
      className="block rounded-lg border bg-card text-card-foreground shadow-sm p-4"
    >
      <div className="text-sm font-semibold">{user.name}</div>
      <div className="text-xs text-muted-foreground">@{user.username}</div>
      <div className="mt-2 text-xs">Nivel {user.level}</div>
      <div className="mt-1 h-2 w-full rounded bg-muted">
        <div className="h-2 rounded bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {user.xp}/{user.xpToNext} XP
      </div>
    </Link>
  );
}
