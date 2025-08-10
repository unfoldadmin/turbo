"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

type DuckArgs = {
    query: string;
    max_results?: number;
    safesearch?: "off" | "moderate" | "strict";
    timelimit?: "d" | "w" | "m" | "y" | string;
    region?: string;
};

type DuckItem = {
    title: string;
    href: string;
    body?: string;
};

type DuckResult =
    | {
        query: string;
        results: DuckItem[];
    }
    | {
        error: string;
        query?: string;
    };

function parseDuckResult(result: unknown): DuckResult | null {
    if (!result) return null;
    if (typeof result === "object") return result as DuckResult;
    if (typeof result === "string") {
        try {
            return JSON.parse(result) as DuckResult;
        } catch {
            try {
                const fixed = result.replace(/'/g, '"');
                return JSON.parse(fixed) as DuckResult;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export const DuckSearchToolUI = makeAssistantToolUI<DuckArgs, DuckResult>({
    toolName: "search_duckduckgo",
    render: ({ args, argsText, status, result }) => {
        if (status.type === "running") {
            const label = args?.query || (argsText?.trim() ? argsText : "запроса");
            return (
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-gray-700">Ищу в DuckDuckGo: {label}…</span>
                </div>
            );
        }

        if (status.type === "incomplete") {
            return (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Ошибка выполнения поиска DuckDuckGo
                </div>
            );
        }

        if (!result) return null;

        const parsed = parseDuckResult(result);
        if (!parsed) {
            return (
                <div className="w-full max-w-xl rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm">
                    <div className="mb-2 text-xs text-gray-500">Результат инструмента search_duckduckgo</div>
                    <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-800">{String(result)}</pre>
                </div>
            );
        }

        if ((parsed as any).error) {
            return (
                <div className="w-full max-w-xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {(parsed as any).error || "Неизвестная ошибка"}
                </div>
            );
        }

        const res = parsed as { query: string; results: DuckItem[] };
        return (
            <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm text-gray-600">Результаты DuckDuckGo для: <span className="font-medium text-gray-800">{res.query}</span></div>
                {res.results?.length ? (
                    <ul className="space-y-3">
                        {res.results.map((it, idx) => (
                            <li key={idx} className="rounded-md border border-gray-100 p-3">
                                <a
                                    href={it.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mb-1 block text-blue-600 hover:underline"
                                >
                                    {it.title || it.href}
                                </a>
                                {it.body && (
                                    <div className="text-sm text-gray-700">{it.body}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-sm text-gray-600">Ничего не найдено</div>
                )}
            </div>
        );
    },
});


