<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# RULES เรื่อง Output (อ่านก่อนแตะใบเสนอเสมอ)

repo นี้ **standalone** = เว็บแสดงใบเสนอราคา · render จาก `data/<uuid>/data.json` ต่อโปรเจกต์
ผ่าน `app/project/[id]/ProjectView.tsx` · **ห้าม improvise โครง/หัวข้อเอง — ทุกค่ามาจาก `data.json`**

## แหล่งความจริง (ในตัว repo นี้ — ไม่อ้าง repo อื่น)
- **วิธีสร้าง `data.json` + spec เต็ม:** [`docs/quotation-spec.md`](docs/quotation-spec.md) ← อ่านอันนี้ก่อนถ้าจะ **gen ใบเสนอใหม่**
- **ชนิดข้อมูล (contract):** [`app/lib/projects.ts`](app/lib/projects.ts) (`type Project`) — ชื่อ field ต้องตรงเป๊ะ
- **ตัว render:** [`app/project/[id]/ProjectView.tsx`](app/project/[id]/ProjectView.tsx)
- **ตัวอย่างจริง:** `data/019ee3bd…` (coupon) · `data/019ee327…` (DOLE) · `data/019ee3ee…` (loyalty)
> เพิ่ม/แก้ field ต้องอัปให้ตรงกัน: `projects.ts` (type) + `ProjectView.tsx` (renderer) + `docs/quotation-spec.md` (spec)

## gen `data.json` เองได้ (สรุปสั้น — รายละเอียดเต็มใน `docs/quotation-spec.md`)
- **ราคา ← man-day ← module ← requirement** · man-day เป็นช่วง `low–high` เสมอ · ที่ตอบไม่ได้ → `assumptions[]`
- เรต default: Junior 2,500 / Mid 4,000 / Senior 6,000 / Expert 8,000 ฿/วัน · support ใส่ครบ 4 (วิเคราะห์/QA/Deploy/PM) · contingency คน ~20%
- โหมด AI (`ai{}`, internal): `AI md = ceil(คน ÷ factor)` (dev 3–5x · support 1.3–2.5x) · contingency 25% · เรตเท่าเดิม · ทุก aiMd มี `factor`

## 9 section ตายตัว (ห้ามเพิ่ม/สลับ)
`overview · scope · actors · usecases · modules · nonfunc · timeline · cost · notes` ·
**เลข section ขับอัตโนมัติจาก `toc[]`** (`secNum` = index+1) — เพิ่ม/ลบ section ผ่าน `toc[]` เท่านั้น อย่า hardcode เลข ·
`useCases`/`nonFunctional` optional → ไม่มีให้ข้าม section

## Audience (client vs internal)
`/project/[id]` = **client** · `/project/[id]/internal` = **internal** (`audience` prop → `internal` flag)
- **client ซ่อน:** คอลัมน์ man-day/group/code/complexity (§5) · contingency/ตารางเรต/`phasing`/บล็อก AI (§8) · เทียบ stack (§7) · รหัส `(M-xx)` ใน free-text
- **internal เห็นเต็ม** · เพิ่มของใหม่ → ตัดสินก่อนเสมอว่า client ควรเห็นไหม

## RULE: แผนงานโปรเจกต์ (schedule)
ทุกใบเสนอ **ควรมี `schedule`** → render เป็น **Gantt + ไทม์ไลน์แนวตั้งใน §7** · **โชว์ทั้ง client + internal** ·
รูป: `schedule{ unit:"day", daysPerWeek:5, note?, phases[]{name, startDay, endDay, group?, items[]} }` ·
~4–6 เฟสตามกลุ่มโมดูล + QA/UAT/Deploy · **relative working day** (วันที่ 1 = วันเริ่มจริง) · **คนละเรื่องกับ timeline ของ AI agent**

## Styling
Tailwind v4 + **hex arbitrary class** เป็น convention ของ repo (เช่น `bg-[#FBFAF6]` `text-[#2F605B]`) — ยึด token ชุดเดิม
(teal `#3E7C76` · teal-dark `#2F605B` · amber `#C98A3B` · green `#4F7A52` · red `#A8543F` · line `#DED8C8` · card `#FBFAF6` · muted `#5C6A68`) — **อย่าเพิ่มสีใหม่นอกชุด**

## ข้อมูล (data.json)
- 1 โปรเจกต์ = 1 โฟลเดอร์ชื่อ uuid v7 ใน `data/` · standalone อ่านจาก `./data`
- (optional) ตอน dev คู่ repo presales ตั้ง env `PRESALES_OUTPUT` ชี้ไป output ของ presales ได้ — ถ้าไม่มี fallback `./data` อัตโนมัติ
- แก้ field → ตรวจ `npm run build` + `npm run lint` ผ่านก่อนเสมอ
