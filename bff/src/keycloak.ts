import { ADMIN_TOKEN_URL, ADMIN_USERS_URL } from "./config";

export async function getAdminToken(): Promise<string> {
  const resp = await fetch(ADMIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: "admin-cli",
      username: "admin",
      password: "admin",
    }),
  });
  return (await resp.json()).access_token;
}

export async function findUserByUsername(adminToken: string, username: string) {
  const resp = await fetch(`${ADMIN_USERS_URL}?username=${encodeURIComponent(username)}&exact=true`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const users = await resp.json();
  return users[0] ?? null;
}

export async function getUserRequiredActions(adminToken: string, userId: string): Promise<string[]> {
  const resp = await fetch(`${ADMIN_USERS_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  return (await resp.json()).requiredActions ?? [];
}

export async function resetUserPassword(adminToken: string, userId: string, newPassword: string) {
  await fetch(`${ADMIN_USERS_URL}/${userId}/reset-password`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "password", value: newPassword, temporary: false }),
  });
}

export async function clearRequiredActions(adminToken: string, userId: string) {
  await fetch(`${ADMIN_USERS_URL}/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requiredActions: [] }),
  });
}

export async function requestToken(params: Record<string, string>) {
  const { TOKEN_URL } = await import("./config");
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  return { ok: resp.ok, data: await resp.json() };
}
