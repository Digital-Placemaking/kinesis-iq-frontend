"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "../actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue="councillor.ward7@kinesisiq.demo"
          className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-10 bg-amber-500 text-slate-950 hover:bg-amber-400"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
