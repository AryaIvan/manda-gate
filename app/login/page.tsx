"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail } from "lucide-react";

import { mockUsers } from "@/data/users";
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
  const login = useAuthStore((state: any) => state.login);

  const [email, setEmail] = useState("admin@manda.sch.id");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    const foundUser = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      setError("Email atau password salah");
      return;
    }

    const { password: _, ...userWithoutPassword } = foundUser;

    login(userWithoutPassword, "mock-token-manda-gate");

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mb-4">
            <GraduationCap size={34} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">MANDA Gate</h1>
          <p className="text-slate-500 mt-1">
            Portal Akademik Terpadu MAN 2 Gresik
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Masuk ke Sistem</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="pl-10"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button className="w-full bg-emerald-700 hover:bg-emerald-800" onClick={handleLogin}>
              Login
            </Button>

            <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold">Akun Demo:</p>
              <p>Admin: admin@manda.sch.id</p>
              <p>Siswa: siswa@manda.sch.id</p>
              <p>Guru: guru@manda.sch.id</p>
              <p>Password semua: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}