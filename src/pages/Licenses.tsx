import {useEffect, useState} from 'react';
import {Button} from '../components/ui/button';
import {Divider} from '../components/ui/divider';
import {Heading} from '../components/ui/heading';
import {Spinner} from '../components/ui/spinner';
import {Text} from '../components/ui/text';

/**
 * 오픈소스 라이센스 고지 페이지
 *
 * 프로젝트에서 사용 중인 모든 오픈소스 라이브러리의 라이센스 정보를 표시합니다.
 * public/LICENSES.txt 파일의 내용을 읽어 화면에 출력합니다.
 *
 * @returns 라이센스 고지 페이지 컴포넌트
 */
export function Licenses() {
  const [licenseText, setLicenseText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * 라이센스 텍스트 파일을 가져옵니다
     */
    const fetchLicenses = async () => {
      try {
        const response = await fetch('/LICENSES.txt');
        if (!response.ok) {
          throw new Error('라이센스 파일을 불러올 수 없습니다.');
        }
        const text = await response.text();
        setLicenseText(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  if (loading) {
    return (<div className="flex items-center justify-center py-12">
      <Spinner size="lg" label="라이센스 정보를 불러오는 중..."/>
    </div>);
  }

  return (<div className="m-5">
    <div className="flex items-center justify-between">
      <Heading>오픈소스 라이센스</Heading>
      <Button href="/" plain>
        ← Home
      </Button>
    </div>
    <Text className="mt-2">
      본 소프트웨어는 다음의 오픈소스 라이브러리를 사용합니다.
      <br/>
      모든 라이브러리는 상업적 사용이 가능한 오픈소스 라이센스를 따릅니다.
    </Text>

    <Divider className="my-10 mt-6"/>

    {!error ? <div>
        <pre
          className="whitespace-pre-wrap font-mono text-sm text-zinc-950 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-h-[600px] overflow-y-auto">
          {licenseText}
        </pre>
    </div> : <Text className="mt-2">라이센스 정보를 확인할 수 없습니다. 관리자에게 문의하세요.</Text>}
  </div>);
}
