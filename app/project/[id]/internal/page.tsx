import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/app/lib/projects";
import ProjectView from "../ProjectView";

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
    title: p ? `${p.projectName} — ใบประเมิน (ภายใน)` : "ไม่พบโปรเจกต์",
  };
}

// หน้าฉบับเต็มสำหรับทีมภายใน (man-day, เรต, เทียบ stack, ฯลฯ)
export default async function ProjectInternalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const p = getProject(id);
  if (!p) notFound();
  return <ProjectView p={p} audience="internal" />;
}
