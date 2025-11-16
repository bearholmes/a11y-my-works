import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadingAtom, sessionAtom, userAtom } from '../stores/authStore';
import { getAuthErrorMessage } from '../utils/authErrorMessages';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [session, setSession] = useAtom(sessionAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 에러 메시지를 한글로 변환
    if (error) {
      return {
        data,
        error: {
          ...error,
          message: getAuthErrorMessage(error),
        },
      };
    }

    return { data, error };
  };

  const signUp = async (
    email: string,
    password: string,
    profile?: { name: string; account_id: string }
  ) => {
    try {
      // profile 데이터를 options.data에 포함시켜 raw_user_meta_data에 저장
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: profile?.name || '',
            account_id: profile?.account_id || '',
          },
        },
      });

      // 에러 메시지를 한글로 변환
      if (error) {
        return {
          data,
          error: {
            ...error,
            message: getAuthErrorMessage(error),
          },
        };
      }

      // 트리거가 자동으로 members 테이블에 생성하므로
      // createMemberProfile 호출 제거

      return { data, error };
    } catch (err) {
      const error = err as Error;
      return {
        data: null,
        error: {
          name: error.name,
          message: getAuthErrorMessage(error),
        } as Error,
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // 에러 메시지를 한글로 변환
    if (error) {
      return {
        data,
        error: {
          ...error,
          message: getAuthErrorMessage(error),
        },
      };
    }

    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    // 에러 메시지를 한글로 변환
    if (error) {
      return {
        data,
        error: {
          ...error,
          message: getAuthErrorMessage(error),
        },
      };
    }

    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
}
