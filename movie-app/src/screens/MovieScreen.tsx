import React, { useMemo } from "react";
import type { User, Genre, Movie } from "../types";

type MovieScreenProps = {
    user: User;
    genres: Genre[];
    selectedGenres: string[];
    movies: Movie[];
    onRestart: () => void;
};

const MovieScreen: React.FC<MovieScreenProps> = ({
    user,
    genres,
    selectedGenres,
    movies,
    onRestart,
}) => {
    // ✅ 선호 장르와의 "겹치는 개수"를 기준으로 정렬
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

            // 1) 겹치는 장르 수가 많은 영화가 위로
            if (aScore !== bScore) {
                return bScore - aScore;
            }

            // 2) 같은 점수면 최신 연도 순으로
            return b.year - a.year;
        });
    }, [movies, selectedGenres]);

    const labelSelected =
        selectedGenres.length > 0
            ? selectedGenres
                .map((s) => genres.find((g) => g.slug === s)?.name || s)
                .join(", ")
            : "전체";

    return (
        <div className="app app--dark">
            <main className="movie-main">
                {/* 상단: 로고 + 프로필 + 처음부터 다시 선택 버튼을 한 줄에 배치 */}
                <header className="movie-main__top">
                    <div className="movie-main__brand">
                        <div className="topbar-logo__mark">F</div>
                        <div>
                            <div className="topbar-logo__title">FilmNavi</div>
                            <div className="topbar-logo__subtitle">
                                {user.name}님을 위한 추천 영화
                            </div>
                        </div>
                    </div>

                    <div className="movie-main__top-right">
                        <div className="user-chip">
                            <div className="user-chip__name">{user.name}</div>
                            <div className="user-chip__email">{user.email}</div>
                        </div>
                        <button className="btn btn--ghost btn--sm" onClick={onRestart}>
                            처음부터 다시 선택
                        </button>
                    </div>
                </header>

                {/* 선택한 장르 + 총 개수 */}
                <div className="movie-main__header">
                    <div>
                        <div className="badge">Step 3 · Movies</div>
                        <h2 className="card-title">
                            선택한 장르: <span className="accent">{labelSelected}</span>
                        </h2>
                        <p className="card-subtitle">
                            장르를 비우면 전체 영화가 표시됩니다.
                        </p>
                    </div>
                    <div className="pill pill--outline">
                        총 <strong>{sortedMovies.length}</strong> 편
                    </div>
                </div>

                {/* 정렬된 영화 리스트 */}
                <section className="movie-grid">
                    {sortedMovies.map((m) => (
                        <article key={m.id} className="movie-card">
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
                        </article>
                    ))}

                    {sortedMovies.length === 0 && (
                        <div className="movie-empty">
                            선택한 장르에 해당하는 영화가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MovieScreen;
