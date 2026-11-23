import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CreateLinkPage } from "@/components/link-pages/collection";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth-session";
import { listLinkPages } from "@/lib/link-pages/store";
import { getUserPlan } from "@/lib/plan-enforcement";

export default async function LinkPagesPage() {
  const user = await requireUser();
  const [pages, plan] = await Promise.all([listLinkPages(user.id), getUserPlan(user.id)]);
  const limit = plan.limits.maxLinkPages;
  const canCreate = limit < 0 || pages.length < limit;

  return (
    <div className="full-bleed space-y-7 py-8 sm:py-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Link pages</h1>
        <p className="mt-3 text-muted-foreground">Share your latest links, featured work, and social profiles from one address.</p>
        <p className="mt-2 text-sm font-medium">{limit < 0 ? "Pro · Unlimited link pages" : `Free · ${pages.length} of ${limit} link page used`}</p>
      </div>
      {pages.length > 0 && (
        <ul className="divide-y rounded-2xl border">
          {pages.map((page) => (
            <li key={page.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link prefetch={false} href={`/link-pages/${page.id}`} className="block font-bold hover:underline">{page.name}</Link>
                <p className="break-all text-sm text-muted-foreground">teag.me/u/{page.slug} · {page.publishedAt ? "Published" : "Draft"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {page.publishedAt && <Button variant="outline" size="sm" asChild><a href={`/u/${page.slug}`} target="_blank" rel="noopener">View <ArrowUpRight className="size-4" /></a></Button>}
                <Button variant="outline" size="sm" asChild><Link prefetch={false} href={`/link-pages/${page.id}`}>Edit page</Link></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {canCreate ? <CreateLinkPage name={user.name ?? ""} /> : (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
          <div><h2 className="font-bold">Need another link page?</h2><p className="text-sm text-muted-foreground">Pro includes unlimited link pages.</p></div>
          <Button asChild><Link href="/upgrade">Upgrade to Pro</Link></Button>
        </section>
      )}
    </div>
  );
}
