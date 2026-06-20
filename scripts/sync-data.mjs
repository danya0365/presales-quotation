// ก๊อป data.json ทุกใบประเมินจาก presales/output → ./data (snapshot ที่ commit ไป deploy บน Vercel)
// รัน: npm run sync:data   (หรือ PRESALES_OUTPUT=/abs/path npm run sync:data)
import fs from "node:fs";
import path from "node:path";

const SRC =
  process.env.PRESALES_OUTPUT ??
  path.resolve(process.cwd(), "..", "..", "ai-agents", "presales", "output");
const DEST = path.join(process.cwd(), "data");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!fs.existsSync(SRC)) {
  console.error(`✗ ไม่พบโฟลเดอร์ source: ${SRC}`);
  console.error(`  ตั้ง env PRESALES_OUTPUT ชี้ไป presales/output แล้วลองใหม่`);
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });

let copied = 0;
for (const id of fs.readdirSync(SRC)) {
  if (!UUID_RE.test(id)) continue;
  const srcFile = path.join(SRC, id, "data.json");
  if (!fs.existsSync(srcFile)) continue;
  const destDir = path.join(DEST, id);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcFile, path.join(destDir, "data.json"));
  console.log(`✓ ${id}`);
  copied++;
}

console.log(`\nก๊อปแล้ว ${copied} โปรเจกต์ → ${path.relative(process.cwd(), DEST)}/`);
if (copied === 0) console.warn("⚠ ไม่มีใบประเมินให้ก๊อปเลย");
