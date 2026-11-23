export type PlanId = "FREE" | "PRO";

export interface PlanLimits {
  maxActiveQrCodes: number;
  maxLinkPages: number;
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
    maxLinkPages: 1,
    maxScansPerMonth: 500,
    analyticsRetentionDays: 7,
    logoUpload: false,
    customDomains: false,
    csvExport: false,
    bulkActions: false,
    maxSyncedCaptures: 100,
  },
  PRO: {
    maxActiveQrCodes: -1, // unlimited
    maxLinkPages: -1,
    maxScansPerMonth: 50_000,
    analyticsRetentionDays: -1, // unlimited
    logoUpload: true,
    customDomains: false,
    csvExport: false,
    bulkActions: false,
    maxSyncedCaptures: -1,
  },
};

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan];
}
