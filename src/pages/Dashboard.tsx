export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          업무 대시보드
        </h2>
        <p className="text-gray-600">
          {import.meta.env.VITE_APP_DESCRIPTION}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">총 작업</h3>
          <div className="mt-2 text-3xl font-semibold text-gray-900">0</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">진행 중인 작업</h3>
          <div className="mt-2 text-3xl font-semibold text-blue-600">0</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">완료된 작업</h3>
          <div className="mt-2 text-3xl font-semibold text-green-600">0</div>
        </div>
      </div>
    </div>
  );
}
