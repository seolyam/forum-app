import { Header } from "@/components/layout/header";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
