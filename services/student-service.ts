import { apiRequest } from "@/lib/api";

export type StudentItem = {
    id: string;
    nis: string;
    nisn: string;
    fullName: string;
    gender: "Laki-laki" | "Perempuan" | "MALE" | "FEMALE";
    birthPlace?: string;
    birthDate?: string;
    address?: string;
    phone?: string;
    email?: string;
    className?: string;
    major?: string;
    admissionYear?: number;
    status: string;
    photo?: string;
    class?: {
        id: string;
        name: string;
        grade: string;
        major: string;
        academicYear: string;
    } | null;
};

type StudentListResponse = {
    message: string;
    status: string;
    data: StudentItem[];
};

type StudentSingleResponse = {
    message: string;
    status: string;
    data: StudentItem;
};

export async function getStudents(token: string) {
    return apiRequest<StudentListResponse>("/students", {
        method: "GET",
        token,
    });
}

export async function getStudent(token: string, id: string) {
    return apiRequest<StudentSingleResponse>(`/students/${id}`, {
        method: "GET",
        token,
    });
}

export async function createStudent(token: string, body: Partial<StudentItem>) {
    return apiRequest<StudentSingleResponse>("/students", {
        method: "POST",
        token,
        body,
    });
}

export async function updateStudent(token: string, id: string, body: Partial<StudentItem>) {
    return apiRequest<StudentSingleResponse>(`/students/${id}`, {
        method: "PUT",
        token,
        body,
    });
}

export async function deleteStudent(token: string, id: string) {
    return apiRequest<{ message: string; status: string }>(`/students/${id}`, {
        method: "DELETE",
        token,
    });
}
