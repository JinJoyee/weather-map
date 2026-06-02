export default function RouteList() {
  const routes = [];
  // const routes = [
  //   {
  //     id: 1,
  //     name: "등교 경로",
  //     createdAt: "2026-06-01",
  //     waypoints: 3,
  //   },
  // ];

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
        {routes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="mb-4 text-gray-500">
              아직 저장된 경로가 없습니다.
            </p>

            <button className="rounded-lg bg-green-500 px-4 py-2 text-white">
              첫 경로 만들기
            </button>
          </div>
        ) : (
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
        )}
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