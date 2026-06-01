import { FaClock, FaSun, FaStar } from "react-icons/fa";

const routeTypes = [
  {
    title: "최단 경로",
    description: "가장 빠르게 목적지에 도착할 수 있는 경로입니다.",
    icon: FaClock,
    cardClass: "border-blue-500 bg-blue-50",
    buttonClass: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "자외선 회피 경로",
    description: "강한 햇빛을 피해 이동할 수 있는 경로입니다.",
    icon: FaSun,
    cardClass: "border-yellow-500 bg-yellow-50",
    buttonClass: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    title: "커스텀 경로",
    description: "사용자가 설정한 조건을 반영한 경로입니다.",
    icon: FaStar,
    cardClass: "border-green-500 bg-green-50",
    buttonClass: "bg-green-500 hover:bg-green-600",
  },
];

export default function RouteCompare() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        추천 경로 비교
      </h1>

      <div className="flex flex-col gap-4 md:flex-row">
        {routeTypes.map((route) => {
          const Icon = route.icon;

          return (
            <div
              key={route.title}
              className={`flex-1 rounded-lg border-2 p-4 shadow ${route.cardClass}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon size={24} />
                <h2 className="text-xl font-semibold">
                  {route.title}
                </h2>
              </div>

              <p className="mb-4 text-gray-700">
                {route.description}
              </p>

              <button
                className={`rounded px-4 py-2 text-white transition ${route.buttonClass}`}
              >
                이 경로 선택
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}