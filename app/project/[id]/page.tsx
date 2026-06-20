import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProject,
  totals,
  sumMd,
  fmtTHB,
  type Project,
} from "@/app/lib/projects";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getProject(id);
  return {
    title: p ? `${p.projectName} — ใบประเมินราคา` : "ไม่พบโปรเจกต์",
  };
}

function complexityBadge(c: string) {
  const low = /low|ต่ำ/i.test(c);
  const high = /high|สูง/i.test(c);
  const cls = high
    ? "bg-[#F2E0D8] text-[#A8543F]"
    : low
      ? "bg-[#E5EEE2] text-[#4F7A52]"
      : "bg-[#F6ECCF] text-[#C98A3B]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {c}
    </span>
  );
}

function Section({
  n,
  title,
  sub,
  children,
}: {
  n: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7 rounded-2xl border border-[#DED8C8] bg-[#FBFAF6] p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center text-xl font-bold text-[#2F605B]">
        <span className="mr-3 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#3E7C76] text-base font-bold text-white">
          {n}
        </span>
        {title}
      </h2>
      {sub ? <p className="ml-12 mb-4 text-sm text-[#5C6A68]">{sub}</p> : <div className="mb-3" />}
      {children}
    </section>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const p: Project | null = getProject(id);
  if (!p) notFound();

  const t = totals(p);
  const contFactor = p.contingencyPct / 100;

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#2D3A3A]">
      {/* Hero */}
      <header className="border-b-4 border-[#C98A3B] bg-gradient-to-br from-[#2F605B] to-[#3E7C76] px-6 py-12 text-center text-[#F4F1EA]">
        <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-widest">
          Presales · Solution Analysis
        </span>
        <h1 className="mx-auto max-w-3xl text-2xl font-bold sm:text-3xl">{p.projectName}</h1>
        <p className="mt-2 opacity-90">{p.client}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">📅 {p.date}</span>
          {p.preparedBy && (
            <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">
              ✍️ {p.preparedBy}
            </span>
          )}
          {p.docVersion && (
            <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">
              📄 {p.docVersion}
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/project"
          className="mb-6 inline-block text-sm font-medium text-[#3E7C76] hover:underline"
        >
          ← กลับไปรายการโปรเจกต์
        </Link>

        {/* Price hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#C98A3B] to-[#B5762E] px-6 py-7 text-center text-white shadow-lg">
          <div className="text-xs uppercase tracking-widest opacity-90">
            ช่วงราคารวมทั้งโครงการ (ก่อน VAT)
          </div>
          <div className="my-1 text-3xl font-bold">
            ≈ {fmtTHB(p.summary.priceLow)} – {fmtTHB(p.summary.priceHigh)} บาท
          </div>
          <div className="text-sm opacity-90">{p.summary.scopeNote}</div>
        </div>

        {/* 1. Overview */}
        <Section n="1" title="ภาพรวม & เป้าหมายธุรกิจ">
          <p className="leading-relaxed">{p.overview}</p>
          {p.businessGoal && (
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <strong className="text-[#2F605B]">ปัญหาที่แก้:</strong>{" "}
                {p.businessGoal.problem}
              </li>
              <li>
                <strong className="text-[#2F605B]">ตัววัดความสำเร็จ:</strong>{" "}
                {p.businessGoal.successMetric}
              </li>
            </ul>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "man-day รวม", v: `${t.totalLow}–${t.totalHigh}` },
              { k: "โมดูลพัฒนา", v: `${p.modules.length}` },
              { k: "Contingency", v: `${p.contingencyPct}%` },
              { k: "เรตที่ใช้", v: `${p.rates.length} ระดับ` },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-[#DED8C8] bg-white p-4 text-center">
                <div className="text-xl font-bold text-[#3E7C76]">{s.v}</div>
                <div className="text-xs text-[#5C6A68]">{s.k}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Scope */}
        <Section n="2" title="ขอบเขตงาน (Scope)" sub="แยก in/out ให้ชัด — กันงานบานปลาย">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#bcd3b8] bg-[#E5EEE2] p-5">
              <h3 className="mb-2 font-semibold text-[#4F7A52]">✅ อยู่ในขอบเขต</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {p.scope.in.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#e3c4b8] bg-[#F2E0D8] p-5">
              <h3 className="mb-2 font-semibold text-[#A8543F]">⛔ อยู่นอกขอบเขต</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {p.scope.out.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* 3. Actors */}
        <Section n="3" title="ผู้ใช้ & บทบาท (Actors)">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  <th className="p-3">บทบาท</th>
                  <th className="p-3">ทำอะไรได้</th>
                </tr>
              </thead>
              <tbody>
                {p.actors.map((a, i) => (
                  <tr key={i} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    <td className="border-b border-[#DED8C8] p-3 font-medium">{a.role}</td>
                    <td className="border-b border-[#DED8C8] p-3">{a.can}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4. Modules + man-day */}
        <Section
          n="4"
          title="โมดูล & ประเมิน man-day"
          sub="ฐานของการตีราคา — man-day เป็นช่วง low–high"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  <th className="p-3">กลุ่ม</th>
                  <th className="p-3">รหัส</th>
                  <th className="p-3">โมดูล</th>
                  <th className="p-3">ความซับซ้อน</th>
                  <th className="p-3 text-right">md low</th>
                  <th className="p-3 text-right">md high</th>
                </tr>
              </thead>
              <tbody>
                {p.modules.map((m, i) => (
                  <tr key={m.code} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    <td className="border-b border-[#DED8C8] p-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#C98A3B] text-xs font-bold text-white">
                        {m.group}
                      </span>
                    </td>
                    <td className="border-b border-[#DED8C8] p-3 font-mono text-xs">{m.code}</td>
                    <td className="border-b border-[#DED8C8] p-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-[#5C6A68]">{m.desc}</div>
                    </td>
                    <td className="border-b border-[#DED8C8] p-3">{complexityBadge(m.complexity)}</td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{m.mdLow}</td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{m.mdHigh}</td>
                  </tr>
                ))}
                <tr className="bg-[#EAE6DA] font-bold text-[#2F605B]">
                  <td className="p-3" colSpan={4}>
                    รวมงานพัฒนา (Subtotal)
                  </td>
                  <td className="p-3 text-right tabular-nums">{t.dev.low}</td>
                  <td className="p-3 text-right tabular-nums">{t.dev.high}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {p.groupLegend && (
            <p className="mt-2 text-xs text-[#5C6A68]">
              {Object.entries(p.groupLegend).map(([k, v]) => (
                <span key={k} className="mr-3">
                  <strong>{k}</strong> {v}
                </span>
              ))}
            </p>
          )}
        </Section>

        {/* 5. Support + totals + price */}
        <Section n="5" title="งานสนับสนุน & สรุปราคา" sub="ทุกตัวเลขมีที่มา: ราคา ← man-day ← module">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  <th className="p-3">งานสนับสนุน (non-feature)</th>
                  <th className="p-3 text-right">md low</th>
                  <th className="p-3 text-right">md high</th>
                </tr>
              </thead>
              <tbody>
                {p.support.map((s, i) => (
                  <tr key={i} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    <td className="border-b border-[#DED8C8] p-3">{s.name}</td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{s.mdLow}</td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{s.mdHigh}</td>
                  </tr>
                ))}
                <tr className="bg-[#EAE6DA] font-bold text-[#2F605B]">
                  <td className="p-3">รวมงานสนับสนุน</td>
                  <td className="p-3 text-right tabular-nums">{sumMd(p.support).low}</td>
                  <td className="p-3 text-right tabular-nums">{sumMd(p.support).high}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* man-day summary */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <tbody>
                <tr>
                  <td className="border-b border-[#DED8C8] p-3">รวมย่อย (dev + support)</td>
                  <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{t.subtotalLow}</td>
                  <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{t.subtotalHigh}</td>
                </tr>
                <tr>
                  <td className="border-b border-[#DED8C8] p-3">+ Contingency {p.contingencyPct}%</td>
                  <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">
                    {Math.round(t.subtotalLow * contFactor)}
                  </td>
                  <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">
                    {Math.round(t.subtotalHigh * contFactor)}
                  </td>
                </tr>
                <tr className="bg-[#3E7C76] font-bold text-white">
                  <td className="p-3">รวม man-day ทั้งสิ้น</td>
                  <td className="p-3 text-right tabular-nums">~{t.totalLow}</td>
                  <td className="p-3 text-right tabular-nums">~{t.totalHigh}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* price by rate */}
          <h3 className="mt-6 mb-2 font-semibold text-[#2F605B]">ราคา (ก่อน VAT) ตามเรต</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  <th className="p-3">เรต man-day</th>
                  <th className="p-3 text-right">ราคา low</th>
                  <th className="p-3 text-right">ราคา high</th>
                </tr>
              </thead>
              <tbody>
                {p.rates.map((r, i) => (
                  <tr key={r.label} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    <td className="border-b border-[#DED8C8] p-3">
                      {r.label} · {fmtTHB(r.rate)} บาท/วัน
                    </td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">
                      {fmtTHB(t.totalLow * r.rate)}
                    </td>
                    <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">
                      {fmtTHB(t.totalHigh * r.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {p.phasing && (
            <div className="mt-5 rounded-xl border-l-4 border-[#3E7C76] bg-[#E5EEE2] p-4 text-sm">
              <strong className="text-[#2F605B]">คำแนะนำ — แบ่งเฟส:</strong> {p.phasing.recommend}
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>เฟส 1:</strong> {p.phasing.phase1}
                </li>
                <li>
                  <strong>เฟส 2:</strong> {p.phasing.phase2}
                </li>
              </ul>
            </div>
          )}
        </Section>

        {/* 6. Timeline */}
        {p.timeline && (
          <Section n="6" title="Timeline & เปรียบเทียบ Stack" sub={p.timeline.teamAssumption}>
            <p className="mb-4 text-sm">{p.timeline.elapsedNote}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {p.timeline.stacks.map((s, i) => (
                <div
                  key={s.name}
                  className={`rounded-xl border border-[#DED8C8] bg-white p-5 ${
                    i === 0 ? "border-t-4 border-t-[#3E7C76]" : "border-t-4 border-t-[#C98A3B]"
                  }`}
                >
                  <h4 className="text-base font-bold">{s.name}</h4>
                  <p className="mb-2 text-sm text-[#5C6A68]">⏱ {s.elapsed}</p>
                  <ul className="space-y-1 text-sm">
                    {s.pros.map((x, j) => (
                      <li key={`p${j}`} className="text-[#4F7A52]">
                        ✓ {x}
                      </li>
                    ))}
                    {s.cons.map((x, j) => (
                      <li key={`c${j}`} className="text-[#A8543F]">
                        – {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border-l-4 border-[#C98A3B] bg-[#F6ECCF] p-4 text-sm">
              <strong className="text-[#2F605B]">สรุป:</strong> {p.timeline.verdict}
            </div>
          </Section>
        )}

        {/* 7. Assumptions / Risks / Open Q / Out of price */}
        <Section n="7" title="สมมติฐาน · ความเสี่ยง · คำถามที่ต้องถามเพิ่ม">
          <h3 className="mb-2 font-semibold text-[#2F605B]">สมมติฐาน (Assumptions)</h3>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
            {p.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          <h3 className="mb-2 font-semibold text-[#2F605B]">ความเสี่ยง (Risks)</h3>
          <div className="mb-5 overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  <th className="p-3">ความเสี่ยง</th>
                  <th className="p-3">ผลกระทบ</th>
                  <th className="p-3">โอกาส</th>
                  <th className="p-3">แนวทางรับมือ</th>
                </tr>
              </thead>
              <tbody>
                {p.risks.map((r, i) => (
                  <tr key={i} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    <td className="border-b border-[#DED8C8] p-3">{r.risk}</td>
                    <td className="border-b border-[#DED8C8] p-3">{r.impact}</td>
                    <td className="border-b border-[#DED8C8] p-3">{r.likelihood}</td>
                    <td className="border-b border-[#DED8C8] p-3">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 font-semibold text-[#2F605B]">คำถามที่ต้องถามลูกค้าเพิ่ม</h3>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
            {p.openQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>

          <h3 className="mb-2 font-semibold text-[#2F605B]">สิ่งที่ไม่รวมในราคานี้</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {p.outOfPrice.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </Section>

        <div className="text-center text-sm text-[#5C6A68]">
          <p className="rounded-lg border border-[#DED8C8] bg-[#FBFAF6] px-4 py-2 font-mono text-xs">
            ใบเสนอ standalone: presales/output/{p.id}/output.html
          </p>
          <p className="mt-2">
            จัดทำโดย {p.preparedBy ?? "เคาะดีญะฮ์"} · ราคาเป็นช่วง ยังไม่รวม VAT ·
            อ้างอิงต้นทาง {p.source}
          </p>
        </div>
      </div>
    </main>
  );
}
