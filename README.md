# CloudDB_MovieProject
대학 프로젝트 과제

## Docker로 실행하기

1. 루트에 있는 `docker-compose.yml`을 사용합니다. 필요한 경우 TMDB API 키나 관리자 토큰을 쉘 환경 변수로 세팅하세요.  
   ```bash
   export TMDB_API_KEY=<TMDB에서 발급받은 키>
   export ADMIN_IMPORT_TOKEN=root-import
   ```
2. 컨테이너 빌드 및 실행
   ```bash
   docker compose build
   docker compose up -d
   ```
3. 접속 포트
   - 프론트엔드: http://localhost:8080
   - 백엔드 API: http://localhost:3000
   - MySQL: 포트 3307 (계정: `movieapp`/`moviepass`, DB: `movieapp`)

> 초기 스키마/데이터는 MySQL 내부에 직접 로딩해야 합니다. `docker compose exec db bash` 후 필요한 SQL을 실행하거나, 덤프 파일을 `mysql -hmysql -u movieapp -p movieapp < your_dump.sql` 형태로 주입하세요. (필요 시 `backend/sql`의 스크립트를 참고하면 됩니다.)

## Dev Container에서 개발하기 (VS Code)

1. VS Code에서 `Open Folder in Container` 실행하면 `.devcontainer/docker-compose.dev.yml`이 올라가며 `devcontainer` 서비스로 접속합니다.
2. 기본으로 DB가 포함되어 있으며 포트는 3000(backend), 5173(Vite), 8080(frontend), 3307(MySQL)을 호스트로 포워딩합니다.
3. 컨테이너 생성 후 `postCreateCommand`가 backend와 movie-app 의존성을 설치합니다. 추가 스크립트가 필요하면 `.devcontainer/devcontainer.json`을 수정하세요.
