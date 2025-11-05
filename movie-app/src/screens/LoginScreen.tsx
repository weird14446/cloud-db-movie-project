// src/screens/LoginScreen.tsx
import React, { useState } from "react";

type LoginScreenProps = {
    onLogin: (name: string, email: string, password: string) => void | Promise<void>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [pw, setPw] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!name || !email || !pw) {
            setError("이름, 이메일, 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            setBusy(true);
            await Promise.resolve(onLogin(name, email, pw));
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.";
            setError(msg);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="app app--gradient">
            <div className="card card--glass login-card">
                <div className="app-logo">
                    <div className="app-logo__mark">F</div>
                    <div className="app-logo__text">
                        <div className="app-logo__title">FilmNavi</div>
                        <div className="app-logo__subtitle">
                            Login · Pick genres · Watch
                        </div>
                    </div>
                </div>

                <h1 className="card-title">로그인해서 취향 맞는 영화 찾기</h1>
                <p className="card-subtitle">
                    첫 로그인 시 선호 장르를 선택하고, 다음부턴 바로 영화 리스트로 이동합니다.
                </p>

                {error && <div className="alert alert--error">{error}</div>}

                <form className="form" onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span className="form-label">이름</span>
                        <input
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">이메일</span>
                        <input
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            type="email"
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">비밀번호</span>
                        <input
                            className="form-input"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            placeholder="••••••••"
                            type="password"
                        />
                        <span className="form-hint">
                            실제 서비스에서는 HTTPS + 안전한 해시(bcrypt 등)를 사용해야 해요.
                        </span>
                    </label>

                    <button className="btn btn--primary" disabled={busy}>
                        {busy ? "로그인 중..." : "시작하기"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
