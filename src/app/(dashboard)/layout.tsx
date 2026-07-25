"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/services/apiService";
import { setUser, setLoading } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, isError, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
    } else if (isError) {
      dispatch(setUser(null));
      router.push("/login");
    } else if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, isError, isLoading, dispatch, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
          />
          <p className="text-sm text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
