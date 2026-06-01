export default function RouteCompare() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        추천 경로 비교
      </h1>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-lg border p-4 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            최단 경로
          </h2>
          <p className="mb-4 text-gray-600">
            가장 빠르게 목적지에 도착할 수 있는 경로입니다.
          </p>
          <button className="rounded bg-blue-500 px-4 py-2 text-white">
            이 경로 선택
          </button>
        </div>

        <div className="flex-1 rounded-lg border p-4 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            자외선 회피 경로
          </h2>
          <p className="mb-4 text-gray-600">
            강한 햇빛을 피해 이동할 수 있는 경로입니다.
          </p>
          <button className="rounded bg-blue-500 px-4 py-2 text-white">
            이 경로 선택
          </button>
        </div>

        <div className="flex-1 rounded-lg border p-4 shadow">
          <h2 className="mb-2 text-xl font-semibold">
            커스텀 경로
          </h2>
          <p className="mb-4 text-gray-600">
            사용자가 설정한 조건을 반영한 경로입니다.
          </p>
          <button className="rounded bg-blue-500 px-4 py-2 text-white">
            이 경로 선택
          </button>
        </div>
      </div>
    </div>
  );
}