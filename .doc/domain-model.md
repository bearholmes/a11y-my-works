# 도메인 모델 설계

## 개요

이 문서는 업무 보고 시스템의 도메인 모델을 Domain-Driven Design (DDD) 관점에서 정의합니다. 비즈니스 로직과 데이터 구조를 명확히 분리하여 유지보수성을 향상시킵니다.

## 도메인 주도 설계 (DDD) 적용 범위

### 적용 이유
- **복잡한 비즈니스 규칙**: 업무 시간 검증, 권한 관리, 프로젝트 계층 구조
- **장기 유지보수**: 도메인 지식을 코드로 명시적으로 표현
- **팀 협업**: 비즈니스와 개발자 간 공통 언어 (Ubiquitous Language)

---

## 1. 바운디드 컨텍스트 (Bounded Contexts)

시스템을 논리적으로 분리된 컨텍스트로 나눕니다:

```
┌───────────────────────────────────────────────────────────┐
│                    업무 보고 시스템                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  인증 컨텍스트    │  │  업무 관리       │              │
│  │ (Auth Context)  │  │  컨텍스트        │              │
│  ├─────────────────┤  │ (Task Context)  │              │
│  │ - 사용자 인증    │  ├─────────────────┤              │
│  │ - 세션 관리      │  │ - 업무 보고 작성 │              │
│  │ - 권한 검증      │  │ - 업무 조회      │              │
│  └─────────────────┘  │ - 시간 추적      │              │
│                       └─────────────────┘              │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  프로젝트 관리    │  │  조직 관리       │              │
│  │ (Project Mgmt)  │  │ (Org Context)   │              │
│  ├─────────────────┤  ├─────────────────┤              │
│  │ - 프로젝트       │  │ - 부서 구조      │              │
│  │ - 서비스         │  │ - 멤버 관리      │              │
│  │ - 비용 그룹      │  │ - 역할/권한      │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 2. 엔티티 (Entities)

### 정의
고유 식별자를 가지며, 속성이 변경되어도 동일성을 유지하는 도메인 객체

### 2.1 Task (업무 보고) - 핵심 엔티티

```typescript
// src/domain/entities/Task.ts

import { TaskId } from '../value-objects/TaskId';
import { WorkTime } from '../value-objects/WorkTime';
import { TaskStatus } from '../value-objects/TaskStatus';

/**
 * 업무 보고 엔티티
 */
export class Task {
  private readonly _id: TaskId;
  private _name: string;
  private _detail?: string;
  private _workTime: WorkTime;
  private _status: TaskStatus;
  private _memberId: number;
  private _projectId?: number;
  private _serviceId?: number;
  private _taskDate: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: TaskId;
    name: string;
    detail?: string;
    workTime: WorkTime;
    status: TaskStatus;
    memberId: number;
    projectId?: number;
    serviceId?: number;
    taskDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._detail = props.detail;
    this._workTime = props.workTime;
    this._status = props.status;
    this._memberId = props.memberId;
    this._projectId = props.projectId;
    this._serviceId = props.serviceId;
    this._taskDate = props.taskDate;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  // Getters
  get id(): TaskId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get workTime(): WorkTime {
    return this._workTime;
  }

  get status(): TaskStatus {
    return this._status;
  }

  /**
   * 비즈니스 규칙: 업무명 변경
   */
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new DomainError('업무명은 필수입니다');
    }

    if (newName.length > 200) {
      throw new DomainError('업무명은 200자를 초과할 수 없습니다');
    }

    this._name = newName;
    this._updatedAt = new Date();
  }

  /**
   * 비즈니스 규칙: 작업 시간 변경
   */
  changeWorkTime(newWorkTime: WorkTime): void {
    this._workTime = newWorkTime;
    this._updatedAt = new Date();
  }

  /**
   * 비즈니스 규칙: 업무 완료 처리
   */
  complete(): void {
    if (this._status.isCompleted()) {
      throw new DomainError('이미 완료된 업무입니다');
    }

    this._status = TaskStatus.completed();
    this._updatedAt = new Date();
  }

  /**
   * 비즈니스 규칙: 본인 업무인지 확인
   */
  isOwnedBy(memberId: number): boolean {
    return this._memberId === memberId;
  }

  /**
   * 유효성 검증
   */
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainError('업무명은 필수입니다');
    }

    if (!this._workTime) {
      throw new DomainError('작업 시간은 필수입니다');
    }

    if (!this._memberId) {
      throw new DomainError('작성자는 필수입니다');
    }
  }

  /**
   * 도메인 이벤트 발행을 위한 변경사항 추적
   */
  markAsModified(): void {
    this._updatedAt = new Date();
  }
}
```

### 2.2 Member (회원) 엔티티

```typescript
// src/domain/entities/Member.ts

import { Email } from '../value-objects/Email';
import { Role } from '../value-objects/Role';

export class Member {
  private readonly _id: number;
  private _accountId: string;
  private _name: string;
  private _email: Email;
  private _role: Role;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: number;
    accountId: string;
    name: string;
    email: Email;
    role: Role;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._accountId = props.accountId;
    this._name = props.name;
    this._email = props.email;
    this._role = props.role;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): number {
    return this._id;
  }

  get role(): Role {
    return this._role;
  }

  /**
   * 비즈니스 규칙: 권한 확인
   */
  hasPermission(permission: string): boolean {
    return this._role.hasPermission(permission);
  }

  /**
   * 비즈니스 규칙: 관리자 여부
   */
  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  /**
   * 비즈니스 규칙: 활성화된 사용자인지 확인
   */
  isActive(): boolean {
    return this._isActive;
  }

  /**
   * 비즈니스 규칙: 사용자 비활성화
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new DomainError('이미 비활성화된 사용자입니다');
    }

    this._isActive = false;
    this._updatedAt = new Date();
  }
}
```

---

## 3. 밸류 오브젝트 (Value Objects)

### 정의
식별자가 없으며, 속성으로만 구분되는 불변 객체

### 3.1 WorkTime (작업 시간)

```typescript
// src/domain/value-objects/WorkTime.ts

/**
 * 작업 시간 밸류 오브젝트
 * 불변 객체로 비즈니스 규칙을 캡슐화
 */
export class WorkTime {
  private readonly _minutes: number;

  private constructor(minutes: number) {
    this._minutes = minutes;
  }

  /**
   * 팩토리 메서드: 분 단위로 생성
   */
  static fromMinutes(minutes: number): WorkTime {
    if (minutes < 0) {
      throw new DomainError('작업 시간은 0 이상이어야 합니다');
    }

    if (minutes > 1440) {
      throw new DomainError('작업 시간은 24시간(1440분)을 초과할 수 없습니다');
    }

    return new WorkTime(minutes);
  }

  /**
   * 팩토리 메서드: 시:분 형식으로 생성
   */
  static fromHoursAndMinutes(hours: number, minutes: number): WorkTime {
    const totalMinutes = hours * 60 + minutes;
    return WorkTime.fromMinutes(totalMinutes);
  }

  /**
   * Getter: 분 단위 값
   */
  get minutes(): number {
    return this._minutes;
  }

  /**
   * Getter: 시간 단위 값
   */
  get hours(): number {
    return Math.floor(this._minutes / 60);
  }

  /**
   * 비즈니스 로직: 다른 작업 시간과 합산
   */
  add(other: WorkTime): WorkTime {
    return WorkTime.fromMinutes(this._minutes + other._minutes);
  }

  /**
   * 비즈니스 로직: 하루 제한 초과 여부
   */
  exceedsDailyLimit(): boolean {
    return this._minutes > 1440;
  }

  /**
   * 비즈니스 로직: 시간 형식으로 변환
   */
  toTimeString(): string {
    const hours = this.hours;
    const mins = this._minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * 동등성 비교
   */
  equals(other: WorkTime): boolean {
    return this._minutes === other._minutes;
  }

  /**
   * 불변성: 새 객체 반환
   */
  clone(): WorkTime {
    return new WorkTime(this._minutes);
  }
}
```

### 3.2 Email (이메일)

```typescript
// src/domain/value-objects/Email.ts

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new DomainError('유효하지 않은 이메일 형식입니다');
    }

    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
```

### 3.3 TaskStatus (업무 상태)

```typescript
// src/domain/value-objects/TaskStatus.ts

export enum TaskStatusType {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class TaskStatus {
  private readonly _status: TaskStatusType;

  private constructor(status: TaskStatusType) {
    this._status = status;
  }

  static pending(): TaskStatus {
    return new TaskStatus(TaskStatusType.PENDING);
  }

  static inProgress(): TaskStatus {
    return new TaskStatus(TaskStatusType.IN_PROGRESS);
  }

  static completed(): TaskStatus {
    return new TaskStatus(TaskStatusType.COMPLETED);
  }

  static cancelled(): TaskStatus {
    return new TaskStatus(TaskStatusType.CANCELLED);
  }

  isPending(): boolean {
    return this._status === TaskStatusType.PENDING;
  }

  isCompleted(): boolean {
    return this._status === TaskStatusType.COMPLETED;
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    // 상태 전환 규칙
    if (this.isCompleted() || this._status === TaskStatusType.CANCELLED) {
      return false; // 완료/취소된 업무는 변경 불가
    }

    return true;
  }

  equals(other: TaskStatus): boolean {
    return this._status === other._status;
  }
}
```

---

## 4. 애그리게이트 (Aggregates)

### 정의
일관성 있는 변경을 위해 함께 묶이는 엔티티와 밸류 오브젝트의 집합

### 4.1 Task Aggregate

```
Task Aggregate Root
├── Task (Entity)
├── WorkTime (Value Object)
├── TaskStatus (Value Object)
└── Comments (Entity Collection) [선택적 확장]
```

**비즈니스 불변식 (Invariants)**:
1. 작업 시간은 0~1440분 사이
2. 완료된 업무는 수정 불가
3. 본인 또는 관리자만 수정 가능

### 4.2 Project Aggregate

```
Project Aggregate Root
├── Project (Entity)
├── Service (Entity)
├── CostGroup (Entity)
└── ProjectUrls (Value Object Collection)
```

**비즈니스 불변식**:
1. 프로젝트는 반드시 서비스에 속함
2. 서비스는 반드시 비용 그룹에 속함
3. 비활성화된 프로젝트는 업무에 사용 불가

---

## 5. 도메인 서비스 (Domain Services)

### 정의
엔티티나 밸류 오브젝트에 속하지 않는 비즈니스 로직

### 5.1 TaskValidationService

```typescript
// src/domain/services/TaskValidationService.ts

import { Task } from '../entities/Task';
import { WorkTime } from '../value-objects/WorkTime';

/**
 * 업무 검증 도메인 서비스
 */
export class TaskValidationService {
  /**
   * 하루 총 업무 시간 검증
   */
  static async validateDailyWorkTime(
    taskDate: Date,
    memberId: number,
    newWorkTime: WorkTime,
    excludeTaskId?: number
  ): Promise<{ valid: boolean; totalMinutes: number }> {
    // 해당 날짜의 모든 업무 조회
    const tasksOnDate = await this.getTasksByDate(taskDate, memberId);

    // 총 작업 시간 계산
    let totalMinutes = 0;
    for (const task of tasksOnDate) {
      if (task.id.value !== excludeTaskId) {
        totalMinutes += task.workTime.minutes;
      }
    }

    totalMinutes += newWorkTime.minutes;

    return {
      valid: totalMinutes <= 1440,
      totalMinutes,
    };
  }

  /**
   * 프로젝트 활성화 상태 확인
   */
  static async validateProjectActive(projectId: number): Promise<boolean> {
    const project = await this.getProjectById(projectId);
    return project?.isActive ?? false;
  }

  // 리포지토리 메서드 (실제 구현은 infrastructure 레이어)
  private static async getTasksByDate(date: Date, memberId: number): Promise<Task[]> {
    throw new Error('Not implemented - should be injected');
  }

  private static async getProjectById(projectId: number): Promise<any> {
    throw new Error('Not implemented - should be injected');
  }
}
```

### 5.2 PermissionService

```typescript
// src/domain/services/PermissionService.ts

import { Member } from '../entities/Member';
import { Task } from '../entities/Task';

/**
 * 권한 검증 도메인 서비스
 */
export class PermissionService {
  /**
   * 업무 수정 권한 확인
   */
  static canModifyTask(member: Member, task: Task): boolean {
    // 본인 업무이거나 관리자인 경우 수정 가능
    return task.isOwnedBy(member.id) || member.isAdmin();
  }

  /**
   * 업무 삭제 권한 확인
   */
  static canDeleteTask(member: Member, task: Task): boolean {
    // 수정 권한과 동일
    return this.canModifyTask(member, task);
  }

  /**
   * 전체 업무 조회 권한 확인
   */
  static canViewAllTasks(member: Member): boolean {
    // 관리자 또는 팀장만 가능
    return member.isAdmin() || member.role.isManager();
  }
}
```

---

## 6. 도메인 이벤트 (Domain Events)

### 정의
도메인 내에서 발생한 중요한 사건

### 6.1 이벤트 정의

```typescript
// src/domain/events/DomainEvent.ts

export interface DomainEvent {
  occurredOn: Date;
  eventType: string;
}

// 업무 생성 이벤트
export class TaskCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'TaskCreated';

  constructor(
    public readonly taskId: number,
    public readonly memberId: number,
    public readonly taskDate: Date,
    public readonly workTime: number
  ) {
    this.occurredOn = new Date();
  }
}

// 업무 완료 이벤트
export class TaskCompletedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'TaskCompleted';

  constructor(
    public readonly taskId: number,
    public readonly memberId: number,
    public readonly completedAt: Date
  ) {
    this.occurredOn = new Date();
  }
}

// 회원 등록 이벤트
export class MemberRegisteredEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'MemberRegistered';

  constructor(
    public readonly memberId: number,
    public readonly email: string,
    public readonly name: string
  ) {
    this.occurredOn = new Date();
  }
}
```

### 6.2 이벤트 핸들러

```typescript
// src/domain/events/EventHandler.ts

type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export const eventBus = new EventBus();

// 사용 예시
eventBus.subscribe('TaskCreated', async (event: TaskCreatedEvent) => {
  console.log(`Task created: ${event.taskId} by member ${event.memberId}`);
  // 통계 업데이트, 알림 전송 등
});
```

---

## 7. 유비쿼터스 언어 (Ubiquitous Language)

### 정의
비즈니스와 개발자가 공유하는 공통 용어

### 업무 보고 시스템 용어 사전

| 한글 용어 | 영어 용어 | 정의 | 예시 |
|----------|----------|------|------|
| 업무 보고 | Task Report | 사용자가 수행한 업무 기록 | "프론트엔드 개발" |
| 작업 시간 | Work Time | 업무에 소요된 시간 (분 단위) | 120분 (2시간) |
| 비용 그룹 | Cost Group | 청구 단위 그룹 | "프로젝트 A" |
| 서비스 | Service | 비용 그룹 하위의 서비스 단위 | "웹 서비스" |
| 프로젝트 | Project | 서비스 하위의 프로젝트 단위 | "관리자 페이지" |
| 활성화 | Active | 사용 가능한 상태 | is_active = true |
| 권한 | Permission | 기능별 접근 권한 | PERM_02 (업무보고) |
| 역할 | Role | 사용자 역할 | ADMIN, MANAGER, EMPLOYEE |

### 금지 용어
- "데이터" → "업무 보고" (구체적으로)
- "유저" → "회원" 또는 "사용자"
- "삭제" → "비활성화" (소프트 삭제 시)

---

## 8. 도메인 모델 구현 예시

### 8.1 레이어드 아키텍처

```
src/
├── domain/                    # 도메인 레이어 (순수 비즈니스 로직)
│   ├── entities/
│   │   ├── Task.ts
│   │   ├── Member.ts
│   │   └── Project.ts
│   ├── value-objects/
│   │   ├── WorkTime.ts
│   │   ├── Email.ts
│   │   └── TaskStatus.ts
│   ├── services/
│   │   ├── TaskValidationService.ts
│   │   └── PermissionService.ts
│   └── events/
│       ├── DomainEvent.ts
│       └── EventBus.ts
├── application/              # 애플리케이션 레이어 (유스케이스)
│   └── use-cases/
│       ├── CreateTaskUseCase.ts
│       └── UpdateTaskUseCase.ts
├── infrastructure/           # 인프라 레이어 (기술 세부사항)
│   ├── repositories/
│   │   └── TaskRepository.ts
│   └── supabase/
│       └── SupabaseClient.ts
└── presentation/            # 프레젠테이션 레이어 (UI)
    ├── components/
    └── pages/
```

### 8.2 사용 예시

```typescript
// application/use-cases/CreateTaskUseCase.ts

import { Task } from '../../domain/entities/Task';
import { WorkTime } from '../../domain/value-objects/WorkTime';
import { TaskStatus } from '../../domain/value-objects/TaskStatus';
import { TaskValidationService } from '../../domain/services/TaskValidationService';
import { eventBus } from '../../domain/events/EventBus';
import { TaskCreatedEvent } from '../../domain/events/DomainEvent';

export class CreateTaskUseCase {
  async execute(input: {
    name: string;
    workTime: number;
    memberId: number;
    taskDate: Date;
  }): Promise<Task> {
    // 1. 밸류 오브젝트 생성
    const workTime = WorkTime.fromMinutes(input.workTime);

    // 2. 도메인 규칙 검증 (도메인 서비스 사용)
    const validation = await TaskValidationService.validateDailyWorkTime(
      input.taskDate,
      input.memberId,
      workTime
    );

    if (!validation.valid) {
      throw new Error(`하루 총 업무 시간이 24시간을 초과합니다 (현재: ${validation.totalMinutes}분)`);
    }

    // 3. 엔티티 생성
    const task = new Task({
      id: TaskId.generate(), // 새 ID 생성
      name: input.name,
      workTime,
      status: TaskStatus.pending(),
      memberId: input.memberId,
      taskDate: input.taskDate,
    });

    // 4. 영속화 (리포지토리)
    const savedTask = await this.taskRepository.save(task);

    // 5. 도메인 이벤트 발행
    await eventBus.publish(
      new TaskCreatedEvent(
        savedTask.id.value,
        input.memberId,
        input.taskDate,
        workTime.minutes
      )
    );

    return savedTask;
  }
}
```

---

## 9. 구현 로드맵

### Phase 1: 핵심 밸류 오브젝트 (1주)
- [ ] WorkTime 구현
- [ ] TaskStatus 구현
- [ ] Email 구현

### Phase 2: 엔티티 및 애그리게이트 (2주)
- [ ] Task 엔티티 구현
- [ ] Member 엔티티 구현
- [ ] 애그리게이트 경계 정의

### Phase 3: 도메인 서비스 (1주)
- [ ] TaskValidationService 구현
- [ ] PermissionService 구현

### Phase 4: 도메인 이벤트 (1주)
- [ ] 이벤트 정의
- [ ] EventBus 구현
- [ ] 핸들러 등록

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
