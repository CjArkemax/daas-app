import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const getCachedUser = cache(async () => {
    // console.log('[cached-user] FETCHING user from Supabase');  
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});