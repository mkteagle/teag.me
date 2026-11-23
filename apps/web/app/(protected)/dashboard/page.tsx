"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeList } from "@/components/qr-codes/code-list";
import { TableLoading } from "@/components/qr-codes/table-loading";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ExtendedQRCode } from "@/components/qr-codes/types";
import { EditQRDialog } from "@/components/qr-codes/edit-qr-code";
import { UpgradeWall } from "@/components/upgrade-wall";
import { usePlan } from "@/lib/hooks/use-plan";
import { PLAN_LIMITS } from "@/lib/plans";
import { capture } from "@/lib/posthog";
import { Plus, ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<ExtendedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<ExtendedQRCode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState<ExtendedQRCode | null>(null);
  const [upgradeWallOpen, setUpgradeWallOpen] = useState(false);
  const [listRevision, setListRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const { toast } = useToast();
  const { data: planData, atQrLimit, atScanLimit } = usePlan();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast({
        title: "Welcome to Pro! 🎉",
        description: "Your account has been upgraded. Enjoy unlimited QR codes, 50k scans/month, and all Pro features.",
      });
      router.replace("/dashboard");
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    const request = new AbortController();
    const fetchQRCodes = async () => {
      setLoading(true);
      try {
        const archived = activeTab === "archived";
        const response = await fetch(
          `/api/qr-codes?archived=${archived}&page=${pagination.page}&limit=${pagination.limit}`,
          { signal: request.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }

        const data = await response.json();
        if (request.signal.aborted) return;
        setQrCodes(data.qrCodes ?? []);
        if (data.pagination) {
          const next = data.pagination as PaginationInfo;
          setPagination({ ...next, page: Math.min(next.page, Math.max(1, next.totalPages)) });
        }
      } catch (error) {
        if (request.signal.aborted) return;
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to fetch QR codes",
          variant: "destructive",
        });
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    };

    void fetchQRCodes();
    return () => request.abort();
  }, [activeTab, pagination.page, pagination.limit, listRevision, toast]);

  const handleDeleteClick = (qr: ExtendedQRCode) => {
    setQrToDelete(qr);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (qr: ExtendedQRCode) => {
    setQrToEdit(qr);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedQR: ExtendedQRCode) => {
    capture("qr_code_edited");
    setQrCodes((prev) =>
      prev.map((qr) =>
        qr.id === updatedQR.id
          ? { ...qr, ...updatedQR, scans: updatedQR.scans ?? qr.scans ?? [] }
          : qr
      )
    );
  };

  const reloadList = () => setListRevision((current) => current + 1);

  const handleArchive = async (qr: ExtendedQRCode, archived: boolean) => {
    try {
      const response = await fetch(`/api/qr-code/${qr.id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive QR code");
      }

      reloadList();
      capture(archived ? "qr_code_archived" : "qr_code_restored");

      toast({
        title: archived ? "QR Code archived" : "QR Code unarchived",
        description: `The QR code has been successfully ${archived ? "archived" : "unarchived"}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;

    try {
      const response = await fetch(`/api/qr-code/${qrToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      reloadList();
      capture("qr_code_deleted");
      toast({
        title: "QR Code deleted",
        description: "The QR code has been successfully deleted.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalScans = qrCodes.reduce((acc, qr) => acc + (qr.scans?.length ?? 0), 0);
  const scanHistoryDays = planData?.plan === "FREE" ? PLAN_LIMITS.FREE.analyticsRetentionDays : null;
  const changeTab = (value: string) => {
    if (value === activeTab || (value !== "active" && value !== "archived")) return;
    setLoading(true);
    setActiveTab(value);
    setPagination((current) => ({ ...current, page: 1 }));
    capture("qr_registry_tab_selected", { tab: value });
  };

  return (
    <section className="full-bleed pb-12 pt-8 sm:pt-12">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-5 gap-y-4 sm:mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-[3.45rem] sm:leading-none">Your codes</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base" aria-live="polite">
            {loading ? "Loading codes…" : `${pagination.totalCount.toLocaleString()} ${activeTab === "archived" ? "archived " : ""}${pagination.totalCount === 1 ? "code" : "codes"} · ${totalScans.toLocaleString()} scans${scanHistoryDays ? ` in the last ${scanHistoryDays} days` : ""}${pagination.totalPages > 1 ? " on this page" : ""}`}
          </p>
        </div>
        {atQrLimit ? (
          <Button size="lg" className="font-semibold sm:h-14 sm:min-w-48 sm:text-base" onClick={() => setUpgradeWallOpen(true)}>
            <Zap className="size-5" aria-hidden="true" /> Upgrade to create
          </Button>
        ) : (
          <Button size="lg" asChild className="font-semibold sm:h-14 sm:min-w-48 sm:text-base">
            <Link href="/generate" onClick={() => capture("create_opened", { source: "dashboard" })}>
              <Plus className="size-5" aria-hidden="true" /> Create QR
            </Link>
          </Button>
        )}
      </div>

      {atScanLimit && planData && (
        <section aria-label="Monthly scan limit" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
          <div>
            <h2 className="text-sm font-semibold">You’ve reached your {planData.usage.scansThisMonth.limit.toLocaleString()} tracked scans for this month</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your QR codes still work. Upgrade to keep tracking this month.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/upgrade" onClick={() => capture("upgrade_clicked", { source: "monthly_scan_limit" })}>Upgrade to Pro</Link>
          </Button>
        </section>
      )}

      <Tabs value={activeTab} onValueChange={changeTab}>
        <TabsList aria-label="Code status" className="mb-3 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger id="active-codes" aria-controls="code-list" value="active" className="min-h-10 px-3 data-[state=active]:bg-[#fff1c4]">Active</TabsTrigger>
          <TabsTrigger id="archived-codes" aria-controls="code-list" value="archived" className="min-h-10 px-3 data-[state=active]:bg-[#fff1c4]">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div id="code-list" role="tabpanel" aria-labelledby={`${activeTab}-codes`}>
        {loading ? <TableLoading /> : qrCodes.length > 0 ? (
          <CodeList qrCodes={qrCodes} trendDays={scanHistoryDays ?? undefined} onDelete={handleDeleteClick} onArchive={handleArchive} onEdit={handleEditClick} />
        ) : (
          <div className="border-t py-12 text-center">
            <h2 className="text-lg font-semibold">{activeTab === "archived" ? "No archived codes" : "No codes yet"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "archived" ? "Archived codes will appear here." : "Create a QR code to start tracking scans."}
            </p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} disabled={loading || pagination.page === 1}>
              <ChevronLeft className="size-4" aria-hidden="true" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} disabled={loading || pagination.page >= pagination.totalPages}>
              Next <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={qrToDelete?.redirectUrl ?? ""}
      />
      <EditQRDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        qrCode={qrToEdit}
        onSuccess={handleEditSuccess}
      />
      <UpgradeWall
        open={upgradeWallOpen}
        onClose={() => setUpgradeWallOpen(false)}
        title="QR code limit reached"
        current={planData?.usage.activeQrCodes.current}
        limit={planData?.usage.activeQrCodes.limit}
      />
    </section>
  );
}
