import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // 세션 타임아웃: 30분 (1800초)
    storageKey: 'a11y-my-works-auth',
    // PKCE 플로우 활성화 (보안 강화)
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'a11y-my-works@1.0.0',
    },
  },
});

// 세션 타임아웃 체크 (30분)
const SESSION_TIMEOUT = 120 * 60 * 1000; // 120분
let lastActivityTime = Date.now();

// 사용자 활동 감지
const updateActivity = () => {
  lastActivityTime = Date.now();
};

// 활동 이벤트 리스너
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // 세션 타임아웃 체크 (1분마다)
  setInterval(async () => {
    const inactiveTime = Date.now() - lastActivityTime;
    if (inactiveTime > SESSION_TIMEOUT) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        window.location.href = '/login?timeout=true';
      }
    }
  }, 60000); // 1분마다 체크
}

export type { Session, User } from '@supabase/supabase-js';
