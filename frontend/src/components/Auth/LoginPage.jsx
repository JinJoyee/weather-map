import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth";
import { resolveApiError } from "../../utils/apiErrorHandler";
import { AuthShell, AuthHeader, Brand, Field } from "./_authShared";
import { Spinner } from "../common/feedback";
import { IconUser, IconLock, IconX, IconGlobe } from "../common/icons";

export default function LoginPage({ onLogin }) {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!id.trim() || !pw.trim()) { setError("아이디와 비밀번호를 입력하세요."); return; }
    setLoading(true); setError("");
    try {
      await login(id, pw);
      onLogin?.();
      nav("/map");
    } catch (err) {
      setError(resolveApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader />
      <Brand subtitle="날씨 따라 똑똑하게 길찾기" />
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field icon={<IconUser size={20} className="text-faint" />} placeholder="아이디"
          value={id} onChange={(v) => { setId(v); setError(""); }} autoFocus />
        <Field icon={<IconLock size={20} className="text-faint" />} type={show ? "text" : "password"}
          placeholder="비밀번호" value={pw} onChange={(v) => { setPw(v); setError(""); }}
          trailing={<button type="button" onClick={() => setShow(!show)} className="text-[12.5px] font-bold text-muted p-1">{show ? "숨기기" : "표시"}</button>} />

        {error && <div className="flex items-center gap-1.5 text-red-600 text-[13px] font-semibold"><IconX size={15} /> {error}</div>}

        <div className="flex justify-end -mt-0.5">
          <Link to="/reset" className="text-[13px] font-semibold text-muted whitespace-nowrap">비밀번호를 잊으셨나요?</Link>
        </div>

        <button type="submit" disabled={loading}
          className="h-[54px] mt-1 rounded-[14px] bg-cta text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-md whitespace-nowrap disabled:opacity-90">
          {loading ? <><Spinner size={20} className="text-white" /> 로그인 중...</> : "로그인"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-[22px]">
        <div className="flex-1 h-px bg-line" /><span className="text-[12.5px] font-semibold text-faint">또는</span><div className="flex-1 h-px bg-line" />
      </div>

      <button onClick={() => nav("/map")}
        className="h-[52px] w-full rounded-[15px] border border-line2 bg-card text-ink text-[15px] font-bold flex items-center justify-center gap-2 whitespace-nowrap">
        <IconGlobe size={19} className="text-muted" /> 로그인 없이 둘러보기
      </button>

      <p className="text-center mt-[22px] text-sm text-muted">
        계정이 없으신가요? <Link to="/signup" className="font-bold text-primary">회원가입</Link>
      </p>
    </AuthShell>
  );
}
