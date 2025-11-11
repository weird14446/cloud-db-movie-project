import React from "react";
import type { User, Movie, Genre } from "../types";

type MyPageScreenProps = {
    user: User | null;
    likedMovies: Movie[];
    selectedGenres: string[];
    genres: Genre[];
    onClose: () => void;
    onOpenGenres: () => void;
    onLogout: () => void;
    onOpenLogin: () => void;
};

const MyPageScreen: React.FC<MyPageScreenProps> = ({
    user,
    likedMovies,
    selectedGenres,
    genres,
    onClose,
    onOpenGenres,
    onLogout,
    onOpenLogin,
}) => {
    const preferredGenres = selectedGenres
        .map((slug) => genres.find((g) => g.slug === slug)?.name ?? slug)
        .filter(Boolean);

    const topLiked = likedMovies.slice(0, 8);

    return (
        <div className="app app--dark">
            <main className="mypage">
                <header className="mypage__header">
                    <div>
                        <div className="badge">My Page</div>
                        <h1 className="mypage__title">
                            {user ? `${user.name}님의 마이페이지` : "마이페이지"}
                        </h1>
                        <p className="mypage__subtitle">
                            {user
                                ? "좋아요한 영화와 선호 장르를 한눈에 확인하고 관리해보세요."
                                : "로그인하면 나만의 취향 정보를 모아볼 수 있습니다."}
                        </p>
                    </div>
                    <div className="mypage__header-actions">
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={onClose}
                        >
                            영화 목록으로
                        </button>
                    </div>
                </header>

                {user ? (
                    <section className="mypage__section">
                        <div className="mypage__info">
                            <div>
                                <p className="mypage__label">이름</p>
                                <strong>{user.name}</strong>
                            </div>
                            <div>
                                <p className="mypage__label">이메일</p>
                                <strong>{user.email}</strong>
                            </div>
                        </div>
                        <div className="mypage__actions">
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={onOpenGenres}
                            >
                                선호 장르 관리
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={onLogout}
                            >
                                로그아웃
                            </button>
                        </div>
                    </section>
                ) : (
                    <section className="mypage__section mypage__section--empty">
                        <p>로그인하면 좋아요한 영화와 취향 정보를 확인할 수 있습니다.</p>
                        <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={onOpenLogin}
                        >
                            로그인하기
                        </button>
                    </section>
                )}

                <section className="mypage__section">
                    <h2 className="mypage__section-title">나의 취향 요약</h2>
                    <div className="mypage__summary">
                        <div className="mypage__summary-card">
                            <span>좋아요한 영화</span>
                            <strong>{likedMovies.length}</strong>
                        </div>
                        <div className="mypage__summary-card">
                            <span>선호 장르</span>
                            <strong>{preferredGenres.length}</strong>
                        </div>
                    </div>

                    <div className="mypage__chips">
                        {preferredGenres.length > 0 ? (
                            preferredGenres.map((name) => (
                                <span key={name} className="pill pill--soft">
                                    {name}
                                </span>
                            ))
                        ) : (
                            <span className="mypage__empty">
                                아직 선호 장르를 설정하지 않았습니다.
                            </span>
                        )}
                    </div>
                </section>

                <section className="mypage__section">
                    <div className="mypage__section-header">
                        <h2 className="mypage__section-title">좋아요한 영화</h2>
                        <span className="mypage__section-hint">
                            최근 좋아요 순서로 최대 8편을 보여드립니다.
                        </span>
                    </div>
                    {likedMovies.length === 0 ? (
                        <p className="mypage__empty">
                            좋아요한 영화가 없습니다. 마음에 드는 작품에 ♥를 눌러보세요.
                        </p>
                    ) : (
                        <div className="mypage__liked-list">
                            {topLiked.map((movie) => (
                                <article key={movie.id} className="mypage-card">
                                    <div className="mypage-card__thumb">
                                        {movie.posterUrl ? (
                                            <img
                                                src={movie.posterUrl}
                                                alt={movie.title}
                                            />
                                        ) : (
                                            <div className="movie-card__noimg">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="mypage-card__body">
                                        <p className="mypage-card__meta">
                                            {movie.director} · {movie.year}
                                        </p>
                                        <h3 className="mypage-card__title">
                                            {movie.title}
                                        </h3>
                                        <div className="mypage-card__genres">
                                            {(movie.genres ?? []).slice(0, 2).map((genre) => (
                                                <span key={genre}>{genre.toUpperCase()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MyPageScreen;
