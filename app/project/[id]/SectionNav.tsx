"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

// แถบสารบัญแบบ pin ติดบนจอ + scroll-spy ไฮไลต์ section ที่กำลังอ่าน + ปุ่มขึ้นบนสุด
// ≥ md = tab หลายแถว (wrap, เห็นครบ ไม่ต้องเลื่อน) · < md = custom dropdown
export default function SectionNav({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState(toc[0]?.id ?? "");
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));

    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [toc]);

  const activeIdx = Math.max(
    0,
    toc.findIndex((t) => t.id === active),
  );
  const activeItem = toc[activeIdx];

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-[#DED8C8] bg-[#FBFAF6]/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-4xl px-5">
          {/* ── Desktop (≥ md): tab หลายแถว wrap ── */}
          <div className="hidden flex-wrap items-center gap-1.5 py-2.5 md:flex">
            <span className="mr-1 flex-none text-xs font-semibold uppercase tracking-widest text-[#2F605B]">
              สารบัญ
            </span>
            {toc.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  active === s.id
                    ? "bg-[#3E7C76] text-white"
                    : "text-[#2D3A3A] hover:bg-[#EAE6DA]"
                }`}
              >
                {i + 1}. {s.label}
              </a>
            ))}
          </div>

          {/* ── Mobile (< md): custom dropdown ── */}
          <div className="relative py-2 md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#DED8C8] bg-white px-4 py-2.5 text-left shadow-sm"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#2D3A3A]">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#2F605B]">
                  สารบัญ
                </span>
                <span className="mx-2 text-[#DED8C8]">·</span>
                {activeItem ? `${activeIdx + 1}. ${activeItem.label}` : "—"}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 flex-none text-[#2F605B] transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M5 8l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <>
                {/* overlay ปิดเมื่อคลิกนอก */}
                <button
                  type="button"
                  aria-label="ปิดสารบัญ"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-50 mt-1.5 max-h-[60vh] overflow-y-auto rounded-xl border border-[#DED8C8] bg-[#FBFAF6] p-1.5 shadow-lg"
                >
                  {toc.map((s, i) => (
                    <li key={s.id} role="option" aria-selected={active === s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                          active === s.id
                            ? "bg-[#3E7C76] text-white"
                            : "text-[#2D3A3A] hover:bg-[#EAE6DA]"
                        }`}
                      >
                        {i + 1}. {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </nav>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ขึ้นบนสุด"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#2F605B] text-lg text-white shadow-lg transition hover:bg-[#3E7C76]"
        >
          ↑
        </button>
      )}
    </>
  );
}
