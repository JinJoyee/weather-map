import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { resolveApiError } from "../../utils/apiErrorHandler";
import { AuthShell, AuthHeader, Field } from "./_authShared";
import { Spinner, StateView } from "../common/feedback";
import { IconUser, IconLock, IconCheck } from "../common/icons";

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [newPw, setNewPw] = useState("");
  const [show, setShow] = useState(false);
  const [step, setStep] = useState("form"); // form | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!id.trim() || !newPw.trim()) { setError("아이디와 새 비밀번호를 입력하세요."); return; }
    setLoading(true); setError("");
    try {
      await resetPassword(id.trim(), newPw.trim());
      setStep("done");
    } catch (err) {
      setError(resolveApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <AuthShell>
        <AuthHeader />
        <div className="pt-[30px]">
          <StateView Icon={IconCheck} tone="neutral"
            title="비밀번호가 변경됐어요"
            desc="새 비밀번호로 로그인하세요."
            primary="로그인으로 돌아가기" onPrimary={() => nav("/login")} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeader />
      <div className="w-14 h-14 rounded-[17px] mb-4 bg-primary/10 grid place-items-center">
        <IconLock size={26} className="text-primary" />
      </div>
      <h1 className="m-0 mb-1.5 text-[26px] font-extrabold text-ink tracking-[-0.03em]">비밀번호 재설정</h1>
      <p className="m-0 mb-6 text-[14.5px] text-muted leading-normal">아이디와 새 비밀번호를 입력하세요.</p>

      <div className="flex flex-col gap-3.5">
        <Field icon={<IconUser size={20} className="text-faint" />} placeholder="아이디"
          value={id} onChange={setId} autoFocus />
        <Field icon={<IconLock size={20} className="text-faint" />}
          type={show ? "text" : "password"}
          placeholder="새 비밀번호"
          value={newPw} onChange={setNewPw}
          trailing={<button type="button" onClick={() => setShow(!show)} className="text-[12.5px] font-bold text-muted p-1">{show ? "숨기기" : "표시"}</button>} />

        {error && <div className="text-[13px] text-red-600 font-semibold">{error}</div>}

        <button onClick={submit} disabled={loading || !id.trim() || !newPw.trim()}
          className={`h-[54px] rounded-[15px] text-base font-bold flex items-center justify-center gap-2.5 whitespace-nowrap transition-colors
            ${id.trim() && newPw.trim() ? "bg-cta text-white shadow-md" : "bg-line2 text-faint"}`}>
          {loading ? <><Spinner size={20} className="text-white" /> 변경 중...</> : "비밀번호 변경"}
        </button>
      </div>

      <p className="text-center mt-[22px] text-sm text-muted">
        비밀번호가 기억나셨나요?{" "}
        <button onClick={() => nav("/login")} className="font-bold text-primary">로그인</button>
      </p>
    </AuthShell>
  );
}
