function SecondPage({ onBack }) {
  return (
    <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-6">
      <div className="glass-panel p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">탐색 화면</h2>
        <p className="text-gray-600 mb-8">
          여기에 실시간 날씨 지도와 경로 데이터가 표시될 예정입니다.
        </p>
        
        <button 
          onClick={onBack}
          className="w-full py-3 px-6 rounded-lvl2 border border-primary text-primary font-bold hover:bg-primary/5 transition-all"
        >
          이전으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default SecondPage;