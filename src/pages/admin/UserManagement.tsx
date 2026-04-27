import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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
  Mail,
  Shield,
  User,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_date: string;
}

const roleColors = {
  admin: "bg-violet-500/10 text-violet-600",
  user: "bg-blue-500/10 text-blue-600",
};

// Static user data
const STATIC_USERS: User[] = [
  {
    id: "1",
    full_name: "John Admin",
    email: "john.admin@brandpulse.com",
    role: "admin",
    created_date: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Sarah Client",
    email: "sarah.client@brandpulse.com",
    role: "user",
    created_date: "2026-01-20T10:00:00Z",
  },
  {
    id: "3",
    full_name: "Mike Johnson",
    email: "mike.johnson@brandpulse.com",
    role: "user",
    created_date: "2026-01-25T10:00:00Z",
  },
  {
    id: "4",
    full_name: "Emma Wilson",
    email: "emma.wilson@brandpulse.com",
    role: "user",
    created_date: "2026-02-01T10:00:00Z",
  },
  {
    id: "5",
    full_name: "David Chen",
    email: "david.chen@brandpulse.com",
    role: "admin",
    created_date: "2026-02-05T10:00:00Z",
  },
  {
    id: "6",
    full_name: "Lisa Thompson",
    email: "lisa.thompson@brandpulse.com",
    role: "user",
    created_date: "2026-02-10T10:00:00Z",
  },
];

// Store users in memory (simulating database)
let usersStore: User[] = [...STATIC_USERS];
let pendingInvites: any[] = [];

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "user" });
  const [inviting, setInviting] = useState(false);

  const loadUsers = async () => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUsers([...usersStore]);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Check if user already exists
      const existingUser = usersStore.find((u) => u.email === inviteForm.email);

      if (existingUser) {
        toast({
          title: "User already exists",
          description: `${inviteForm.email} is already registered.`,
          variant: "destructive",
        });
      } else {
        // Create new user
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          full_name: "",
          email: inviteForm.email,
          role: inviteForm.role as "admin" | "user",
          created_date: new Date().toISOString(),
        };

        usersStore.push(newUser);
        setUsers([...usersStore]);

        // Store pending invite
        pendingInvites.push({
          email: inviteForm.email,
          role: inviteForm.role,
          invited_at: new Date().toISOString(),
        });

        toast({
          title: "Invitation sent!",
          description: `An invite was sent to ${inviteForm.email}`,
        });

        setInviteOpen(false);
        setInviteForm({ email: "", role: "user" });
      }
    } catch (err: any) {
      toast({
        title: "Failed to invite",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }

    setInviting(false);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user",
  ) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userIndex = usersStore.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      usersStore[userIndex] = { ...usersStore[userIndex], role: newRole };
      setUsers([...usersStore]);
    }

    toast({ title: `Role updated to ${newRole}` });
  };

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invite and manage platform users
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-2xl font-heading font-extrabold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card rounded-2xl border p-4">
          <p className="text-2xl font-heading font-extrabold">
            {users.filter((u) => u.role === "admin").length}
          </p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </div>
        <div className="bg-card rounded-2xl border p-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-heading font-extrabold">
            {users.filter((u) => u.role === "user").length}
          </p>
          <p className="text-sm text-muted-foreground">Regular Users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search users..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xs font-heading shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium">{u.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${roleColors[u.role] || "bg-muted"}`}
                    >
                      {u.role === "admin" ? (
                        <Shield className="w-3 h-3 mr-1" />
                      ) : (
                        <User className="w-3 h-3 mr-1" />
                      )}
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {moment(u.created_date).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg h-8 w-8"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.role !== "admin" && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u.id, "admin")}
                          >
                            <Shield className="w-4 h-4 mr-2 text-violet-600" />{" "}
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {u.role !== "user" && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(u.id, "user")}
                          >
                            <User className="w-4 h-4 mr-2 text-blue-600" /> Make
                            Regular User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Invite a User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInviteForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="user@company.com"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v: string) =>
                  setInviteForm((p) => ({ ...p, role: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Regular User (Client)
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Regular users access the client dashboard. Admins can manage the
                platform.
              </p>
            </div>
            <Button
              type="submit"
              disabled={inviting}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {inviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Optional: Display debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
          <p>
            Demo Mode: {users.length} total users (
            {users.filter((u) => u.role === "admin").length} admins,{" "}
            {users.filter((u) => u.role === "user").length} regular users)
          </p>
          <p className="mt-1">Pending invites: {pendingInvites.length}</p>
        </div>
      )}
    </div>
  );
}
