# 📐 Quotation Spec — วิธีสร้าง `data.json` (self-contained)

> **แหล่งความจริงเดียวในตัว repo นี้** สำหรับ "สร้างใบเสนอราคา 1 ใบ" — อ่านไฟล์นี้จบแล้ว AI/คน
> สามารถเขียน `data.json` ที่ถูกต้องได้ **โดยไม่ต้องเปิด repo อื่น** (repo นี้ standalone)
>
> repo นี้ = **เว็บแสดงใบเสนอ** · input คือ `data/<uuid>/data.json` · renderer คือ
> [`app/project/[id]/ProjectView.tsx`](../app/project/[id]/ProjectView.tsx) · type สัญญาคือ
> [`app/lib/projects.ts`](../app/lib/projects.ts) (`type Project`) — **ชื่อ field ต้องตรงเป๊ะ**

---

## 0. หลักคิด (กฎเหล็ก)

1. **ราคา ← man-day ← module ← requirement** — ทุกตัวเลขต้องตามรอยกลับไปหา requirement ได้
   ถ้าตอบไม่ได้ว่าเลขมาจากไหน = ยังตีราคาไม่ได้
2. **man-day เป็นช่วง `low–high` เสมอ** (สะท้อนความไม่แน่นอน) ห้ามใส่ค่าเดียว
3. **อะไรที่ยังไม่ยืนยัน → เขียนเป็น `assumptions[]`** อย่าเดาเงียบ ๆ และอย่าปล่อยว่าง
4. **คำนวณด้วย helper กลางเท่านั้น** (`totals/sumMd/fmtTHB/aiTotals/phasePos` ใน `projects.ts`) — อย่าคำนวณเลขซ้ำเอง

---

## 1. ขั้นตอนสร้างใบเสนอ (3 สเตป — ไอเดียจาก presales)

### สเตป 1 — เก็บ & ขุด requirement
ถามให้ครบก่อนตีราคา (ไม่เดาแทนลูกค้า): เป้าหมายธุรกิจ · ผู้ใช้/บทบาท · ขอบเขต in/out ·
ปริมาณงาน (ผู้ใช้/ข้อมูล/ทราฟฟิก) · การเชื่อมต่อระบบภายนอก · non-functional (security/perf/scale/อุปกรณ์) ·
ข้อจำกัด (งบ/เดดไลน์/เทคโนโลยีบังคับ) · สิ่งที่ยังไม่ได้คำตอบ → `assumptions[]`

### สเตป 2 — วิเคราะห์ระบบ (แปลงเป็นโครง data.json)
- ภาพรวม + เป้าหมายธุรกิจ → `overview`, `businessGoal`
- ขอบเขต in/out → `scope.in[]`, `scope.out[]`
- ผู้ใช้/บทบาท + use case → `actors[]`, `useCases[]`
- **แตกฟีเจอร์เป็น `modules[]`** (นี่คือฐานการตีราคา) จัดกลุ่ม A/B/C/D ใน `groupLegend`
- non-functional → `nonFunctional[]` · ความเสี่ยง → `risks[]` · สมมติฐาน → `assumptions[]`

### สเตป 3 — ตีราคา (man-day rate, THB)
1. ประเมิน **man-day `mdLow`–`mdHigh` ต่อ module** ตามความซับซ้อน (`complexity`: low/medium/high/medium-high)
2. ใส่ **support items (ใส่ครบ 4 ตัวเสมอ)** เป็นช่วง man-day ใน `support[]`:
   วิเคราะห์/ออกแบบระบบ & UX · ทดสอบ (QA) · ติดตั้ง/ขึ้นระบบ (Deploy) · จัดการโครงการ (PM)
3. **เรต default (auto — ไม่ต้องถาม)** ใน `rates[]` (1 man-day = 8 ชม.):
   `{label:"Junior",rate:2500}`, `{label:"Mid",rate:4000}`, `{label:"Senior",rate:6000}`, `{label:"Expert",rate:8000}`
   (ยกเว้นลูกค้าระบุเรตเอง → ใช้เฉพาะเรตนั้น)
