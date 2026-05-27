import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-micro uppercase tracking-[0.22em] block",
      className,
    )}
    style={{ color: "hsl(var(--accent-strong))" }}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
