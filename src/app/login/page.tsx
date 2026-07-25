"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "@/store/services/apiService";
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Stethoscope, Lock, Mail, Loader2, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      const result = await login(data).unwrap();
      dispatch(setUser(result.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setError(error?.data?.error || "Invalid credentials. Please try again.");
    }
  };

  const fillDemo = () => {
    setValue("email", "admin@doctortracker.com");
    setValue("password", "admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.6 0.18 210)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.62 0.16 160)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5"
          style={{ background: "oklch(0.52 0.18 220)" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.2 0.05 220) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2 0.05 220) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Glass card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
            >
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Doctor Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Healthcare Administration Portal
            </p>
          </div>

          {/* Demo credentials banner */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mb-6 flex items-center gap-3 p-3 rounded-xl border border-dashed text-sm cursor-pointer transition-all hover:bg-accent/50 group"
            style={{ borderColor: "oklch(0.6 0.18 210 / 0.4)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.6 0.18 210 / 0.15)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "oklch(0.52 0.18 220)" }} />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-foreground">Use demo credentials</p>
              <p className="text-xs text-muted-foreground">admin@doctortracker.com / admin123</p>
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-md transition-colors group-hover:opacity-90"
              style={{ background: "oklch(0.6 0.18 210 / 0.15)", color: "oklch(0.45 0.18 220)" }}
            >
              Click to fill
            </span>
          </button>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@doctortracker.com"
                  className="pl-10 h-11"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full h-11 text-sm font-medium mt-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Portal"
              )}
            </Button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Secure healthcare administration portal.{" "}
            <span className="font-medium">All data is encrypted.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