4. **`contingencyPct` (คน) = ~20%** (ปรับตามความไม่แน่นอน)
5. `summary` = ช่วงรวม: `manDayLow/High` (man-day รวมหลัง contingency) + `priceLow/High`
   โดย **`priceLow = manDayLow × เรตต่ำสุด` · `priceHigh = manDayHigh × เรตสูงสุด`** (ดู helper `totals()`)

> สูตร: `subtotal = sum(modules.md) + sum(support.md)` → `total = round(subtotal × (1 + contingencyPct/100))`

---

## 2. โหมด AI — `ai{}` (ถ้าทำ · internal เท่านั้น)
ออกใบเสนอ **2 มุมในใบเดียว**: ทีมคน (ของหลัก) + ให้ AI เขียนโค้ด (`ai{}`)
- **ฐานคนไม่แตะ** — `modules/support/rates/man-day คน` ของเดิม เพิ่มเฉพาะ `ai{}`
- **AI = ตัวเร่งบน module เดิม** `AI man-day = man-day คน ÷ factor` (ปัดขึ้น, ขั้นต่ำ 1):
  - Dev modules: 3–5x → `aiMdLow=ceil(mdLow/5)`, `aiMdHigh=ceil(mdHigh/3)`
  - Support req/design/UX/PM: 1.3–2x → `ceil(mdLow/2)`, `ceil(mdHigh/1.3)`
  - Support QA/Deploy: 1.5–2.5x → `ceil(mdLow/2.5)`, `ceil(mdHigh/1.5)`
- **`ai.contingencyPct = 25%`** (รีวิว/แก้งานแปรปรวนสูงกว่า) · **`ai.rates` = เรตคนเท่าเดิม** (ราคาลงเพราะวันน้อยลง ไม่ใช่เรตถูกลง)
- ทุก `ai.modules[].factor` ต้องมี (ที่มาของวันที่ลด) · ต้องมี `ai.assumptions`/`ai.risks` เฉพาะ AI (หลอน/รีวิวแน่น/integration ช้า)

---

## 3. `data.json` contract (ทุก field ของ `type Project`)

ส่วนหัว: `id` (uuid v7 = ชื่อโฟลเดอร์) · `projectName` · `client` · `date` (YYYY-MM-DD) · `source` ·
`preparedBy?` · `docVersion?` · `currency` (เช่น "THB")

| field | ป้อนเข้า § | หมายเหตุ |
|---|---|---|
| `summary{scopeNote, manDayLow, manDayHigh, priceLow, priceHigh}` | Price hero | ช่วงราคารวม |
| `overview` · `businessGoal{problem, successMetric}?` | §1 overview | |
| `scope{in[], out[]}` | §2 scope | เคลียร์ทั้งสองฝั่ง |
| `actors[]{role, can}` | §3 actors | |
| `useCases?[]{title, actor?, desc}` | §4 usecases | **optional** — ไม่มี → ข้าม section |
| `modules[]{group, code, name, desc, complexity, mdLow, mdHigh}` | §5 modules | ฐานราคา · `groupLegend?` = คำอธิบายกลุ่ม |
| `nonFunctional?[]{key, label, detail?}` | §6 nonfunc | **optional** — ไม่มี → ข้าม |
| `schedule?{...}` | §7 (บนสุด) | ดู §4 ด้านล่าง — โชว์ทั้ง client+internal |
| `timeline?{teamAssumption, elapsedNote, stacks[]{name, elapsed, pros[], cons[]}, verdict}` | §7 | **internal เท่านั้น** (เทียบ stack) |
| `support[]{name, mdLow, mdHigh}` · `rates[]{label, rate}` · `contingencyPct` · `phasing?{recommend, phase1, phase2}` | §8 cost | |
| `ai?{...}` | §8 (ท้าย) | **internal เท่านั้น** · ดู §2 |
| `assumptions[]` · `risks[]{risk, impact, likelihood, mitigation}` · `openQuestions[]` · `outOfPrice[]` | §9 notes | |
| `manDayPerDay?` | — | ค่าคงที่ช่วยคำนวณ (เช่น 8) |

