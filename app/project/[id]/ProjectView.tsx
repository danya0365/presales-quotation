import Link from "next/link";
import { totals, sumMd, fmtTHB, type Project } from "@/app/lib/projects";

export type Audience = "client" | "internal";

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
  id,
  n,
  title,
  sub,
  children,
}: {
  id?: string;
  n: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-7 scroll-mt-24 rounded-2xl border border-[#DED8C8] bg-[#FBFAF6] p-6 shadow-sm sm:p-8"
    >
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

export default function ProjectView({
  p,
  audience,
}: {
  p: Project;
  audience: Audience;
}) {
  const internal = audience === "internal";
  const t = totals(p);
  const contFactor = p.contingencyPct / 100;

  // เวอร์ชันลูกค้า: ตัด role ภายในในวงเล็บออกจากชื่อผู้จัดทำ
  const preparedByRaw = p.preparedBy ?? "เคาะดีญะฮ์";
  const preparedBy = internal ? preparedByRaw : preparedByRaw.replace(/\s*\(.*\)\s*$/, "");

  // เวอร์ชันลูกค้า: ตัดรหัสโมดูลภายในแบบ "(M-07)" ที่อาจฝังใน free-text ออก
  const clean = (s: string) => (internal ? s : s.replace(/\s*\(M-\d+\)/g, ""));

  // สารบัญ — เฉพาะหัวข้อที่หน้านี้แสดงจริง (ลูกค้าไม่มี Timeline/Stack)
  const toc = [
    { id: "overview", label: "ภาพรวม & เป้าหมาย" },
    { id: "scope", label: "ขอบเขตงาน" },
    { id: "actors", label: "ผู้ใช้ & บทบาท" },
    { id: "modules", label: internal ? "โมดูล & man-day" : "ขอบเขตฟีเจอร์" },
    { id: "pricing", label: "สรุปราคา" },
    ...(internal && p.timeline ? [{ id: "timeline", label: "Timeline & Stack" }] : []),
    { id: "notes", label: "สมมติฐาน & ความเสี่ยง" },
  ];

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#2D3A3A]">
      {/* Hero */}
      <header className="border-b-4 border-[#C98A3B] bg-gradient-to-br from-[#2F605B] to-[#3E7C76] px-6 py-12 text-center text-[#F4F1EA]">
        <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-widest">
          {internal ? "Presales · Solution Analysis" : "ข้อเสนอโครงการ"}
        </span>
        <h1 className="mx-auto max-w-3xl text-2xl font-bold sm:text-3xl">{p.projectName}</h1>
        <p className="mt-2 opacity-90">{p.client}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">📅 {p.date}</span>
          <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">✍️ {preparedBy}</span>
          {internal && p.docVersion && (
            <span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5">
              📄 {p.docVersion}
            </span>
          )}
        </div>
      </header>

      {/* สารบัญ — กดแล้วเลื่อนไปหัวข้อ (smooth scroll) */}
      <div className="px-5">
        <nav className="mx-auto -mt-7 mb-2 max-w-4xl rounded-2xl border border-[#DED8C8] bg-[#FBFAF6] px-6 py-4 shadow-lg">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#2F605B]">
            สารบัญ
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {toc.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="border-b-2 border-transparent pb-0.5 text-sm font-medium text-[#2D3A3A] transition hover:border-[#C98A3B] hover:text-[#3E7C76]"
              >
                {i + 1}. {s.label}
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {internal && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/project"
              className="text-sm font-medium text-[#3E7C76] hover:underline"
            >
              ← กลับไปรายการโปรเจกต์
            </Link>
            <Link
              href={`/project/${p.id}`}
              className="rounded-lg border border-[#C98A3B] px-3 py-1.5 text-sm font-medium text-[#B5762E] hover:bg-[#F6ECCF]"
            >
              👁 ดูเวอร์ชันลูกค้า (ลิงก์ที่ส่งให้ลูกค้า)
            </Link>
          </div>
        )}

        {/* Price hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#C98A3B] to-[#B5762E] px-6 py-7 text-center text-white shadow-lg">
          <div className="text-xs uppercase tracking-widest opacity-90">
            ช่วงราคารวมทั้งโครงการ (ก่อน VAT)
          </div>
          <div className="my-1 text-3xl font-bold">
            ≈ {fmtTHB(p.summary.priceLow)} – {fmtTHB(p.summary.priceHigh)} บาท
          </div>
          {internal && <div className="text-sm opacity-90">{p.summary.scopeNote}</div>}
        </div>

        {/* 1. Overview */}
        <Section id="overview" n="1" title="ภาพรวม & เป้าหมายธุรกิจ">
          <p className="leading-relaxed">{clean(p.overview)}</p>
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
          {internal && (
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
          )}
        </Section>

        {/* 2. Scope */}
        <Section
          id="scope"
          n="2"
          title="ขอบเขตงาน (Scope)"
          sub={internal ? "แยก in/out ให้ชัด — กันงานบานปลาย" : undefined}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#bcd3b8] bg-[#E5EEE2] p-5">
              <h3 className="mb-2 font-semibold text-[#4F7A52]">✅ อยู่ในขอบเขต</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {p.scope.in.map((s, i) => (
                  <li key={i}>{clean(s)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#e3c4b8] bg-[#F2E0D8] p-5">
              <h3 className="mb-2 font-semibold text-[#A8543F]">⛔ อยู่นอกขอบเขต</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {p.scope.out.map((s, i) => (
                  <li key={i}>{clean(s)}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* 3. Actors */}
        <Section id="actors" n="3" title="ผู้ใช้ & บทบาท (Actors)">
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
                    <td className="border-b border-[#DED8C8] p-3">{clean(a.can)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4. Modules */}
        <Section
          id="modules"
          n="4"
          title={internal ? "โมดูล & ประเมิน man-day" : "ขอบเขตฟีเจอร์ (โมดูล)"}
          sub={internal ? "ฐานของการตีราคา — man-day เป็นช่วง low–high" : undefined}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-[#2F605B] text-left text-white">
                  {internal && <th className="p-3">กลุ่ม</th>}
                  {internal && <th className="p-3">รหัส</th>}
                  <th className="p-3">โมดูล</th>
                  {internal && <th className="p-3">ความซับซ้อน</th>}
                  {internal && <th className="p-3 text-right">md low</th>}
                  {internal && <th className="p-3 text-right">md high</th>}
                </tr>
              </thead>
              <tbody>
                {p.modules.map((m, i) => (
                  <tr key={i} className={i % 2 ? "bg-[#F7F4EC]" : ""}>
                    {internal && (
                      <td className="border-b border-[#DED8C8] p-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#C98A3B] text-xs font-bold text-white">
                          {m.group}
                        </span>
                      </td>
                    )}
                    {internal && (
                      <td className="border-b border-[#DED8C8] p-3 font-mono text-xs">{m.code}</td>
                    )}
                    <td className="border-b border-[#DED8C8] p-3">
                      <div className="font-medium">{clean(m.name)}</div>
                      <div className="text-xs text-[#5C6A68]">{clean(m.desc)}</div>
                    </td>
                    {internal && (
                      <td className="border-b border-[#DED8C8] p-3">{complexityBadge(m.complexity)}</td>
                    )}
                    {internal && (
                      <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{m.mdLow}</td>
                    )}
                    {internal && (
                      <td className="border-b border-[#DED8C8] p-3 text-right tabular-nums">{m.mdHigh}</td>
                    )}
                  </tr>
                ))}
                {internal && (
                  <tr className="bg-[#EAE6DA] font-bold text-[#2F605B]">
                    <td className="p-3" colSpan={4}>
                      รวมงานพัฒนา (Subtotal)
                    </td>
                    <td className="p-3 text-right tabular-nums">{t.dev.low}</td>
                    <td className="p-3 text-right tabular-nums">{t.dev.high}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {internal && p.groupLegend && (
            <p className="mt-2 text-xs text-[#5C6A68]">
              {Object.entries(p.groupLegend).map(([k, v]) => (
                <span key={k} className="mr-3">
                  <strong>{k}</strong> {v}
                </span>
              ))}
            </p>
          )}
        </Section>

        {/* 5. Pricing */}
        {internal ? (
          <Section id="pricing" n="5" title="งานสนับสนุน & สรุปราคา" sub="ทุกตัวเลขมีที่มา: ราคา ← man-day ← module">
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
        ) : (
          <Section id="pricing" n="5" title="สรุปราคา">
            <div className="rounded-2xl border border-[#DED8C8] bg-white p-6 text-center">
              <div className="text-sm text-[#5C6A68]">ราคารวมทั้งโครงการ (ก่อน VAT)</div>
              <div className="my-1 text-2xl font-bold text-[#B5762E]">
                ≈ {fmtTHB(p.summary.priceLow)} – {fmtTHB(p.summary.priceHigh)} บาท
              </div>
              <div className="text-xs text-[#5C6A68]">ราคาเป็นช่วงประมาณการ ยังไม่รวม VAT</div>
            </div>
          </Section>
        )}

        {/* 6. Timeline & Stack — internal only */}
        {internal && p.timeline && (
          <Section id="timeline" n="6" title="Timeline & เปรียบเทียบ Stack" sub={p.timeline.teamAssumption}>
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
        <Section
          id="notes"
          n={internal ? "7" : "6"}
          title={
            internal
              ? "สมมติฐาน · ความเสี่ยง · คำถามที่ต้องถามเพิ่ม"
              : "สมมติฐาน · ความเสี่ยง · ข้อมูลเพิ่มเติม"
          }
        >
          <h3 className="mb-2 font-semibold text-[#2F605B]">สมมติฐาน (Assumptions)</h3>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
            {p.assumptions.map((a, i) => (
              <li key={i}>{clean(a)}</li>
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
                    <td className="border-b border-[#DED8C8] p-3">{clean(r.risk)}</td>
                    <td className="border-b border-[#DED8C8] p-3">{clean(r.impact)}</td>
                    <td className="border-b border-[#DED8C8] p-3">{r.likelihood}</td>
                    <td className="border-b border-[#DED8C8] p-3">{clean(r.mitigation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 font-semibold text-[#2F605B]">
            {internal ? "คำถามที่ต้องถามลูกค้าเพิ่ม" : "ข้อมูลที่ต้องการเพิ่มเติม"}
          </h3>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
            {p.openQuestions.map((q, i) => (
              <li key={i}>{clean(q)}</li>
            ))}
          </ul>

          <h3 className="mb-2 font-semibold text-[#2F605B]">สิ่งที่ไม่รวมในราคานี้</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {p.outOfPrice.map((o, i) => (
              <li key={i}>{clean(o)}</li>
            ))}
          </ul>
        </Section>

        <div className="text-center text-sm text-[#5C6A68]">
          {internal && (
            <p className="rounded-lg border border-[#DED8C8] bg-[#FBFAF6] px-4 py-2 font-mono text-xs">
              ใบเสนอ standalone: presales/output/{p.id}/output.html
            </p>
          )}
          <p className="mt-2">
            จัดทำโดย {preparedBy} · ราคาเป็นช่วง ยังไม่รวม VAT
            {internal ? ` · อ้างอิงต้นทาง ${p.source}` : ""}
          </p>
        </div>
      </div>
    </main>
  );
}
