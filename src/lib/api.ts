const API = {
  auth: "https://functions.poehali.dev/b1f72cac-d6ec-47e0-8e0e-48e8b5bdc9e3",
  userData: "https://functions.poehali.dev/d13a64a8-0966-4c4a-85ed-0240f49f4145",
  generateComic: "https://functions.poehali.dev/9923ee9a-8edb-44cc-8484-117e4950e5a3",
};

function getAuth() {
  const raw = localStorage.getItem("comic_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; user: User };
  } catch {
    return null;
  }
}

function getUserId(): string | null {
  const auth = getAuth();
  if (!auth?.token) return null;
  return auth.token.split(":")[0];
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
  comics_count?: number;
  characters_count?: number;
}

export interface Comic {
  id: number;
  title: string;
  prompt: string;
  style: string;
  panels: string[];
  status: string;
  is_archived: boolean;
  created_at: string;
}

export interface Character {
  id: number;
  name: string;
  description: string;
  style: string;
  color: string;
  created_at: string;
}

export async function register(email: string, password: string, name: string) {
  const resp = await fetch(API.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", email, password, name }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Ошибка регистрации");
  localStorage.setItem("comic_auth", JSON.stringify(data));
  return data as { token: string; user: User };
}

export async function login(email: string, password: string) {
  const resp = await fetch(API.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Ошибка входа");
  localStorage.setItem("comic_auth", JSON.stringify(data));
  return data as { token: string; user: User };
}

export function logout() {
  localStorage.removeItem("comic_auth");
}

export function isAuthenticated(): boolean {
  return !!getAuth();
}

export function getCurrentUser(): User | null {
  return getAuth()?.user || null;
}

export async function fetchProfile(): Promise<User> {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  const resp = await fetch(`${API.auth}?action=profile`, {
    headers: { "X-User-Id": userId },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  return data.user;
}

export async function updateProfile(name: string): Promise<User> {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  const resp = await fetch(`${API.auth}?action=profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify({ name }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  const auth = getAuth()!;
  auth.user.name = data.user.name;
  localStorage.setItem("comic_auth", JSON.stringify(auth));
  return data.user;
}

export async function fetchComics(archived = false): Promise<Comic[]> {
  const userId = getUserId();
  if (!userId) return [];
  const resp = await fetch(`${API.userData}?entity=comics&archived=${archived}`, {
    headers: { "X-User-Id": userId },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  return data.comics;
}

export async function saveComic(comic: { title: string; prompt: string; style: string; panels: string[] }) {
  const userId = getUserId();
  if (!userId) return null;
  const resp = await fetch(`${API.userData}?entity=comics`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify(comic),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  return data;
}

export async function archiveComic(id: number, isArchived: boolean) {
  const userId = getUserId();
  if (!userId) return;
  await fetch(`${API.userData}?entity=comics`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify({ id, is_archived: isArchived }),
  });
}

export async function fetchCharacters(): Promise<Character[]> {
  const userId = getUserId();
  if (!userId) return [];
  const resp = await fetch(`${API.userData}?entity=characters`, {
    headers: { "X-User-Id": userId },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  return data.characters;
}

export async function createCharacter(char: { name: string; description: string; style: string }) {
  const userId = getUserId();
  if (!userId) return null;
  const resp = await fetch(`${API.userData}?entity=characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify(char),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error);
  return data.character as Character;
}

export async function removeCharacter(id: number) {
  const userId = getUserId();
  if (!userId) return;
  await fetch(`${API.userData}?entity=characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify({ action: "remove", id }),
  });
}

export default API;
