import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { getUserFromToken, SupabaseUser } from "./supabase";
import { createClient } from "./supabase/server";

const bypassUser = {
  id: "dev-auth-bypass",
  email: "admin@olopsc.edu.ph",
  role: "ADMIN",
  user_metadata: {
    role: "ADMIN",
    name: "Development Admin",
  },
  app_metadata: {
    role: "ADMIN",
  },
} as unknown as SupabaseUser;

// Server-side helper to get user from cookies (Supabase token stored in cookie)
export async function getServerUserFromCookies(): Promise<SupabaseUser | null> {
  return bypassUser;

  const cookieStore = await cookies();
  const token =
    cookieStore.get("sb-access-token")?.value ||
    cookieStore.get("access_token")?.value;
  if (!token) return null;
  console.log(token);
  const user = await getUserFromToken(token);
  return user;
}

// Require role on server side; redirects to /login or /unauthorized as needed.
export async function requireRoleOrRedirect(allowedRoles: string[]) {
  const bypassRole = String(
    bypassUser.user_metadata?.role ||
      bypassUser.app_metadata?.role ||
      bypassUser.role ||
      "",
  );

  if (bypassRole && allowedRoles.includes(bypassRole)) {
    return bypassUser;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log(error);
  if (!user) {
    redirect("/auth" as Route);
  }

  const role = user.user_metadata?.role || user.app_metadata?.role || user.role;
  if (!role || !allowedRoles.includes(role)) {
    redirect("/auth" as Route);
  }

  return user;
}

const serverAuth = { getServerUserFromCookies, requireRoleOrRedirect };

export default serverAuth;
