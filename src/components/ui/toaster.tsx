import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 md:max-w-[420px] w-full pointer-events-none">
      {toasts
        .filter((t) => t.open !== false)
        .map(({ id, title, description, variant, action }) => (
          <div
            key={id}
            className={cn(
              "pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 shadow-lg",
              "animate-in slide-in-from-bottom-4 fade-in duration-300",
              variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-gray-200 bg-white text-gray-900",
            )}
          >
            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <p
                  className={cn(
                    "text-sm font-semibold",
                    variant === "destructive"
                      ? "text-red-900"
                      : "text-gray-900",
                  )}
                >
                  {title}
                </p>
              )}
              {description && (
                <p
                  className={cn(
                    "text-sm mt-0.5",
                    variant === "destructive"
                      ? "text-red-700"
                      : "text-gray-500",
                  )}
                >
                  {description}
                </p>
              )}
              {action && <div className="mt-2">{action}</div>}
            </div>

            {/* Close button — plain button, no Radix, no wrappers */}
            <button
              type="button"
              onClick={() => dismiss(id)}
              className={cn(
                "flex-shrink-0 rounded-lg p-1 transition-colors cursor-pointer",
                variant === "destructive"
                  ? "text-red-400 hover:text-red-700 hover:bg-red-100"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
    </div>
  );
}