---

## 4. `schedule` — แผนงานโปรเจกต์ (กำหนดการส่งมอบ)
รูป: `schedule{ unit:"day", daysPerWeek:5, note?, phases[]{ name, startDay, endDay, group?, items[] } }`
- **~4–6 เฟส** แบ่งตามกลุ่มโมดูล (A/B/C/D) + **เฟสปิดท้าย QA/UAT/Deploy**
- **วัน = relative working day** (วันที่ 1 = วันเริ่มจริง · จ–ศ · ไม่ผูกปฏิทินจริง)
- **ช่วงวันรวม ≈ man-day ÷ ขนาดทีม** (effective heads เช่น ~2 คน) · เฟสซ้อนเหลื่อมกันได้เล็กน้อย
- `items[]` = งานหลักในเฟส · `group?` โยงกลุ่มโมดูล
- render เป็น **Gantt แนวนอน (เลื่อนข้าง, ชื่อเฟส sticky) + ไทม์ไลน์แนวตั้ง** ใน §7 — **โชว์ทั้ง client + internal** (ไม่มีข้อมูลอ่อนไหว)
- ⚠️ **นี่คือกำหนดการของโปรเจกต์ลูกค้า** ไม่ใช่ timeline ของ AI agent

---

## 5. โครงเอกสาร 9 section (ลำดับตายตัว) + audience

ลำดับ id (ห้ามสลับ/เพิ่ม · เลข section ขับอัตโนมัติจาก `toc[]` ใน `ProjectView.tsx`):
`overview · scope · actors · usecases · modules · nonfunc · timeline · cost · notes`

2 หน้า: **`/project/[id]` = client** · **`/project/[id]/internal` = internal**

**client ซ่อน:**
- §5 modules: เห็นแค่ `name`+`desc` — ซ่อน `group/code/complexity/mdLow/mdHigh`, แถว subtotal, `groupLegend`
- §7: เห็นแค่ **`schedule`** (Gantt+ไทม์ไลน์) — ซ่อน `timeline`/เทียบ stack
- §8 cost: เห็นแค่กล่องสรุปช่วงราคา — ซ่อนตาราง support/man-day/เรต, `phasing`, **บล็อก `ai` ทั้งหมด**
- รหัสโมดูล `(M-xx)` ใน free-text → ตัดออก · "Open Questions" → "ข้อมูลที่ต้องการเพิ่มเติม"

**internal:** เห็นครบทุก section/คอลัมน์/บล็อก AI

---

## 6. เพิ่มใบเสนอใหม่ (workflow)
1. gen `id` = **uuid v7** (เช่น `node -e "console.log(crypto.randomUUID())"` แล้วปรับ หรือ uuid v7 จริง)
2. สร้าง `data/<id>/data.json` ตาม contract §3 (ดูตัวอย่างจริง 3 ไฟล์: `data/019ee3bd…` coupon, `019ee327…` DOLE, `019ee3ee…` loyalty)
3. `npm run dev` → เปิด `/project/<id>` (client) + `/project/<id>/internal` → ตรวจ render ครบ 9 section, ราคา/Gantt ถูก
4. `npm run build` + `npm run lint` ผ่าน

> data source: standalone อ่านจาก `./data` · (ตอน dev คู่ presales อาจ override ด้วย env `PRESALES_OUTPUT` — optional)

---

## 7. Styling tokens (hex — convention ของ repo นี้)
teal `#3E7C76` · teal-dark `#2F605B` · amber `#C98A3B` · green `#4F7A52` · red `#A8543F` ·
line `#DED8C8` · card `#FBFAF6` · bg `#F4F1EA` · ink `#2D3A3A` · muted `#5C6A68` · stripe `#F7F4EC` —
**อย่าเพิ่มสีใหม่นอกชุดนี้**
