import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  listAccessRequests,
  listAdminUsers,
  listPendingInvites,
} from "@/services/admin-users.service";
import {
  AdminShell,
  AdminHeader,
  AdminBody,
} from "@/components/admin/admin-page-shell";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Área restrita ao owner — editor é mandado de volta pro painel.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (adminRow?.role !== "owner") {
    redirect("/admin");
  }

  const [users, invites, accessRequests] = await Promise.all([
    listAdminUsers(),
    listPendingInvites(),
    listAccessRequests(),
  ]);

  const invitesMeta =
    invites.length > 0
      ? ` · ${invites.length} ${invites.length === 1 ? "convite pendente" : "convites pendentes"}`
      : "";
  const requestsMeta =
    accessRequests.length > 0
      ? ` · ${accessRequests.length} ${accessRequests.length === 1 ? "solicitação" : "solicitações"}`
      : "";

  return (
    <AdminShell>
      <AdminHeader
        eyebrow="Acesso"
        title="Usuários"
        meta={`${users.length} com acesso${invitesMeta}${requestsMeta}`}
      />

      <AdminBody>
        <UsersManager
          users={users}
          invites={invites}
          accessRequests={accessRequests}
          currentUserId={user.id}
        />
      </AdminBody>
    </AdminShell>
  );
}
