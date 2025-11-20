const DEFAULT_BASE_URL = "/api";

function isLocalhostUrl(url: string): boolean {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function resolveBaseUrl(): string {
    const fromEnv = import.meta.env.VITE_API_BASE_URL;
    if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
        const normalized = fromEnv.trim().replace(/\/$/, "");

        // 빌드된 번들을 원격에서 열 때 로컬호스트 기반 주소가 설정돼 있으면
        // 같은 오리진(/api)으로 자동 폴백하도록 처리.
        if (
            typeof window !== "undefined" &&
            isLocalhostUrl(normalized) &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
        ) {
            return DEFAULT_BASE_URL;
        }

        return normalized;
    }

    if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${DEFAULT_BASE_URL}`;
    }

    return DEFAULT_BASE_URL;
}

const API_BASE_URL = resolveBaseUrl();

type RequestOptions = RequestInit & {
    parse?: "json" | "text" | "blob";
};

async function parseResponse<T>(response: Response, parse: RequestOptions["parse"]): Promise<T> {
    if (parse === "text") {
        return (await response.text()) as unknown as T;
    }
    if (parse === "blob") {
        return (await response.blob()) as unknown as T;
    }
    if (response.status === 204) {
        return {} as T;
    }
    return (await response.json()) as T;
}

export async function apiRequest<T>(
    path: string,
    { parse = "json", headers, ...options }: RequestOptions = {}
): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    let response: Response;

    try {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            ...options,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`API 서버에 연결하지 못했습니다. (${message})`);
    }

    if (!response.ok) {
        const fallback = await response.text().catch(() => "");
        const message = fallback || `API 요청이 실패했습니다. (status: ${response.status})`;
        throw new Error(message);
    }

    return parseResponse<T>(response, parse);
}
