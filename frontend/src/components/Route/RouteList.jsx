import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { getToken } from "../../api/auth";
import { resolveApiError } from "../../utils/apiErrorHandler";
import { SkeletonRouteCard, StateView } from "../common/feedback";
import { IconLock, IconStar, IconWifiOff } from "../common/icons";
import RouteMapModal from "./RouteMapModal";

export default function RouteList({ loggedIn }) {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalRoute, setModalRoute] = useState(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/routes/custom");
      setRoutes(data.routes ?? []);
    } catch (err) {
      const { code, message } = resolveApiError(err);
      setError(code === "UNAUTHORIZED" ? "UNAUTHORIZED" : message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setError("UNAUTHORIZED");
      return;
    }

    fetchRoutes();
  }, [loggedIn]);

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `"${name}" 경로를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    )
      return;

    try {
      await api.delete(`/api/routes/custom/${id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const { message } = resolveApiError(err);
      alert(message);
    }
  };

  if (!getToken() || error === "UNAUTHORIZED") {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg flex items-center justify-center px-6">
        <StateView
          Icon={IconLock}
          tone="neutral"
          title="로그인이 필요해요"
          desc="저장된 경로를 보려면 로그인하세요."
          primary="로그인하기"
          onPrimary={() => navigate("/login")}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg px-6 py-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-ink dark:text-dark-ink mb-6">
          내 커스텀 경로
        </h1>

        <div className="flex flex-col gap-3">
          <SkeletonRouteCard />
          <SkeletonRouteCard />
          <SkeletonRouteCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg flex items-center justify-center px-6">
        <StateView
          Icon={IconWifiOff}
          tone="error"
          title="불러오지 못했어요"
          desc={error}
          primary="다시 시도"
          onPrimary={fetchRoutes}
        />
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg flex items-center justify-center px-6">
        <StateView
          Icon={IconStar}
          tone="neutral"
          title="아직 저장된 경로가 없어요"
          desc="직접 경로를 그려서 저장해보세요."
          primary="경로 그리러 가기"
          onPrimary={() => navigate("/draw")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-dark-bg px-6 py-10 max-w-2xl mx-auto">
      {modalRoute && (
        <RouteMapModal
          route={modalRoute}
          onClose={() => setModalRoute(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-dark-ink">
          내 커스텀 경로
        </h1>

        <button
          onClick={fetchRoutes}
          className="text-sm text-primary font-semibold hover:opacity-70 transition-all"
        >
          새로고침
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {routes.map((route) => (
          <div
            key={route.id}
            className="
              bg-card dark:bg-dark-card
              rounded-card
              border border-line dark:border-dark-line
              shadow-sm
              p-5
              flex justify-between items-start
              cursor-pointer
              hover:shadow-md
              transition-shadow
            "
            onClick={() => setModalRoute(route)}
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-ink dark:text-dark-ink text-[15px] truncate">
                {route.name}
              </h3>

              <div className="flex gap-2 mt-1 flex-wrap">
                {route.context_tag && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    {route.context_tag}
                  </span>
                )}

                {route.is_public && (
                  <span className="text-xs bg-custom text-white px-2 py-0.5 rounded-full">
                    공개
                  </span>
                )}
              </div>

              <p className="text-xs text-faint dark:text-dark-faint mt-2">
                경유지{" "}
                {Array.isArray(route.waypoints)
                  ? route.waypoints.length
                  : 0}
                개
              </p>

              <p className="text-xs text-faint dark:text-dark-faint">
                저장일:{" "}
                {route.created_at
                  ? new Date(route.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </p>

              <p className="text-xs text-primary mt-1 font-semibold">
                지도에서 보기 →
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(route.id, route.name);
              }}
              className="text-red-500 text-sm font-semibold hover:opacity-70 transition-all ml-3 shrink-0"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}