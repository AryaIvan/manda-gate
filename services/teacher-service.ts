import { apiRequest } from "@/lib/api";

export type TeacherItem = {
    id: string;
    nip?: string;
    fullName: string;
    gender: string;
    email?: string;
    phone?: string;
    address?: string;
    subject?: string;
    position?: string;
    status: string;
    photo?: string;
    account?: {
        id: string;
        name?: string;
        email: string;
        username: string;
        role: "TEACHER" | "HOMEROOM_TEACHER" | string;
        status: "ACTIVE" | "INACTIVE" | string;
        lastLogin?: string | null;
    } | null;
};

type TeacherListResponse = {
    message: string;
    status: string;
    data: TeacherItem[];
};

type TeacherSingleResponse = {
    message: string;
    status: string;
    data: TeacherItem;
};

export async function getTeachers(token: string) {
    return apiRequest<TeacherListResponse>("/teachers", {
        method: "GET",
        token,
    });
}

export async function getTeacher(token: string, id: string) {
    return apiRequest<TeacherSingleResponse>(`/teachers/${id}`, {
        method: "GET",
        token,
    });
}

export async function createTeacher(token: string, body: Partial<TeacherItem>) {
    return apiRequest<TeacherSingleResponse>("/teachers", {
        method: "POST",
        token,
        body,
    });
}

type CreateTeacherAccountPayload = {
    email?: string;
    username?: string;
    password?: string;
    role?: "TEACHER" | "HOMEROOM_TEACHER";
};

type CreateTeacherAccountResponse = {
    message: string;
    status: string;
    data: {
        teacher: TeacherItem;
        defaultPassword: string;
    };
};

export async function createTeacherAccount(
    token: string,
    id: string,
    body: CreateTeacherAccountPayload,
) {
    return apiRequest<CreateTeacherAccountResponse>(`/teachers/${id}/create-account`, {
        method: "POST",
        token,
        body,
    });
}

export async function updateTeacher(token: string, id: string, body: Partial<TeacherItem>) {
    return apiRequest<TeacherSingleResponse>(`/teachers/${id}`, {
        method: "PUT",
        token,
        body,
    });
}

export async function deleteTeacher(token: string, id: string) {
    return apiRequest<{ message: string; status: string }>(`/teachers/${id}`, {
        method: "DELETE",
        token,
    });
}
