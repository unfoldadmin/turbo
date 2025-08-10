"use client";

import { useMemo, useState } from "react";
import { useThread, useThreadRuntime } from "@assistant-ui/react";

type ToolLogItem = {
    id: string;
    toolName: string;
    argsPreview: string;
    hasResult: boolean;
    isError?: boolean;
};

export function ToolSidebar() {
    const isRunning = useThread((t) => t.isRunning);
    const messages = useThread((t) => t.messages);
    const runtime = useThreadRuntime({ optional: true });
    const [logOpen, setLogOpen] = useState(true);

    const currentTools = useMemo(() => {
        const last = (messages as any[])?.at?.(-1);
        if (!last || last.role !== "assistant") return [] as string[];
        return (last.content as any[])
            ?.filter((p) => p?.type === "tool-call")
            ?.map((p) => String(p.toolName)) ?? [];
    }, [messages]);

    const items = useMemo(() => {
        const result: ToolLogItem[] = [];
        for (const m of messages as any[]) {
            if (!m || m.role !== "assistant") continue;
            for (const p of (m.content as any[]) ?? []) {
                if (!p || p.type !== "tool-call") continue;
                const id = `${m.id}:${p.toolCallId}`;
                const argsPreview = (() => {
                    try {
                        if (p.args && Object.keys(p.args).length > 0) {
                            return JSON.stringify(p.args, null, 0).slice(0, 200);
                        }
                        if (p.argsText && String(p.argsText).trim()) return String(p.argsText).trim();
                    } catch { }
                    return "";
                })();
                result.push({
                    id,
                    toolName: String(p.toolName),
                    argsPreview,
                    hasResult: p.result !== undefined,
                    isError: Boolean(p.isError),
                });
            }
        }
        return result.reverse();
    }, [messages]);

    if (!runtime) return null;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 p-3 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">Инструменты</div>
                    {isRunning ? (
                        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                            <span>Агент думает…</span>
                        </div>
                    ) : (
                        <div className="ml-auto text-xs text-gray-500">Готов</div>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-auto p-3">
                {/* Активные инструменты */}
                <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                        Активные инструменты
                    </div>
                    {currentTools.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {currentTools.map((t, i) => (
                                <span
                                    key={`${t}-${i}`}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">Инструменты не используются</div>
                    )}
                </section>

                {/* Быстрые действия */}
                <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                        Быстрые действия
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Обновить страницу
                        </button>
                        <a
                            href="https://assistant-ui.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Документация
                        </a>
                    </div>
                </section>

                {/* Лог инструментов */}
                {items.length > 0 && (
                    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                            <div className="text-xs uppercase tracking-wide text-gray-500">Лог инструментов</div>
                            <button
                                type="button"
                                onClick={() => setLogOpen((v) => !v)}
                                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                            >
                                {logOpen ? "Свернуть" : "Развернуть"}
                            </button>
                        </div>
                        {logOpen && (
                            <div className="max-h-[40vh] overflow-auto p-2">
                                <ul className="space-y-1">
                                    {items.map((it) => (
                                        <li key={it.id} className="rounded-md border border-gray-100 p-2 text-xs">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span
                                                    className={`inline-block h-2 w-2 rounded-full ${it.hasResult
                                                        ? it.isError
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                        : "bg-amber-500 animate-pulse"}`}
                                                />
                                                <span className="font-medium text-gray-800">{it.toolName}</span>
                                                <span className="ml-auto text-gray-500">
                                                    {it.hasResult ? (it.isError ? "ошибка" : "готово") : "выполняется"}
                                                </span>
                                            </div>
                                            {it.argsPreview && (
                                                <div className="line-clamp-2 whitespace-pre-wrap text-gray-600">
                                                    {it.argsPreview}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}


