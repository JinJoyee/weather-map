function App() {
  return (
    <div className="min-h-screen bg-neutral flex flex-col items-center justify-center px-6 py-10">
      
      <header className="text-center mb-10">
        <h1 className="text-5xl text-secondary font-extrabold mb-3">
          Weather Map System
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          실시간 데이터 기반 경로 추천 시스템
        </p>
      </header>

      <div className="glass-panel p-8 max-w-md w-full">
        
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-3xl">
            wb_sunny
          </span>
          <h3 className="text-xl font-bold text-[#191C1E]">
            오늘의 추천 경로
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          날씨 데이터를 기반으로 최적의 이동 경로를 추천합니다.
          혼잡도와 기온을 고려하여 사용자 경험을 개선합니다.
        </p>

        <div className="inline-block bg-tertiary/10 text-tertiary text-xs font-semibold px-3 py-1 rounded-lvl2 mb-6">
          실시간 분석 적용됨
        </div>

        <button className="w-full bg-primary text-white py-3 rounded-lvl2 font-bold 
        hover:scale-[1.03] hover:shadow-lg 
        transition-all duration-200 
        active:scale-95">
          탐색 시작하기
        </button>
      </div>
    </div>
  );
}

export default App;