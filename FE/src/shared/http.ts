import axios, { AxiosError } from "axios";
import type { IResponseBE } from "./types";
import { ApiError } from "./ApiError";
import { IS_DEV } from "./env";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: { requestId: string; startedAt: number };
  }
}

export const http = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(
  (config) => {
    config.metadata = {
      requestId: crypto.randomUUID(),
      startedAt: performance.now(),
    };
    config.headers.set("X-Request-Id", config.metadata.requestId);
    return config;
  },
  null,
  { synchronous: true },
);

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<IResponseBE<null>>(error)) {
    if (error.response) {
      const { status, data } = error.response;

      // xử lí lỗi mạng (502, 503, 504) mà backend trả về HTML thay vì JSON, kiểu tập trung lạii
      const fromApi =
        typeof data === "object" && data !== null && "success" in data;
      if (!fromApi && (status === 502 || status === 503 || status === 504)) {
        return new ApiError(
          status,
          "Chưa kết nối được backend.\nChạy: cd be-ltwnc && npm run start:dev",
          "NETWORK",
        );
      }

      return new ApiError(
        status,
        data?.message ?? `Máy chủ trả về ${status}`,
        "HTTP",
      );
    }
    switch (error.code) {
      case AxiosError.ECONNABORTED:
      case AxiosError.ETIMEDOUT:
        return new ApiError(0, "Máy chủ phản hồi quá chậm", "TIMEOUT");
      case AxiosError.ERR_NETWORK:
        return new ApiError(
          0,
          "Không kết nối được máy chủ — backend đã chạy chưa?",
          "NETWORK",
        );
      default:
        return new ApiError(0, error.message, "UNKNOWN");
    }
  }
  return new ApiError(
    0,
    error instanceof Error ? error.message : "Lỗi không xác định",
    "UNKNOWN",
  );
}

http.interceptors.response.use(
  (response) => {
    if (IS_DEV && response.config.metadata) {
      const ms = Math.round(
        performance.now() - response.config.metadata.startedAt,
      );
      console.debug(
        `[api] ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status} ${ms}ms`,
      );
    }
    return response;
  },
  (error: unknown) => Promise.reject(toApiError(error)),
);
