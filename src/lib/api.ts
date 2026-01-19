import axios from "axios";
import { BASE_URL } from "./config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type Note = {
  _id: string;
  title: string;
  discriptipn: string;
  createdAt: string;
};

// Get token from localStorage
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

// Save token to localStorage
function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

// Remove token from localStorage
function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token removal
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }
    const message = error.response?.data?.message || error.message || "Request failed";
    throw new ApiError(message, error.response?.status || 500);
  }
);

type SignupResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    token: string;
  };
};

type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    token: string;
  };
};

type NotesResponse = {
  success: boolean;
  count: number;
  data: Note[];
};

type NoteResponse = {
  success: boolean;
  message: string;
  data: Note;
};

export async function signup(
  name: string,
  email: string,
  password: string,
  phone?: string,
  confirmPassword?: string
) {
  const response = await axiosInstance.post<SignupResponse>("/auth/signup", {
    name,
    email,
    password,
    phone,
  });

  if (response.data.success && response.data.data.token) {
    saveToken(response.data.data.token);
  }

  return response.data;
}

export async function login(email: string, password: string) {
  const response = await axiosInstance.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  if (response.data.success && response.data.data.token) {
    saveToken(response.data.data.token);
  }

  return response.data;
}

export function logout() {
  removeToken();
  return Promise.resolve({ message: "Logged out successfully" });
}

// In your api.ts file, update the getProfile function:

export async function getProfile() {
   const response = await axiosInstance.get("/auth/profile");
  return response?.data.data;
}

export async function getNotes() {
  const response = await axiosInstance.get<NotesResponse>("/note/notes");
  return response.data.data;
}

export async function createNote(title: string, discriptipn: string) {
  const response = await axiosInstance.post<NoteResponse>("/note/notes", {
    title,
    discriptipn,
  });
  return response.data.data;
}

export async function updateNote(id: string, title: string, discriptipn: string) {
  const response = await axiosInstance.put<NoteResponse>(`/note/notes/${id}`, {
    title,
    discriptipn,
  });
  return response.data.data;
}

export async function deleteNote(id: string) {
  const response = await axiosInstance.delete<NoteResponse>(`/note/notes/${id}`);
  return response.data.data;
}
