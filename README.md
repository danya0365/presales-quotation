<div align="center">

# 📋 Presales Quotation

**เว็บแสดงผลใบประเมินราคาโปรเจกต์ (Presales Cost Estimation Viewer)**

แอปอ่านใบประเมินที่ "เคาะดีญะฮ์" (Presales / Solution Architect agent) สร้างไว้
แล้ว render เป็นหน้าใบเสนอราคาสวย ๆ ที่ตรวจย้อนกลับได้ทุกตัวเลข — _ราคาผูกกับ man-day, man-day ผูกกับ module, module ผูกกับ requirement_

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: Private](https://img.shields.io/badge/License-Private-lightgrey)](#-license)

</div>

---

## ✨ Features

- 🗂️ **ลิสต์ทุกโปรเจกต์อัตโนมัติ** — อ่านทุกใบประเมินจากโฟลเดอร์ data แล้วเรียงตามวันที่ (ใหม่สุดอยู่บน)
- 📄 **หน้าใบประเมินรายโปรเจกต์** — overview, scope, modules, man-day, ราคาช่วง (low–high), สมมติฐาน, ความเสี่ยง
- 🧮 **คำนวณสด ตรวจย้อนได้** — รวม man-day → คูณเรต → บวก contingency ผ่าน helper เดียวกัน ตัวเลขทุกบรรทัดมีที่มา
- 🔌 **Zero-config per project** — เพิ่มโปรเจกต์ใหม่แค่วางไฟล์ `data.json` ไม่ต้องแตะโค้ดเลย
- 🎨 **โทนกลาง อ่านสบาย** — UI ด้วย Tailwind v4, รองรับภาษาไทยเต็มรูปแบบ, จัดรูปแบบเงินบาท (`th-TH`)

---

## 🏗️ How It Works

แอปนี้เป็นแค่ **ตัว render** — _data_ อยู่คนละ tree (ในเวิร์กสเปซ `presales/`) แยกขาดจากตัวแอป
ทำให้ commit ราคา/ใบเสนอแยกจาก codebase ได้ และเปลี่ยน UI ได้โดยไม่แตะข้อมูล

```mermaid
flowchart LR
    A["presales/output/&lt;uuid&gt;/data.json<br/>(ใบประเมินที่ agent สร้าง)"] -->|"fs.readFileSync"| B["app/lib/projects.ts<br/>getProject / getAllProjects"]
    B -->|"totals() · fmtTHB()"| C["/project<br/>(ลิสต์)"]
    B -->|"totals() · fmtTHB()"| D["/project/&lt;uuid&gt;<br/>(ใบประเมิน 1 ใบ)"]
```

ตำแหน่งไฟล์ data หาเจอด้วย `OUTPUT_ROOT` ใน [`app/lib/projects.ts`](app/lib/projects.ts):

```ts
const OUTPUT_ROOT =
  process.env.PRESALES_OUTPUT ??                                  // 1) override ด้วย env (absolute path)
  path.resolve(process.cwd(), "..", "..", "ai-agents", "presales", "output"); // 2) default: relative กลับไปที่ presales/output
```

> โฟลเดอร์ที่ชื่อตรงกับ pattern ของ UUID (v7) เท่านั้นที่ถูกอ่าน — โฟลเดอร์อื่นถูกข้าม

---

## 📁 Project Structure

```
presales-quotation/
├── app/
│   ├── layout.tsx              # root layout + metadata
│   ├── page.tsx                # landing page
│   ├── globals.css             # Tailwind v4 + theme
│   ├── lib/
│   │   └── projects.ts         # 💡 หัวใจ: types + อ่าน data.json + helper คำนวณ
│   └── project/
│       ├── page.tsx            # /project        → ลิสต์ทุกโปรเจกต์
│       └── [id]/page.tsx       # /project/<uuid> → ใบประเมิน 1 โปรเจกต์
├── next.config.ts
├── tsconfig.json               # path alias "@/*"
└── package.json
```

> 📌 **ข้อมูลอยู่ใน `data/<uuid>/data.json` ของ repo นี้** (standalone — มีตัวอย่าง 3 ใบให้แล้ว) ·
> วิธีสร้าง `data.json` ใหม่ดู [`docs/quotation-spec.md`](docs/quotation-spec.md) ·
> (ตอน dev คู่ repo presales จะ override ด้วย env `PRESALES_OUTPUT` ก็ได้ — optional)

---

## 🚀 Getting Started

**Prerequisites:** Node.js 20+ · มีใบประเมินใน `data/` อย่างน้อย 1 ใบ (repo นี้มีตัวอย่างให้แล้ว 3 ใบ)

```bash
# ติดตั้ง dependencies
npm install

# โหมดพัฒนา (hot reload)
npm run dev          # → http://localhost:3000/project

# โหมด production
npm run build        # ต้องผ่านก่อนเสมอ
npm run start
```

เปิด **[http://localhost:3000/project](http://localhost:3000/project)** เพื่อดูรายการใบประเมินทั้งหมด

---

## 🛣️ Routes

| Route | คำอธิบาย | Rendering |
|---|---|---|
| `/` | หน้าแรก | Static |
| `/project` | ลิสต์ใบประเมินทุกโปรเจกต์ | Dynamic (อ่านไฟล์ทุก request) |
| `/project/[id]` | ใบประเมิน 1 โปรเจกต์ จาก UUID | Dynamic |

> หน้าที่อ่านไฟล์ใช้ `export const dynamic = "force-dynamic"` เพื่อให้เพิ่ม/แก้ `data.json` แล้วเห็นผลทันทีโดยไม่ต้อง rebuild

---

## 🧩 Data Model

ทุกโปรเจกต์คือไฟล์ `data.json` หนึ่งไฟล์ ตาม type `Project` ใน [`app/lib/projects.ts`](app/lib/projects.ts) — ฟิลด์หลัก:

| ฟิลด์ | ความหมาย |
|---|---|
| `projectName`, `client`, `date` | ข้อมูลหัวเอกสาร |
| `summary` | สรุป man-day / ราคา ช่วง low–high |
| `scope.in` / `scope.out` | ขอบเขต in / out (กันงานบานปลาย) |
| `modules[]` | ฟีเจอร์แตกเป็น module + `mdLow`/`mdHigh` (ฐานของราคา) |
| `support[]` | งานเสริม (PM, QA, deploy ฯลฯ) |
| `rates[]` | เรต man-day หลายระดับ (Junior → Expert) |
| `contingencyPct` | % buffer ความเสี่ยง |
| `assumptions`, `risks`, `openQuestions`, `outOfPrice` | สมมติฐาน / ความเสี่ยง / คำถามค้าง / สิ่งที่ไม่รวมในราคา |

**Helper คำนวณ** (ใช้ร่วมทุกหน้า เพื่อให้ตัวเลขตรงกันเสมอ):

```ts
sumMd(items)   // รวม man-day ช่วง low/high
totals(p)      // dev + support → subtotal → × (1 + contingency%) → total
fmtTHB(n)      // จัดรูปแบบเงินบาท (th-TH)
```

---

## ⚙️ Configuration

| Env | Default | ใช้ทำอะไร |
|---|---|---|
| `PRESALES_OUTPUT` | `../../ai-agents/presales/output` (relative จาก cwd) | ชี้ไปโฟลเดอร์ data แบบ absolute เผื่อย้าย/รันจากที่อื่น |

```bash
# ตัวอย่าง: รันโดยชี้ data ไปที่อื่น
PRESALES_OUTPUT=/path/to/presales/output npm run start
```

---

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, Server Components, Turbopack
- **[React 19](https://react.dev)**
- **[TypeScript 5](https://www.typescriptlang.org)**
- **[Tailwind CSS v4](https://tailwindcss.com)**

> ⚠️ **Next.js 16 มี breaking changes** — `params` ในหน้าเป็น `Promise` ต้อง `await` ก่อนใช้
> ก่อนแก้โค้ดให้อ่าน docs ใน `node_modules/next/dist/docs/` เพราะ API บางส่วนต่างจากเวอร์ชันก่อน

---

## ➕ เพิ่มโปรเจกต์ใหม่ (standalone)

ไม่ต้องแตะโค้ดแอป — สร้างไฟล์เดียว:

```
data/<uuid-v7>/data.json      ← แอปนี้อ่านไป render
```

**วิธีสร้าง `data.json` ให้ถูกต้อง (รวมวิธีตีราคา/man-day/schedule):** อ่าน [`docs/quotation-spec.md`](docs/quotation-spec.md) ·
ดูตัวอย่างจริงได้ใน `data/` (3 ใบ) · AI agent gen เองได้จากไกด์นั้นโดยไม่ต้องพึ่ง repo อื่น

บนเครื่อง dev: รีเฟรช `/project` แล้วโปรเจกต์ใหม่จะโผล่ขึ้นมาเอง 🎉

---

## ☁️ Deploy (Vercel)

repo นี้ **standalone** — `data/` อยู่ใน repo อยู่แล้ว → commit + push แล้ว Vercel deploy ได้เลย (ไม่ต้องพึ่ง repo อื่น)

ลำดับการหา data (ใน [`app/lib/projects.ts`](app/lib/projects.ts)):

| ลำดับ | แหล่ง | ใช้เมื่อ |
|---|---|---|
| 1 | `PRESALES_OUTPUT` (env) | override เอง (optional) |
| 2 | `../../ai-agents/presales/output` | ตอน dev คู่ repo presales (ถ้ามี) — มี `fs.existsSync` guard, ไม่มีก็ข้าม |
| 3 | `./data` (in-repo) | **standalone / Vercel — ค่าเริ่มต้น** |

> 🔁 (optional) ถ้าทำงานคู่ presales: `npm run sync:data` ก๊อป data.json จาก presales/output → `./data` แล้ว push
> ⚠️ ไซต์ public — `data/` มีราคา/ชื่อลูกค้าจริง ใครมีลิงก์ก็เห็นได้

---

## 📜 License

Private — ใช้ภายในทีมเท่านั้น (ใบประเมินมีราคาจริงและข้อมูลลูกค้า)
