function App() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-6">
      <header className="text-center">
        <h1 className="text-4xl text-secondary font-extrabold mb-2">Weather Map System</h1>
        <p className="text-gray-500 font-medium">디자인 시스템 초기 세팅 완료</p>
      </header>

      <div className="glass-panel p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">wb_sunny</span>
          <h3 className="text-lg font-bold">오늘의 추천 경로</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Tailwind CSS와 명세서의 색상, 폰트가 성공적으로 적용되었습니다.
        </p>

        <button className="w-full bg-primary text-white py-3 rounded-lvl2 font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-md">
          탐색 시작하기
        </button>
      </div>
    </div>
  );
}

export default App;