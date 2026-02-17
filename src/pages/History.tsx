import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/components/AuthContext";
import { fetchComics, archiveComic, Comic } from "@/lib/api";

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function gradientForStyle(style: string): string {
  const s = style.toLowerCase();
  if (s.includes("манга")) return "from-pink-400 to-purple-500";
  if (s.includes("киберпанк")) return "from-violet-500 to-fuchsia-500";
  if (s.includes("нуар")) return "from-gray-600 to-blue-900";
  return "from-purple-500 to-cyan-400";
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hidden sm:block">
          Готов
        </span>
      );
    case "draft":
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hidden sm:block">
          Черновик
        </span>
      );
    case "generating":
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:block">
          Генерация
        </span>
      );
    default:
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground border border-border hidden sm:block">
          {status}
        </span>
      );
  }
}

const History = () => {
  const { isLoggedIn } = useAuth();

  const [activeComics, setActiveComics] = useState<Comic[]>([]);
  const [archivedComics, setArchivedComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        fetchComics(false),
        fetchComics(true),
      ]);
      setActiveComics(active);
      setArchivedComics(archived);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isLoggedIn, loadData]);

  const handleArchive = async (id: number) => {
    const comic = activeComics.find((c) => c.id === id);
    if (!comic) return;
    setActiveComics((prev) => prev.filter((c) => c.id !== id));
    setArchivedComics((prev) => [{ ...comic, is_archived: true }, ...prev]);
    try {
      await archiveComic(id, true);
    } catch {
      setActiveComics((prev) => [comic, ...prev]);
      setArchivedComics((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleRestore = async (id: number) => {
    const comic = archivedComics.find((c) => c.id === id);
    if (!comic) return;
    setArchivedComics((prev) => prev.filter((c) => c.id !== id));
    setActiveComics((prev) => [{ ...comic, is_archived: false }, ...prev]);
    try {
      await archiveComic(id, false);
    } catch {
      setArchivedComics((prev) => [comic, ...prev]);
      setActiveComics((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const currentList = showArchived ? archivedComics : activeComics;
  const filtered = currentList.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ---- Not logged in ---- */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-md mx-auto mt-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
            <Icon name="Clock" size={40} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-3">
            Войдите, чтобы видеть историю
          </h1>
          <p className="text-muted-foreground mb-6">
            История ваших генераций будет доступна после входа
          </p>
          <Link to="/profile">
            <Button className="gap-2">
              <Icon name="LogIn" size={16} />
              Перейти ко входу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-56 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-4 w-40 bg-muted/30 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="h-10 flex-1 max-w-md bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-9 w-32 bg-muted/30 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-muted/30 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 bg-muted/40 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-muted/20 rounded-full animate-pulse hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Main view ---- */
  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl">
            История <span className="text-gradient">генераций</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeComics.length}{" "}
            {activeComics.length === 1
              ? "комикс"
              : activeComics.length >= 2 && activeComics.length <= 4
                ? "комикса"
                : "комиксов"}{" "}
            &middot; {archivedComics.length} в корзине
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по истории..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Icon name="Trash2" size={16} />
            Корзина{" "}
            {archivedComics.length > 0 && `(${archivedComics.length})`}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Icon
              name={showArchived ? "Trash2" : "Clock"}
              size={48}
              className="opacity-40"
            />
            <p className="text-lg">
              {showArchived ? "Корзина пуста" : "История пуста"}
            </p>
            <p className="text-sm">
              {showArchived
                ? "Удалённые комиксы появятся здесь"
                : search
                  ? `Ничего не найдено по запросу "${search}"`
                  : "Созданные комиксы будут отображаться здесь"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((comic, i) => (
              <div
                key={comic.id}
                className="glass rounded-2xl p-4 flex items-center gap-4 hover-lift animate-fade-in group"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientForStyle(comic.style)} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon name="BookOpen" size={28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{comic.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Icon name="FileText" size={12} />
                      {comic.panels.length} стр.
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Palette" size={12} />
                      {comic.style}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} />
                      {formatDate(comic.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(comic.status)}
                  {showArchived ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleRestore(comic.id)}
                    >
                      <Icon name="RotateCcw" size={14} />
                      <span className="hidden sm:inline">Восстановить</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <Icon name="Download" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => handleArchive(comic.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
