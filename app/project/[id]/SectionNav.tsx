"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

// แถบสารบัญแบบ pin ติดบนจอ + scroll-spy ไฮไลต์ section ที่กำลังอ่าน + ปุ่มขึ้นบนสุด
export default function SectionNav({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState(toc[0]?.id ?? "");
  const [showTop, setShowTop] = useState(false);

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

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-[#DED8C8] bg-[#FBFAF6]/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="mr-2 flex-none text-xs font-semibold uppercase tracking-widest text-[#2F605B]">
              สารบัญ
            </span>
            {toc.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex-none rounded-full px-3 py-1 text-sm font-medium transition ${
                  active === s.id
                    ? "bg-[#3E7C76] text-white"
                    : "text-[#2D3A3A] hover:bg-[#EAE6DA]"
                }`}
              >
                {i + 1}. {s.label}
              </a>
            ))}
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
