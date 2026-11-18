'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateDisplayName } from '../actions'

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, isPending] = useActionState(updateDisplayName, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="display_name">표시 이름</Label>
        <Input id="display_name" name="display_name" defaultValue={displayName} maxLength={50} />
      </div>
      {state && (
        <p
          role="status"
          className={state.ok ? 'text-sm text-muted-foreground' : 'text-sm text-destructive'}
        >
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? '저장하는 중…' : '저장'}
      </Button>
    </form>
  )
}
