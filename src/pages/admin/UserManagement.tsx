import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  UserPlus,
  Shield,
  User,
  MoreVertical,
  Trash2,
  ToggleLeft,
  Pencil,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

const roleClass = {
  admin: "bg-violet-500/10 text-violet-600",
  user: "bg-blue-500/10 text-blue-600",
};

function UserActionsMenu({
  user,
  onEdit,
  onToggle,
  onDelete,
}: {
  user: any;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl h-8 w-8"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[160px] rounded-lg border bg-popover p-1 shadow-md">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <Pencil className="w-4 h-4" /> Edit Role
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => { setOpen(false); onToggle(); }}
          >
            <ToggleLeft className="w-4 h-4" />
            {user.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user" as "admin" | "user",
  tenant_id: "",
};

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState<"admin" | "user">("user");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: () =>
      AdminAPI.listUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page,
        per_page: 15,
      }).then((r: any) => r),
    staleTime: 30_000,
  });

  // Fetch tenants for the create-user form dropdown
  const { data: tenantsData } = useQuery({
    queryKey: ["admin-clients-all"],
    queryFn: () =>
      AdminAPI.listClients({ per_page: 100 }).then((r: any) => r.data),
    staleTime: 120_000,
  });

  const users: any[] = (data as any)?.data ?? [];
  const meta: any = (data as any)?.meta ?? {};
  const tenants: any[] = tenantsData ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: (body: any) => AdminAPI.createUser(body),
    onSuccess: () => {
      toast({ title: "User created!" });
      invalidate();
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.toggleActive(id),
    onSuccess: (res: any) => {
      toast({ title: res.data?.message ?? "Updated" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.deleteUser(id),
    onSuccess: () => {
      toast({ title: "User deleted" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      AdminAPI.updateUser(id, { role }),
    onSuccess: () => {
      toast({ title: "Role updated!" });
      invalidate();
      setEditOpen(false);
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e?.response?.message ?? e.message, variant: "destructive" }),
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta.total ?? users.length} total users
          </p>
        </div>
        <Button
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users…"
            className="pl-10 rounded-xl"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {[
                    "User",
                    "Email",
                    "Company",
                    "Role",
                    "Status",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {user.tenant?.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${roleClass[user.role as "admin" | "user"] ?? "bg-muted"}`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="w-3 h-3 inline mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 inline mr-1" />
                            User
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          user.is_active
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {user.created_at
                        ? moment(user.created_at).format("D MMM YYYY")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <UserActionsMenu
                        user={user}
                        onEdit={() => { setEditUser(user); setEditRole(user.role); setEditOpen(true); }}
                        onToggle={() => toggleMutation.mutate(user.id)}
                        onDelete={() => deleteMutation.mutate(user.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · {meta.total}{" "}
                total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  disabled={page === meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Role — {editUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v: "admin" | "user") => setEditRole(v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Client (User)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              disabled={updateRoleMutation.isPending}
              onClick={() => editUser && updateRoleMutation.mutate({ id: editUser.id, role: editRole })}
            >
              {updateRoleMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="rounded-xl"
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="rounded-xl"
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input
                required
                type="password"
                value={form.password}
                placeholder="Min 8 characters"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v: "admin" | "user") =>
                    setForm((p) => ({ ...p, role: v }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select
                  value={form.tenant_id}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, tenant_id: v }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {createMutation.isPending ? "Creating…" : "Create User"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
