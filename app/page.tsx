import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[#F4F1EA] px-6 text-center text-[#2D3A3A]">
      <span className="mb-4 inline-block rounded-full bg-[#E5EEE2] px-4 py-1 text-xs uppercase tracking-widest text-[#4F7A52]">
        Presales · Khadijah
      </span>
      <h1 className="max-w-xl text-3xl font-bold leading-snug text-[#2F605B]">
        ระบบใบประเมินราคา
      </h1>
      <p className="mt-3 max-w-md text-[#5C6A68]">
        รวมใบประเมินค่าใช้จ่ายของทุกโปรเจกต์ — วิเคราะห์ระบบ แตกโมดูล และตีราคาแบบมีที่มา
      </p>
      <Link
        href="/project"
        className="mt-8 rounded-full bg-[#3E7C76] px-7 py-3 font-medium text-white transition hover:bg-[#2F605B]"
      >
        ดูรายการโปรเจกต์ →
      </Link>
    </main>
  );
}
