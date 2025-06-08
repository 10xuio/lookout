import { config } from "@/lib/config";
import { SearchResult } from "@/lib/llm";
import { cleanUrl, cn } from "@/lib/utils";
import Image from "next/image";

interface BrandListProps {
  top: SearchResult[];
  className?: string;
}

export function ImageAvatar({
  url,
  title,
  size = 80,
  className,
}: {
  url: string;
  title: string;
  size?: number;
  className?: string;
}) {
  const link = cleanUrl(url);
  if (link) {
    return (
      <Image
        src={`https://img.logo.dev/${link}?token=${config.logoDevApi}&size=80&retina=true`}
        alt={title}
        className={cn(
          "w-6.5 h-6.5 border border-gray-200 rounded object-cover",
          className
        )}
        width={size}
        height={size}
      />
    );
  }

  return (
    <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center text-xs font-medium text-gray-100">
      {title?.charAt(0).toUpperCase()}
    </div>
  );
}

export function BrandList({ top, className }: BrandListProps) {
  if (top.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {top.slice(0, 3).map((brand, index) => (
        <div key={index} className="flex items-center gap-1">
          <ImageAvatar url={brand.url} title={brand.title} />
        </div>
      ))}
    </div>
  );
}
