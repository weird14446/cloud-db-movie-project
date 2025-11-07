// src/screens/MovieScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { User, Genre, Movie } from "../types";

type MovieScreenProps = {
    user: User | null;
    genres: Genre[];
    selectedGenres: string[];
    movies: Movie[];
    onOpenLogin: () => void;
    onOpenGenres: () => void;
    onLogout: () => void;
    onOpenMovie: (movie: Movie) => void;

    // ❤️ 좋아요 관련
    likedMovieIds: number[];
    onToggleLike: (movieId: number) => void;

    // 평균 평점 (App에서 계산해서 내려줌)
    avgRatingsByMovie: Record<number, number>;
};

const MovieScreen: React.FC<MovieScreenProps> = ({
    user,
    genres,
    selectedGenres,
    movies,
    onOpenLogin,
    onOpenGenres,
    onLogout,
    onOpenMovie,
    likedMovieIds,
    onToggleLike,
    avgRatingsByMovie,
}) => {
    // 🔎 검색어 상태
    const [searchQuery, setSearchQuery] = useState<string>("");
    // ❤️ 좋아요 한 영화만 보기 토글
    const [showOnlyLiked, setShowOnlyLiked] = useState<boolean>(false);

    // 로그아웃하면 "좋아요만 보기" 자동 해제
    useEffect(() => {
        if (!user && showOnlyLiked) {
            setShowOnlyLiked(false);
        }
    }, [user, showOnlyLiked]);

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

    // 2) 정렬된 리스트에 검색 + 좋아요 필터 적용
    const visibleMovies = useMemo(() => {
        let list = sortedMovies;

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter((m) => {
                const inTitle = m.title.toLowerCase().includes(q);
                const inGenres = m.genres.some((g) =>
                    g.toLowerCase().includes(q)
                );
                const inYear = m.year.toString().includes(q);
                return inTitle || inGenres || inYear;
            });
        }

        if (showOnlyLiked && user) {
            list = list.filter((m) => likedMovieIds.includes(m.id));
        }

        return list;
    }, [sortedMovies, searchQuery, showOnlyLiked, likedMovieIds, user]);

    const labelSelected =
        selectedGenres.length > 0
            ? selectedGenres
                .map((s) => genres.find((g) => g.slug === s)?.name || s)
                .join(", ")
            : "전체";

    const likedCount = user
        ? likedMovieIds.length
        : 0;

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

                    {/* 선택한 장르 + 검색 + 개수/좋아요 필터 */}
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

                        {/* 오른쪽: 총 개수 + 좋아요 필터 + 검색창 */}
                        <div className="movie-main__header-right">
                            <div className="movie-main__filter-row">
                                <div className="pill pill--outline">
                                    총 <strong>{visibleMovies.length}</strong> 편
                                </div>

                                <button
                                    type="button"
                                    className={
                                        "btn btn--ghost btn--sm btn--toggle-like" +
                                        (showOnlyLiked ? " btn--toggle-like--active" : "")
                                    }
                                    disabled={!user}
                                    onClick={() => {
                                        if (!user) {
                                            alert("좋아요 필터는 로그인 후 사용할 수 있습니다.");
                                            return;
                                        }
                                        setShowOnlyLiked((prev) => !prev);
                                    }}
                                >
                                    {showOnlyLiked ? "♥ 좋아요만 보기" : `♡ 좋아요만 보기${user ? ` (${likedCount})` : ""}`}
                                </button>
                            </div>

                            <input
                                className="form-input movie-main__search"
                                placeholder="제목 / 장르 / 연도 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ✅ 정렬 + 검색 + 좋아요 필터가 적용된 영화 리스트 */}
                <section className="movie-grid">
                    {visibleMovies.map((m) => {
                        const avgRating = avgRatingsByMovie[m.id];
                        const isLiked = likedMovieIds.includes(m.id);

                        return (
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
                                        {/* 좌상단 평균 평점, 우상단 좋아요 */}
                                        <div className="movie-card__badge-row">
                                            {typeof avgRating === "number" && (
                                                <div className="movie-card__rating-badge">
                                                    ★ {avgRating.toFixed(1)}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                className={
                                                    "movie-card__like" +
                                                    (isLiked ? " movie-card__like--active" : "")
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    if (!user) {
                                                        alert("좋아요를 사용하려면 로그인 해주세요.");
                                                        return;
                                                    }
                                                    onToggleLike(m.id);
                                                }}
                                            >
                                                {isLiked ? "♥" : "♡"}
                                            </button>
                                        </div>

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
                            </article>
                        );
                    })}

                    {visibleMovies.length === 0 && (
                        <div className="movie-empty">
                            검색/필터 조건에 해당하는 영화가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MovieScreen;
