import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  experience: number;
  qualification: string;
  bio: string;
  status: "active" | "inactive";
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email: string;
  doctorId: string | Doctor;
  admissionDate: string;
  dischargeDate?: string;
  status: "admitted" | "discharged" | "under-observation" | "critical";
  bloodGroup: string;
  notes: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  pagination: Pagination;
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: Pagination;
}

export interface DashboardStats {
  stats: {
    totalDoctors: number;
    totalPatients: number;
    activePatients: number;
    criticalPatients: number;
    avgPatientsPerDoctor: number;
    dischargedPatients: number;
  };
  charts: {
    patientsByCondition: { name: string; value: number }[];
    patientsByStatus: { name: string; value: number }[];
    patientsByGender: { name: string; value: number }[];
    admissionTrend: { date: string; admissions: number }[];
    doctorWorkload: { name: string; specialization: string; patients: number }[];
  };
}

export interface DoctorFilters {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PatientFilters {
  page?: number;
  limit?: number;
  search?: string;
  doctorId?: string;
  condition?: string;
  status?: string;
  gender?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Doctor", "Patient", "DashboardStats", "Auth"],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<{ success: boolean; user: User }, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    // Doctors
    getDoctors: builder.query<DoctorsResponse, DoctorFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") params.append(key, String(value));
        });
        return `/doctors?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.doctors.map(({ _id }) => ({ type: "Doctor" as const, id: _id })),
              { type: "Doctor", id: "LIST" },
            ]
          : [{ type: "Doctor", id: "LIST" }],
    }),

    getDoctorById: builder.query<{ doctor: Doctor; patients: Patient[] }, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_, __, id) => [{ type: "Doctor", id }],
    }),

    createDoctor: builder.mutation<{ doctor: Doctor; success: boolean }, Partial<Doctor>>({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      invalidatesTags: [{ type: "Doctor", id: "LIST" }, "DashboardStats"],
    }),

    updateDoctor: builder.mutation<{ doctor: Doctor; success: boolean }, { id: string; data: Partial<Doctor> }>({
      query: ({ id, data }) => ({ url: `/doctors/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_, __, { id }) => [{ type: "Doctor", id }, { type: "Doctor", id: "LIST" }],
    }),

    deleteDoctor: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/doctors/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Doctor", id: "LIST" }, "DashboardStats"],
    }),

    // Patients
    getPatients: builder.query<PatientsResponse, PatientFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") params.append(key, String(value));
        });
        return `/patients?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.patients.map(({ _id }) => ({ type: "Patient" as const, id: _id })),
              { type: "Patient", id: "LIST" },
            ]
          : [{ type: "Patient", id: "LIST" }],
    }),

    createPatient: builder.mutation<{ patient: Patient; success: boolean }, Partial<Patient>>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }, { type: "Doctor", id: "LIST" }, "DashboardStats"],
    }),

    updatePatient: builder.mutation<{ patient: Patient; success: boolean }, { id: string; data: Partial<Patient> }>({
      query: ({ id, data }) => ({ url: `/patients/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_, __, { id }) => [{ type: "Patient", id }, { type: "Patient", id: "LIST" }],
    }),

    deletePatient: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }, { type: "Doctor", id: "LIST" }, "DashboardStats"],
    }),

    // Dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      providesTags: ["DashboardStats"],
    }),

    // Seed
    seedDatabase: builder.mutation<{ success: boolean; message: string; data: object }, void>({
      query: () => ({ url: "/seed", method: "POST" }),
      invalidatesTags: ["Doctor", "Patient", "DashboardStats"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetDashboardStatsQuery,
  useSeedDatabaseMutation,
} = api;
