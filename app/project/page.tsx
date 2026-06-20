import Link from "next/link";
import type { Metadata } from "next";
import { getAllProjects, totals, fmtTHB } from "@/app/lib/projects";

// อ่านไฟล์ data.json จาก filesystem ตอน request → ไม่ prerender แบบ static
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ใบประเมินราคา — รายการโปรเจกต์",
  description: "รายการประเมินค่าใช้จ่ายทั้งหมด โดยเคาะดีญะฮ์ (Presales)",
};

export default function ProjectIndexPage() {
  const projects = getAllProjects();

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#2D3A3A]">
      <header className="border-b-4 border-[#C98A3B] bg-gradient-to-br from-[#2F605B] to-[#3E7C76] px-6 py-12 text-center text-[#F4F1EA]">
        <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-widest">
          Presales · Khadijah
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">รายการใบประเมินราคา</h1>
        <p className="mt-2 opacity-90">โปรเจกต์ที่ประเมินแล้วทั้งหมด — คลิกเพื่อดูรายละเอียด</p>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[#DED8C8] bg-[#FBFAF6] p-10 text-center text-[#5C6A68]">
            ยังไม่มีโปรเจกต์ที่ประเมิน — วางโจทย์ใน <code>presales/input/</code> แล้วสั่ง “ช่วยประเมินราคา”
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((p) => {
              const t = totals(p);
              return (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className="group block rounded-2xl border border-[#DED8C8] bg-[#FBFAF6] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#E5EEE2] px-3 py-1 text-xs font-semibold text-[#4F7A52]">
                      {p.date}
                    </span>
                    <span className="font-mono text-[11px] text-[#9aa49f]">
                      {p.id.slice(0, 8)}…
                    </span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-[#2F605B] group-hover:text-[#3E7C76]">
                    {p.projectName}
                  </h2>
                  <p className="mt-1 text-sm text-[#5C6A68]">{p.client}</p>
                  <p className="mt-3 text-sm text-[#5C6A68]">{p.summary.scopeNote}</p>

                  <div className="mt-4 rounded-xl bg-gradient-to-br from-[#C98A3B] to-[#B5762E] px-4 py-3 text-center text-white">
                    <div className="text-[11px] uppercase tracking-wide opacity-90">
                      ช่วงราคา (ก่อน VAT)
                    </div>
                    <div className="text-lg font-bold">
                      {fmtTHB(p.summary.priceLow)} – {fmtTHB(p.summary.priceHigh)} บาท
                    </div>
                    <div className="text-xs opacity-90">
                      ~{t.totalLow}–{t.totalHigh} man-day
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mx-auto max-w-5xl px-5 pb-12 text-center text-sm text-[#5C6A68]">
        จัดทำโดย เคาะดีญะฮ์ — Presales / Solution Architect · ราคาเป็นช่วง ยังไม่รวม VAT
      </footer>
    </main>
  );
}
