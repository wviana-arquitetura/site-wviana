import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className,
      )}
      style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
