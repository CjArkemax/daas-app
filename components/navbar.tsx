import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { getCachedUser } from "@/lib/auth/cached-user";



export default async function NavBar(){
 const user = await getCachedUser();
  if (!user) return null;
    return(
        <nav className="flex gap-6 px-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/projects">Projects</Link>
            <LogoutButton/>
        </nav>
    )
}