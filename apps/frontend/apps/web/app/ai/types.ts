// Stock data types
export interface StockData {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface HistoricalStockData {
  [timestamp: string]: StockData;
}

// Component prop types
export interface StockPriceCardProps {
  symbol: string;
  price: number;
  themeColor: string;
}

export interface HistoricalStockDataProps {
  data: HistoricalStockData;
  args: {
    symbol: string;
    period: string;
    interval: string;
  };
  themeColor: string;
}


