export const THEME_KEY = 'enbrioatlas:theme';

/**
 * Runs before first paint (inlined in the root layout) so a light reader never sees a dark flash.
 * Kept as a string: it must not depend on the bundle.
 */
export const themeScript = `try{var p=localStorage.getItem('${THEME_KEY}')||'system';var t=p==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):p;document.documentElement.dataset.theme=t}catch(e){}`;
