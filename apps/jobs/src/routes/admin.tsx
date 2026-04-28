import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listUsers, createUser, deleteUser } from "@/server/functions/admin";
import { PageHero, PageSection } from "@spearyx/ui-kit";
import { Shield, Trash2 } from "lucide-react";

type AdminUser = { id: number; email: string; role: string; createdAt: string };

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number; role: string } | null };
    if (!ctx.user) throw redirect({ to: "/login" });
    if (ctx.user.role !== "admin") throw redirect({ to: "/" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      setUserList(await listUsers({}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUserList([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUser({ data: { email, password } });
      setEmail(""); setPassword("");
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!window.confirm("Delete this user and all their data?")) return;
    setError("");
    try {
      await deleteUser({ data: { userId } });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <PageHero
        eyebrow="Admin"
        icon={<Shield className="h-3.5 w-3.5" />}
        title="User Management"
        description="Manage jobs-app access, create accounts, and remove users when needed."
        stats={[
          { label: "Users", value: String(userList.length) },
          { label: "Admins", value: String(userList.filter((user) => user.role === "admin").length) },
        ]}
      />

      <PageSection
        title="Create User"
        description="Add a new user to the jobs application with an initial password."
      >
        <form onSubmit={handleAddUser} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {loadingUsers && <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>}
      </PageSection>

      <PageSection
        title="Current Users"
        description="Accounts with access to the jobs workspace."
        className="overflow-hidden p-0"
        contentClassName=""
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {userList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No users yet
                </td>
              </tr>
            ) : (
              userList.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </PageSection>
    </div>
  );
}
