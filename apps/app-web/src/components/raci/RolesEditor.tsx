/**
 * Roles Editor
 * CRUD operations for roles with reordering
 */

import { RaciRole } from "@/types/raci";
import { Button } from "@spearyx/ui-kit";
import { Plus, Trash2 } from "lucide-react";

interface RolesEditorProps {
  roles: RaciRole[];
  onChange: (roles: RaciRole[]) => void;
}

export default function RolesEditor({ roles, onChange }: RolesEditorProps) {
  const addRole = () => {
    const newRole: RaciRole = {
      id: `role-${Date.now()}`,
      name: "",
      order: roles.length,
    };
    onChange([...roles, newRole]);
  };

  const removeRole = (id: string) => {
    onChange(roles.filter((r) => r.id !== id));
  };

  const updateRole = (id: string, name: string) => {
    onChange(roles.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((role) => (
          <div key={role.id} className="flex gap-2">
            <input
              type="text"
              value={role.name}
              onChange={(e) => updateRole(role.id, e.target.value)}
              placeholder="Role name"
              aria-label={`Role ${role.order + 1}`}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
            />
            <Button
              onClick={() => removeRole(role.id)}
              variant="destructive"
              size="sm"
              aria-label={`Remove role ${role.name}`}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={addRole} variant="outline" className="w-full">
        <Plus size={16} /> Add Role
      </Button>
    </div>
  );
}
