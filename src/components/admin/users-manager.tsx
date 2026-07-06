"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  inviteUserAction,
  revokeInviteAction,
  removeUserAction,
  changeUserRoleAction,
  approveAccessRequestAction,
  rejectAccessRequestAction,
} from "@/app/admin/_actions/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangesPreviewDialog } from "./changes-preview-dialog";
import type { ChangeEntry } from "./project-changes-diff";
import {
  ADMIN_ROLE_LABEL,
  type AdminAccessRequestRow,
  type AdminInviteRow,
  type AdminRole,
  type AdminUserRow,
} from "@/lib/supabase/types";

const BORDER = "hsl(var(--accent) / 0.3)";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Fortaleza",
});

type UsersManagerProps = {
  users: AdminUserRow[];
  invites: AdminInviteRow[];
  accessRequests: AdminAccessRequestRow[];
  /** id do owner logado — não pode remover a si mesmo. */
  currentUserId: string;
};

type PendingConfirm =
  | { kind: "remove"; user: AdminUserRow }
  | { kind: "role"; user: AdminUserRow; nextRole: AdminRole }
  | { kind: "revoke"; invite: AdminInviteRow }
  | { kind: "approve"; request: AdminAccessRequestRow }
  | { kind: "reject"; request: AdminAccessRequestRow };

