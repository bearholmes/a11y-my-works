import type { AuthError } from '@supabase/supabase-js';

/**
 * Supabase Auth 에러 메시지를 한글로 변환하는 매핑 테이블
 *
 * Supabase는 영문 에러 메시지를 반환하므로,
 * 사용자 친화적인 한글 메시지로 변환하여 제공합니다.
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // 로그인 관련 에러
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed':
    '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
  'Invalid email or password': '이메일 또는 비밀번호가 올바르지 않습니다.',

  // 회원가입 관련 에러
  'User already registered': '이미 가입된 이메일입니다.',
  'Signup requires a valid password':
    '유효한 비밀번호를 입력해주세요. (최소 6자 이상)',
  'Password should be at least 6 characters':
    '비밀번호는 최소 6자 이상이어야 합니다.',
  'Unable to validate email address: invalid format':
    '올바른 이메일 형식이 아닙니다.',
  'Signup disabled': '현재 회원가입이 비활성화되어 있습니다.',

  // 세션 관련 에러
  'Session expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'Invalid session': '유효하지 않은 세션입니다. 다시 로그인해주세요.',
  'No session': '로그인이 필요합니다.',
  'Refresh token not found': '세션이 만료되었습니다. 다시 로그인해주세요.',

  // 비밀번호 재설정 관련 에러
  'User not found': '해당 이메일로 가입된 계정을 찾을 수 없습니다.',
  'Password reset link expired': '비밀번호 재설정 링크가 만료되었습니다.',
  'New password should be different from the old password':
    '새 비밀번호는 기존 비밀번호와 달라야 합니다.',

  // 네트워크 관련 에러
  'Failed to fetch': '네트워크 연결을 확인해주세요.',
  'Network request failed': '네트워크 연결을 확인해주세요.',
  'fetch failed': '네트워크 연결을 확인해주세요.',

  // Rate limiting
  'Email rate limit exceeded':
    '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  'Too many requests':
    '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 기타
  'Invalid token': '유효하지 않은 토큰입니다.',
  'Token has expired': '토큰이 만료되었습니다.',
  'Invalid recovery token': '유효하지 않은 복구 토큰입니다.',
};

/**
 * Supabase Auth 에러를 한글 메시지로 변환합니다.
 *
 * @param error - Supabase AuthError 객체 또는 일반 Error 객체
 * @returns 한글로 변환된 에러 메시지
 *
 * @example
 * ```typescript
 * const { error } = await supabase.auth.signInWithPassword({ email, password });
 * if (error) {
 *   const message = getAuthErrorMessage(error);
 *   console.log(message); // "이메일 또는 비밀번호가 올바르지 않습니다."
 * }
 * ```
 */
export function getAuthErrorMessage(error: AuthError | Error | null): string {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }

  // AuthError의 경우 message 속성 확인
  const errorMessage = error.message;

  // 정확히 일치하는 메시지 찾기
  if (errorMessage && ERROR_MESSAGE_MAP[errorMessage]) {
    return ERROR_MESSAGE_MAP[errorMessage];
  }

  // 부분 일치 검색 (대소문자 구분 없이)
  const lowerMessage = errorMessage?.toLowerCase() || '';

  // 'invalid login', 'invalid credentials' 등 변형 처리
  if (
    lowerMessage.includes('invalid') &&
    (lowerMessage.includes('login') ||
      lowerMessage.includes('credentials') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('password'))
  ) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }

  // 'email not confirmed' 변형 처리
  if (lowerMessage.includes('email') && lowerMessage.includes('confirm')) {
    return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.';
  }

  // 'user already registered' 변형 처리
  if (
    lowerMessage.includes('user') &&
    (lowerMessage.includes('already') || lowerMessage.includes('exist'))
  ) {
    return '이미 가입된 이메일입니다.';
  }

  // 'password' 관련 에러
  if (lowerMessage.includes('password')) {
    if (lowerMessage.includes('least') || lowerMessage.includes('minimum')) {
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    if (lowerMessage.includes('required') || lowerMessage.includes('valid')) {
      return '유효한 비밀번호를 입력해주세요. (최소 6자 이상)';
    }
  }

  // 'network' 또는 'fetch' 관련 에러
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection')
  ) {
    return '네트워크 연결을 확인해주세요.';
  }

  // 'session' 관련 에러
  if (lowerMessage.includes('session') || lowerMessage.includes('token')) {
    if (lowerMessage.includes('expired') || lowerMessage.includes('invalid')) {
      return '세션이 만료되었습니다. 다시 로그인해주세요.';
    }
  }

  // 'rate limit' 관련 에러
  if (lowerMessage.includes('rate') || lowerMessage.includes('too many')) {
    return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 매핑되지 않은 에러는 원본 메시지 반환 (개발 시 디버깅용)
  // 프로덕션에서는 기본 메시지 반환
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unmapped auth error:', errorMessage);
    return `인증 오류: ${errorMessage}`;
  }

  return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
}

/**
 * 특정 에러 코드에 대한 복구 제안 메시지를 반환합니다.
 *
 * @param error - Supabase AuthError 객체
 * @returns 복구 제안 메시지 (있는 경우)
 *
 * @example
 * ```typescript
 * const { error } = await supabase.auth.signInWithPassword({ email, password });
 * if (error) {
 *   const suggestion = getAuthErrorSuggestion(error);
 *   if (suggestion) {
 *     console.log(suggestion); // "비밀번호 찾기를 이용해주세요."
 *   }
 * }
 * ```
 */
export function getAuthErrorSuggestion(
  error: AuthError | Error | null
): string | null {
  if (!error) return null;

  const errorMessage = error.message?.toLowerCase() || '';

  if (
    errorMessage.includes('invalid') &&
    (errorMessage.includes('login') || errorMessage.includes('credentials'))
  ) {
    return '비밀번호를 잊으셨다면 비밀번호 찾기를 이용해주세요.';
  }

  if (errorMessage.includes('email') && errorMessage.includes('confirm')) {
    return '이메일을 받지 못하셨다면 스팸 메일함을 확인해주세요.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return '인터넷 연결 상태를 확인하고 다시 시도해주세요.';
  }

  return null;
}
