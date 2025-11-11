import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthContext } from '../providers/AuthProvider';

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

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // 로딩 중에는 아무것도 렌더링하지 않음
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-label="로딩 중"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
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
          alert('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
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
    } catch (err) {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
          <p className="mt-2 text-gray-600">
            {import.meta.env.VITE_APP_DESCRIPTION}
          </p>
        </div>

        <form
          className="bg-white p-8 rounded-lg shadow-sm space-y-6"
          onSubmit={
            isSignUp
              ? signUpForm.handleSubmit(onSubmit)
              : loginForm.handleSubmit(onSubmit)
          }
          aria-label={isSignUp ? '회원가입 폼' : '로그인 폼'}
        >
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              {...(isSignUp
                ? signUpForm.register('email')
                : loginForm.register('email'))}
              id="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              aria-required="true"
              aria-invalid={
                !!(isSignUp
                  ? signUpForm.formState.errors.email
                  : loginForm.formState.errors.email)
              }
              aria-describedby={
                (isSignUp
                  ? signUpForm.formState.errors.email
                  : loginForm.formState.errors.email)
                  ? 'email-error'
                  : undefined
              }
            />
            {(isSignUp
              ? signUpForm.formState.errors.email
              : loginForm.formState.errors.email) && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {
                  (isSignUp
                    ? signUpForm.formState.errors.email
                    : loginForm.formState.errors.email
                  )?.message
                }
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              {!isSignUp && (
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              )}
            </div>
            <input
              {...(isSignUp
                ? signUpForm.register('password')
                : loginForm.register('password'))}
              id="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={
                !!(isSignUp
                  ? signUpForm.formState.errors.password
                  : loginForm.formState.errors.password)
              }
              aria-describedby={
                (isSignUp
                  ? signUpForm.formState.errors.password
                  : loginForm.formState.errors.password)
                  ? 'password-error'
                  : undefined
              }
            />
            {(isSignUp
              ? signUpForm.formState.errors.password
              : loginForm.formState.errors.password) && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {
                  (isSignUp
                    ? signUpForm.formState.errors.password
                    : loginForm.formState.errors.password
                  )?.message
                }
              </p>
            )}
          </div>

          {isSignUp && (
            <>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  비밀번호 확인
                </label>
                <input
                  {...signUpForm.register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  aria-required="true"
                  aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                  aria-describedby={
                    signUpForm.formState.errors.confirmPassword
                      ? 'confirmPassword-error'
                      : undefined
                  }
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  이름
                </label>
                <input
                  {...signUpForm.register('name')}
                  id="name"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="홍길동"
                  aria-required="true"
                  aria-invalid={!!signUpForm.formState.errors.name}
                  aria-describedby={
                    signUpForm.formState.errors.name ? 'name-error' : undefined
                  }
                />
                {signUpForm.formState.errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="accountId"
                  className="block text-sm font-medium text-gray-700"
                >
                  계정 ID
                </label>
                <input
                  {...signUpForm.register('accountId')}
                  id="accountId"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user123"
                  aria-required="true"
                  aria-invalid={!!signUpForm.formState.errors.accountId}
                  aria-describedby={
                    signUpForm.formState.errors.accountId
                      ? 'accountId-error'
                      : undefined
                  }
                />
                {signUpForm.formState.errors.accountId && (
                  <p id="accountId-error" className="mt-1 text-sm text-red-600" role="alert">
                    {signUpForm.formState.errors.accountId.message}
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            aria-busy={submitting}
            aria-label={
              submitting
                ? '처리 중'
                : isSignUp
                  ? '회원가입 제출'
                  : '로그인 제출'
            }
          >
            {submitting ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignUp
                ? '이미 계정이 있나요? 로그인'
                : '계정이 없나요? 회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
