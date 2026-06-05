import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

const prisma =
  tursoUrl && tursoUrl.startsWith("libsql://")
    ? new PrismaClient({
        adapter: new PrismaLibSQL({
          url: tursoUrl,
          authToken: tursoAuthToken,
        }),
      })
    : new PrismaClient();

async function main() {
  console.log("Mulai menjalankan seeder...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@manda.sch.id",
    },
    update: {},
    create: {
      name: "Admin MANDA",
      email: "admin@manda.sch.id",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const teacherUser1 = await prisma.user.upsert({
    where: {
      email: "ahmad.zainuddin@manda.sch.id",
    },
    update: {},
    create: {
      name: "Drs. Ahmad Zainuddin",
      email: "ahmad.zainuddin@manda.sch.id",
      username: "ahmad.zainuddin",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacherUser2 = await prisma.user.upsert({
    where: {
      email: "siti.rahmawati@manda.sch.id",
    },
    update: {},
    create: {
      name: "Siti Rahmawati, S.Pd",
      email: "siti.rahmawati@manda.sch.id",
      username: "siti.rahmawati",
      password: hashedPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacher1 = await prisma.teacher.upsert({
    where: {
      userId: teacherUser1.id,
    },
    update: {},
    create: {
      userId: teacherUser1.id,
      nip: "197801012006041001",
      fullName: "Drs. Ahmad Zainuddin",
      gender: "MALE",
      subject: "Matematika",
      phone: "081234567890",
      address: "Gresik",
      status: "ACTIVE",
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: {
      userId: teacherUser2.id,
    },
    update: {},
    create: {
      userId: teacherUser2.id,
      nip: "198505152010012002",
      fullName: "Siti Rahmawati, S.Pd",
      gender: "FEMALE",
      subject: "Bahasa Indonesia",
      phone: "081234567891",
      address: "Gresik",
      status: "ACTIVE",
    },
  });

  const classXipa1 = await prisma.schoolClass.upsert({
    where: {
      name_academicYear: {
        name: "X IPA 1",
        academicYear: "2026/2027",
      },
    },
    update: {},
    create: {
      name: "X IPA 1",
      grade: "X",
      major: "IPA",
      academicYear: "2026/2027",
      homeroomTeacherId: teacher1.id,
      status: "ACTIVE",
    },
  });

  const classXips1 = await prisma.schoolClass.upsert({
    where: {
      name_academicYear: {
        name: "X IPS 1",
        academicYear: "2026/2027",
      },
    },
    update: {},
    create: {
      name: "X IPS 1",
      grade: "X",
      major: "IPS",
      academicYear: "2026/2027",
      homeroomTeacherId: teacher2.id,
      status: "ACTIVE",
    },
  });

  const studentData = [
    {
      nis: "2026001",
      nisn: "0067890001",
      fullName: "Ahmad Fauzi",
      gender: "MALE" as const,
      classId: classXipa1.id,
    },
    {
      nis: "2026002",
      nisn: "0067890002",
      fullName: "Siti Aminah",
      gender: "FEMALE" as const,
      classId: classXipa1.id,
    },
    {
      nis: "2026003",
      nisn: "0067890003",
      fullName: "Dimas Pratama",
      gender: "MALE" as const,
      classId: classXipa1.id,
    },
    {
      nis: "2026004",
      nisn: "0067890004",
      fullName: "Laila Putri",
      gender: "FEMALE" as const,
      classId: classXipa1.id,
    },
    {
      nis: "2026005",
      nisn: "0067890005",
      fullName: "Muhammad Ilham",
      gender: "MALE" as const,
      classId: classXips1.id,
    },
    {
      nis: "2026006",
      nisn: "0067890006",
      fullName: "Nabila Safira",
      gender: "FEMALE" as const,
      classId: classXips1.id,
    },
  ];

  for (const item of studentData) {
    const username = item.fullName.toLowerCase().replace(/\s+/g, ".");
    const email = `${username}@siswa.manda.sch.id`;

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {},
      create: {
        name: item.fullName,
        email,
        username,
        password: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    const student = await prisma.student.upsert({
      where: {
        nis: item.nis,
      },
      update: {},
      create: {
        userId: user.id,
        nis: item.nis,
        nisn: item.nisn,
        fullName: item.fullName,
        gender: item.gender,
        address: "Gresik",
        phone: "081234560000",
        status: "ACTIVE",
      },
    });

    await prisma.studentClass.upsert({
      where: {
        studentId_classId_academicYear: {
          studentId: student.id,
          classId: item.classId,
          academicYear: "2026/2027",
        },
      },
      update: {},
      create: {
        studentId: student.id,
        classId: item.classId,
        academicYear: "2026/2027",
        status: "ACTIVE",
      },
    });
  }

  const subjectData = [
    {
      name: "Matematika Wajib",
      code: "MTK-WAJIB",
      classId: classXipa1.id,
      teacherId: teacher1.id,
    },
    {
      name: "Bahasa Indonesia",
      code: "BIN-X",
      classId: classXipa1.id,
      teacherId: teacher2.id,
    },
    {
      name: "Fisika",
      code: "FIS-X",
      classId: classXipa1.id,
      teacherId: null,
    },
    {
      name: "Matematika Wajib",
      code: "MTK-WAJIB",
      classId: classXips1.id,
      teacherId: teacher1.id,
    },
    {
      name: "Bahasa Indonesia",
      code: "BIN-X",
      classId: classXips1.id,
      teacherId: teacher2.id,
    },
    {
      name: "Sosiologi",
      code: "SOS-X",
      classId: classXips1.id,
      teacherId: null,
    },
  ];

  for (const item of subjectData) {
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: item.name,
        classId: item.classId,
      },
    });

    if (!existingSubject) {
      await prisma.subject.create({
        data: {
          name: item.name,
          code: item.code,
          classId: item.classId,
          teacherId: item.teacherId,
          status: "ACTIVE",
        },
      });
    }
  }

  // Clear transactional tables to avoid seeding duplicates or referential issues when re-seeding
  await prisma.achievement.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.announcement.deleteMany();

  // Get fresh lists for relationship referencing
  const students = await prisma.student.findMany();
  const subjects = await prisma.subject.findMany();
  const users = await prisma.user.findMany();

  // 1. Seed System Settings
  await prisma.systemSetting.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      schoolName: "MAN 2 Gresik",
      academicYear: "2026/2027",
      semester: "Ganjil"
    }
  });

  // 2. Seed Announcements
  const adminUser = users.find(u => u.role === "ADMIN");
  if (adminUser) {
    await prisma.announcement.create({
      data: {
        title: "Pemberitahuan Ujian Akhir Semester",
        content: "Diberitahukan kepada seluruh siswa bahwa Ujian Akhir Semester (UAS) Ganjil akan dilaksanakan mulai tanggal 8 Juni 2026. Harap persiapkan diri dengan baik.",
        category: "Akademik",
        targetRole: "ALL",
        createdById: adminUser.id
      }
    });

    await prisma.announcement.create({
      data: {
        title: "Rapat Koordinasi Guru",
        content: "Undangan rapat koordinasi bulanan untuk mengevaluasi proses pembelajaran di semester ganjil. Rapat akan diadakan di ruang guru pada hari Sabtu pukul 09:00 WIB.",
        category: "Kegiatan",
        targetRole: "TEACHER",
        createdById: adminUser.id
      }
    });
  }

  // 3. Seed Schedules
  const mathXipa1 = subjects.find(s => s.name === "Matematika Wajib" && s.classId === classXipa1.id);
  if (mathXipa1) {
    await prisma.schedule.create({
      data: {
        day: "Senin",
        startTime: "07:00",
        endTime: "08:30",
        subjectId: mathXipa1.id,
        teacherId: teacher1.id,
        classId: classXipa1.id,
        room: "Ruang 101",
        semester: "Ganjil",
        academicYear: "2026/2027"
      }
    });
  }

  const binXipa1 = subjects.find(s => s.name === "Bahasa Indonesia" && s.classId === classXipa1.id);
  if (binXipa1) {
    await prisma.schedule.create({
      data: {
        day: "Selasa",
        startTime: "10:15",
        endTime: "11:45",
        subjectId: binXipa1.id,
        teacherId: teacher2.id,
        classId: classXipa1.id,
        room: "Lab IPA",
        semester: "Ganjil",
        academicYear: "2026/2027"
      }
    });
  }

  // 4. Seed Attendances
  if (mathXipa1) {
    for (const student of students.filter(s => s.fullName === "Ahmad Fauzi" || s.fullName === "Siti Aminah")) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: classXipa1.id,
          subjectId: mathXipa1.id,
          teacherId: teacher1.id,
          date: new Date("2026-05-30"),
          status: "PRESENT",
          note: "Hadir tepat waktu"
        }
      });

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: classXipa1.id,
          subjectId: mathXipa1.id,
          teacherId: teacher1.id,
          date: new Date("2026-06-01"),
          status: student.fullName === "Ahmad Fauzi" ? "LATE" : "PRESENT",
          note: student.fullName === "Ahmad Fauzi" ? "Terlambat 10 menit" : null
        }
      });
    }
  }

  // 5. Seed Grades
  if (mathXipa1 && binXipa1) {
    const ahmadFauzi = students.find(s => s.fullName === "Ahmad Fauzi");
    if (ahmadFauzi) {
      await prisma.grade.create({
        data: {
          studentId: ahmadFauzi.id,
          classId: classXipa1.id,
          subjectId: mathXipa1.id,
          teacherId: teacher1.id,
          assignmentScore: 85,
          dailyScore: 88,
          midtermScore: 82,
          finalExamScore: 90,
          finalScore: 86.55,
          predicate: "B",
          note: "Aktif dan konsisten."
        }
      });

      await prisma.grade.create({
        data: {
          studentId: ahmadFauzi.id,
          classId: classXipa1.id,
          subjectId: binXipa1.id,
          teacherId: teacher2.id,
          assignmentScore: 82,
          dailyScore: 84,
          midtermScore: 80,
          finalExamScore: 86,
          finalScore: 83.7,
          predicate: "B",
          note: "Pemahaman konsep baik."
        }
      });
    }

    const sitiAminah = students.find(s => s.fullName === "Siti Aminah");
    if (sitiAminah) {
      await prisma.grade.create({
        data: {
          studentId: sitiAminah.id,
          classId: classXipa1.id,
          subjectId: mathXipa1.id,
          teacherId: teacher1.id,
          assignmentScore: 90,
          dailyScore: 92,
          midtermScore: 88,
          finalExamScore: 94,
          finalScore: 91.10,
          predicate: "A",
          note: "Sangat baik."
        }
      });
    }
  }

  // 6. Seed Leave Requests
  const ahmadFauzi = students.find(s => s.fullName === "Ahmad Fauzi");
  if (ahmadFauzi) {
    await prisma.leaveRequest.create({
      data: {
        studentId: ahmadFauzi.id,
        classId: classXipa1.id,
        type: "Izin Sakit",
        date: new Date("2026-05-30"),
        status: "Disetujui",
        description: "Sakit demam"
      }
    });

    await prisma.leaveRequest.create({
      data: {
        studentId: ahmadFauzi.id,
        classId: classXipa1.id,
        type: "Izin Keluarga",
        date: new Date("2026-06-02"),
        status: "Menunggu",
        description: "Ada acara keluarga"
      }
    });
  }

  // 7. Seed Achievements
  if (ahmadFauzi) {
    await prisma.achievement.create({
      data: {
        code: "PR001",
        studentId: ahmadFauzi.id,
        classId: classXipa1.id,
        title: "Juara 1 Olimpiade Matematika",
        level: "Kabupaten",
        date: new Date("2026-05-15")
      }
    });
  }

  console.log("Seeder berhasil dijalankan.");
  console.log("Akun login awal:");
  console.log("Admin: admin@manda.sch.id / password123");
  console.log("Guru: ahmad.zainuddin@manda.sch.id / password123");
  console.log("Siswa: ahmad.fauzi@siswa.manda.sch.id / password123");
}

main()
  .catch((error) => {
    console.error("Seeder gagal:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
