import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/lib/api/auth.functions";
import { Sparkles, UserPlus, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/cadastrar")({
  head: () => ({
    meta: [
      { title: "Cadastrar · traduz.ai" },
      { name: "description", content: "Crie sua conta no traduz.ai" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: () => signUp({ data: { email, password, name: name || undefined } }),
    onSuccess: () => navigate({ to: "/" }),
    onError: (err) => setError((err as Error).message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signupMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-6">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.04 300) 0%, oklch(0.94 0.03 180) 50%, oklch(0.96 0.02 200) 100%)",
        }}
      />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2.5 z-20">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold tracking-tight text-foreground text-lg">
          traduz<span className="text-primary">.ai</span>
        </span>
      </Link>

      <div className="w-full max-w-sm glass rounded-3xl p-8 card-hover">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Junte-se ao traduz.ai</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Nome <span className="text-muted-foreground/50">(opcional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-white/70 rounded-xl px-4 py-2.5 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-muted-foreground/50"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/70 rounded-xl px-4 py-2.5 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-muted-foreground/50"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-white/70 rounded-xl px-4 py-2.5 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-muted-foreground/50 pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {signupMutation.isPending ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link to="/entrar" className="font-medium text-foreground hover:text-primary transition underline underline-offset-4 decoration-primary/30">
            Entre
          </Link>
        </p>
      </div>
    </div>
  );
}
