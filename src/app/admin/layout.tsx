import { cookies } from "next/headers";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is logged in to decide whether to show sidebar
  const cookieStore = await cookies();
  const session = cookieStore.get("bi-admin-session");
  const isLoggedIn = session?.value === "bi-authenticated";

  if (!isLoggedIn) {
    // Login page — no sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
