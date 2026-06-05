import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/types/attendance";

type AttendanceBadgeProps = {
  status: AttendanceStatus;
};

export function AttendanceBadge({ status }: AttendanceBadgeProps) {
  if (status === "PRESENT") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Hadir
      </Badge>
    );
  }

  if (status === "PERMISSION") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Izin
      </Badge>
    );
  }

  if (status === "SICK") {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Sakit
      </Badge>
    );
  }

  if (status === "ABSENT") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Alfa
      </Badge>
    );
  }

  if (status === "LATE") {
    return (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
        Terlambat
      </Badge>
    );
  }

  return <Badge variant="secondary">{status}</Badge>;
}