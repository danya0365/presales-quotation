import fs from "node:fs";
import path from "node:path";

// หาตำแหน่งโฟลเดอร์ data ตามลำดับ:
//   1) env PRESALES_OUTPUT (absolute path) — override เองได้
//   2) presales/output ของจริง (เครื่อง dev: 2 repo อยู่ติดกัน) — source of truth
//   3) ./data ที่ bundle มากับ repo (Vercel/standalone: deploy แค่ repo เดียว ไม่มี presales/output)
// gen snapshot ข้อ 3 ด้วย `npm run sync:data` ก่อน deploy
function resolveOutputRoot(): string {
  if (process.env.PRESALES_OUTPUT) return process.env.PRESALES_OUTPUT;
  const live = path.resolve(process.cwd(), "..", "..", "ai-agents", "presales", "output");
  if (fs.existsSync(live)) return live;
  return path.join(process.cwd(), "data");
}
const OUTPUT_ROOT = resolveOutputRoot();

export type Module = {
  group: string;
  code: string;
  name: string;
  desc: string;
  complexity: string;
  mdLow: number;
  mdHigh: number;
};

export type SupportItem = { name: string; mdLow: number; mdHigh: number };
export type Rate = { label: string; rate: number };
export type Actor = { role: string; can: string };
export type Risk = { risk: string; impact: string; likelihood: string; mitigation: string };

export type StackInfo = {
  name: string;
  elapsed: string;
  pros: string[];
  cons: string[];
};

export type Project = {
  id: string;
  projectName: string;
  client: string;
  date: string;
  source: string;
  preparedBy?: string;
  docVersion?: string;
  currency: string;
  summary: {
    scopeNote: string;
    manDayLow: number;
    manDayHigh: number;
    priceLow: number;
    priceHigh: number;
  };
  overview: string;
  businessGoal?: { problem: string; successMetric: string };
  actors: Actor[];
  scope: { in: string[]; out: string[] };
  modules: Module[];
  support: SupportItem[];
  contingencyPct: number;
  rates: Rate[];
  manDayPerDay?: number;
  groupLegend?: Record<string, string>;
  timeline?: {
    teamAssumption: string;
    elapsedNote: string;
    stacks: StackInfo[];
    verdict: string;
  };
  phasing?: { recommend: string; phase1: string; phase2: string };
  assumptions: string[];
  risks: Risk[];
  openQuestions: string[];
  outOfPrice: string[];
};

// uuid v7 (และ v1-v8) ขึ้นต้นด้วย 8 hex + "-" — ใช้กรองโฟลเดอร์ที่ใช่
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readProjectFile(id: string): Project | null {
  const file = path.join(OUTPUT_ROOT, id, "data.json");
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export function getProject(id: string): Project | null {
  if (!UUID_RE.test(id)) return null;
  return readProjectFile(id);
}

export function getAllProjects(): Project[] {
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(OUTPUT_ROOT);
  } catch {
    return [];
  }
  return entries
    .filter((name) => UUID_RE.test(name))
    .map((id) => readProjectFile(id))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // ใหม่สุดอยู่บน
}

// ---- ตัวช่วยคำนวณ (ทุกตัวเลขผูกกับ module → ตรวจย้อนได้) ----
export function sumMd(items: { mdLow: number; mdHigh: number }[]) {
  return items.reduce(
    (acc, m) => ({ low: acc.low + m.mdLow, high: acc.high + m.mdHigh }),
    { low: 0, high: 0 },
  );
}

export function totals(p: Project) {
  const dev = sumMd(p.modules);
  const support = sumMd(p.support);
  const subtotalLow = dev.low + support.low;
  const subtotalHigh = dev.high + support.high;
  const factor = 1 + p.contingencyPct / 100;
  const totalLow = Math.round(subtotalLow * factor);
  const totalHigh = Math.round(subtotalHigh * factor);
  return { dev, support, subtotalLow, subtotalHigh, totalLow, totalHigh };
}

export function fmtTHB(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}
