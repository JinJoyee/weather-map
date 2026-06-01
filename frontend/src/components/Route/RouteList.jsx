export default function RouteList() {
  const routes = [
    {
      id: 1,
      name: "등교 경로",
      createdAt: "2026-06-01",
      waypoints: 3,
    },
    {
      id: 2,
      name: "하교 경로",
      createdAt: "2026-05-30",
      waypoints: 5,
    },
    {
      id: 3,
      name: "운동 경로",
      createdAt: "2026-05-28",
      waypoints: 2,
    },
  ];

  return (
    <div className="flex h-screen flex-col p-6">
      {/* 헤더 */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold">
          내 커스텀 경로
        </h1>
      </header>

      {/* 경로 목록 영역 */}
      <main className="flex-1 overflow-y-auto rounded-lg border p-4">
        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {route.name}
                </h3>
                <p className="text-sm text-gray-500">
                  저장일: {route.createdAt}
                </p>
                <p className="text-sm text-gray-500">
                  웨이포인트: {route.waypoints}개
                </p>
              </div>

              <button className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600">
                삭제
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 하단 버튼 */}
      <footer className="mt-4">
        <button className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white">
          새 경로 추가
        </button>
      </footer>
    </div>
  );
}