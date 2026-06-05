import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,#facc15,transparent_30%),radial-gradient(circle_at_bottom_right,#34d399,transparent_35%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <GraduationCap size={26} />
              </div>

              <div>
                <h1 className="text-lg font-bold">MANDA Gate</h1>
                <p className="text-xs text-emerald-100">MAN 2 Gresik</p>
              </div>
            </div>

            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              Login
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-emerald-50 backdrop-blur">
                <ShieldCheck size={16} />
                Portal Akademik Terpadu
              </div>

              <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Sistem Akademik Modern untuk MAN 2 Gresik.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-emerald-50 md:text-lg">
                MANDA Gate membantu mengelola data siswa, guru, kelas, jadwal,
                absensi, nilai, tugas, pengumuman, surat izin, dan laporan
                akademik secara digital dalam satu sistem.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Masuk ke Sistem
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#fitur"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Lihat Fitur
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-5 text-slate-900">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Dashboard</p>
                    <h3 className="text-xl font-bold">Ringkasan Akademik</h3>
                  </div>

                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Online
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DashboardCard
                    title="Total Siswa"
                    value="720"
                    icon={<Users size={22} />}
                  />
                  <DashboardCard
                    title="Total Guru"
                    value="58"
                    icon={<GraduationCap size={22} />}
                  />
                  <DashboardCard
                    title="Jadwal Hari Ini"
                    value="32"
                    icon={<CalendarDays size={22} />}
                  />
                  <DashboardCard
                    title="Kehadiran"
                    value="94%"
                    icon={<ClipboardCheck size={22} />}
                  />
                </div>

                <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 font-semibold">
                    <BookOpen size={18} className="text-emerald-700" />
                    Jadwal Hari Ini
                  </div>

                  <div className="space-y-3">
                    <ScheduleItem
                      subject="Matematika"
                      time="07.00 - 08.30"
                      classNameText="X IPA 1"
                    />
                    <ScheduleItem
                      subject="Informatika"
                      time="08.30 - 10.00"
                      classNameText="XI IPA 1"
                    />
                    <ScheduleItem
                      subject="Bahasa Arab"
                      time="10.15 - 11.45"
                      classNameText="X Agama"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-950">
            Fitur Utama MANDA Gate
          </h2>
          <p className="mt-3 text-slate-500">
            Semua kebutuhan akademik sekolah dalam satu portal digital.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="Manajemen Akademik"
            description="Kelola data siswa, guru, kelas, mata pelajaran, jadwal, dan tahun ajaran."
            icon={<Users size={24} />}
          />
          <FeatureCard
            title="Absensi & Nilai"
            description="Guru dapat menginput absensi dan nilai, siswa dapat melihat hasilnya."
            icon={<ClipboardCheck size={24} />}
          />
          <FeatureCard
            title="Pengumuman & Laporan"
            description="Informasi sekolah dan laporan akademik dapat diakses secara terpusat."
            icon={<BookOpen size={24} />}
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ScheduleItem({
  subject,
  time,
  classNameText,
}: {
  subject: string;
  time: string;
  classNameText: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-3">
      <div>
        <p className="font-semibold text-slate-900">{subject}</p>
        <p className="text-sm text-slate-500">{time}</p>
      </div>

      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        {classNameText}
      </span>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-500">{description}</p>
    </div>
  );
}