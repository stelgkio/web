import { RegisterClient } from "./register-client";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Choose whether you&apos;re joining as a <strong className="text-foreground">partner</strong> (affiliate) or{" "}
        <strong className="text-foreground">company</strong> (merchant). Then sign up with email or a social account.
      </p>
      <RegisterClient />
    </main>
  );
}
