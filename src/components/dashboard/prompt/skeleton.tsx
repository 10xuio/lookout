import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export function PromptsTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Checkbox />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-20 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
