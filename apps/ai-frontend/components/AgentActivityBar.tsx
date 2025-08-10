"use client";

import { useMemo } from "react";
import { useThread, useThreadRuntime } from "@assistant-ui/react";

type AgentActivityBarProps = {
    variant?: "floating" | "inline";
    className?: string;
};

function Dot({ className = "" }: { className?: string }) {
    return (
        <span
            className={`inline-block h-2 w-2 rounded-full ${className}`}
            aria-hidden
        />
    );
}

export function AgentActivityBar({ variant = "floating", className = "" }: AgentActivityBarProps) {
    const isRunning = useThread((t) => t.isRunning);
    const messages = useThread((t) => t.messages);
    const runtime = useThreadRuntime({ optional: true });

    const currentTools = useMemo(() => {
        const last = messages.at(-1);
        if (!last || last.role !== "assistant") return [] as string[];
        return last.content
            .filter((p: any) => p?.type === "tool-call")
            .map((p: any) => p.toolName as string);
    }, [messages]);

    if (!runtime) return null;

    const Content = (
        <div className={`flex items-center gap-2 ${variant === "inline" ? "rounded-lg border border-gray-200 bg-white p-2 shadow-sm" : "pointer-events-auto max-w-2xl flex-1 rounded-full border border-gray-200 bg-white/90 p-2 shadow-md backdrop-blur"} ${className}`}>
            {isRunning ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-gray-700">Агент думает…</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Dot className="bg-gray-300" />
                    <span className="text-sm text-gray-500">Готов</span>
                </div>
            )}

            <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                {currentTools.length > 0 ? (
                    <>
                        <span className="hidden sm:inline">Инструменты:</span>
                        <div className="flex flex-wrap gap-1">
                            {currentTools.map((t, i) => (
                                <span
                                    key={`${t}-${i}`}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <span className="text-gray-400">Инструменты не используются</span>
                )}
            </div>
        </div>
    );

    if (variant === "inline") {
        return <div>{Content}</div>;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-2 z-20 flex justify-center px-3">
            {Content}
        </div>
    );
}


