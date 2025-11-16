import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { ErrorMessage, Field, Label } from '../components/ui/fieldset';
import { Heading } from '../components/ui/heading';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../hooks/useNotification';
import { holidayAPI } from '../services/api';

const holidaySchema = z.object({
  holiday_date: z.string().min(1, '날짜를 선택해주세요'),
  name: z.string().min(1, '공휴일명을 입력해주세요'),
  description: z.string().optional(),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

export function HolidayForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const { showSuccess, showError } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
  });

  // 수정 모드일 때 공휴일 정보 조회
  const { data: holiday, isLoading: holidayLoading } = useQuery({
    queryKey: ['holiday', id],
    queryFn: () => holidayAPI.getHoliday(Number(id)),
    enabled: isEditMode,
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (holiday) {
      reset({
        holiday_date: holiday.holiday_date,
        name: holiday.name,
        description: holiday.description || '',
      });
    }
  }, [holiday, reset]);

  // 공휴일 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: HolidayFormData) => holidayAPI.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      showSuccess('공휴일이 등록되었습니다.');
      navigate('/holidays');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  // 공휴일 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      holidayId,
      data,
    }: {
      holidayId: number;
      data: HolidayFormData;
    }) => holidayAPI.updateHoliday(holidayId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holiday', id] });
      showSuccess('공휴일이 수정되었습니다.');
      navigate('/holidays');
    },
    onError: (error) => {
      showError(`오류가 발생했습니다: ${(error as Error).message}`);
    },
  });

  const onSubmit = async (data: HolidayFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ holidayId: Number(id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && holidayLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Heading>{isEditMode ? '공휴일 수정' : '공휴일 등록'}</Heading>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8  bg-white dark:bg-zinc-900 rounded-lg p-6 space-y-6"
      >
        <Field>
          <Label>
            날짜{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="holiday_date"
            {...register('holiday_date')}
            type="date"
            aria-required="true"
            aria-invalid={!!errors.holiday_date}
          />
          {errors.holiday_date && (
            <ErrorMessage>{errors.holiday_date.message}</ErrorMessage>
          )}
        </Field>

        <Field>
          <Label>
            공휴일명{' '}
            <span className="text-red-600" aria-label="필수 항목">
              *
            </span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            type="text"
            placeholder="예: 설날"
            aria-required="true"
            aria-invalid={!!errors.name}
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </Field>

        <Field>
          <Label>설명</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="공휴일에 대한 추가 설명을 입력하세요"
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <ErrorMessage>{errors.description.message}</ErrorMessage>
          )}
        </Field>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                처리 중...
              </span>
            ) : isEditMode ? (
              '수정'
            ) : (
              '등록'
            )}
          </Button>
          <Button type="button" plain onClick={() => navigate('/holidays')}>
            취소
          </Button>
        </div>
      </form>
    </>
  );
}
