import { apiRequest } from "@/lib/api";

export type LoginPayload = {
    identifier: string;
    password: string;
};

export type LoginResponse = {
    message: string;
    status: string;
    data: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            username: string;
            role:
                | "ADMIN"
                | "TEACHER"
                | "HOMEROOM_TEACHER"
                | "STUDENT"
                | "BK"
                | "HEADMASTER";
            status: "ACTIVE" | "INACTIVE";
        };
    };
};

export async function login(payload: LoginPayload) {
    return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: payload,
    });
}

export async function getProfile(token: string) {
    return apiRequest("/auth/profile", {
        method: "GET",
        token,
    });
}
