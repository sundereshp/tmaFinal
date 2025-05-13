
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  submessage?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ message, submessage, onAction, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{message}</h3>
        {submessage && <p className="text-sm text-muted-foreground mb-4">{submessage}</p>}
        {onAction && (
          <Button onClick={onAction}>
            {actionLabel || "Get Started"}
          </Button>
        )}
      </div>
    </div>
  );
}
