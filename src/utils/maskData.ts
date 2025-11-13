/**
 * 민감 데이터 마스킹 유틸리티
 * 개인정보 보호를 위한 데이터 마스킹 함수들
 */

/**
 * 이메일 마스킹
 * @example "user@example.com" → "us***@example.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visibleLength = Math.min(2, Math.floor(localPart.length / 2));
  const maskedLocal =
    localPart.substring(0, visibleLength) + '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹
 * @example "010-1234-5678" → "010-****-5678"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';

  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 11) {
    // 010-1234-5678 형식
    return `${numbers.substring(0, 3)}-****-${numbers.substring(7)}`;
  } else if (numbers.length === 10) {
    // 02-1234-5678 형식
    return `${numbers.substring(0, 2)}-****-${numbers.substring(6)}`;
  }

  return phone;
}

/**
 * 이름 마스킹
 * @example "홍길동" → "홍*동"
 * @example "John Doe" → "J*** D**"
 */
export function maskName(name: string): string {
  if (!name || typeof name !== 'string') return '';

  // 한글 이름 (2-4자)
  if (/^[가-힣]{2,4}$/.test(name)) {
    if (name.length === 2) {
      return name[0] + '*';
    }
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  }

  // 영문 이름
  return name
    .split(' ')
    .map((part) => part[0] + '***')
    .join(' ');
}

/**
 * 계정 ID 마스킹
 * @example "user1234" → "us******"
 */
export function maskAccountId(accountId: string): string {
  if (!accountId || typeof accountId !== 'string') return '';

  const visibleLength = Math.min(2, Math.floor(accountId.length / 3));
  return accountId.substring(0, visibleLength) + '***';
}

/**
 * 민감 데이터 마스킹 여부 확인
 * 관리자나 본인의 데이터는 마스킹하지 않음
 */
export function shouldMaskData(
  currentUserId: string | number,
  targetUserId: string | number,
  isAdmin: boolean
): boolean {
  // 관리자는 마스킹하지 않음
  if (isAdmin) return false;

  // 본인 데이터는 마스킹하지 않음
  if (currentUserId === targetUserId) return false;

  return true;
}

/**
 * 사용자 정보 객체 마스킹
 */
export interface MaskableUserInfo {
  email?: string;
  mobile?: string;
  name?: string;
  account_id?: string;
}

export function maskUserInfo(
  user: MaskableUserInfo,
  currentUserId: string | number,
  targetUserId: string | number,
  isAdmin: boolean = false
): MaskableUserInfo {
  if (!shouldMaskData(currentUserId, targetUserId, isAdmin)) {
    return user;
  }

  return {
    ...user,
    email: user.email ? maskEmail(user.email) : user.email,
    mobile: user.mobile ? maskPhoneNumber(user.mobile) : user.mobile,
    name: user.name ? maskName(user.name) : user.name,
    account_id: user.account_id ? maskAccountId(user.account_id) : user.account_id,
  };
}
