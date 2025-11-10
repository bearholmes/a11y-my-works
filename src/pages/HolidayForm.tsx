import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
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
      alert('공휴일이 등록되었습니다.');
      navigate('/holidays');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
      alert('공휴일이 수정되었습니다.');
      navigate('/holidays');
    },
    onError: (error) => {
      alert(`오류가 발생했습니다: ${(error as Error).message}`);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          공휴일 {isEditMode ? '수정' : '등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          공휴일 정보를 {isEditMode ? '수정' : '입력'}합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-sm rounded-lg border p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="holiday_date"
            className="block text-sm font-medium text-gray-700"
          >
            날짜 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('holiday_date')}
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.holiday_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.holiday_date.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            공휴일명 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="예: 설날"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            설명
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="공휴일에 대한 추가 설명을 입력하세요"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? '처리 중...'
              : isEditMode
                ? '수정'
                : '등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/holidays')}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
