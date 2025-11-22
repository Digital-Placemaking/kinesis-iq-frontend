/**
 * app/admin/components/QuickActions.tsx
 * Quick actions grid component.
 * Displays common admin actions in a responsive grid layout.
 */
import QuickActionCard from "./QuickActionCard";

interface QuickAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, idx) => (
          <QuickActionCard
            key={action.href || `${action.label}-${idx}`}
            href={action.href}
            label={action.label}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}
