// Tipos mínimos do lib.mjs do kit (usado pelo app em TypeScript, 050 D).
export const KIT: string;
export const HUB: string;
export function video(arg: string): { dir: string; file: string; tl: { scenes: { use?: string }[]; [k: string]: unknown }; slug: string | null; companyDir: string | null; name: string; save: () => void };
