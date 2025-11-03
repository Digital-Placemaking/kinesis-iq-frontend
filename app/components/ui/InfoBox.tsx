/**
 * Info box component
 * Displays colored information boxes with title and content
 */
interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
  className?: string;
}

export default function InfoBox({
  title,
  children,
  variant = "info",
  className = "",
}: InfoBoxProps) {
  // Variant color mapping
  const variantClasses = {
    info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
    warning: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
    success:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
  };

  const textClasses = {
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
  };

  return (
    <div
      className={`rounded-xl border p-3 ${variantClasses[variant]} ${className}`}
    >
      {title && (
        <p
          className={`mb-1 text-center text-xs font-medium uppercase tracking-wide ${textClasses[variant]}`}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
