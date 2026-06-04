import { apiRequest } from "@/lib/api";

export type SubjectItem = {
    id: string;
    name: string;
    code?: string;
    description?: string;
    credits?: number;
    grade?: string;
    major?: string;
    status?: string;
    teacher?: {
        id: string;
        fullName: string;
        nip?: string;
    } | null;
};

type SubjectListResponse = {
    message: string;
    status: string;
    data: SubjectItem[];
};

type SubjectSingleResponse = {
    message: string;
    status: string;
    data: SubjectItem;
};

export async function getSubjects(token: string) {
    return apiRequest<SubjectListResponse>("/subjects", {
        method: "GET",
        token,
    });
}

export async function getSubject(token: string, id: string) {
    return apiRequest<SubjectSingleResponse>(`/subjects/${id}`, {
        method: "GET",
        token,
    });
}

export async function createSubject(token: string, body: Partial<SubjectItem>) {
    return apiRequest<SubjectSingleResponse>("/subjects", {
        method: "POST",
        token,
        body,
    });
}

export async function updateSubject(token: string, id: string, body: Partial<SubjectItem>) {
    return apiRequest<SubjectSingleResponse>(`/subjects/${id}`, {
        method: "PUT",
        token,
        body,
    });
}

export async function deleteSubject(token: string, id: string) {
    return apiRequest<{ message: string; status: string }>(`/subjects/${id}`, {
        method: "DELETE",
        token,
    });
}
