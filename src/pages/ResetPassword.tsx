import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Fieldset, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const { showSuccess } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    setSubmitting(true);

    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        setError(error.message);
      } else {
        showSuccess('비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (_err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Heading level={1}>비밀번호 재설정</Heading>
          <Text className="mt-2">새로운 비밀번호를 입력해주세요.</Text>
        </div>

        <form
          className="bg-white dark:bg-zinc-900 p-8 rounded-lg space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Fieldset>
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              {...register('password')}
              id="password"
              type="password"
              placeholder="••••••••"
            />
            {errors.password && (
              <Text className="mt-1 text-red-600">
                {errors.password.message}
              </Text>
            )}
          </Fieldset>

          <Fieldset>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <Text className="mt-1 text-red-600">
                {errors.confirmPassword.message}
              </Text>
            )}
          </Fieldset>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                변경 중...
              </span>
            ) : (
              '비밀번호 변경'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
