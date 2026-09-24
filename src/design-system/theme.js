// Theme runtime — injecte les variables CSS des tokens (light + dark) et gère
// la bascule. Les valeurs viennent de tokens.js (source unique) : light et dark
// restent en phase automatiquement, aucune duplication de hex dans le CSS.
//
// Mécanique : `colors.X` (tokens.js) renvoie `var(--x, #fallback)` et
// tailwind.config référence les mêmes vars → tout l'app (styles inline ET
// classes) bascule quand `.dark` est posé sur <html>.
import { cssVarsLight, cssVarsDark } from './tokens';

// Clé bumpée en -2 : l'ancienne version persistait le mode auto-détecté (système)
// comme s'il était un choix explicite → un dark système restait « collé ». La
// nouvelle clé repart propre : light par défaut tant qu'on n'a pas cliqué le toggle.
const STORAGE_KEY = 'ds-theme-2';

const block = (selector, vars) =>
  `${selector}{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`;

// Injecte une feuille <style> unique : :root (light) + .dark (dark).
export function installThemeVars() {
  if (typeof document === 'undefined' || document.getElementById('ds-theme-vars')) return;
  const style = document.createElement('style');
  style.id = 'ds-theme-vars';
  style.textContent =
    block(':root', cssVarsLight) +
    block('.dark', cssVarsDark) +
    ':root{color-scheme:light}.dark{color-scheme:dark}';
  document.head.appendChild(style);
}

export function getStoredTheme() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

// Préférence : LIGHT par défaut. Le dark est opt-in (toggle explicite mémorisé).
// On ne suit PAS `prefers-color-scheme` : le prototype reste en light tant que
// personne n'a basculé, pour éviter un dark non voulu (et encore en rodage).
export function resolveTheme() {
  const stored = getStoredTheme();
  return stored === 'dark' ? 'dark' : 'light';
}

// persist = true seulement pour un choix explicite (toggle). L'application du
// défaut au démarrage NE persiste PAS (sinon le défaut se fige comme un choix).
export function applyTheme(mode, persist = false) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', mode === 'dark');
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }
}

export function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next, true); // choix explicite → mémorisé
  return next;
}

// À appeler une fois au démarrage (avant le premier render) pour éviter le FOUC.
export function initTheme() {
  installThemeVars();
  applyTheme(resolveTheme()); // défaut light, non persisté
}
