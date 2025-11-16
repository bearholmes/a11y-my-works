import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useNotification } from '../hooks/useNotification';
import { useAuthContext } from '../providers/AuthProvider';
import { Alert, AlertActions, AlertDescription, AlertTitle } from './ui/alert';
import { AuthLayout } from './ui/auth-layout';
import { Button } from './ui/button';
import { Checkbox, CheckboxField } from './ui/checkbox';
import { ErrorMessage, Field, Label } from './ui/fieldset';
import { Heading, Subheading } from './ui/heading';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';
import { Strong, Text, TextLink } from './ui/text';

const loginSchema = z.object({
  email: z.string().trim().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

const signUpSchema = z
  .object({
    email: z.string().trim().email('올바른 이메일을 입력해주세요'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요'),
    name: z.string().trim().min(1, '이름을 입력해주세요'),
    accountId: z.string().trim().min(1, '계정 ID를 입력해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, signIn, signUp, loading } = useAuthContext();
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // 세션 타임아웃 알림 처리
  useEffect(() => {
    const timeout = searchParams.get('timeout');
    const sessionExpired = searchParams.get('session_expired');

    if (timeout === 'true' || sessionExpired === 'true') {
      setShowTimeoutAlert(true);

      // URL에서 쿼리 파라미터 제거 (clean URL)
      searchParams.delete('timeout');
      searchParams.delete('session_expired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 로딩 중에는 아무것도 렌더링하지 않음
  if (loading) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  // 이미 로그인된 경우 대시보드로 리다이렉션
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormData | SignUpFormData) => {
    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        const signUpData = data as SignUpFormData;
        const { error } = await signUp(signUpData.email, signUpData.password, {
          name: signUpData.name,
          account_id: signUpData.accountId,
        });

        if (error) {
          setError(error.message);
        } else {
          setError('');
          showSuccess(
            '회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.'
          );
          // 회원가입 성공 후 로그인 모드로 전환
          setIsSignUp(false);
          loginForm.reset();
          signUpForm.reset();
        }
      } else {
        const loginData = data as LoginFormData;
        const { error } = await signIn(loginData.email, loginData.password);

        if (error) {
          setError(error.message);
        }
        // 로그인 성공 시 onAuthStateChange가 자동으로 감지하고
        // LoginForm의 useEffect가 리다이렉션 처리함
      }
    } catch (_err) {
      setError('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    loginForm.reset();
    signUpForm.reset();
  };

  return (
    <>
      {/* 세션 타임아웃 알림 */}
      <Alert open={showTimeoutAlert} onClose={() => setShowTimeoutAlert(false)}>
        <AlertTitle>세션이 만료되었습니다</AlertTitle>
        <AlertDescription>
          일정 시간 동안 활동이 없어 자동으로 로그아웃되었습니다.
          <br />
          다시 로그인해주세요.
        </AlertDescription>
        <AlertActions>
          <Button onClick={() => setShowTimeoutAlert(false)}>확인</Button>
        </AlertActions>
      </Alert>

      <AuthLayout>
        <form
          className="grid w-full max-w-sm grid-cols-1 gap-8"
          onSubmit={
            isSignUp
              ? signUpForm.handleSubmit(onSubmit)
              : loginForm.handleSubmit(onSubmit)
          }
          aria-label={isSignUp ? '회원가입 폼' : '로그인 폼'}
        >
          {/* 헤딩 */}
          <Heading level={1}>A11yWorks</Heading>
          <Subheading level={2}>
            {isSignUp ? '계정 만들기' : '계정 로그인'}
          </Subheading>

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
              {...(isSignUp
                ? signUpForm.register('email')
                : loginForm.register('email'))}
              type="email"
              name="email"
              placeholder="your@email.com"
              aria-required="true"
              invalid={
                !!(isSignUp
                  ? signUpForm.formState.errors.email
                  : loginForm.formState.errors.email)
              }
            />
            {(isSignUp
              ? signUpForm.formState.errors.email
              : loginForm.formState.errors.email) && (
              <ErrorMessage>
                {
                  (isSignUp
                    ? signUpForm.formState.errors.email
                    : loginForm.formState.errors.email
                  )?.message
                }
              </ErrorMessage>
            )}
          </Field>

          {/* 비밀번호 필드 */}
          <Field>
            <Label>비밀번호</Label>
            <Input
              {...(isSignUp
                ? signUpForm.register('password')
                : loginForm.register('password'))}
              type="password"
              name="password"
              placeholder="Password"
              aria-required="true"
              invalid={
                !!(isSignUp
                  ? signUpForm.formState.errors.password
                  : loginForm.formState.errors.password)
              }
            />
            {(isSignUp
              ? signUpForm.formState.errors.password
              : loginForm.formState.errors.password) && (
              <ErrorMessage>
                {
                  (isSignUp
                    ? signUpForm.formState.errors.password
                    : loginForm.formState.errors.password
                  )?.message
                }
              </ErrorMessage>
            )}
          </Field>

          {/* 회원가입 추가 필드 */}
          {isSignUp && (
            <>
              <Field>
                <Label>비밀번호 확인</Label>
                <Input
                  {...signUpForm.register('confirmPassword')}
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  aria-required="true"
                  invalid={!!signUpForm.formState.errors.confirmPassword}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <ErrorMessage>
                    {signUpForm.formState.errors.confirmPassword.message}
                  </ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>이름</Label>
                <Input
                  {...signUpForm.register('name')}
                  type="text"
                  name="name"
                  placeholder="홍길동"
                  aria-required="true"
                  invalid={!!signUpForm.formState.errors.name}
                />
                {signUpForm.formState.errors.name && (
                  <ErrorMessage>
                    {signUpForm.formState.errors.name.message}
                  </ErrorMessage>
                )}
              </Field>

              <Field>
                <Label>계정 ID</Label>
                <Input
                  {...signUpForm.register('accountId')}
                  type="text"
                  name="accountId"
                  placeholder="user123"
                  aria-required="true"
                  invalid={!!signUpForm.formState.errors.accountId}
                />
                {signUpForm.formState.errors.accountId && (
                  <ErrorMessage>
                    {signUpForm.formState.errors.accountId.message}
                  </ErrorMessage>
                )}
              </Field>
            </>
          )}

          {/* Remember me & Forgot password (로그인 모드만) */}
          {!isSignUp && (
            <div className="flex items-center justify-between">
              <CheckboxField>
                <Checkbox name="remember" value="remember" />
                <Label>로그인 상태 유지</Label>
              </CheckboxField>
              <Text>
                <TextLink href="/forgot-password">
                  <Strong>비밀번호 찾기</Strong>
                </TextLink>
              </Text>
            </div>
          )}

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
                처리 중...
              </span>
            ) : isSignUp ? (
              '회원가입'
            ) : (
              '로그인'
            )}
          </Button>

          {/* 모드 전환 링크 */}
          <Text>
            {isSignUp ? '이미 계정이 있나요? ' : '계정이 없나요? '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white font-medium"
            >
              <Strong>{isSignUp ? '로그인' : '회원가입'}</Strong>
            </button>
          </Text>
        </form>
      </AuthLayout>
    </>
  );
}
