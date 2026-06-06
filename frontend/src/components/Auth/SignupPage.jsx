import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, checkUsernameAvailable } from "../../api/auth";
import { resolveApiError } from "../../utils/apiErrorHandler";
import { AuthShell, AuthHeader, Field, pwStrength } from "./_authShared";
import { Spinner } from "../common/feedback";
import { IconUser, IconLock, IconCheck, IconX } from "../common/icons";

export default function SignupPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [idState, setIdState] = useState("idle"); // idle|short|checking|ok|taken
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    if (id.trim().length < 3) { setIdState(id.length === 0 ? "idle" : "short"); return; }
    setIdState("checking");
    const my = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(id.trim());
        if (my === seq.current) setIdState(available ? "ok" : "taken");
      } catch {
        if (my === seq.current) setIdState("idle");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [id]);

  const strength = pwStrength(pw);
  const match = pw2.length > 0 && pw === pw2;
  const canSubmit = idState === "ok" && strength.score >= 2 && match && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true); setError("");
    try { await signup(id, pw); nav("/login"); }
    catch (err) { setError(resolveApiError(err).message); }
    finally { setLoading(false); }
  };

  const idHint = {
    checking: ["text-faint", "사용 가능 여부 확인 중..."],
    ok: ["text-custom", "사용 가능한 아이디예요"],
    taken: ["text-red-600", "이미 사용 중인 아이디예요"],
    short: ["text-faint", "3자 이상 입력하세요"],
  }[idState];

  return (
    <AuthShell>
      <AuthHeader />
      <h1 className="m-0 mb-1.5 text-[27px] font-extrabold text-ink tracking-[-0.03em]">회원가입</h1>
      <p className="m-0 mb-6 text-[14.5px] text-muted">몇 초면 시작할 수 있어요</p>

      <div className="flex flex-col gap-[7px]">
        <Field icon={<IconUser size={20} className="text-faint" />} placeholder="아이디 (3자 이상)"
          value={id} onChange={setId} autoFocus
          trailing={
            idState === "checking" ? <Spinner size={18} className="text-faint" />
            : idState === "ok" ? <IconCheck size={19} className="text-custom" />
            : idState === "taken" ? <IconX size={18} className="text-red-600" /> : null
          } />
        <div className={`text-[12.5px] font-semibold pl-0.5 ${idHint ? idHint[0] : ""}`} style={{ minHeight: 4 }}>{idHint?.[1]}</div>

        <Field icon={<IconLock size={20} className="text-faint" />} type={show ? "text" : "password"}
          placeholder="비밀번호" value={pw} onChange={setPw}
          trailing={<button type="button" onClick={() => setShow(!show)} className="text-[12.5px] font-bold text-muted p-1">{show ? "숨기기" : "표시"}</button>} />
        {pw.length > 0 && (
          <div className="flex items-center gap-2 pl-0.5">
            <div className="flex gap-1 flex-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < strength.score ? strength.bar : "bg-line2"}`} />
              ))}
            </div>
            <span className={`text-xs font-bold min-w-[28px] ${strength.color}`}>{strength.label}</span>
          </div>
        )}

        <Field icon={<IconLock size={20} className="text-faint" />} type={show ? "text" : "password"}
          placeholder="비밀번호 확인" value={pw2} onChange={setPw2}
          trailing={pw2.length > 0 ? (match ? <IconCheck size={19} className="text-custom" /> : <IconX size={18} className="text-red-600" />) : null} />
        {pw2.length > 0 && !match && <div className="text-[12.5px] text-red-600 font-semibold pl-0.5">비밀번호가 일치하지 않아요</div>}

        {error && <div className="text-[13px] text-red-600 font-semibold">{error}</div>}

        <button onClick={submit} disabled={!canSubmit}
          className={`h-[54px] mt-3 rounded-[15px] text-base font-bold flex items-center justify-center gap-2.5 whitespace-nowrap transition-colors
            ${canSubmit ? "bg-cta text-white shadow-md" : "bg-line2 text-faint"}`}>
          {loading ? <><Spinner size={20} className="text-white" /> 가입 중...</> : "가입하고 시작하기"}
        </button>
      </div>

      <p className="text-center mt-[22px] text-sm text-muted">
        이미 계정이 있으신가요? <Link to="/login" className="font-bold text-primary">로그인</Link>
      </p>
    </AuthShell>
  );
}
