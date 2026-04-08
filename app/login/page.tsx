import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Use your email and password, or sign in with Google or Facebook. New accounts are created on the register page.
      </p>
      <LoginForm />
    </main>
  );
}
