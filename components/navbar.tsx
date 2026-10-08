import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";



export default async function NavBar(){
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)
    const {data:{user}} = await supabase.auth.getUser()

    if(!user){
        return null
    }
    return(
        <nav className="flex gap-6 px-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/projects">Projects</Link>
            <LogoutButton/>
        </nav>
    )
}