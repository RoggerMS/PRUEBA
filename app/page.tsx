import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FacebookStyleComposer } from '@/components/feed/FacebookStyleComposer';
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }
  redirect("/feed");

}
