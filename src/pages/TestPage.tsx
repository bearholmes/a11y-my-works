import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { memberAPI, taskAPI } from '../services/api';

export function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // 1. Supabase 연결 테스트
      addResult('🔗 Supabase 연결 테스트 시작...');
      const { data: session } = await supabase.auth.getSession();
      addResult(`✅ Supabase 연결 성공 - 현재 세션: ${session.session ? '로그인됨' : '로그아웃됨'}`);

      // 2. 테스트 계정 생성
      addResult('👤 테스트 계정 생성 시작...');
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'test123456';
      const testProfile = {
        name: '테스트 사용자',
        account_id: `test-${Date.now()}`
      };

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        addResult(`❌ 회원가입 실패: ${signUpError.message}`);
        return;
      }

      addResult(`✅ 회원가입 성공 - User ID: ${signUpData.user?.id}`);

      // 3. Members 테이블에 프로필 생성
      if (signUpData.user) {
        addResult('📝 Members 테이블 프로필 생성 시작...');
        try {
          await memberAPI.createMemberProfile(signUpData.user.id, {
            account_id: testProfile.account_id,
            name: testProfile.name,
            email: testEmail,
          });
          addResult('✅ Members 테이블 프로필 생성 성공');
        } catch (memberError) {
          addResult(`❌ Members 테이블 프로필 생성 실패: ${memberError}`);
        }
      }

      // 4. 로그인 테스트
      addResult('🔐 로그인 테스트 시작...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        addResult(`❌ 로그인 실패: ${signInError.message}`);
        return;
      }

      addResult(`✅ 로그인 성공 - Session: ${signInData.session?.access_token ? '활성' : '비활성'}`);

      // 5. 데이터베이스 테이블 확인
      addResult('🗃️ 데이터베이스 테이블 확인 시작...');
      
      // Roles 테이블 확인
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(3);
      
      if (rolesError) {
        addResult(`❌ Roles 테이블 조회 실패: ${rolesError.message}`);
      } else {
        addResult(`✅ Roles 테이블 조회 성공 - ${roles?.length || 0}개 데이터`);
      }

      // Members 테이블 확인
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('email', testEmail);
      
      if (membersError) {
        addResult(`❌ Members 테이블 조회 실패: ${membersError.message}`);
      } else {
        addResult(`✅ Members 테이블 조회 성공 - 생성된 프로필: ${members?.[0]?.name || 'N/A'}`);
      }

      // 6. 테스트 업무 생성
      addResult('📋 테스트 업무 생성 시작...');
      try {
        const testTask = {
          task_date: new Date().toISOString().split('T')[0],
          task_name: '테스트 업무',
          task_detail: '데이터 연동 테스트용 업무입니다.',
          member_id: members?.[0]?.member_id || 1,
        };

        await taskAPI.createTask(testTask);
        addResult('✅ 테스트 업무 생성 성공');
      } catch (taskError) {
        addResult(`❌ 테스트 업무 생성 실패: ${taskError}`);
      }

      // 7. 정리 (테스트 계정 삭제는 보안상 생략)
      addResult('🧹 테스트 완료');
      addResult('⚠️ 주의: 테스트 계정은 수동으로 정리가 필요합니다.');

    } catch (error) {
      addResult(`❌ 전체 테스트 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          실제 데이터 연동 테스트
        </h2>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '테스트 실행 중...' : '통합 테스트 실행'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">테스트 결과:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">테스트를 실행하려면 위의 버튼을 클릭하세요.</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono ${
                    result.includes('❌') 
                      ? 'text-red-600' 
                      : result.includes('✅') 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>테스트 항목:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Supabase 클라이언트 연결 확인</li>
            <li>사용자 회원가입 (Supabase Auth)</li>
            <li>Members 테이블 프로필 자동 생성</li>
            <li>로그인 기능 테스트</li>
            <li>데이터베이스 테이블 접근 확인</li>
            <li>업무 생성 API 테스트</li>
          </ul>
        </div>
      </div>
    </div>
  );
}