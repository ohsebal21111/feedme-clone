import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

import { LogoutButton } from './_components/logout-button'
import { ProfileForm } from './_components/profile-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Verify the identity on the server; never trust client state here.
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login?next=/settings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', data.claims.sub)
    .maybeSingle()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-lg tracking-normal">설정</CardTitle>
            <CardDescription>{data.claims.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ProfileForm displayName={profile?.display_name ?? ''} />
            <LogoutButton />
          </CardContent>
        </Card>
        <Link href="/" className="text-center text-sm underline underline-offset-4">
          홈으로
        </Link>
      </div>
    </div>
  )
}
