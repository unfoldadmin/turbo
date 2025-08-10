"use client";

import { useMemo, useState } from "react";
import type {
    ThreadAssistantContentPart,
    ThreadMessage,
} from "@assistant-ui/react";
import { useThread } from "@assistant-ui/react";

type ToolLogItem = {
    id: string;
    toolName: string;
    argsPreview: string;
    hasResult: boolean;
    isError?: boolean;
};

type ToolLogPanelProps = {
    variant?: "floating" | "inline";
    className?: string;
    title?: string;
};

export function ToolLogPanel({ variant = "floating", className = "", title = "Лог агента" }: ToolLogPanelProps) {
    const messages = useThread((t) => t.messages);
    const [open, setOpen] = useState(true);

    const items = useMemo(() => {
        const result: ToolLogItem[] = [];
        for (const m of messages as ThreadMessage[]) {
            if (m.role !== "assistant") continue;
            for (const p of m.content as ThreadAssistantContentPart[]) {
                if (p.type !== "tool-call") continue;
                const id = `${m.id}:${p.toolCallId}`;
                const argsPreview = (() => {
                    try {
                        if (p.args && Object.keys(p.args).length > 0) {
                            return JSON.stringify(p.args, null, 0).slice(0, 200);
                        }
                        if (p.argsText && p.argsText.trim()) return p.argsText.trim();
                    } catch { }
                    return "";
                })();
                result.push({
                    id,
                    toolName: p.toolName,
                    argsPreview,
                    hasResult: p.result !== undefined,
                    isError: p.isError,
                });
            }
        }
        return result.reverse();
    }, [messages]);

    if (!items.length) return null;

    if (variant === "inline") {
        return (
            <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                    <div className="text-sm font-medium text-gray-800">{title}</div>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    >
                        {open ? "Свернуть" : "Развернуть"}
                    </button>
                </div>
                {open && (
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
                                                : "bg-amber-500 animate-pulse"
                                                }`}
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
            </div>
        );
    }

    return (
        <div className={`fixed right-2 top-20 z-30 w-80 max-w-[90vw] ${className}`}>
            <div className="rounded-lg border border-gray-200 bg-white shadow-md">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                    <div className="text-sm font-medium text-gray-800">{title}</div>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    >
                        {open ? "Свернуть" : "Развернуть"}
                    </button>
                </div>
                {open && (
                    <div className="max-h-[50vh] overflow-auto p-2">
                        <ul className="space-y-1">
                            {items.map((it) => (
                                <li
                                    key={it.id}
                                    className="rounded-md border border-gray-100 p-2 text-xs"
                                >
                                    <div className="mb-1 flex items-center gap-2">
                                        <span
                                            className={`inline-block h-2 w-2 rounded-full ${it.hasResult
                                                ? it.isError
                                                    ? "bg-red-500"
                                                    : "bg-green-500"
                                                : "bg-amber-500 animate-pulse"
                                                }`}
                                        />
                                        <span className="font-medium text-gray-800">
                                            {it.toolName}
                                        </span>
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
            </div>
        </div>
    );
}


