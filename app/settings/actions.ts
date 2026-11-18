'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type UpdateDisplayNameState = { ok: boolean; message: string } | null

export async function updateDisplayName(
  _prev: UpdateDisplayNameState,
  formData: FormData
): Promise<UpdateDisplayNameState> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/auth/login?next=/settings')

  const displayName = String(formData.get('display_name') ?? '').trim()

  // RLS only lets the owner update this row; the id filter picks the row.
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName || null })
    .eq('id', userId)

  if (error) return { ok: false, message: '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' }

  revalidatePath('/settings')
  return { ok: true, message: '저장했습니다.' }
}
