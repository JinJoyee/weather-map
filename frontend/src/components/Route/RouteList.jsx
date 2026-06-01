export default function RouteList() {
  const routes = [];

  return (
    <div className="route-list">
      <h1>내 커스텀 경로</h1>

      {routes.length === 0 ? (
        <div className="empty-state">
          <p>아직 저장된 경로가 없습니다.</p>
          <button>첫 경로 만들기</button>
        </div>
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

      <button>새 경로 추가</button>
    </div>
  );
}