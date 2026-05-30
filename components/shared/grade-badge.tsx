import { Badge } from "@/components/ui/badge";
import { Grade } from "@/types/grade";

type GradeBadgeProps = {
  predicate: Grade["predicate"];
};

export function GradeBadge({ predicate }: GradeBadgeProps) {
  if (predicate === "A") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        A
      </Badge>
    );
  }

  if (predicate === "B") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        B
      </Badge>
    );
  }

  if (predicate === "C") {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        C
      </Badge>
    );
  }

  if (predicate === "D") {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        D
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
      E
    </Badge>
  );
}