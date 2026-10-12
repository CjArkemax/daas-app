import 'server-only';
import type { User } from '@supabase/supabase-js';
import { getCachedUser } from './cached-user';

export async function requireUser(): Promise<User> {
  const user = await getCachedUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}