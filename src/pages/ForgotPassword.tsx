import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthLayout } from '../components/ui/auth-layout';
import { Button } from '../components/ui/button';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Strong, Text, TextLink } from '../components/ui/text';
import { useAuth } from '../hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSubmitting(true);

    try {
      const { error } = await resetPasswordForEmail(data.email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (_err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="grid w-full max-w-sm grid-cols-1 gap-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-950">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <Heading>이메일을 확인해주세요</Heading>
          <Text>
            비밀번호 재설정 링크를 이메일로 발송했습니다. 이메일을 확인하고
            링크를 클릭해주세요.
          </Text>
          <Button href="/login" plain className="w-full">
            로그인 페이지로 돌아가기
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form
        className="grid w-full max-w-sm grid-cols-1 gap-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* 헤딩 */}
        <Heading>비밀번호 찾기</Heading>

        {/* 에러 메시지 */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* 이메일 필드 */}
        <Field>
          <Label>이메일</Label>
          <Input
            {...register('email')}
            type="email"
            name="email"
            placeholder="your@email.com"
            aria-required="true"
            invalid={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </Field>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" className="text-white" />
              발송 중...
            </span>
          ) : (
            '재설정 링크 보내기'
          )}
        </Button>

        {/* 로그인 링크 */}
        <Text>
          비밀번호가 기억나셨나요?{' '}
          <TextLink href="/login">
            <Strong>로그인</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
