"use client";

import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useState } from "react";
import type { StockData, HistoricalStockDataProps, StockPriceCardProps } from "./types";

function CopilotKitContent() {
    const [themeColor, setThemeColor] = useState("#6366f1");

    // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
    useCopilotAction({
        name: "set_theme_color",
        parameters: [{
            name: "theme_color",
            description: "The theme color to set. Make sure to pick nice colors.",
            required: true,
        }],
        handler({ theme_color }) {
            setThemeColor(theme_color);
        },
    });

    return (
        <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
            <YourMainContent themeColor={themeColor} />
            <CopilotSidebar
                clickOutsideToClose={false}
                defaultOpen={true}
                labels={{
                    title: "Popup Assistant",
                    initial: "👋 Hi, there! You're chatting with an agent. This agent comes with a few tools to get you started.\n\nFor example you can try:\n- **Frontend Tools**: \"Set the theme to orange\"\n- **Manage state**: \"Write a proverb about AI\"\n- **Generative UI**: \"Get the last 4 days of stock prices for AAPL\"\n\nAs you interact with the agent, you'll see the UI update in real-time to reflect the agent's **state**, **tool calls**, and **progress**."
                }}
            />
        </main>
    );
}

export default function CopilotKitPage() {
    return (
        <CopilotKit runtimeUrl="/api/copilotkit" agent="agno_agent" showDevConsole={true}>
            <CopilotKitContent />
        </CopilotKit>
    );
}

function YourMainContent({ themeColor }: { themeColor: string }) {
    const [state, setState] = useState<{ proverbs: string[] }>({
        proverbs: [
            "CopilotKit may be new, but its the best thing since sliced bread.",
        ],
    });

    // 🪁 Frontend Actions: https://docs.copilotkit.ai/coagents/frontend-actions
    useCopilotAction({
        name: "add_proverb",
        parameters: [{
            name: "proverb",
            description: "The proverb to add. Make it witty, short and concise.",
            required: true,
        }],
        handler: ({ proverb }) => {
            setState({
                ...state,
                proverbs: [...state.proverbs, proverb],
            });
        },
    });

    //🪁 Generative UI: https://docs.copilotkit.ai/coagents/generative-ui
    useCopilotAction({
        name: "get_current_stock_price",
        render: ({ args, result, status }) => {
            if (status !== "complete") return <div>Loading stock price for {args.symbol}...</div>;
            return (
                <div className="mb-4">
                    {result && <StockPriceCard symbol={args.symbol} price={result} themeColor={themeColor} />}
                </div>
            );
        },
    });

    //🪁 Generative UI: https://docs.copilotkit.ai/coagents/generative-ui
    useCopilotAction({
        name: "get_historical_stock_prices",
        parameters: [
            { name: "symbol", type: "string", required: true },
            { name: "period", type: "string", required: true },
            { name: "interval", type: "string", required: true },
        ],
        render: ({ args, result, status }) => {
            if (status !== "complete") return <div>Loading historical prices for {args.symbol} every {args.interval} for the last {args.period}...</div>;
            return (
                <div className="mb-4">
                    {result && <HistoricalStockData data={result} args={args} themeColor={themeColor} />}
                </div>
            );
        },
    });


    return (
        <div
            style={{ backgroundColor: themeColor }}
            className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300"
        >
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
                <h1 className="text-4xl font-bold text-white mb-2 text-center">Proverbs</h1>
                <p className="text-gray-200 text-center italic mb-6">This is a demonstrative page, but it could be anything you want! 🪁</p>
                <hr className="border-white/20 my-6" />
                <div className="flex flex-col gap-3">
                    {state.proverbs?.map((proverb, index) => (
                        <div
                            key={index}
                            className="bg-white/15 p-4 rounded-xl text-white relative group hover:bg-white/20 transition-all"
                        >
                            <p className="pr-8">{proverb}</p>
                            <button
                                onClick={() => setState({
                                    ...state,
                                    proverbs: state.proverbs?.filter((_, i) => i !== index),
                                })}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity 
                  bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                {state.proverbs?.length === 0 && <p className="text-center text-white/80 italic my-8">
                    No proverbs yet. Ask the assistant to add some!
                </p>}
            </div>
        </div>
    );
}

function StockPriceCard({ symbol, price, themeColor }: StockPriceCardProps) {
    return (
        <div style={{ backgroundColor: themeColor }} className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg max-w-md w-full mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex justify-between w-full">
                    <h3 className="text-2xl font-bold text-white">{symbol}</h3>
                    <p className="text-gray-200 text-2xl">${price}</p>
                </div>
            </div>
        </div>
    );
}

function HistoricalStockData({ data, args, themeColor }: HistoricalStockDataProps) {
    if (!data) return null;
    const entries = Object.entries(data).slice(0, 5);
    return (
        <div style={{ backgroundColor: themeColor }} className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg max-w-2xl w-full mb-4">
            <h3 className="text-xl font-bold text-white mb-4">{args.symbol}</h3>
            <p className="text-gray-200 text-sm mb-4">Period: {args.period}  |  Interval: {args.interval}</p>
            <div className="space-y-3">
                {entries.map(([timestamp, stockData]: [string, StockData]) => {
                    const date = new Date(parseInt(timestamp));
                    const formattedDate = date.toLocaleDateString();
                    return (
                        <div key={timestamp} className="bg-white/10 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-medium">{formattedDate}</span>
                                <span className="text-green-400 font-bold">${stockData.Close?.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-300">Open</span>
                                    <div className="text-white">${stockData.Open?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <span className="text-gray-300">High</span>
                                    <div className="text-white">${stockData.High?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <span className="text-gray-300">Low</span>
                                    <div className="text-white">${stockData.Low?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <span className="text-gray-300">Volume</span>
                                    <div className="text-white">{(stockData.Volume / 1000000).toFixed(1)}M</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


