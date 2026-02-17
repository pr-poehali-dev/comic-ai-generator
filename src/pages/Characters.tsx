import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/components/AuthContext";
import {
  fetchCharacters,
  createCharacter,
  removeCharacter,
  Character,
} from "@/lib/api";

const colorPresets = [
  "from-purple-500 to-cyan-400",
  "from-pink-500 to-rose-400",
  "from-blue-500 to-indigo-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-yellow-400",
  "from-red-500 to-pink-400",
];

function pickColor(index: number) {
  return colorPresets[index % colorPresets.length];
}

const Characters = () => {
  const { isLoggedIn } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChar, setNewChar] = useState({
    name: "",
    description: "",
    style: "",
  });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCharacters()
      .then((chars) => setCharacters(chars))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const addCharacter = async () => {
    if (!newChar.name.trim()) return;
    setCreating(true);
    try {
      const created = await createCharacter({
        name: newChar.name,
        description: newChar.description,
        style: newChar.style || "Свой стиль",
      });
      if (created) {
        setCharacters((prev) => [...prev, created]);
      }
      setNewChar({ name: "", description: "", style: "" });
      setOpen(false);
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const deleteCharacter = async (id: number) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    try {
      await removeCharacter(id);
    } catch {
      /* rollback on error — re-fetch */
      fetchCharacters()
        .then((chars) => setCharacters(chars))
        .catch(() => {});
    }
  };

  /* ---- Not logged in ---- */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-md mx-auto mt-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
            <Icon name="Users" size={40} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-3">
            Войдите, чтобы управлять персонажами
          </h1>
          <p className="text-muted-foreground mb-6">
            Создавайте и сохраняйте своих персонажей для комиксов
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-muted/30 rounded mt-2 animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-muted/50 rounded-lg animate-pulse" />
          </div>
          <div className="mb-6">
            <div className="h-10 w-full max-w-md bg-muted/30 rounded-lg animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="h-24 bg-muted/30 animate-pulse" />
                <div className="p-5 pt-9 space-y-3">
                  <div className="h-5 w-24 bg-muted/40 rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted/20 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-muted/30 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (characters.length === 0 && !search) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl">
                Мои <span className="text-gradient">персонажи</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                0 персонажей
              </p>
            </div>
          </div>
          <div className="text-center mt-16">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="Users" size={40} className="text-primary/50" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">
              У вас пока нет персонажей
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Создайте своего первого персонажа для использования в комиксах
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 glow-purple">
                  <Icon name="Plus" size={18} />
                  Создать персонажа
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Новый персонаж
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Имя
                    </label>
                    <Input
                      placeholder="Как зовут персонажа?"
                      value={newChar.name}
                      onChange={(e) =>
                        setNewChar({ ...newChar, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Описание
                    </label>
                    <Textarea
                      placeholder="Внешность, характер, способности..."
                      value={newChar.description}
                      onChange={(e) =>
                        setNewChar({ ...newChar, description: e.target.value })
                      }
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Стиль
                    </label>
                    <Input
                      placeholder="Манга, Киберпанк, Реализм..."
                      value={newChar.style}
                      onChange={(e) =>
                        setNewChar({ ...newChar, style: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={addCharacter}
                    className="w-full gap-2"
                    disabled={!newChar.name.trim() || creating}
                  >
                    {creating ? (
                      <Icon
                        name="Loader2"
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Icon name="Sparkles" size={16} />
                    )}
                    Создать персонажа
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Main view ---- */
  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl">
              Мои <span className="text-gradient">персонажи</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {characters.length}{" "}
              {characters.length === 1
                ? "персонаж"
                : characters.length >= 2 && characters.length <= 4
                  ? "персонажа"
                  : "персонажей"}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 glow-purple">
                <Icon name="Plus" size={18} />
                <span className="hidden sm:inline">Создать</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Новый персонаж
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Имя
                  </label>
                  <Input
                    placeholder="Как зовут персонажа?"
                    value={newChar.name}
                    onChange={(e) =>
                      setNewChar({ ...newChar, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Описание
                  </label>
                  <Textarea
                    placeholder="Внешность, характер, способности..."
                    value={newChar.description}
                    onChange={(e) =>
                      setNewChar({ ...newChar, description: e.target.value })
                    }
                    className="min-h-[100px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Стиль
                  </label>
                  <Input
                    placeholder="Манга, Киберпанк, Реализм..."
                    value={newChar.style}
                    onChange={(e) =>
                      setNewChar({ ...newChar, style: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={addCharacter}
                  className="w-full gap-2"
                  disabled={!newChar.name.trim() || creating}
                >
                  {creating ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Sparkles" size={16} />
                  )}
                  Создать персонажа
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск персонажей..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((char, i) => (
            <div
              key={char.id}
              className="glass rounded-2xl overflow-hidden hover-lift animate-fade-in group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className={`h-24 bg-gradient-to-br ${pickColor(char.id)} relative`}
              >
                <div className="absolute -bottom-6 left-5">
                  <div className="w-14 h-14 rounded-xl bg-card border-2 border-background flex items-center justify-center text-2xl font-display font-bold text-gradient">
                    {char.name[0]}
                  </div>
                </div>
                <button
                  onClick={() => deleteCharacter(char.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </button>
              </div>
              <div className="p-5 pt-9">
                <h3 className="font-semibold text-lg">{char.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {char.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {char.style}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setOpen(true)}
            className="glass rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 min-h-[200px] transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon name="Plus" size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Создать персонажа</p>
          </button>
        </div>

        {filtered.length === 0 && search && (
          <div className="text-center mt-12">
            <Icon
              name="SearchX"
              size={40}
              className="text-muted-foreground/40 mx-auto mb-3"
            />
            <p className="text-muted-foreground">
              Ничего не найдено по запросу "{search}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;
