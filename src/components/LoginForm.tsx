import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

const signUpSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요'),
  name: z.string().min(1, '이름을 입력해주세요'),
  accountId: z.string().min(1, '계정 ID를 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });


  const onSubmit = async (data: any) => {
    setError('');
    
    try {
      if (isSignUp) {
        const signUpData = data as SignUpFormData;
        const { error } = await signUp(
          signUpData.email, 
          signUpData.password,
          {
            name: signUpData.name,
            account_id: signUpData.accountId,
          }
        );
        
        if (error) {
          setError(error.message);
        } else {
          setError('');
          alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        }
      } else {
        const loginData = data as LoginFormData;
        const { error } = await signIn(loginData.email, loginData.password);
        
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
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
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="mt-2 text-gray-600">
            {import.meta.env.VITE_APP_DESCRIPTION}
          </p>
        </div>

        <form className="bg-white p-8 rounded-lg shadow-sm space-y-6" onSubmit={isSignUp ? signUpForm.handleSubmit(onSubmit) : loginForm.handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              {...(isSignUp ? signUpForm.register('email') : loginForm.register('email'))}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
            {(isSignUp ? signUpForm.formState.errors.email : loginForm.formState.errors.email) && (
              <p className="mt-1 text-sm text-red-600">{(isSignUp ? signUpForm.formState.errors.email : loginForm.formState.errors.email)?.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              {...(isSignUp ? signUpForm.register('password') : loginForm.register('password'))}
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {(isSignUp ? signUpForm.formState.errors.password : loginForm.formState.errors.password) && (
              <p className="mt-1 text-sm text-red-600">{(isSignUp ? signUpForm.formState.errors.password : loginForm.formState.errors.password)?.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>

          {isSignUp && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  {...signUpForm.register('name')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="홍길동"
                />
                {signUpForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                  계정 ID
                </label>
                <input
                  {...signUpForm.register('accountId')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user123"
                />
                {signUpForm.formState.errors.accountId && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.accountId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  {...signUpForm.register('confirmPassword')}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}