'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function register(_prevState: unknown, formData: FormData): Promise<{ error: string } | void>{
    const raw = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const parsed = registerSchema.safeParse(raw);
    if(!parsed.success){
        return {error: parsed.error.issues[0].message}
    }

    const {email, password} = parsed.data;

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const {error} = await supabase.auth.signUp({ email,password })

    if(error){
        return {error: error.message}
    }
    redirect('/dashboard')
}

export async function login(_prevState: unknown, formData: FormData): Promise<{ error: string } | void>{

     const raw = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const parsed = loginSchema.safeParse(raw);
    if(!parsed.success){
        return {error: parsed.error.issues[0].message}
    }

    const {email,password} = parsed.data;

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const {error} = await supabase.auth.signInWithPassword({ email,password })
    if(error){
        return {error: error.message}
    }

    redirect('/dashboard')
}

export async function logout(): Promise<void>{

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const {error} = await supabase.auth.signOut();   
    if(error){
        console.error(error.message)
    }

    redirect('/login')
}