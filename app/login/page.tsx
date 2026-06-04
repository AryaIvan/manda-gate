"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail } from "lucide-react";

import { login as loginService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("admin@manda.sch.id");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await loginService({
        identifier: email,
        password,
      });

      setAuth(response.data.user, response.data.token);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login gagal, silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <GraduationCap size={34} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">MANDA Gate</h1>
          <p className="mt-1 text-slate-500">
            Portal Akademik Terpadu MAN 2 Gresik
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Masuk ke Sistem</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email / Username</label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    className="pl-10"
                    placeholder="Masukkan email atau username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    className="pl-10"
                    placeholder="Masukkan password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800"
              >
                {loading ? "Memproses..." : "Login"}
              </Button>

              <div className="space-y-1 rounded-lg border bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold">Akun Demo dari Backend:</p>
                <p>Admin: admin@manda.sch.id</p>
                <p>Guru: ahmad.zainuddin@manda.sch.id</p>
                <p>Siswa: ahmad.fauzi@siswa.manda.sch.id</p>
                <p>Password semua: password123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}