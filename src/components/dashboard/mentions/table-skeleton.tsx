import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export function MentionsTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Checkbox />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6.5 w-6.5 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
