# 에러 처리 전략

## 개요

이 문서는 업무 보고 시스템의 통합 에러 처리 전략을 정의합니다. 일관되고 사용자 친화적인 에러 처리를 위한 표준을 수립합니다.

## 에러 처리 원칙

### 핵심 원칙
1. **사용자 친화적**: 기술적 오류가 아닌 해결 방법을 제시
2. **일관성**: 모든 레이어에서 동일한 에러 처리 패턴 사용
3. **명확성**: 에러의 원인과 영향 범위를 명확히 전달
4. **복구 가능성**: 가능한 경우 자동 복구 메커니즘 제공
5. **추적 가능성**: 모든 에러를 로깅하여 디버깅 지원

---

## 에러 분류 체계

### 1. 에러 카테고리

```typescript
/**
 * 에러 카테고리 열거형
 */
enum ErrorCategory {
  // 네트워크 관련 에러
  NETWORK = 'NETWORK',

  // 인증/인가 에러
  AUTH = 'AUTH',

  // 유효성 검증 에러
  VALIDATION = 'VALIDATION',

  // 비즈니스 로직 에러
  BUSINESS = 'BUSINESS',

  // 데이터베이스 에러
  DATABASE = 'DATABASE',

  // 시스템/서버 에러
  SYSTEM = 'SYSTEM',

  // 클라이언트 에러
  CLIENT = 'CLIENT',

  // 알 수 없는 에러
  UNKNOWN = 'UNKNOWN'
}
```

### 2. 에러 심각도

```typescript
/**
 * 에러 심각도 수준
 */
enum ErrorSeverity {
  // 정보성 - 로깅만 필요
  INFO = 'INFO',

  // 경고 - 사용자에게 알림, 작업 계속 가능
  WARNING = 'WARNING',

  // 오류 - 작업 실패, 사용자 개입 필요
  ERROR = 'ERROR',

  // 치명적 - 시스템 장애, 즉시 대응 필요
  CRITICAL = 'CRITICAL'
}
```

### 3. 에러 코드 체계

```typescript
/**
 * 에러 코드 정의
 * 형식: [카테고리][심각도][순번]
 * 예: NET_ERR_001 = 네트워크 에러 1번
 */
const ErrorCodes = {
  // 네트워크 에러 (NET)
  NET_ERR_001: 'NET_ERR_001', // 네트워크 연결 실패
  NET_ERR_002: 'NET_ERR_002', // 타임아웃
  NET_ERR_003: 'NET_ERR_003', // 요청 중단

  // 인증 에러 (AUTH)
  AUTH_ERR_001: 'AUTH_ERR_001', // 로그인 실패
  AUTH_ERR_002: 'AUTH_ERR_002', // 세션 만료
  AUTH_ERR_003: 'AUTH_ERR_003', // 권한 부족
  AUTH_ERR_004: 'AUTH_ERR_004', // 토큰 무효
  AUTH_ERR_005: 'AUTH_ERR_005', // 이메일 미인증

  // 유효성 검증 에러 (VAL)
  VAL_ERR_001: 'VAL_ERR_001', // 필수 필드 누락
  VAL_ERR_002: 'VAL_ERR_002', // 형식 오류
  VAL_ERR_003: 'VAL_ERR_003', // 범위 초과
  VAL_ERR_004: 'VAL_ERR_004', // 중복 데이터

  // 비즈니스 로직 에러 (BIZ)
  BIZ_ERR_001: 'BIZ_ERR_001', // 업무 시간 24시간 초과
  BIZ_ERR_002: 'BIZ_ERR_002', // 프로젝트 비활성화
  BIZ_ERR_003: 'BIZ_ERR_003', // 삭제 불가 (참조 존재)
  BIZ_ERR_004: 'BIZ_ERR_004', // 동시 수정 충돌

  // 데이터베이스 에러 (DB)
  DB_ERR_001: 'DB_ERR_001', // 연결 실패
  DB_ERR_002: 'DB_ERR_002', // 쿼리 오류
  DB_ERR_003: 'DB_ERR_003', // 제약 조건 위반
  DB_ERR_004: 'DB_ERR_004', // 데이터 없음

  // 시스템 에러 (SYS)
  SYS_ERR_001: 'SYS_ERR_001', // 서버 오류
  SYS_ERR_002: 'SYS_ERR_002', // 서비스 이용 불가
  SYS_ERR_003: 'SYS_ERR_003', // 설정 오류

  // 클라이언트 에러 (CLI)
  CLI_ERR_001: 'CLI_ERR_001', // 지원하지 않는 브라우저
  CLI_ERR_002: 'CLI_ERR_002', // 로컬 스토리지 접근 불가
  CLI_ERR_003: 'CLI_ERR_003', // 페이지 렌더링 오류
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

---

## 에러 타입 정의

### 기본 에러 클래스

```typescript
// src/types/errors.ts

