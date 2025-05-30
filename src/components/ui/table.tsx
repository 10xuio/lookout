import * as React from "react";

import { cn } from "@/lib/utils";
import { FileX } from "lucide-react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground bg-sidebar border-r last:border-r-0 h-10 px-3 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:w-10 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle border-r last:border-r-0 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-10 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

interface TableEmptyStateProps {
  colSpan: number;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function TableEmptyState({
  colSpan,
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon: Icon = FileX,
}: TableEmptyStateProps) {
  return (
    <TableBody>
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colSpan} className="h-32">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Icon className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmptyState,
};
