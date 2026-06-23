import fs from "node:fs";
import path from "node:path";

// หาตำแหน่งโฟลเดอร์ data ตามลำดับ:
//   1) env PRESALES_OUTPUT (absolute path) — override เอง (optional)
//   2) presales/output (เครื่อง dev ที่วาง 2 repo ติดกัน) — มี fs.existsSync guard, ไม่มีก็ข้าม
//   3) ./data ในตัว repo — **standalone default** (clone ไปที่ไหนก็ใช้อันนี้)
// repo นี้ standalone: ปกติใช้ข้อ 3 (data/ อยู่ใน repo) · ข้อ 2 ไว้ dev คู่ presales เท่านั้น
// วิธีสร้าง data.json ใหม่: ดู docs/quotation-spec.md
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
export type UseCase = { title: string; actor?: string; desc: string };
export type NonFunc = { key: string; label: string; detail?: string };

export type StackInfo = {
  name: string;
  elapsed: string;
  pros: string[];
  cons: string[];
};

// โหมดประเมิน "ถ้าให้ AI เขียนโค้ด" — คิดแยกจากของเดิม (คน) เป็นตัวเร่งบน module เดิม
// AI man-day = man-day คน ÷ ตัวเร่ง (factor) · คนเปลี่ยนบทเป็นผู้ควบคุม AI + รีวิว · เรตเท่าเดิม
export type AiModule = { code: string; aiMdLow: number; aiMdHigh: number; factor: string };
export type AiSupport = { name: string; aiMdLow: number; aiMdHigh: number };
export type AiEstimate = {
  approach: "speedup";
  factorNote: string; // อธิบายตัวเร่งที่ใช้ (ที่มาของวันที่ลด)
  roleNote: string; // บทใหม่ของคน เช่น "ผู้ควบคุม AI + รีวิว + เทสต์"
  modules: AiModule[]; // ผูกกับ modules[] เดิมผ่าน code
  support: AiSupport[];
  contingencyPct: number; // default 25 (ความแปรปรวนรีวิว/แก้งานสูงกว่าโหมดคน)
  rates: Rate[]; // = เรตเดิม (Junior–Expert) → ราคาลงเพราะวันน้อยลง ไม่ใช่เรตถูกลง
  summary: {
    manDayLow: number;
    manDayHigh: number;
    priceLow: number;
    priceHigh: number;
    elapsedNote: string; // เวลาจริงด้วย AI เช่น "~3–6 สัปดาห์"
  };
  assumptions?: string[];
  risks?: Risk[];
};

// แผนงานโปรเจกต์ (กำหนดการส่งมอบตามเวลา) — relative working day · คนละเรื่องกับ timeline ของ AI agent
export type SchedulePhase = {
  name: string;
  startDay: number; // วันเริ่ม (relative working day, 1-based)
  endDay: number;
  group?: string; // โยงกลุ่มโมดูล (A/B/...) ถ้ามี
  items: string[]; // งานหลักในเฟส
};
export type ProjectSchedule = {
  unit?: "day";
  daysPerWeek?: number; // default 5
  note?: string;
  phases: SchedulePhase[];
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
  useCases?: UseCase[];
  scope: { in: string[]; out: string[] };
  modules: Module[];
  nonFunctional?: NonFunc[];
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
  schedule?: ProjectSchedule; // แผนงานโปรเจกต์ (Gantt + ไทม์ไลน์) — relative working day
  assumptions: string[];
  risks: Risk[];
  openQuestions: string[];
  outOfPrice: string[];
  ai?: AiEstimate; // optional — ใบที่ไม่มีก็ render เดิมได้ (backward-compatible)
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

// ---- ตัวช่วยแผนงาน (schedule) — วาง Gantt ----
export function scheduleTotalDays(s: ProjectSchedule) {
  return Math.max(1, ...s.phases.map((ph) => ph.endDay));
}
export function scheduleWeeks(s: ProjectSchedule) {
  const perWeek = s.daysPerWeek && s.daysPerWeek > 0 ? s.daysPerWeek : 5;
  return Math.max(1, Math.ceil(scheduleTotalDays(s) / perWeek));
}
export function phasePos(
  phase: { startDay: number; endDay: number },
  totalDays: number,
) {
  const total = totalDays > 0 ? totalDays : 1;
  const start = Math.max(0, phase.startDay - 1);
  const span = Math.max(1, phase.endDay - phase.startDay + 1);
  return { leftPct: (start / total) * 100, widthPct: (span / total) * 100 };
}

// ---- ตัวช่วยคำนวณโหมด AI (คู่ขนานกับ totals() — ไม่แตะของเดิม) ----
export function sumAiMd(items: { aiMdLow: number; aiMdHigh: number }[]) {
  return items.reduce(
    (acc, m) => ({ low: acc.low + m.aiMdLow, high: acc.high + m.aiMdHigh }),
    { low: 0, high: 0 },
  );
}

export function aiTotals(p: Project) {
  if (!p.ai) return null;
  const dev = sumAiMd(p.ai.modules);
  const support = sumAiMd(p.ai.support);
  const subtotalLow = dev.low + support.low;
  const subtotalHigh = dev.high + support.high;
  const factor = 1 + p.ai.contingencyPct / 100;
  const totalLow = Math.round(subtotalLow * factor);
  const totalHigh = Math.round(subtotalHigh * factor);
  return { dev, support, subtotalLow, subtotalHigh, totalLow, totalHigh };
}
