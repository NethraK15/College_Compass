import type { College, Question } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  token?: string | null;
  body?: unknown;
};

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Request failed");
  }

  return (await response.json()) as T;
}

export type CollegesResponse = {
  data: College[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export function fetchColleges(queryString: string) {
  return apiRequest<CollegesResponse>(`/api/colleges${queryString}`);
}

export function fetchCollegeById(id: string) {
  return apiRequest<{ data: College }>(`/api/colleges/${id}`);
}

export function fetchQuestions() {
  return apiRequest<{ data: Question[] }>("/api/questions");
}
