import { notFound } from "next/navigation";
import { LinkPageEditor } from "@/components/link-pages/editor";
import { requireUser } from "@/lib/auth-session";
import { ownerLinkPage } from "@/lib/link-pages/store";

export default async function EditLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const page = await ownerLinkPage(id, user.id);
  if (!page) notFound();
  return <LinkPageEditor id={page.id} slug={page.slug} initial={page.draft}
    initialVersion={page.version} isPublished={Boolean(page.publishedAt)} />;
}
