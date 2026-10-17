import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const ID = /^[a-z0-9][a-z0-9-]*$/;

/** Dev-only endpoint the mapping tool uses to save a section's hotspots to src/data/geometry/. */
function mapperSave(): Plugin {
  return {
    name: 'mapper-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__mapper/save', async (req, res) => {
        const fail = (code: number, msg: string) => {
          res.statusCode = code;
          res.end(msg);
        };
        if (req.method !== 'POST') return fail(405, 'POST only');
        let body = '';
        for await (const chunk of req) body += chunk;
        let data: { section?: unknown; hotspots?: unknown };
        try {
          data = JSON.parse(body);
        } catch {
          return fail(400, 'Bad JSON');
        }
        const { section, hotspots } = data;
        if (typeof section !== 'string' || !ID.test(section)) return fail(400, 'Bad section id');
        if (!Array.isArray(hotspots)) return fail(400, 'hotspots must be an array');
        for (const h of hotspots) {
          const ok =
            h && typeof h.frame === 'string' && ID.test(h.frame) && Array.isArray(h.points) && h.points.length >= 3 &&
            h.points.every((p: unknown) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && n >= -0.05 && n <= 1.05));
          if (!ok) return fail(400, `Bad hotspot ${JSON.stringify(h?.frame)}`);
        }
        const file = path.resolve(process.cwd(), 'src/data/geometry', `${section}.json`);
        await writeFile(file, JSON.stringify({ section, hotspots }, null, 1) + '\n');
        res.end('saved');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mapperSave()],
});
