"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  UserPlus,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    roleId: "r-auditor",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isLogin ? { email: formData.email } : formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: isLogin
            ? "¡Bienvenido de nuevo! Redirigiendo..."
            : "¡Registro exitoso! Redirigiendo...",
        });

        // Iniciar sesión
        login(data.user);

        setTimeout(() => router.push("/"), 1500);
      } else {
        setStatus({
          type: "error",
          message: data.error || "Ocurrió un error al procesar la solicitud",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Error de conexión con el servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
            {isLogin ? (
              <Shield className="h-8 w-8 text-primary" />
            ) : (
              <UserPlus className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-black text-[#1a365d] tracking-tight">
            {isLogin ? "Bienvenido" : "Crear Cuenta"}
          </h1>
          <p className="text-muted-foreground text-sm text-center mt-1">
            {isLogin 
              ? "Inicia sesión para continuar con tus auditorías." 
              : "Regístrese para comenzar a gestionar sus auditorías ISO 27001."}
          </p>
        </div>

        {status && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="nombre"
                    required={!isLogin}
                    placeholder="Ej. Juan"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="apellido"
                    required={!isLogin}
                    placeholder="Ej. Pérez"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                required
                placeholder="juan.perez@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-base font-bold shadow-lg"
            disabled={loading}
          >
            {loading 
              ? "Procesando..." 
              : (isLogin ? "Iniciar Sesión" : "Completar Registro")}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-4">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}
