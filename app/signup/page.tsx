import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Sign Up | Fleeting Commerce",
  description:
    "Create your Fleeting Commerce account and start your free trial",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
