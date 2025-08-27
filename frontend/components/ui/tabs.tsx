import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root
export const TabsList = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600",
      className
    )}
    {...props}
  />
)
export const TabsTrigger = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow",
      className
    )}
    {...props}
  />
)
export const TabsContent = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn("mt-4 focus-visible:outline-none", className)}
    {...props}
  />
)
