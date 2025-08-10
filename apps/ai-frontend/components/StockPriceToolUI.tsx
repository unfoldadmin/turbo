"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

type StockArgs = {
    stock_symbol: string;
};

type StockResult = {
    symbol: string;
    company_name: string;
    current_price: number;
    change: number;
    change_percent: number;
    volume: number;
    market_cap: string;
    pe_ratio: number;
    fifty_two_week_high: number;
    fifty_two_week_low: number;
    timestamp: string;
};

function parseStockResult(result: unknown): StockResult | null {
    if (!result) return null;
    if (typeof result === "object") return result as StockResult;
    if (typeof result === "string") {
        try {
            return JSON.parse(result) as StockResult;
        } catch {
            try {
                const fixed = result.replace(/'/g, '"');
                return JSON.parse(fixed) as StockResult;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export const StockPriceToolUI = makeAssistantToolUI<StockArgs, StockResult>({
    toolName: "get_stock_price",
    render: ({ args, argsText, status, result }) => {
        if (status.type === "running") {
            const label = args?.stock_symbol || (argsText?.trim() ? argsText : "символу");
            return (
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-gray-700">
                        Получаю котировки для {label}...
                    </span>
                </div>
            );
        }

        if (status.type === "incomplete" && status.reason === "error") {
            return (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Не удалось получить данные по {args.stock_symbol}
                </div>
            );
        }

        if (!result) return null;

        const parsed = parseStockResult(result);
        if (!parsed) {
            return (
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm font-medium">Результат инструмента get_stock_price</div>
                    <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-800">{String(result)}</pre>
                </div>
            );
        }

        const isUp = parsed.change >= 0;

        return (
            <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-baseline justify-between">
                    <div>
                        <h3 className="text-lg font-semibold leading-none">
                            {parsed.company_name}
                        </h3>
                        <p className="text-xs text-gray-500">{parsed.symbol}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">${parsed.current_price.toFixed(2)}</div>
                        <div className={isUp ? "text-green-600" : "text-red-600"}>
                            {isUp ? "▲" : "▼"} {Math.abs(parsed.change).toFixed(2)} ({Math.abs(parsed.change_percent).toFixed(2)}%)
                        </div>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-gray-500">Объём</div>
                        <div className="font-medium">{parsed.volume.toLocaleString()}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-gray-500">Капитализация</div>
                        <div className="font-medium">{parsed.market_cap}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-gray-500">P/E</div>
                        <div className="font-medium">{parsed.pe_ratio}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-gray-500">52W</div>
                        <div className="font-medium">
                            {parsed.fifty_two_week_low.toFixed(2)} — {parsed.fifty_two_week_high.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Обновлено: {new Date(parsed.timestamp).toLocaleString()}
                </div>
            </div>
        );
    },
});


