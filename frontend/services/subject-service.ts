import { apiRequest } from "@/lib/api";

export type SubjectItem = {
    id: string;
    name: string;
    code?: string;
    classId?: string;
    teacherId?: string | null;
    description?: string;
    credits?: number;
    grade?: string;
    major?: string;
    status?: string;
    class?: {
        id: string;
        name: string;
        grade: string;
        major: string;
        academicYear: string;
    } | null;
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

type SubjectQuery = {
    classId?: string;
    status?: string;
    search?: string;
};

function toQueryString(query?: SubjectQuery) {
    if (!query) return "";

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
}

export async function getSubjects(token: string, query?: SubjectQuery) {
    return apiRequest<SubjectListResponse>(`/subjects${toQueryString(query)}`, {
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
