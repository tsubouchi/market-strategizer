import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 backdrop-blur-sm transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }