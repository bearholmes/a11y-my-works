# JSDoc 주석 작성 가이드

## 목차

1. [개요](#개요)
2. [JSDoc 주석 기본 구조](#jsdoc-주석-기본-구조)
3. [파일/모듈 레벨 주석](#파일모듈-레벨-주석)
4. [함수 문서화](#함수-문서화)
5. [클래스 문서화](#클래스-문서화)
6. [타입 문서화](#타입-문서화)
7. [코드 예제](#코드-예제)
8. [모범 사례](#모범-사례)

## 개요

JSDoc은 JavaScript 코드에 주석을 추가하기 위한 API 문서 생성 도구입니다. 특수 태그를 사용하여 코드의 구조, 타입, 목적 등을 명확하게 문서화할 수 있습니다. 이 가이드는 프로젝트에서 일관된 주석 방식을 유지하고 코드의 가독성과 유지보수성을 향상시키기 위한 규칙과 권장 사항을 제공합니다.

## JSDoc 주석 기본 구조

JSDoc 주석은 `/**`로 시작하고 `*/`로 끝납니다.

```javascript
/**
 * 이것은 JSDoc 주석입니다.
 * 여러 줄에 걸쳐 작성할 수 있습니다.
 */
```

## 파일/모듈 레벨 주석

각 파일의 상단에는 해당 모듈에 대한 개요와 목적을 설명하는 JSDoc 주석을 포함해야 합니다.

```javascript
/**
 * 파일/모듈 이름
 * 
 * 이 모듈의 목적과 기능에 대한 상세 설명.
 * 다른 모듈과의 관계나 사용 방법에 대한 정보를 포함합니다.
 * 
 * @module 모듈명
 * @requires 의존모듈1
 * @requires 의존모듈2
 * @author 작성자명
 * @version 1.0.0
 */
```

## 함수 문서화

함수 선언 전에는 함수의 목적, 매개변수, 반환값 등을 설명하는 JSDoc 주석을 포함해야 합니다.

```javascript
/**
 * 함수 이름
 * 함수가 수행하는 작업에 대한 간략한 설명.
 * 필요한 경우 더 자세한 설명을 추가합니다.
 *
 * @function 함수명
 * @async (비동기 함수인 경우 추가)
 * @param {타입} 파라미터명 - 파라미터 설명
 * @param {타입} [선택적파라미터] - 선택적 파라미터 설명
 * @param {타입} [기본값파라미터=기본값] - 기본값이 있는 파라미터 설명
 * @returns {타입} 반환값 설명
 * @throws {예외타입} 예외 발생 조건 설명
 * @example
 * // 함수 사용 예제
 * const result = 함수명(인자1, 인자2);
 */
```

### 비동기 함수(Promise)를 반환하는 경우:

```javascript
/**
 * 비동기 함수 이름
 * 
 * @async
 * @function 함수명
 * @param {타입} 파라미터명 - 파라미터 설명
 * @returns {Promise<타입>} Promise 반환값 설명
 */
```

## 클래스 문서화

클래스와 그 메서드를 문서화하는 방법입니다.

```javascript
/**
 * 클래스 이름
 * 클래스의 목적과 역할에 대한 설명.
 *
 * @class
 * @classdesc 클래스에 대한 자세한 설명
 */
class 클래스명 {
  /**
   * 클래스 생성자
   * 
   * @constructor
   * @param {타입} 파라미터명 - 파라미터 설명
   */
  constructor(파라미터) {
    // 생성자 코드
  }

  /**
   * 메서드 이름
   * 메서드가 수행하는 작업에 대한 설명.
   *
   * @method
   * @param {타입} 파라미터명 - 파라미터 설명
   * @returns {타입} 반환값 설명
   */
  메서드명(파라미터) {
    // 메서드 코드
  }
}
```

## 타입 문서화

복잡한 객체 구조나 사용자 정의 타입을 문서화하는 방법입니다.

```javascript
/**
 * 사용자 정보를 나타내는 객체
 *
 * @typedef {Object} User
 * @property {number} id - 사용자 고유 식별자
 * @property {string} name - 사용자 이름
 * @property {string} email - 사용자 이메일
 * @property {boolean} [isActive] - 사용자 활성화 상태 (선택적)
 */

/**
 * 사용자 정보를 조회하는 함수
 *
 * @param {number} userId - 조회할 사용자 ID
 * @returns {User} 사용자 정보 객체
 */
function getUser(userId) {
  // 함수 코드
}
```

## 코드 예제

실제 프로젝트에서 사용된 JSDoc 주석 예제입니다.

### 1. 모듈 레벨 주석 예제:

```javascript
/**
 * 인증 컨트롤러 모듈
 * 
 * 이 모듈은 사용자 인증과 관련된 모든 HTTP 요청을 처리하는 컨트롤러 함수들을 포함합니다.
 * 로그인, 로그아웃, 토큰 갱신, JWT 인증 등의 기능을 제공합니다.
 * 
 * @module controllers/auth/authController
 * @requires services/auth/authService
 * @requires utils/tokenUtil
 * @requires helpers/errorResponse
 */
```

### 2. 함수 주석 예제:

```javascript
/**
 * 로그인 컨트롤러
 * 사용자 계정 ID와 비밀번호를 검증하고 유효한 경우 JWT 토큰을 발급합니다.
 * 
 * @function loginController
 * @param {Object} fastify - Fastify 인스턴스
 * @returns {Function} 라우트 핸들러 함수
 */
export const loginController = (fastify) => async (request, reply) => {
  // 함수 구현
};
```

### 3. 모델 주석 예제:

```javascript
/**
 * 회원 모델 클래스
 * 시스템 사용자 정보를 저장하는 데이터베이스 모델입니다.
 * 
 * @class Member
 * @extends Model
 */
export class Member extends Model {
  /**
   * 시퀄라이즈 모델 초기화
   * 데이터베이스 테이블 구조를 정의합니다.
   * 
   * @static
   * @param {Sequelize} sequelize - 시퀄라이즈 인스턴스
   * @returns {Class<Member>} 초기화된 Member 모델 클래스
   */
  static initialize(sequelize) {
    // 메서드 구현
  }
}
```

## 모범 사례

1. **일관성 유지**: 동일한 형식과 스타일로 주석을 작성하세요.
2. **구체적인 설명**: "이 함수는 X를 합니다"보다 "이 함수는 입력 데이터를 검증하고 필터링한 후 정렬된 결과를 반환합니다"와 같이 구체적으로 작성하세요.
3. **타입 명시**: 모든 매개변수와 반환값의 타입을 명시하세요.
4. **필수 정보 포함**: 함수의 부작용, 예외 발생 조건, 사용 제약 사항 등 중요한 정보를 포함하세요.
5. **예제 코드 제공**: 복잡한 함수나 API의 경우 사용 예제를 포함하세요.
6. **최신 상태 유지**: 코드가 변경될 때 관련 주석도 함께 업데이트하세요.
7. **간결함 유지**: 너무 길거나 불필요한 정보는 피하고 핵심 정보에 집중하세요.
8. **코드 레벨에 맞는 문서화**: 모듈, 클래스, 함수, 속성 등 각 레벨에 맞는 적절한 태그와 설명을 사용하세요.

이 가이드를 따르면 코드베이스의 자체 문서화가 강화되어 새로운 개발자들이 프로젝트를 더 빠르게 이해하고 기여할 수 있으며, IDE의 인텔리센스와 자동 완성 기능을 통해 개발 생산성도 향상됩니다.
