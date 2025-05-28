import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface PromptTagsProps {
  tags: string[];
}

const getTagVariant = (tag: string) => {
  switch (tag) {
    case "Safety Features":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Competitive":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Pricing":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Features":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Reviews":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "Technical":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    case "EV Range":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Performance":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    case "Market Share":
      return "bg-pink-100 text-pink-800 hover:bg-pink-100";
    case "Add Tags":
      return "bg-gray-50 text-gray-500 hover:bg-gray-50 border border-dashed border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export function PromptTags({ tags }: PromptTagsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, idx) => (
        <Badge
          key={idx}
          variant="secondary"
          className={`text-xs ${getTagVariant(tag)}`}
        >
          {tag === "Add Tags" && <Plus className="h-3 w-3 mr-1" />}
          {tag}
        </Badge>
      ))}
    </div>
  );
}
