import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthContext";
import { login, register, updateProfile, fetchProfile } from "@/lib/api";

const Profile = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, logout, isLoggedIn } = useAuth();

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [comicsCount, setComicsCount] = useState(0);
  const [charactersCount, setCharactersCount] = useState(0);

  const [settings, setSettings] = useState({
    autosave: true,
    notifications: false,
    highQuality: true,
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      setProfileName(user.name);
      fetchProfile()
        .then((p) => {
          setComicsCount(p.comics_count ?? 0);
          setCharactersCount(p.characters_count ?? 0);
        })
        .catch(() => {});
    }
  }, [isLoggedIn, user]);

  const handleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await login(authEmail, authPassword);
      setUser(data.user);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const data = await register(authEmail, authPassword, authName);
      setUser(data.user);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Ошибка регистрации");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      const updated = await updateProfile(profileName);
      setUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      /* ignore */
    } finally {
      setProfileSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
              Войдите или зарегистрируйтесь, чтобы сохранять проекты и
              персонажей
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <Tabs
              value={authTab}
              onValueChange={(v) => {
                setAuthTab(v as "login" | "register");
                setAuthError("");
              }}
            >
              <TabsList className="w-full mb-6">
                <TabsTrigger value="login" className="flex-1">
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Пароль
                  </label>
                  <Input
                    type="password"
                    placeholder="Введите пароль"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <Icon name="AlertCircle" size={14} />
                    {authError}
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={handleLogin}
                  disabled={authLoading || !authEmail || !authPassword}
                >
                  {authLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="LogIn" size={16} />
                  )}
                  Войти
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Имя
                  </label>
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Пароль
                  </label>
                  <Input
                    type="password"
                    placeholder="Придумайте пароль"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <Icon name="AlertCircle" size={14} />
                    {authError}
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={handleRegister}
                  disabled={
                    authLoading || !authEmail || !authPassword || !authName
                  }
                >
                  {authLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="UserPlus" size={16} />
                  )}
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Нажимая кнопку, вы соглашаетесь с условиями использования. Ваши
            данные защищены и не передаются третьим лицам.
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
            {user ? getInitials(user.name) : "?"}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display font-bold text-xl">
              {user?.name ?? ""}
            </h1>
            <p className="text-muted-foreground text-sm">
              {user?.email ?? ""}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <Icon name="BookOpen" size={14} />
                {comicsCount}{" "}
                {comicsCount === 1
                  ? "комикс"
                  : comicsCount >= 2 && comicsCount <= 4
                    ? "комикса"
                    : "комиксов"}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Users" size={14} />
                {charactersCount}{" "}
                {charactersCount === 1
                  ? "персонаж"
                  : charactersCount >= 2 && charactersCount <= 4
                    ? "персонажа"
                    : "персонажей"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={logout}
          >
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
                  <p className="font-medium text-sm">Темная тема</p>
                  <p className="text-xs text-muted-foreground">
                    Переключение между темным и светлым режимом
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
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
                    <p className="text-xs text-muted-foreground">
                      Автоматическое сохранение проектов
                    </p>
                  </div>
                  <Switch
                    checked={settings.autosave}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, autosave: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium text-sm">Высокое качество</p>
                    <p className="text-xs text-muted-foreground">
                      Генерация в максимальном разрешении
                    </p>
                  </div>
                  <Switch
                    checked={settings.highQuality}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, highQuality: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">Уведомления</p>
                    <p className="text-xs text-muted-foreground">
                      Уведомлять о завершении генерации
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, notifications: v })
                    }
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
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Имя
                </label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Email
                </label>
                <Input value={user?.email ?? ""} type="email" disabled />
              </div>
              {profileSuccess && (
                <p className="text-sm text-green-500 flex items-center gap-1.5">
                  <Icon name="Check" size={14} />
                  Сохранено
                </p>
              )}
              <Button
                className="gap-2"
                onClick={handleUpdateProfile}
                disabled={profileSaving || !profileName.trim()}
              >
                {profileSaving ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Save" size={16} />
                )}
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
                  {
                    icon: "Lock",
                    title: "Шифрование данных",
                    desc: "Все данные зашифрованы",
                  },
                  {
                    icon: "Server",
                    title: "Безопасные серверы",
                    desc: "Данные хранятся на защищённых серверах",
                  },
                  {
                    icon: "Trash2",
                    title: "Удаление данных",
                    desc: "Вы можете удалить аккаунт в любой момент",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Icon
                        name={item.icon}
                        size={16}
                        className="text-green-400"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
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
