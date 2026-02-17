import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useTheme } from "@/components/ThemeProvider";

const socialProviders = [
  { name: "Google", icon: "Chrome", color: "from-red-500 to-yellow-500" },
  { name: "ВКонтакте", icon: "MessageCircle", color: "from-blue-500 to-blue-600" },
  { name: "Telegram", icon: "Send", color: "from-sky-400 to-blue-500" },
  { name: "GitHub", icon: "Github", color: "from-gray-700 to-gray-900" },
  { name: "Яндекс", icon: "Search", color: "from-red-500 to-red-600" },
];

const Profile = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState({
    autosave: true,
    notifications: false,
    highQuality: true,
    language: "ru",
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Icon name="Zap" size={40} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-2">
              Войти в <span className="text-gradient">КомиксАрт</span>
            </h1>
            <p className="text-muted-foreground">
              Войдите через соцсеть, чтобы сохранять проекты и персонажей
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-3">
            {socialProviders.map((provider, i) => (
              <Button
                key={provider.name}
                variant="outline"
                className="w-full h-12 gap-3 text-base justify-start animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => setIsLoggedIn(true)}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                  <Icon name={provider.icon} size={16} className="text-white" />
                </div>
                Войти через {provider.name}
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Нажимая «Войти», вы соглашаетесь с условиями использования.
            Ваши данные защищены и не передаются третьим лицам.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl font-display font-bold text-white">
            К
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display font-bold text-xl">Космонавт</h1>
            <p className="text-muted-foreground text-sm">user@example.com</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <Icon name="BookOpen" size={14} />
                4 комикса
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Users" size={14} />
                3 персонажа
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsLoggedIn(false)}>
            <Icon name="LogOut" size={16} />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="settings">
          <TabsList className="mb-6">
            <TabsTrigger value="settings" className="gap-2">
              <Icon name="Settings" size={14} />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Icon name="User" size={14} />
              Аккаунт
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Icon name="Shield" size={14} />
              Безопасность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Palette" size={18} className="text-primary" />
                Внешний вид
              </h3>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <p className="font-medium text-sm">Тёмная тема</p>
                  <p className="text-xs text-muted-foreground">Переключение между тёмным и светлым режимом</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Sliders" size={18} className="text-neon-cyan" />
                Генерация
              </h3>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium text-sm">Автосохранение</p>
                    <p className="text-xs text-muted-foreground">Автоматическое сохранение проектов</p>
                  </div>
                  <Switch
                    checked={settings.autosave}
                    onCheckedChange={(v) => setSettings({ ...settings, autosave: v })}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium text-sm">Высокое качество</p>
                    <p className="text-xs text-muted-foreground">Генерация в максимальном разрешении</p>
                  </div>
                  <Switch
                    checked={settings.highQuality}
                    onCheckedChange={(v) => setSettings({ ...settings, highQuality: v })}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">Уведомления</p>
                    <p className="text-xs text-muted-foreground">Уведомлять о завершении генерации</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(v) => setSettings({ ...settings, notifications: v })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="User" size={18} className="text-primary" />
                Данные аккаунта
              </h3>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Имя</label>
                <Input defaultValue="Космонавт" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input defaultValue="user@example.com" type="email" />
              </div>
              <Button className="gap-2">
                <Icon name="Save" size={16} />
                Сохранить
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-green-400" />
                Безопасность данных
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "Lock", text: "Шифрование данных AES-256", status: "Активно" },
                  { icon: "Server", text: "Безопасное хранение проектов", status: "Активно" },
                  { icon: "Eye", text: "Проекты видны только вам", status: "Активно" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Icon name={item.icon} size={16} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.text}</p>
                    </div>
                    <span className="text-xs text-green-400">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;