// ============= SKELETON.TSX =============

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    function cn(arg0: string, className: string | undefined): string {
        if (!className) return arg0;
        return `${arg0} ${className}`.trim();
    }
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };