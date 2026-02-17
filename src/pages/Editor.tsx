import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { saveComic, isAuthenticated } from "@/lib/api";

const artStyles = [
  "Манга", "Супергерои", "Европейский", "Нуар", "Киберпанк",
  "Фэнтези", "Акварель", "Пиксель-арт", "Реализм", "Мультяшный",
];

const layouts = [
  { name: "Классический", cols: 2, rows: 2, icon: "Grid2x2" },
  { name: "Полоса", cols: 1, rows: 3, icon: "Rows3" },
  { name: "Широкий", cols: 3, rows: 2, icon: "LayoutGrid" },
  { name: "Одна панель", cols: 1, rows: 1, icon: "Square" },
];

interface ComicPage {
  id: number;
  prompt: string;
  generated: boolean;
  panels: string[];
}

const Editor = () => {
  const [pages, setPages] = useState<ComicPage[]>([
    { id: 1, prompt: "", generated: false, panels: [] },
  ]);
  const [activePage, setActivePage] = useState(0);
  const [style, setStyle] = useState("Манга");
  const [layout, setLayout] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [quality, setQuality] = useState([75]);
  const [creativity, setCreativity] = useState([50]);

  const addPage = () => {
    setPages((prev) => [
      ...prev,
      { id: prev.length + 1, prompt: "", generated: false, panels: [] },
    ]);
    setActivePage(pages.length);
  };

  const updatePrompt = (val: string) => {
    setPages((prev) =>
      prev.map((p, i) => (i === activePage ? { ...p, prompt: val } : p))
    );
  };

  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setProgress(0);

    const panelCount = layouts[layout].cols * layouts[layout].rows;
    const fakeProgressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8, 90));
    }, 500);

    try {
      const resp = await fetch("https://functions.poehali.dev/9923ee9a-8edb-44cc-8484-117e4950e5a3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPage?.prompt || "",
          style,
          panelCount,
        }),
      });

      const data = await resp.json();
      clearInterval(fakeProgressInterval);

      if (!resp.ok) {
        setError(data.error || "Ошибка генерации");
        setGenerating(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      const generatedPanels = data.panels.filter(Boolean);
      setPages((prev) =>
        prev.map((p, i) =>
          i === activePage
            ? { ...p, generated: true, panels: generatedPanels }
            : p
        )
      );

      if (isAuthenticated()) {
        const title = (currentPage?.prompt || "Без названия").slice(0, 60);
        saveComic({
          title,
          prompt: currentPage?.prompt || "",
          style,
          panels: generatedPanels,
        }).catch(() => {});
      }
    } catch (e) {
      clearInterval(fakeProgressInterval);
      setError("Не удалось подключиться к серверу генерации");
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const currentPage = pages[activePage];
  const currentLayout = layouts[layout];

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl">
              Редактор <span className="text-gradient">комикса</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {pages.length} {pages.length === 1 ? "страница" : "страниц"} · Стиль: {style}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="Save" size={16} />
              <span className="hidden sm:inline">Сохранить</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="Download" size={16} />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5">
          <div className="glass rounded-2xl p-4 space-y-5 order-2 lg:order-1">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-primary" />
                Страницы
              </h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {pages.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePage(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      i === activePage
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <span>Страница {p.id}</span>
                    {p.generated && <Icon name="Check" size={14} className="text-green-400" />}
                  </button>
                ))}
              </div>
              <Button onClick={addPage} variant="outline" size="sm" className="w-full mt-2 gap-2">
                <Icon name="Plus" size={14} />
                Добавить страницу
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Palette" size={16} className="text-neon-pink" />
                Стиль
              </h3>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="LayoutGrid" size={16} className="text-neon-cyan" />
                Макет
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {layouts.map((l, i) => (
                  <button
                    key={l.name}
                    onClick={() => setLayout(i)}
                    className={`p-3 rounded-lg border text-center text-xs transition-all ${
                      i === layout
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <Icon name={l.icon} size={20} className="mx-auto mb-1" />
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Sliders" size={16} className="text-neon-yellow" />
                Параметры
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Качество</span>
                    <span>{quality[0]}%</span>
                  </div>
                  <Slider value={quality} onValueChange={setQuality} max={100} step={5} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Креативность</span>
                    <span>{creativity[0]}%</span>
                  </div>
                  <Slider value={creativity} onValueChange={setCreativity} max={100} step={5} />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <div className="glass rounded-2xl p-5">
              <Tabs defaultValue="generate">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="generate" className="flex-1 gap-2">
                    <Icon name="Sparkles" size={14} />
                    Генерация
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex-1 gap-2">
                    <Icon name="PenTool" size={14} />
                    Редактирование
                  </TabsTrigger>
                  <TabsTrigger value="background" className="flex-1 gap-2">
                    <Icon name="Image" size={14} />
                    Фон
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                  <Textarea
                    placeholder="Опишите, что должно происходить на этой странице комикса...&#10;&#10;Например: Герой стоит на крыше небоскрёба. Внизу город в огнях. На горизонте появляется гигантский робот."
                    className="min-h-[120px] resize-none"
                    value={currentPage?.prompt || ""}
                    onChange={(e) => updatePrompt(e.target.value)}
                  />
                  {generating && (
                    <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                      <Icon name="AlertCircle" size={16} />
                      {error}
                    </div>
                  )}
                  <Button
                    className="w-full gap-2 glow-purple"
                    onClick={handleGenerate}
                    disabled={generating || !currentPage?.prompt}
                  >
                    {generating ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        Генерация... {Math.round(progress)}%
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={18} />
                        Сгенерировать страницу
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2 h-auto py-3 flex-col">
                      <Icon name="Type" size={20} />
                      <span className="text-xs">Добавить текст</span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-3 flex-col">
                      <Icon name="MessageSquare" size={20} />
                      <span className="text-xs">Баблы речи</span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-3 flex-col">
                      <Icon name="Sticker" size={20} />
                      <span className="text-xs">Эффекты</span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-3 flex-col">
                      <Icon name="Crop" size={20} />
                      <span className="text-xs">Обрезать</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Сначала сгенерируйте страницу, затем редактируйте
                  </p>
                </TabsContent>

                <TabsContent value="background" className="space-y-4">
                  <Input placeholder="Опишите фон: Ночной город с неоновыми огнями..." />
                  <Button variant="outline" className="w-full gap-2">
                    <Icon name="Wand2" size={16} />
                    Сгенерировать фон
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Предпросмотр — Страница {(activePage || 0) + 1}</h3>
              {currentPage?.generated ? (
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`,
                  }}
                >
                  {currentPage.panels.map((panel, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden border border-border/50 group relative cursor-pointer"
                    >
                      <img src={panel} alt={`Панель ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
                          <Icon name="PenTool" size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
                          <Icon name="RefreshCw" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3 py-12">
                  <Icon name="ImagePlus" size={48} className="opacity-40" />
                  <p className="text-sm">Опишите страницу и нажмите «Сгенерировать»</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 space-y-5 order-3">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Settings" size={16} className="text-primary" />
                Настройки генерации
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Разрешение</label>
                  <Select defaultValue="1024">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512×512</SelectItem>
                      <SelectItem value="768">768×768</SelectItem>
                      <SelectItem value="1024">1024×1024</SelectItem>
                      <SelectItem value="2048">2048×2048</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Формат экспорта</label>
                  <Select defaultValue="png">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Lightbulb" size={16} className="text-neon-yellow" />
                Подсказки
              </h3>
              <div className="space-y-2">
                {["Добавьте детали окружения", "Укажите эмоции персонажей", "Опишите освещение сцены"].map((tip) => (
                  <div key={tip} className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-accent/50">
                    <Icon name="ChevronRight" size={12} className="mt-0.5 text-primary flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-neon-cyan" />
                Автосохранение
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Активно · Последнее: только что
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;