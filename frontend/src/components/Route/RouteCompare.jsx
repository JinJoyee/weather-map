import { useEffect, useState } from "react";
import { FaClock, FaSun, FaStar } from "react-icons/fa";
import { fetchRouteRecommend } from "../../api/route";

export default function RouteCompare() {
  const [routes, setRoutes] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [contextTags, setContextTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchRouteRecommend(
          36.3504,
          127.3845,
          36.3623,
          127.3568
        );

        setRoutes(data.routes);
        setRecommendation(data.recommendation);
        setContextTags(data.context_tags || []);
      } catch (err) {
        console.error(err);
        setError("경로를 불러오지 못했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-lg">경로를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-lg text-red-500">
          경로를 불러오지 못했습니다
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: "최단 경로",
      icon: FaClock,
      cardClass: "border-blue-500 bg-blue-50",
      buttonClass: "bg-blue-500 hover:bg-blue-600",
      route: routes?.normal,
    },
    {
      title: "자외선 회피 경로",
      icon: FaSun,
      cardClass: "border-yellow-500 bg-yellow-50",
      buttonClass: "bg-yellow-500 hover:bg-yellow-600",
      route: routes?.context,
    },
    {
      title: "커스텀 경로",
      icon: FaStar,
      cardClass: "border-green-500 bg-green-50",
      buttonClass: "bg-green-500 hover:bg-green-600",
      route: routes?.context,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold">
        추천 경로 비교
      </h1>

      {recommendation && (
        <div className="mb-4 rounded-lg bg-indigo-50 p-4 text-indigo-700">
          {recommendation}
        </div>
      )}

      {contextTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {contextTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-200 px-3 py-1 text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`flex-1 rounded-lg border-2 p-4 shadow ${card.cardClass}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon size={24} />
                <h2 className="text-xl font-semibold">
                  {card.title}
                </h2>
              </div>

              <p className="mb-2 text-gray-700">
                {card.route?.description ?? "설명 없음"}
              </p>

              <p className="mb-4 text-sm text-gray-600">
                경유지 수: {card.route?.waypoints?.length ?? 0}
              </p>

              <button
                className={`rounded px-4 py-2 text-white transition ${card.buttonClass}`}
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