/**
 * 기본 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: Date;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly metadata?: Record<string, any>;
  public readonly retryable: boolean;

  constructor({
    code,
    category,
    severity,
    userMessage,
    technicalMessage,
    metadata,
    retryable = false,
  }: {
    code: ErrorCode;
    category: ErrorCategory;
    severity: ErrorSeverity;
    userMessage: string;
    technicalMessage: string;
    metadata?: Record<string, any>;
    retryable?: boolean;
  }) {
    super(technicalMessage);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.metadata = metadata;
    this.retryable = retryable;
    this.timestamp = new Date();

    // 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * 에러를 로그 형식으로 변환
   */
  toLog(): string {
    return JSON.stringify({
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    });
  }
}
```

### 특화된 에러 클래스

```typescript
/**
 * 네트워크 에러
 */
export class NetworkError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super({
      code: 'NET_ERR_001',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.ERROR,
      userMessage: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
      technicalMessage: message,
      metadata,
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * 인증 에러
 */
export class AuthError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalMessage: string,
    metadata?: Record<string, any>
  ) {
    super({
      code,
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.ERROR,
      userMessage,
      technicalMessage,
      metadata,
      retryable: false,
    });
    this.name = 'AuthError';
  }
}

/**
 * 유효성 검증 에러
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly constraint?: string;

  constructor(
    userMessage: string,
    field?: string,
    constraint?: string,
    metadata?: Record<string, any>
  ) {
    super({
      code: 'VAL_ERR_001',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      userMessage,
      technicalMessage: `Validation failed for field: ${field}, constraint: ${constraint}`,
      metadata: { field, constraint, ...metadata },
      retryable: false,
    });
    this.name = 'ValidationError';
    this.field = field;
    this.constraint = constraint;
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessError extends AppError {
  constructor(
    code: ErrorCode,
    userMessage: string,
    technicalMessage: string,
    metadata?: Record<string, any>
  ) {
    super({
      code,
      category: ErrorCategory.BUSINESS,
      severity: ErrorSeverity.WARNING,
      userMessage,
      technicalMessage,
      metadata,
      retryable: false,
    });
    this.name = 'BusinessError';
  }
}

/**
 * 데이터베이스 에러
 */
export class DatabaseError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super({
      code: 'DB_ERR_001',
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.ERROR,
      userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      technicalMessage: message,
      metadata,
      retryable: true,
    });
    this.name = 'DatabaseError';
  }
}
```

---

## 에러 처리 레이어

### 1. API 레이어 (src/services/api.ts)

```typescript
// src/services/errorHandler.ts

import { PostgrestError } from '@supabase/supabase-js';
import {
  AppError,
  NetworkError,
  DatabaseError,
  AuthError,
  ValidationError,
} from '../types/errors';

/**
 * Supabase 에러를 AppError로 변환
 */
export function handleSupabaseError(error: PostgrestError | Error): AppError {
  // PostgreSQL 에러 코드 매핑
  if ('code' in error && error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return new ValidationError(
          '이미 존재하는 데이터입니다.',
          undefined,
          'unique',
          { postgresCode: error.code }
        );

      case '23503': // foreign_key_violation
        return new ValidationError(
          '참조하는 데이터가 존재하지 않습니다.',
          undefined,
          'foreign_key',
          { postgresCode: error.code }
        );

      case '23514': // check_violation
        return new ValidationError(
          '입력 데이터가 유효하지 않습니다.',
          undefined,
          'check',
          { postgresCode: error.code }
        );

      case 'PGRST116': // No rows found
        return new DatabaseError('데이터를 찾을 수 없습니다.', {
          postgresCode: error.code,
        });

      default:
        return new DatabaseError(error.message, {
          postgresCode: error.code,
        });
    }
  }

  // 일반 에러
  if (error.message.includes('Failed to fetch')) {
    return new NetworkError('네트워크 요청 실패', { originalError: error.message });
  }

  return new DatabaseError(error.message);
}

