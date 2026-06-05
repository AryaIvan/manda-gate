import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "Aktif") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Aktif
      </Badge>
    );
  }

  if (status === "Tidak Aktif") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Tidak Aktif
      </Badge>
    );
  }

  if (status === "Lulus") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Lulus
      </Badge>
    );
  }

  return <Badge variant="secondary">{status}</Badge>;
}