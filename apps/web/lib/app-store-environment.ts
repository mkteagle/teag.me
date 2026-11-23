export function getAppStoreSandboxUserId(): string | undefined {
  return process.env.APP_STORE_SANDBOX_USER_ID?.trim() || undefined;
}

export function canUseAppStoreEnvironment(userId: string, environment: string | null | undefined): boolean {
  return environment === "Production" || (environment === "Sandbox" && userId === getAppStoreSandboxUserId());
}
