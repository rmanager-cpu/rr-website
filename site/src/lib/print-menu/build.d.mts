export type PageReport = { label: string; fits: boolean; itemsOver?: number; reason?: string };
/** widened: page numbers set in two columns so the menu fits ([] if it fit as laid out). */
export type BuildResult = { ok: boolean; report: PageReport[]; floorPt: number; theme: string; widened: number[]; pdf?: Uint8Array; printPdf?: Uint8Array; printCopiesPdf?: Uint8Array };
export type PdfMeta = { title: string; author?: string; subject?: string; keywords?: string[] };
export const THEME_IDS: string[];
export function buildMenu(menu: unknown, themeId: string, opts?: { meta?: PdfMeta }): Promise<BuildResult>;
export function buildFirstFit(menu: unknown, themeIds: string[], opts?: { meta?: PdfMeta; split?: number }): Promise<BuildResult & { pages: number }>;
export function checkThemes(menu: unknown, themeIds?: string[]): Promise<Record<string, { ok: boolean; widened: number[] }>>;
