import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Reusable Label Component.
 * Built on top of Radix UI's Label Primitive to support enhanced click delegation,
 * focus behavior, and seamless integration with form inputs.
 * 
 * Props:
 * @param className - Optional styling overrides from the parent component.
 * @param ...props - Attributes accepted by Radix UI Label Root (like htmlFor, etc.).
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

