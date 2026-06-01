export default function RouteList() {
  const routes = [];

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
          <p className="text-gray-500">
            경로 목록이 여기에 표시됩니다.
          </p>
        ) : (
          <div className="route-container">
            {routes.map((route) => (
              <div key={route.id} className="route-card">
                <h3>{route.name}</h3>
                <p>저장일: {route.createdAt}</p>
                <p>웨이포인트: {route.waypoints}개</p>
                <button>삭제</button>
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