// src/screens/MovieScreen.tsx

import React, { useMemo, useState } from "react";
import type { User, Genre, Movie } from "../types";

type MovieScreenProps = {
    user: User | null;
    genres: Genre[];
    selectedGenres: string[];
    movies: Movie[];

    // ✅ 좋아요 상태 관련
    likedMovieIds: number[];
    isLiked: (movieId: number) => boolean;
    onToggleLike: (movie: Movie) => void;

    onOpenLogin: () => void;
    onOpenGenres: () => void;
    onLogout: () => void;
    onOpenMovie: (movie: Movie) => void;
};

const MovieScreen: React.FC<MovieScreenProps> = ({
    user,
    genres,
    selectedGenres,
    movies,
    likedMovieIds,
    isLiked,
    onToggleLike,
    onOpenLogin,
    onOpenGenres,
    onLogout,
    onOpenMovie,
}) => {
    // 🔎 검색어 상태
    const [searchQuery, setSearchQuery] = useState<string>("");

    // 👀 보기 모드: 전체 / 좋아요한 영화
    const [viewMode, setViewMode] = useState<"all" | "liked">("all");

    // 1) 선호 장르를 기준으로 우선 정렬
    const sortedMovies = useMemo(() => {
        if (selectedGenres.length === 0) return movies;

        const set = new Set(selectedGenres);

        return [...movies].sort((a, b) => {
            const aScore = a.genres.reduce(
                (acc, g) => acc + (set.has(g) ? 1 : 0),
                0
            );
            const bScore = b.genres.reduce(
                (acc, g) => acc + (set.has(g) ? 1 : 0),
                0
            );

            if (aScore !== bScore) {
                return bScore - aScore;
            }

            // 선호 점수가 같으면 최신 연도 우선
            return b.year - a.year;
        });
    }, [movies, selectedGenres]);

    // 2) 보기 모드 + 검색 적용
    const visibleMovies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        // (1) 기본 정렬된 리스트
        let base = sortedMovies;

        // (2) 좋아요 탭이면, 좋아요한 영화만
        if (viewMode === "liked") {
            base = base.filter((m) => isLiked(m.id));
        }

        // (3) 검색어 필터
        if (!q) return base;

        return base.filter((m) => {
            const inTitle = m.title.toLowerCase().includes(q);
            const inGenres = m.genres.some((g) => g.toLowerCase().includes(q));
            const inYear = m.year.toString().includes(q);
            return inTitle || inGenres || inYear;
        });
    }, [sortedMovies, searchQuery, viewMode, isLiked]);

    const labelSelected =
        selectedGenres.length > 0
            ? selectedGenres
                .map((s) => genres.find((g) => g.slug === s)?.name || s)
                .join(", ")
            : "전체";

    const likedCount = likedMovieIds.length;

    return (
        <div className="app app--dark">
            <main className="movie-main">
                {/* ✅ 상단 고정 영역(로고 + 로그인/로그아웃 + 검색/선호 장르) */}
                <div className="movie-main__sticky">
                    {/* 상단 바: 로고 + 우측 액션 */}
                    <header className="movie-main__top">
                        <div className="movie-main__brand">
                            <div className="topbar-logo__mark">F</div>
                            <div>
                                <div className="topbar-logo__title">FilmNavi</div>
                                <div className="topbar-logo__subtitle">
                                    {user
                                        ? `${user.name}님을 위한 영화 추천`
                                        : "로그인 없이 둘러보고, 원하면 취향 설정하기"}
                                </div>
                            </div>
                        </div>

                        <div className="movie-main__top-right">
                            <button
                                className="btn btn--ghost btn--sm"
                                onClick={onOpenGenres}
                            >
                                선호 장르 선택
                            </button>

                            {user ? (
                                <>
                                    <div className="user-chip">
                                        <div className="user-chip__name">{user.name}</div>
                                        <div className="user-chip__email">{user.email}</div>
                                    </div>
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={onLogout}
                                    >
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn--ghost btn--sm"
                                    onClick={onOpenLogin}
                                >
                                    로그인
                                </button>
                            )}
                        </div>
                    </header>

                    {/* 선택한 장르 + 검색 + 개수 + 보기모드 */}
                    <div className="movie-main__header">
                        <div>
                            <div className="badge">Movies</div>
                            <h2 className="card-title">
                                선택한 장르:{" "}
                                <span className="accent">{labelSelected}</span>
                            </h2>
                            <p className="card-subtitle">
                                선호 장르를 설정하면 관련도가 높은 영화가 위에 정렬됩니다.
                                (설정하지 않으면 전체 리스트가 노출됩니다.)
                            </p>
                        </div>

                        {/* 오른쪽: 총 개수 + 검색창 + 좋아요 정보 */}
                        <div className="movie-main__header-right">
                            <div className="movie-main__view-bar">
                                <div className="pill pill--outline">
                                    총 <strong>{visibleMovies.length}</strong> 편
                                </div>

                                {/* ✅ 좋아요한 영화 수 표시 */}
                                <div className="pill pill--soft movie-main__likes-pill">
                                    <span>♥ 좋아요</span>
                                    <strong>{likedCount}</strong>
                                    <span>편</span>
                                </div>
                            </div>

                            {/* 보기 모드 탭: 전체 / 좋아요한 영화 */}
                            <div className="movie-main__view-tabs">
                                <button
                                    type="button"
                                    className={
                                        "view-tab" +
                                        (viewMode === "all" ? " view-tab--active" : "")
                                    }
                                    onClick={() => setViewMode("all")}
                                >
                                    전체
                                </button>
                                <button
                                    type="button"
                                    className={
                                        "view-tab" +
                                        (viewMode === "liked" ? " view-tab--active" : "")
                                    }
                                    onClick={() => setViewMode("liked")}
                                    disabled={!user || likedCount === 0}
                                    title={
                                        !user
                                            ? "로그인하면 좋아요한 영화만 볼 수 있어요."
                                            : likedCount === 0
                                                ? "좋아요한 영화가 아직 없습니다."
                                                : "좋아요한 영화만 보기"
                                    }
                                >
                                    좋아요한 영화
                                </button>
                            </div>

                            {/* 검색창 */}
                            <input
                                className="form-input movie-main__search"
                                placeholder="제목 / 장르 / 연도 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ✅ 정렬 + 검색 + 보기모드가 적용된 영화 리스트 (스크롤 영역) */}
                <section className="movie-grid">
                    {visibleMovies.map((m) => (
                        <article
                            key={m.id}
                            className="movie-card movie-card--compact"
                        >
                            <button
                                type="button"
                                className="movie-card__clickable"
                                onClick={() => onOpenMovie(m)}
                            >
                                <div className="movie-card__poster">
                                    {m.posterUrl ? (
                                        <img src={m.posterUrl} alt={m.title} />
                                    ) : (
                                        <div className="movie-card__noimg">No Image</div>
                                    )}
                                </div>
                                <div className="movie-card__body">
                                    <h3 className="movie-card__title">{m.title}</h3>
                                    <p className="movie-card__year">{m.year}</p>
                                    <div className="movie-card__genres">
                                        {m.genres.map((g) => (
                                            <span key={g} className="pill pill--soft">
                                                {g.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </button>

                            {/* ✅ 카드 하단에 개별 좋아요 버튼 (원래 구현해둔 것과 비슷하게 쓸 수 있음) */}
                            <div style={{ padding: "0.4rem 0.5rem 0.6rem" }}>
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => onToggleLike(m)}
                                >
                                    {isLiked(m.id) ? "♥ 좋아요 취소" : "♡ 좋아요"}
                                </button>
                            </div>
                        </article>
                    ))}

                    {visibleMovies.length === 0 && (
                        <div className="movie-empty">
                            검색 조건(또는 좋아요 필터)에 해당하는 영화가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MovieScreen;
