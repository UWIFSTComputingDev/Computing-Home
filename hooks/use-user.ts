import { getCurrentUserFromCookieStore } from '@/lib/auth';
import { cookies } from 'next/headers';
import * as React from 'react'

export function useUser() {
  const [user, setUser] = React.useState<{
    profile: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      displayName: string;
      bio: string | null;
      avatarUrl: string | null;
    } | undefined;
    id: string;
    email: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
  } | null>(null)

  React.useEffect(() => {
    async function fetchUser() {
      const cookieStore = await cookies();
      const res = await getCurrentUserFromCookieStore(cookieStore);
      setUser(res);
    }
    fetchUser();
  }, [])

  return user;
}
