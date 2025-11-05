// src/screens/GenreScreen.tsx
import React from "react";
import type { User, Genre } from "../types";

type GenreScreenProps = {
    user: User;
    genres: Genre[];
    selected: string[]; // genre slug 배열
    onChangeSelected: (value: string[]) => void;
    onNext: () => void;
};

const GenreScreen: React.FC<GenreScreenProps> = ({
    user,
    genres,
    selected,
    onChangeSelected,
    onNext,
}) => {
    function toggle(slug: string) {
        if (selected.includes(slug)) {
            onChangeSelected(selected.filter((s) => s !== slug));
        } else {
            onChangeSelected([...selected, slug]);
        }
    }

    const selectedLabel =
        selected.length > 0
            ? selected
                .map((s) => genres.find((g) => g.slug === s)?.name || s)
                .join(", ")
            : "없음";

    const canNext = selected.length > 0;

    return (
        <div className="app app--dark">
            <div className="card genre-card">
                <header className="card-header">
                    <div>
                        <div className="badge">Step 2 · Preference</div>
                        <h2 className="card-title">
                            {user.name}님, 선호하는 장르를 선택해주세요.
                        </h2>
                        <p className="card-subtitle">
                            최소 1개 이상 선택하면, 해당 장르 위주의 영화 리스트를 보여드립니다.
                        </p>
                    </div>
                    <div className="user-chip">
                        <div className="user-chip__name">{user.name}</div>
                        <div className="user-chip__email">{user.email}</div>
                    </div>
                </header>

                <div className="genre-grid">
                    {genres.map((g) => {
                        const active = selected.includes(g.slug);
                        const className =
                            "genre-pill" + (active ? " genre-pill--active" : "");
                        return (
                            <button
                                key={g.slug}
                                type="button"
                                className={className}
                                onClick={() => toggle(g.slug)}
                            >
                                <span>{g.name}</span>
                                {active && <span className="genre-pill__check">✓</span>}
                            </button>
                        );
                    })}
                </div>

                <footer className="card-footer">
                    <div className="card-footer__left">
                        <span className="form-label">선택한 장르</span>
                        <span className="pill pill--soft">{selectedLabel}</span>
                    </div>
                    <button
                        className="btn btn--primary"
                        disabled={!canNext}
                        onClick={onNext}
                    >
                        영화 리스트 보러 가기
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default GenreScreen;
