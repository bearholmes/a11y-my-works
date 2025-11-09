import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadingAtom, sessionAtom, userAtom } from '../stores/authStore';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [session, setSession] = useAtom(sessionAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  useEffect(() => {
    setLoading(true);

    // 현재 세션 확인
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

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
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string, profile?: { name: string; account_id: string }) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setLoading(false);
        return { data, error };
      }
      
      // 회원가입 성공 시 members 테이블에 프로필 생성
      if (data.user && profile) {
        const { memberAPI } = await import('../services/api');
        try {
          await memberAPI.createMemberProfile(data.user.id, {
            account_id: profile.account_id,
            name: profile.name,
            email: email,
          });
        } catch (memberError) {
          console.error('Failed to create member profile:', memberError);
          // 프로필 생성 실패해도 회원가입은 성공으로 처리
        }
      }
      
      setLoading(false);
      return { data, error };
    } catch (err) {
      setLoading(false);
      return { data: null, error: err as any };
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