/**
 * API 함수 래퍼 - 에러 처리 통합
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Supabase 에러 처리
    if (error.code || error.message) {
      throw handleSupabaseError(error);
    }

    // 예상치 못한 에러
    console.error(`Unexpected error in ${context}:`, error);
    throw new AppError({
      code: 'SYS_ERR_001',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      userMessage: '알 수 없는 오류가 발생했습니다.',
      technicalMessage: error.message || 'Unknown error',
      metadata: { context },
    });
  }
}
```

**수정된 API 함수 예시:**

```typescript
// src/services/api.ts

import { withErrorHandling, handleSupabaseError } from './errorHandler';

export const taskAPI = {
  async createTask(task: Database['public']['Tables']['tasks']['Insert']) {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw handleSupabaseError(error);
      return data;
    }, 'taskAPI.createTask');
  },

  async getTasks(query: TaskQuery = {}) {
    return withErrorHandling(async () => {
      // ... 기존 로직
      const { data, error, count } = await queryBuilder.range(start, end);

      if (error) throw handleSupabaseError(error);

      return {
        data: data || [],
        pagination: {
          total: count || 0,
          page,
          pageSize,
          pageCount: Math.ceil((count || 0) / pageSize),
        },
      };
    }, 'taskAPI.getTasks');
  },
};
```

### 2. Hook 레이어 (React Query)

```typescript
// src/hooks/useErrorHandler.ts

import { useCallback } from 'react';
import { AppError } from '../types/errors';
import { useToast } from './useToast'; // 토스트 알림 훅

/**
 * 에러 처리 훅
 */
export function useErrorHandler() {
  const toast = useToast();

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AppError) {
      // AppError 처리
      toast.show({
        type: error.severity === 'CRITICAL' ? 'error' : 'warning',
        message: error.userMessage,
        duration: 5000,
      });

      // 로그 전송
      console.error(error.toLog());

      // 특정 에러에 대한 추가 처리
      if (error.code === 'AUTH_ERR_002') {
        // 세션 만료 - 로그인 페이지로 리다이렉트
        window.location.href = '/login?reason=session_expired';
      }
    } else if (error instanceof Error) {
      // 일반 Error 처리
      toast.show({
        type: 'error',
        message: '오류가 발생했습니다. 다시 시도해주세요.',
        duration: 5000,
      });
      console.error(error);
    } else {
      // 알 수 없는 에러
      toast.show({
        type: 'error',
        message: '알 수 없는 오류가 발생했습니다.',
        duration: 5000,
      });
      console.error('Unknown error:', error);
    }
  }, [toast]);

  return { handleError };
}
```

**TanStack Query와 통합:**

```typescript
// src/hooks/useTasks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '../services/api';
import { useErrorHandler } from './useErrorHandler';

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: handleError, // 에러 핸들러 연결
  });
}

export function useTasks(query: TaskQuery) {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
    onError: handleError, // 에러 핸들러 연결
    retry: (failureCount, error) => {
      // AppError의 retryable 속성 확인
      if (error instanceof AppError && !error.retryable) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

### 3. 컴포넌트 레이어

```typescript
// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorSeverity } from '../types/errors';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React 에러 바운더리
 * 컴포넌트 렌더링 중 발생한 에러를 포착
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등으로 전송
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
              오류가 발생했습니다
            </h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {this.state.error instanceof AppError
                ? this.state.error.userMessage
                : '페이지를 표시하는 중 오류가 발생했습니다.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 사용자 피드백 전략

### 1. 토스트 알림 시스템

```typescript
// src/components/Toast.tsx

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function Toast({ type, message, duration = 5000 }: ToastProps) {
  // 구현...
}
```

**에러 타입별 사용자 메시지:**

| 에러 카테고리 | 사용자 메시지 예시 | UI 타입 |
|--------------|-------------------|---------|
| NETWORK | "인터넷 연결을 확인해주세요" | 경고 토스트 |
| AUTH | "로그인이 필요합니다" | 경고 토스트 + 리다이렉트 |
| VALIDATION | "필수 항목을 입력해주세요" | 폼 필드 오류 |
| BUSINESS | "업무 시간은 24시간을 초과할 수 없습니다" | 경고 토스트 |
| DATABASE | "일시적인 오류가 발생했습니다" | 오류 토스트 |
| SYSTEM | "서버 점검 중입니다" | 오류 페이지 |

### 2. 폼 유효성 검증 피드백

```typescript
// React Hook Form과 통합

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  task_name: z.string().min(1, '업무명을 입력해주세요'),
  work_time: z
    .number()
    .min(1, '작업 시간은 1분 이상이어야 합니다')
    .max(1440, '작업 시간은 24시간을 초과할 수 없습니다'),
});