export function UsersManager({
  users,
  invites,
  accessRequests,
  currentUserId,
}: UsersManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Formulário de convite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("editor");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Ação destrutiva aguardando confirmação no dialog
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const ownersCount = users.filter((u) => u.role === "owner").length;

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const result = await inviteUserAction({
        email: inviteEmail,
        role: inviteRole,
      });
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success(
        `Convite criado — ${inviteEmail.trim().toLowerCase()} já pode entrar com o Google`,
      );
      setInviteEmail("");
      setInviteRole("editor");
    });
  }

  function confirmPending() {
    if (!pending) return;
    const action = pending;
    setPending(null);
    startTransition(async () => {
      const result =
        action.kind === "remove"
          ? await removeUserAction(action.user.id)
          : action.kind === "role"
            ? await changeUserRoleAction(action.user.id, action.nextRole)
            : action.kind === "revoke"
              ? await revokeInviteAction(action.invite.id)
              : action.kind === "approve"
                ? await approveAccessRequestAction(action.request.id)
                : await rejectAccessRequestAction(action.request.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        action.kind === "remove"
          ? `Acesso de ${action.user.email} removido`
          : action.kind === "role"
            ? `${action.user.email} agora é ${ADMIN_ROLE_LABEL[action.nextRole].toLowerCase()}`
            : action.kind === "revoke"
              ? `Convite de ${action.invite.email} cancelado`
              : action.kind === "approve"
                ? `${action.request.email} agora tem acesso como editor`
                : `Pedido de ${action.request.email} recusado`,
      );
    });
  }

  const dialogConfig = pending ? buildDialogConfig(pending) : null;

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-12">
      {/* Convidar */}
      <section>
        <h2 className="text-caption uppercase tracking-[0.22em] text-foreground">
          Convidar
        </h2>
        <p className="mt-2 text-body text-muted-foreground">
          Informe o e-mail Google da pessoa. Ela entra sozinha no primeiro
          login — sem senha e sem cadastro manual.
        </p>

        <form
          onSubmit={submitInvite}
          className="mt-5 border p-6"
          style={{ borderColor: BORDER }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div>
              <Label htmlFor="invite-email">E-mail Google</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nome@gmail.com"
                autoComplete="off"
                required
                className="mt-2"
              />
              {fieldErrors.email ? (
                <p className="mt-1.5 text-caption" style={{ color: "hsl(0 60% 50%)" }}>
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="invite-role">Papel</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as AdminRole)}
              >
                <SelectTrigger id="invite-role" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="owner">Dono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="border px-6 py-2.5 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              style={{ borderColor: "hsl(var(--accent-strong))" }}
            >
              {isPending ? "Enviando..." : "Convidar"}
            </button>
          </div>
        </form>
      </section>

      {/* Solicitações de acesso */}
      {accessRequests.length > 0 ? (
        <section>
          <h2 className="text-caption uppercase tracking-[0.22em] text-foreground">
            Solicitações de acesso
          </h2>
          <p className="mt-2 text-body text-muted-foreground">
            Pedidos feitos na tela de login. Ao aprovar, a pessoa entra como
            editor imediatamente — dá pra promover a dono depois.
          </p>

          <ul className="mt-5 border" style={{ borderColor: BORDER }}>
            {accessRequests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b p-4 last:border-b-0"
                style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
              >
                <div className="min-w-0 flex-1">
                  <span className="block break-all text-body text-foreground">
                    {request.email}
                  </span>
                  <span className="mt-0.5 block text-micro uppercase tracking-[0.14em] text-muted-foreground">
                    pedido em {dateFmt.format(new Date(request.created_at))}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setPending({ kind: "approve", request })}
                  className="border px-4 py-2 text-micro uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                  style={{ borderColor: "hsl(var(--accent-strong))" }}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setPending({ kind: "reject", request })}
                  className="text-micro uppercase tracking-[0.18em] transition-colors hover:opacity-70 disabled:opacity-60"
                  style={{ color: "hsl(0 60% 50%)" }}
                >
                  Recusar
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Convites pendentes */}
      {invites.length > 0 ? (
        <section>
          <h2 className="text-caption uppercase tracking-[0.22em] text-foreground">
            Convites pendentes
          </h2>
          <p className="mt-2 text-body text-muted-foreground">
            Aguardando o primeiro login. O acesso é ativado automaticamente
            quando a pessoa entrar com o Google.
          </p>

          <ul className="mt-5 border" style={{ borderColor: BORDER }}>
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b p-4 last:border-b-0"
                style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
              >
                <div className="min-w-0 flex-1">
                  <span className="block break-all text-body text-foreground">
                    {invite.email}
                  </span>
                  <span className="mt-0.5 block text-micro uppercase tracking-[0.14em] text-muted-foreground">
                    {ADMIN_ROLE_LABEL[invite.role]} · convidado em{" "}
                    {dateFmt.format(new Date(invite.created_at))}
                    {invite.invited_by_email ? (
                      <span className="normal-case tracking-normal">
                        {" "}
                        por {invite.invited_by_email}
                      </span>
                    ) : null}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setPending({ kind: "revoke", invite })}
                  className="text-micro uppercase tracking-[0.18em] transition-colors hover:opacity-70 disabled:opacity-60"
                  style={{ color: "hsl(0 60% 50%)" }}
                >
                  Cancelar convite
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Quem tem acesso */}
      <section>
        <h2 className="text-caption uppercase tracking-[0.22em] text-foreground">
          Com acesso
        </h2>
        <p className="mt-2 text-body text-muted-foreground">
          Donos gerenciam usuários; editores só editam o conteúdo do site.
        </p>

        <ul className="mt-5 border" style={{ borderColor: BORDER }}>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isLastOwner = user.role === "owner" && ownersCount <= 1;
            return (
              <li
                key={user.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b p-4 last:border-b-0"
                style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
              >
                <div className="min-w-0 flex-1">
                  <span className="block break-all text-body text-foreground">
                    {user.email}
                    {isSelf ? (
                      <span
                        className="ml-2 text-micro uppercase tracking-[0.18em]"
                        style={{ color: "hsl(var(--accent-strong))" }}
                      >
                        você
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-micro uppercase tracking-[0.14em] text-muted-foreground">
                    desde {dateFmt.format(new Date(user.created_at))}
                  </span>
                </div>

                <div className="w-[140px]">
                  <Select
                    value={user.role}
                    disabled={isPending || isLastOwner}
                    onValueChange={(v) => {
                      const nextRole = v as AdminRole;
                      if (nextRole !== user.role) {
                        setPending({ kind: "role", user, nextRole });
                      }
                    }}
                  >
                    <SelectTrigger aria-label={`Papel de ${user.email}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="owner">Dono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <button
                  type="button"
                  disabled={isPending || isSelf || isLastOwner}
                  title={
                    isSelf
                      ? "Você não pode remover o próprio acesso"
                      : isLastOwner
                        ? "O painel precisa de pelo menos um dono"
                        : undefined
                  }
                  onClick={() => setPending({ kind: "remove", user })}
                  className="text-micro uppercase tracking-[0.18em] transition-colors hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ color: "hsl(0 60% 50%)" }}
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Confirmação de ações destrutivas */}
      {dialogConfig ? (
        <ChangesPreviewDialog
          open={pending !== null}
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          title={dialogConfig.title}
          description={dialogConfig.description}
          changes={dialogConfig.changes}
          confirmLabel={dialogConfig.confirmLabel}
          confirmVariant={dialogConfig.confirmVariant}
          loading={isPending}
          onConfirm={confirmPending}
        />
      ) : null}
    </div>
  );
}

function buildDialogConfig(pending: PendingConfirm): {
  title: string;
  description: string;
  changes: ChangeEntry[];
  confirmLabel: string;
  confirmVariant: "default" | "danger";
} {
  switch (pending.kind) {
    case "remove":
      return {
        title: "Remover acesso ao painel?",
        description:
          "A pessoa perde o acesso imediatamente. Para devolver, basta convidar o e-mail de novo.",
        changes: [
          {
            field: "Acesso",
            before: `${pending.user.email} · ${ADMIN_ROLE_LABEL[pending.user.role]}`,
            after: "Sem acesso",
            kind: "removed",
          },
        ],
        confirmLabel: "Remover acesso",
        confirmVariant: "danger",
      };
    case "role":
      return {
        title: "Alterar papel?",
        description: `A mudança vale a partir do próximo carregamento do painel de ${pending.user.email}.`,
        changes: [
          {
            field: "Papel",
            before: ADMIN_ROLE_LABEL[pending.user.role],
            after: ADMIN_ROLE_LABEL[pending.nextRole],
            kind: "modified",
          },
        ],
        confirmLabel: "Alterar papel",
        confirmVariant: "default",
      };
    case "revoke":
      return {
        title: "Cancelar convite?",
        description:
          "O e-mail deixa de ter entrada liberada no primeiro login. Você pode convidar de novo quando quiser.",
        changes: [
          {
            field: "Convite",
            before: `${pending.invite.email} · ${ADMIN_ROLE_LABEL[pending.invite.role]}`,
            after: "Cancelado",
            kind: "removed",
          },
        ],
        confirmLabel: "Cancelar convite",
        confirmVariant: "danger",
      };
    case "approve":
      return {
        title: "Aprovar acesso?",
        description:
          "A pessoa passa a acessar o painel imediatamente, como editor. Você pode promover a dono depois, na lista.",
        changes: [
          {
            field: "Acesso",
            before: "Sem acesso",
            after: `${pending.request.email} · Editor`,
            kind: "added",
          },
        ],
        confirmLabel: "Aprovar acesso",
        confirmVariant: "default",
      };
    case "reject":
      return {
        title: "Recusar pedido?",
        description:
          "O pedido é apagado e a pessoa continua sem acesso. Ela pode pedir de novo se tentar entrar outra vez.",
        changes: [
          {
            field: "Pedido",
            before: pending.request.email,
            after: "Recusado",
            kind: "removed",
          },
        ],
        confirmLabel: "Recusar pedido",
        confirmVariant: "danger",
      };
  }
}
