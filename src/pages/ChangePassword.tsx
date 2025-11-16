import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Divider } from '../components/ui/divider';
import { ErrorMessage, Fieldset, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z.string().min(6, '새 비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePassword() {
  const navigate = useNavigate();
  const { user, signIn, updatePassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const { showSuccess } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError('');
    setSubmitting(true);

    try {
      // 현재 비밀번호 확인
      if (user?.email) {
        const { error: signInError } = await signIn(
          user.email,
          data.currentPassword
        );

        if (signInError) {
          setError('현재 비밀번호가 일치하지 않습니다.');
          setSubmitting(false);
          return;
        }
      }

      // 새 비밀번호로 업데이트
      const { error } = await updatePassword(data.newPassword);

      if (error) {
        setError(error.message);
      } else {
        showSuccess('비밀번호가 변경되었습니다.');
        reset();
        navigate('/');
      }
    } catch (_err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Heading>비밀번호 변경</Heading>
      <Text className="mt-2">보안을 위해 정기적으로 비밀번호를 변경하세요.</Text>

      <Divider className="my-10 mt-6" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Fieldset>
          <Label htmlFor="currentPassword">현재 비밀번호</Label>
          <Input
            {...register('currentPassword')}
            id="currentPassword"
            type="password"
            placeholder="••••••••"
          />
          {errors.currentPassword && (
            <ErrorMessage>{errors.currentPassword.message}</ErrorMessage>
          )}
        </Fieldset>

        <Fieldset>
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <Input
            {...register('newPassword')}
            id="newPassword"
            type="password"
            placeholder="••••••••"
          />
          {errors.newPassword && (
            <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
          )}
        </Fieldset>

        <Fieldset>
          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
          )}
        </Fieldset>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                변경 중...
              </span>
            ) : (
              '비밀번호 변경'
            )}
          </Button>
          <Button type="button" onClick={() => navigate(-1)} plain>
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