function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
  });

  return (
    <form>
      <input {...register('task_name')} />
      {errors.task_name && (
        <p className="text-red-500 text-sm">{errors.task_name.message}</p>
      )}
    </form>
  );
}
```

---

## 로깅 및 모니터링

### 1. 로그 레벨

```typescript
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

class Logger {
  private logToConsole(level: LogLevel, message: string, metadata?: any) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      level,
      message,
      metadata,
    };

    if (process.env.NODE_ENV === 'development') {
      console[level.toLowerCase()](log);
    } else {
      // 프로덕션: 외부 로깅 서비스로 전송
      this.sendToExternalService(log);
    }
  }

  error(error: AppError | Error, context?: string) {
    if (error instanceof AppError) {
      this.logToConsole(
        error.severity === ErrorSeverity.CRITICAL ? LogLevel.FATAL : LogLevel.ERROR,
        error.userMessage,
        {
          code: error.code,
          category: error.category,
          technicalMessage: error.technicalMessage,
          metadata: error.metadata,
          stack: error.stack,
          context,
        }
      );
    } else {
      this.logToConsole(LogLevel.ERROR, error.message, {
        stack: error.stack,
        context,
      });
    }
  }

  private sendToExternalService(log: any) {
    // TODO: Sentry, Datadog, LogRocket 등과 연동
  }
}

export const logger = new Logger();
```

### 2. 에러 추적

```typescript
// src/utils/errorTracking.ts

/**
 * 에러 추적 초기화 (앱 시작 시 호출)
 */
export function initErrorTracking() {
  // 전역 에러 핸들러
  window.addEventListener('error', (event) => {
    logger.error(new Error(event.message), 'Global error handler');
  });

  // Promise rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(
      new Error(event.reason),
      'Unhandled promise rejection'
    );
  });
}
```

---

## 재시도 정책

### 1. 자동 재시도 규칙

```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorCode[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1초
  maxDelay: 30000, // 30초
  backoffMultiplier: 2,
  retryableErrors: ['NET_ERR_001', 'NET_ERR_002', 'DB_ERR_001'],
};

/**
 * 지수 백오프 재시도
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // 재시도 불가능한 에러인 경우 즉시 종료
      if (error instanceof AppError && !error.retryable) {
        throw error;
      }

      // 마지막 시도인 경우 에러 던지기
      if (attempt === config.maxAttempts - 1) {
        throw error;
      }

      // 대기 시간 계산 (지수 백오프)
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### 2. 사용 예시

```typescript
// API 호출 시 자동 재시도 적용
const data = await retryWithBackoff(
  () => taskAPI.getTasks({ page: 1 }),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['NET_ERR_001', 'DB_ERR_001'],
  }
);
```

---

## 구현 체크리스트

### Phase 1: 기본 에러 타입 정의
- [ ] `src/types/errors.ts` 생성
- [ ] 에러 카테고리, 심각도, 코드 정의
- [ ] AppError 클래스 구현
- [ ] 특화된 에러 클래스 구현

### Phase 2: 에러 핸들러 구현
- [ ] `src/services/errorHandler.ts` 생성
- [ ] handleSupabaseError 함수 구현
- [ ] withErrorHandling 래퍼 구현
- [ ] 기존 API 함수에 적용

### Phase 3: React 통합
- [ ] useErrorHandler 훅 생성
- [ ] ErrorBoundary 컴포넌트 구현
- [ ] Toast 알림 시스템 구현
- [ ] TanStack Query 에러 핸들링 통합

### Phase 4: 로깅 및 모니터링
- [ ] Logger 클래스 구현
- [ ] 전역 에러 핸들러 설정
- [ ] 외부 로깅 서비스 연동 (선택)

### Phase 5: 재시도 메커니즘
- [ ] retryWithBackoff 함수 구현
- [ ] TanStack Query 재시도 설정
- [ ] 네트워크 에러 자동 재시도

---

## 모범 사례

### DO ✅
- 사용자에게 해결 방법을 제시하는 메시지 사용
- 모든 에러를 로깅
- 재시도 가능한 에러는 자동 재시도
- 에러 타입에 따라 적절한 UI 피드백 제공
- 민감한 정보를 사용자에게 노출하지 않음

### DON'T ❌
- 기술적 에러 메시지를 사용자에게 직접 표시
- 에러를 무시하거나 숨김
- 모든 에러를 동일하게 처리
- 재시도 없이 즉시 실패
- 사용자에게 스택 트레이스 노출

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
