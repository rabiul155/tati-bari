import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/admin/auth/login-form";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "সাইন ইন" };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>অ্যাডমিন সাইন ইন</CardTitle>
          <CardDescription>পণ্য ও অর্ডার পরিচালনা করতে সাইন ইন করুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
