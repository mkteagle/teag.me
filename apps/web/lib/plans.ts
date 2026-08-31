export type PlanId = "FREE" | "PRO";

export interface PlanLimits {
  maxActiveQrCodes: number;
  maxScansPerMonth: number;
  analyticsRetentionDays: number;
  logoUpload: boolean;
  customDomains: boolean;
  csvExport: boolean;
  bulkActions: boolean;
  maxSyncedCaptures: number;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  FREE: {
    maxActiveQrCodes: 10,
    maxScansPerMonth: 3_000,
    analyticsRetentionDays: 90,
    logoUpload: false,
    customDomains: false,
    csvExport: false,
    bulkActions: false,
    maxSyncedCaptures: 100,
  },
  PRO: {
    maxActiveQrCodes: -1, // unlimited
    maxScansPerMonth: 50_000,
    analyticsRetentionDays: -1, // unlimited
    logoUpload: true,
    customDomains: true,
    csvExport: true,
    bulkActions: true,
    maxSyncedCaptures: -1,
  },
};

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan];
}
