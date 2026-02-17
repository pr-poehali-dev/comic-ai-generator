import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/a10ec4dd-e50e-4d9d-9773-536078c8c374/files/434ecc31-cdcb-4c59-86c6-8a703e99f377.jpg";

const features = [
  { icon: "Sparkles", title: "ИИ-генерация", desc: "Опишите сюжет — ИИ нарисует страницы комикса за секунды", color: "from-purple-500 to-cyan-400" },
  { icon: "Users", title: "Свои персонажи", desc: "Создавайте уникальных героев без ограничений по количеству", color: "from-pink-500 to-purple-500" },
  { icon: "Layers", title: "500+ страниц", desc: "До 500 страниц за раз. Автосохранение каждого проекта", color: "from-cyan-400 to-blue-500" },
  { icon: "Palette", title: "Стили и шаблоны", desc: "Манга, супергерои, европейский стиль и десятки других", color: "from-yellow-400 to-orange-500" },
  { icon: "PenTool", title: "Полное редактирование", desc: "Настройка каждой страницы после генерации с параметрами", color: "from-green-400 to-cyan-400" },
  { icon: "Download", title: "Экспорт в любом формате", desc: "PDF, PNG, JPG, WebP — скачайте комикс как удобно", color: "from-purple-400 to-pink-500" },
];

const styles = [
  { name: "Манга", emoji: "🇯🇵" },
  { name: "Супергерои", emoji: "🦸" },
  { name: "Европейский", emoji: "🇪🇺" },
  { name: "Нуар", emoji: "🌑" },
  { name: "Киберпанк", emoji: "🤖" },
  { name: "Фэнтези", emoji: "🐉" },
  { name: "Акварель", emoji: "🎨" },
  { name: "Пиксель-арт", emoji: "👾" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-neon-purple/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-neon-cyan/8 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Бесплатно и без ограничений
              </div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Создавайте{" "}
                <span className="text-gradient">комиксы</span>
                <br />
                с помощью <span className="text-gradient-pink">ИИ</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Опишите идею — получите полноценный комикс. Уникальные персонажи,
                множество стилей и до 500 страниц за генерацию.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/editor">
                  <Button size="lg" className="gap-2 glow-purple text-base font-semibold px-8">
                    <Icon name="Zap" size={20} />
                    Создать комикс
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button size="lg" variant="outline" className="gap-2 text-base">
                    <Icon name="LayoutGrid" size={20} />
                    Шаблоны
                  </Button>
                </Link>
              </div>
            </div>

            <div className="animate-fade-in relative" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden glow-purple">
                <img
                  src={HERO_IMG}
                  alt="КомиксАрт — генератор комиксов"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon name="Sparkles" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Быстрая генерация</p>
                      <p className="text-xs text-muted-foreground">Средняя скорость — 3 сек на страницу</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Всё, что нужно для <span className="text-gradient">комиксов</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Мощные инструменты для создания профессиональных комиксов без навыков рисования
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group glass rounded-2xl p-6 hover-lift cursor-default animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon name={f.icon} size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Художественные <span className="text-gradient-pink">стили</span>
            </h2>
            <p className="text-muted-foreground text-lg">Выберите стиль, который подходит вашей истории</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {styles.map((s, i) => (
              <Link
                key={s.name}
                to="/templates"
                className="glass rounded-2xl p-6 text-center hover-lift group animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{s.emoji}</div>
                <p className="font-medium">{s.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Готовы создать свой <span className="text-gradient">комикс</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Полностью бесплатно. Без ограничений. Начните прямо сейчас.
          </p>
          <Link to="/editor">
            <Button size="lg" className="gap-2 glow-purple text-base font-semibold px-10">
              <Icon name="Rocket" size={20} />
              Начать создавать
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icon name="Zap" size={16} className="text-primary" />
            <span>КомиксАрт © 2026</span>
          </div>
          <p>Создано с помощью ИИ. Все данные защищены.</p>
        </div>
      </footer>

      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Index;