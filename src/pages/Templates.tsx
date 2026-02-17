import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";

const categories = ["Все", "Популярные", "Манга", "Супергерои", "Фэнтези", "Нуар", "Киберпанк"];

const templates = [
  { id: 1, name: "Эпическая битва", category: "Супергерои", pages: 12, emoji: "💥", gradient: "from-red-500 to-orange-400", popular: true },
  { id: 2, name: "Тихий город", category: "Нуар", pages: 8, emoji: "🌃", gradient: "from-gray-600 to-blue-900", popular: true },
  { id: 3, name: "Школьные дни", category: "Манга", pages: 16, emoji: "🏫", gradient: "from-pink-400 to-purple-500", popular: true },
  { id: 4, name: "Затерянный мир", category: "Фэнтези", pages: 20, emoji: "🗺️", gradient: "from-green-500 to-teal-400", popular: false },
  { id: 5, name: "Неон и хром", category: "Киберпанк", pages: 10, emoji: "🤖", gradient: "from-cyan-400 to-purple-500", popular: true },
  { id: 6, name: "Путь самурая", category: "Манга", pages: 24, emoji: "⚔️", gradient: "from-red-600 to-rose-400", popular: false },
  { id: 7, name: "Городской герой", category: "Супергерои", pages: 14, emoji: "🦸", gradient: "from-blue-500 to-indigo-500", popular: true },
  { id: 8, name: "Тайна леса", category: "Фэнтези", pages: 18, emoji: "🌲", gradient: "from-emerald-500 to-green-400", popular: false },
  { id: 9, name: "Космос-2099", category: "Киберпанк", pages: 30, emoji: "🚀", gradient: "from-violet-500 to-fuchsia-500", popular: true },
];

const artStyles = [
  { name: "Манга", desc: "Японский стиль с выразительными глазами", emoji: "🇯🇵", gradient: "from-pink-500 to-rose-400" },
  { name: "Marvel/DC", desc: "Детализированный стиль супергероев", emoji: "🦸", gradient: "from-blue-500 to-red-500" },
  { name: "Европейский", desc: "Элегантная графика и нарратив", emoji: "🎭", gradient: "from-amber-500 to-orange-400" },
  { name: "Нуар", desc: "Контрастные тени и атмосфера", emoji: "🌑", gradient: "from-gray-700 to-gray-900" },
  { name: "Киберпанк", desc: "Неон, технологии, футуризм", emoji: "💠", gradient: "from-cyan-400 to-violet-500" },
  { name: "Акварель", desc: "Мягкие переходы и текстуры", emoji: "🎨", gradient: "from-sky-300 to-pink-300" },
  { name: "Пиксель-арт", desc: "Ретро-стиль 8/16 бит", emoji: "👾", gradient: "from-green-400 to-lime-400" },
  { name: "Реализм", desc: "Фотореалистичная графика", emoji: "📸", gradient: "from-stone-500 to-stone-700" },
];

const Templates = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Все" || category === "Популярные" ? true : t.category === category;
    const matchPopular = category === "Популярные" ? t.popular : true;
    return matchSearch && matchCat && matchPopular;
  });

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl">
            Шаблоны и <span className="text-gradient-pink">стили</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Готовые шаблоны и художественные стили для вашего комикса
          </p>
        </div>

        <Tabs defaultValue="templates">
          <TabsList className="mb-6">
            <TabsTrigger value="templates" className="gap-2">
              <Icon name="LayoutGrid" size={14} />
              Шаблоны
            </TabsTrigger>
            <TabsTrigger value="styles" className="gap-2">
              <Icon name="Palette" size={14} />
              Стили
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Найти шаблон..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className={category === cat ? "glow-purple" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((t, i) => (
                <div
                  key={t.id}
                  className="glass rounded-2xl overflow-hidden hover-lift group animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`h-32 bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}>
                    <span className="text-5xl group-hover:scale-125 transition-transform">{t.emoji}</span>
                    {t.popular && (
                      <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm flex items-center gap-1">
                        <Icon name="TrendingUp" size={10} />
                        Популярный
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={14} />
                        {t.pages} страниц
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Palette" size={14} />
                        {t.category}
                      </span>
                    </div>
                    <Link to="/editor">
                      <Button className="w-full mt-4 gap-2" variant="outline">
                        <Icon name="Play" size={16} />
                        Использовать
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="styles">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {artStyles.map((s, i) => (
                <div
                  key={s.name}
                  className="glass rounded-2xl overflow-hidden hover-lift group animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`h-28 bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                    <span className="text-4xl group-hover:scale-125 transition-transform">{s.emoji}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    <Link to="/editor">
                      <Button size="sm" className="w-full mt-3 gap-2" variant="outline">
                        <Icon name="Zap" size={14} />
                        Выбрать
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Templates;