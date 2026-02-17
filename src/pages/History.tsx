import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface HistoryItem {
  id: number;
  title: string;
  pages: number;
  style: string;
  date: string;
  status: "completed" | "draft";
  deleted: boolean;
  gradient: string;
}

const initialHistory: HistoryItem[] = [
  { id: 1, title: "Космическая одиссея", pages: 12, style: "Киберпанк", date: "17 фев 2026", status: "completed", deleted: false, gradient: "from-violet-500 to-fuchsia-500" },
  { id: 2, title: "Тайны старого города", pages: 8, style: "Нуар", date: "16 фев 2026", status: "completed", deleted: false, gradient: "from-gray-600 to-blue-900" },
  { id: 3, title: "Школа магии", pages: 5, style: "Манга", date: "15 фев 2026", status: "draft", deleted: false, gradient: "from-pink-400 to-purple-500" },
  { id: 4, title: "Битва титанов", pages: 20, style: "Супергерои", date: "14 фев 2026", status: "completed", deleted: false, gradient: "from-red-500 to-orange-400" },
];

const History = () => {
  const [items, setItems] = useState<HistoryItem[]>(initialHistory);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (showDeleted ? item.deleted : !item.deleted);
  });

  const toggleDelete = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, deleted: !item.deleted } : item
      )
    );
  };

  const activeCount = items.filter((i) => !i.deleted).length;
  const deletedCount = items.filter((i) => i.deleted).length;

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl">
            История <span className="text-gradient">генераций</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount} комиксов · {deletedCount} в корзине
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по истории..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showDeleted ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDeleted(!showDeleted)}
            className="gap-2"
          >
            <Icon name="Trash2" size={16} />
            Корзина {deletedCount > 0 && `(${deletedCount})`}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Icon name={showDeleted ? "Trash2" : "Clock"} size={48} className="opacity-40" />
            <p className="text-lg">{showDeleted ? "Корзина пуста" : "История пуста"}</p>
            <p className="text-sm">
              {showDeleted
                ? "Удалённые комиксы появятся здесь"
                : "Созданные комиксы будут отображаться здесь"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="glass rounded-2xl p-4 flex items-center gap-4 hover-lift animate-fade-in group"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon name="BookOpen" size={28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="FileText" size={12} />
                      {item.pages} стр.
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Palette" size={12} />
                      {item.style}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} />
                      {item.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "completed" ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hidden sm:block">
                      Готов
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hidden sm:block">
                      Черновик
                    </span>
                  )}
                  {item.deleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => toggleDelete(item.id)}
                    >
                      <Icon name="RotateCcw" size={14} />
                      <span className="hidden sm:inline">Восстановить</span>
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <Icon name="Download" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => toggleDelete(item.id)}
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