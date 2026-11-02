export type PageReport = { label: string; fits: boolean; itemsOver?: number; reason?: string };
export type BuildResult = { ok: boolean; report: PageReport[]; floorPt: number; theme: string; pdf?: Uint8Array; printPdf?: Uint8Array; printCopiesPdf?: Uint8Array };
export const THEME_IDS: string[];
export function buildMenu(menu: unknown, themeId: string): Promise<BuildResult>;
