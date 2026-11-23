import { TableLoading } from "@/components/qr-codes/table-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="full-bleed pb-12 pt-8 sm:pt-12" aria-label="Loading codes">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div><Skeleton className="h-12 w-48" /><Skeleton className="mt-3 h-5 w-36" /></div>
        <Skeleton className="h-12 w-28 sm:w-36" />
      </div>
      <TableLoading />
    </section>
  );
}
