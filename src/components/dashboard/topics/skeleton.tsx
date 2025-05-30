import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export function TopicsTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
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
            <span className="font-medium max-w-xs overflow-hidden whitespace-normal break-words">
              <Skeleton className="h-4 w-48" />
            </span>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-10 rounded" />
              <Skeleton className="h-8 w-10 rounded" />
              <Skeleton className="h-8 w-10 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
