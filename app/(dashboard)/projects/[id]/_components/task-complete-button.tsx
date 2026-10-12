'use client';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

export function TaskCompleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? '...' : 'Complete'}
    </Button>
  );
}