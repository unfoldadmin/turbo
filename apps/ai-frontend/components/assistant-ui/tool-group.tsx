"use client";

import type { FC, PropsWithChildren } from "react";

export const ToolGroup: FC<
    PropsWithChildren<{ startIndex: number; endIndex: number }>
> = ({ startIndex, endIndex, children }) => {
    const toolCount = endIndex - startIndex + 1;
    return (
        <details className="my-2">
            <summary className="cursor-pointer font-medium">
                {toolCount} tool {toolCount === 1 ? "call" : "calls"}
            </summary>
            <div className="space-y-2 pl-4">{children}</div>
        </details>
    );
};


