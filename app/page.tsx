import {cookies} from "next/headers";
import {createServerSupabaseClient} from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore =await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  
  const {data:{ user }} = await supabase.auth.getUser();

  if(user){
    redirect('/dashboard');
  }
  redirect('/login');
}
