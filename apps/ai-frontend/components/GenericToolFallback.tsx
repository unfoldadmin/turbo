"use client";

import type { ToolCallContentPartProps } from "@assistant-ui/react";
import { useMemo } from "react";

export function GenericToolFallback(
    props: ToolCallContentPartProps<any, any>,
) {
    const { toolName, args, argsText, status, result, isError } = props;

    const prettyArgs = useMemo(() => {
        try {
            if (args && Object.keys(args).length > 0) {
                return JSON.stringify(args, null, 2);
            }
            if (argsText && argsText.trim().length > 0) {
                return argsText.trim();
            }
        } catch { }
        return "";
    }, [args, argsText]);

    const prettyResult = useMemo(() => {
        try {
            if (result === undefined) return "";
            if (typeof result === "string") return result;
            return JSON.stringify(result, null, 2);
        } catch {
            return String(result);
        }
    }, [result]);

    if (status.type === "running") {
        return (
            <div className="w-full max-w-xl rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <div className="mb-1 flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="font-medium">Выполняю инструмент: {toolName}</span>
                </div>
                {prettyArgs && (
                    <pre className="max-h-40 overflow-auto rounded bg-white/60 p-2 text-xs text-gray-800">
                        {prettyArgs}
                    </pre>
                )}
            </div>
        );
    }

    if (status.type === "incomplete") {
        return (
            <div className="w-full max-w-xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                <div className="mb-1 font-medium">Ошибка в инструменте: {toolName}</div>
                {isError && (
                    <div className="mb-2 text-xs text-red-700">Пометка результата как ошибка</div>
                )}
                {status.error && (
                    <pre className="max-h-40 overflow-auto rounded bg-white/60 p-2 text-xs text-red-800">
                        {String(status.error)}
                    </pre>
                )}
            </div>
        );
    }

    // complete or other states
    return (
        <div className="w-full max-w-xl rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm">
            <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                Инструмент
            </div>
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{toolName}</div>
                <div className="text-xs text-gray-500">{status.type === "complete" ? "готово" : status.type}</div>
            </div>
            {prettyArgs && (
                <div className="mb-2">
                    <div className="mb-1 text-xs text-gray-500">Аргументы</div>
                    <pre className="max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-800">
                        {prettyArgs}
                    </pre>
                </div>
            )}
            {result !== undefined && (
                <div>
                    <div className="mb-1 text-xs text-gray-500">Результат</div>
                    <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-800">
                        {prettyResult}
                    </pre>
                </div>
            )}
        </div>
    );
}


