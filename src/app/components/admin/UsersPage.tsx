import { useMemo, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";
import { Loader2, Pencil, Search, Trash2, UserPlus, Users as UsersIcon, X } from "lucide-react";

import UserModal from "./modals/UserModal";
import { type User, type UserRole, type UserStatus } from "@/lib/data/admin/users";
import { useAdminUsers } from "@/lib/hooks/admin/useAdminUsers";

export default function UsersPage() {
  const { users, statistics, loading, error, createUser, updateUser, deleteUser } =
    useAdminUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.studentNumber?.toLowerCase().includes(query) ||
          user.employeeId?.toLowerCase().includes(query),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    return result;
  }, [search, roleFilter, statusFilter, users]);

  const hasFilters = Boolean(search) || roleFilter !== "all" || statusFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "faculty":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "program-chair":
        return "bg-green-100 text-green-800 border-green-300";
      case "stakeholder":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "admin":
        return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
    }
  };

  const formatRole = (role: UserRole) =>
    role
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const openCreateModal = () => {
    setActiveUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setActiveUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSubmit = async (payload: Partial<User>) => {
    if (modalMode === "create") {
      await createUser(payload);
      return;
    }

    if (activeUser) {
      await updateUser(activeUser.id, payload);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    await deleteUser(deleteTarget.id);
    setProcessingId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage system users and permissions
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load users: {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="mt-1 text-2xl font-bold">{statistics.totalUsers}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <UsersIcon className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{statistics.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="mt-1 text-2xl font-bold text-gray-600">{statistics.inactiveUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New This Month</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">
                {statistics.newUsersThisMonth}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="program-chair">Program Chair</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department/Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <UsersIcon className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters ? "No users match your filters." : "No users found."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.studentNumber || user.employeeId || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("border text-xs", getRoleBadgeColor(user.role))}>
                          {formatRole(user.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.department || user.courseId || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastLogin || "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </CardContent>
      </Card>

      <UserModal
        open={modalOpen}
        mode={modalMode}
        initialUser={activeUser}
        onOpenChange={setModalOpen}
        onSubmit={handleModalSubmit}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.name} from the user list and revoke access data
              linked to this record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(processingId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={Boolean(processingId)}>
              {processingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
