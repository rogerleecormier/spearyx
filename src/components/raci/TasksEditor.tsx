/**
 * Tasks Editor
 * CRUD operations for tasks with descriptions
 */

import { RaciTask } from "@/types/raci";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TasksEditorProps {
  tasks: RaciTask[];
  onChange: (tasks: RaciTask[]) => void;
}

export default function TasksEditor({ tasks, onChange }: TasksEditorProps) {
  const addTask = () => {
    const newTask: RaciTask = {
      id: `task-${Date.now()}`,
      name: "",
      description: "",
      order: tasks.length,
    };
    onChange([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    onChange(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (
    id: string,
    field: "name" | "description",
    value: string
  ) => {
    onChange(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="space-y-2 p-3 border border-input rounded-md bg-muted/30"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={task.name}
                onChange={(e) => updateTask(task.id, "name", e.target.value)}
                placeholder="Task name"
                aria-label={`Task ${task.order + 1} name`}
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
              />
              <Button
                onClick={() => removeTask(task.id)}
                variant="destructive"
                size="sm"
                aria-label={`Remove task ${task.name}`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <textarea
              value={task.description || ""}
              onChange={(e) =>
                updateTask(task.id, "description", e.target.value)
              }
              placeholder="Description (optional)"
              aria-label={`Task ${task.order + 1} description`}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-xs"
              rows={2}
            />
          </div>
        ))}
      </div>
      <Button onClick={addTask} variant="outline" className="w-full">
        <Plus size={16} /> Add Task
      </Button>
    </div>
  );
}
