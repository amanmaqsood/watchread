import { notFound } from "next/navigation";
import { Studio } from "@/components/studio";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; view: string }>;
}) {
  const { id, view } = await params;
  if (!["read", "practice", "sources", "export"].includes(view)) notFound();
  return <Studio id={id} view={view} />;
}
