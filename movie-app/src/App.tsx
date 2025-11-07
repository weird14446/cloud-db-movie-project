// src/App.tsx
import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import GenreScreen from "./screens/GenreScreen";
import MovieScreen from "./screens/MovieScreen";
import MovieDetailModal from "./components/MovieDetailModal";
import type { User, Genre, Movie, Review } from "./types";

// 데모 장르/영화 데이터 (나중에 TMDb + DB로 교체 가능)
const DEMO_GENRES: Genre[] = [
  { id: 1, slug: "action", name: "액션" },
  { id: 2, slug: "comedy", name: "코미디" },
  { id: 3, slug: "drama", name: "드라마" },
  { id: 4, slug: "romance", name: "로맨스" },
  { id: 5, slug: "sf", name: "SF" },
];

const DEMO_MOVIES: Movie[] = [
  {
    id: 1,
    title: "도시의 추격자",
    year: 2020,
    genres: ["action"],
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    overview: "도시를 배경으로 한 스릴 넘치는 추격 액션 영화.",
    releaseDate: "2020-07-15",
    status: "Released",
    budget: 80000000,
    revenue: 210000000,
    runtimeMinutes: 123,
    trailerKey: "ScMzIvxBSi4", // 데모용 유튜브 ID
    trailerSite: "YouTube",
    cast: [
      {
        id: 1,
        name: "홍길동",
        character: "집요한 형사",
        profileUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: 2,
        name: "김영희",
        character: "천재 해커",
        profileUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: 2,
    title: "웃음 연구소",
    year: 2019,
    genres: ["comedy"],
    posterUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop",
    overview: "실패투성이 연구원들이 만드는 대환장 코미디.",
    releaseDate: "2019-03-10",
    status: "Released",
    budget: 25000000,
    revenue: 95000000,
    runtimeMinutes: 108,
    trailerKey: "ScMzIvxBSi4",
    trailerSite: "YouTube",
    cast: [
      { id: 3, name: "이코미디", character: "연구소 소장" },
      { id: 4, name: "박유머", character: "신입 연구원" },
    ],
  },
  {
    id: 3,
    title: "눈물의 계절",
    year: 2021,
    genres: ["drama"],
    posterUrl:
      "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=800&auto=format&fit=crop",
    overview: "헤어진 연인과의 시간을 회상하는 감성 드라마.",
    releaseDate: "2021-11-02",
    status: "Released",
    budget: 15000000,
    revenue: 60000000,
    runtimeMinutes: 115,
  },
  {
    id: 4,
    title: "너와 나의 거리",
    year: 2018,
    genres: ["romance", "drama"],
    posterUrl:
      "https://images.unsplash.com/photo-1529634892667-3c0b5b1c5c48?q=80&w=800&auto=format&fit=crop",
    overview: "서로 다른 도시에서 살아가는 두 사람의 로맨스.",
    releaseDate: "2018-05-22",
    status: "Released",
    budget: 30000000,
    revenue: 120000000,
    runtimeMinutes: 102,
  },
  {
    id: 5,
    title: "별을 향한 시간",
    year: 2022,
    genres: ["sf", "drama"],
    posterUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop",
    overview: "인류 마지막 우주 탐사선을 타고 떠나는 이들의 이야기.",
    releaseDate: "2023-01-10",
    status: "Released",
    budget: 120000000,
    revenue: 380000000,
    runtimeMinutes: 136,
  },
  {
    id: 6,
    title: "액션 코미디 콜라보",
    year: 2017,
    genres: ["action", "comedy"],
    posterUrl:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop",
    overview: "탐정과 코미디언이 함께 사건을 해결하는 액션 코미디.",
    releaseDate: "2017-09-01",
    status: "Released",
    budget: 40000000,
    revenue: 160000000,
    runtimeMinutes: 110,
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showGenres, setShowGenres] = useState(false);

  // 영화 상세 모달용
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  // 리뷰 데이터
  const [reviewsByMovie, setReviewsByMovie] = useState<Record<number, Review[]>>(
    {}
  );

  // ❤️ 좋아요 상태 (로그인한 유저별로 localStorage 저장)
  const [likedMovieIds, setLikedMovieIds] = useState<number[]>([]);

  // 영화 정보 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (activeMovie) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [activeMovie]);

  // 로그인/로그아웃에 따라 좋아요 목록 로드/초기화
  useEffect(() => {
    if (!user) {
      setLikedMovieIds([]);
      return;
    }
    const key = `likedMovies:${user.email}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setLikedMovieIds([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === "number")) {
        setLikedMovieIds(parsed as number[]);
      } else {
        setLikedMovieIds([]);
      }
    } catch {
      setLikedMovieIds([]);
    }
  }, [user?.email]);

  // 리뷰로부터 영화별 평균 평점 map 계산 (카드/모달에서 사용)
  const avgRatingByMovie = useMemo(() => {
    const result: Record<number, number> = {};
    for (const [movieIdStr, list] of Object.entries(reviewsByMovie)) {
      if (!list || list.length === 0) continue;
      const sum = list.reduce((acc, r) => acc + r.rating, 0);
      result[Number(movieIdStr)] = sum / list.length;
    }
    return result;
  }, [reviewsByMovie]);

  // 로그인 / 회원가입 성공 시 공통 처리
  function handleLogin(name: string, email: string, password: string): void {
    const newUser: User = { name, email };
    setUser(newUser);

    // 저장된 선호 장르 불러오기
    try {
      const raw = localStorage.getItem(`preferredGenres:${email}`);
      if (raw) {
        const saved = JSON.parse(raw) as unknown;
        if (Array.isArray(saved) && saved.every((s) => typeof s === "string")) {
          setSelectedGenres(saved as string[]);
        }
      }
    } catch {
      // 실패해도 무시
    }

    setShowLogin(false);
    setShowSignup(false);
  }

  // 선호 장르 저장
  function handleSaveGenres(): void {
    if (user) {
      try {
        localStorage.setItem(
          `preferredGenres:${user.email}`,
          JSON.stringify(selectedGenres)
        );
      } catch {
        // 실패해도 무시
      }
    }
    setShowGenres(false);
  }

  // 로그아웃
  function handleLogout(): void {
    setUser(null);
    setSelectedGenres([]);
    setLikedMovieIds([]);
  }

  // 장르 선택 클릭
  function openGenreSelection() {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowGenres(true);
  }

  // 영화 카드 클릭 → 상세 모달 열기
  function handleOpenMovie(movie: Movie) {
    setActiveMovie(movie);
  }

  function handleCloseMovie() {
    setActiveMovie(null);
  }

  // 리뷰 추가: 로그인한 유저의 이름으로만 작성
  function handleAddReview(
    movieId: number,
    input: { rating: number; content: string }
  ) {
    if (!user) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      return;
    }

    const now = new Date();
    const newReview: Review = {
      id: now.getTime(),
      movieId,
      userName: user.name,
      rating: input.rating,
      content: input.content,
      createdAt: now.toISOString(),
    };

    setReviewsByMovie((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] ?? []), newReview],
    }));
  }

  // ❤️ 좋아요 토글 (로그인 필요)
  function handleToggleLike(movieId: number) {
    if (!user) {
      alert("좋아요를 사용하려면 로그인이 필요합니다.");
      return;
    }

    setLikedMovieIds((prev) => {
      let next: number[];
      if (prev.includes(movieId)) {
        next = prev.filter((id) => id !== movieId);
      } else {
        next = [...prev, movieId];
      }

      try {
        localStorage.setItem(
          `likedMovies:${user.email}`,
          JSON.stringify(next)
        );
      } catch {
        // 실패해도 무시
      }

      return next;
    });
  }

  const modalOpen =
    showLogin || showSignup || showGenres || activeMovie !== null;

  return (
    <div className="app-root">
      {/* 흐릿해질 메인 영역 */}
      <div
        className={
          modalOpen
            ? "app-blur-wrapper app-blur-wrapper--blurred"
            : "app-blur-wrapper"
        }
      >
        <MovieScreen
          user={user}
          genres={DEMO_GENRES}
          selectedGenres={selectedGenres}
          movies={DEMO_MOVIES}
          onOpenLogin={() => setShowLogin(true)}
          onOpenGenres={openGenreSelection}
          onLogout={handleLogout}
          onOpenMovie={handleOpenMovie}
          likedMovieIds={likedMovieIds}
          onToggleLike={handleToggleLike}
          avgRatingsByMovie={avgRatingByMovie}
        />
      </div>

      {/* 어두운 배경 + 블러 */}
      {modalOpen && <div className="modal-backdrop" />}

      {/* 로그인 모달 */}
      {showLogin && (
        <LoginScreen
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          onGoSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {/* 회원가입 모달 */}
      {showSignup && (
        <SignupScreen
          onSignup={handleLogin}
          onClose={() => setShowSignup(false)}
          onGoLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* 선호 장르 선택 모달 (로그인 상태에서만) */}
      {showGenres && user && (
        <GenreScreen
          user={user}
          genres={DEMO_GENRES}
          selected={selectedGenres}
          onChangeSelected={setSelectedGenres}
          onNext={handleSaveGenres}
          onClose={() => setShowGenres(false)}
        />
      )}

      {/* 영화 상세 모달 */}
      {activeMovie && (
        <MovieDetailModal
          movie={activeMovie}
          reviews={reviewsByMovie[activeMovie.id] ?? []}
          user={user}
          onClose={handleCloseMovie}
          onAddReview={(input) => handleAddReview(activeMovie.id, input)}
          isLiked={likedMovieIds.includes(activeMovie.id)}
          onToggleLike={() => handleToggleLike(activeMovie.id)}
        />
      )}
    </div>
  );
};

export default App;
