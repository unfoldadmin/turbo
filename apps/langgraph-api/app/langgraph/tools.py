from langchain_core.tools import tool
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
import json
import urllib.request
import urllib.error
import urllib.parse
import csv
import io
import os


def _stooq_variants(symbol: str) -> List[str]:
    s = (symbol or "").strip().lower()
    if not s:
        return []
    # Пробуем сначала .us (для американских тикеров), затем без суффикса
    variants = [f"{s}.us", s]
    # Уберём дубликаты, сохраняя порядок
    seen = set()
    uniq: List[str] = []
    for v in variants:
        if v not in seen:
            uniq.append(v)
            seen.add(v)
    return uniq


def _stooq_fetch_name(symbol_variant: str) -> Optional[str]:
    # Пробуем получить имя компании: f=sn -> Symbol,Name
    url = f"https://stooq.com/q/l/?s={symbol_variant}&f=sn&e=csv"
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")
        reader = csv.reader(io.StringIO(raw))
        rows = [r for r in reader if r]
        if not rows:
            return None
        # Если есть заголовок, пропускаем
        if len(rows) >= 2 and rows[0] and rows[0][0].lower() == "symbol":
            data_row = rows[1]
        else:
            data_row = rows[0]
        if len(data_row) >= 2 and data_row[1].strip():
            name = data_row[1].strip()
            if name.upper() != "N/D":
                return name
        return None
    except Exception:
        return None


def _stooq_fetch_history(symbol_variant: str) -> List[Dict[str, str]]:
    # Исторические дневные данные
    url = f"https://stooq.com/q/d/l/?s={symbol_variant}&i=d"
    try:
        with urllib.request.urlopen(url, timeout=12) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(raw))
        rows = [r for r in reader if r and r.get("Close") and r["Close"].lower() != "null"]
        return rows
    except urllib.error.HTTPError as e:
        raise ValueError(f"HTTP ошибка Stooq: {e.code}")
    except urllib.error.URLError as e:
        raise ValueError(f"Сеть недоступна или таймаут Stooq: {e.reason}")
    except Exception as e:
        raise ValueError(f"Ошибка разбора данных Stooq: {e}")


@tool(return_direct=True)
def get_stock_price(stock_symbol: str):
    """Котировки через Stooq (бесплатно, без ключа).

    Возвращает: {symbol, company_name, current_price, change, change_percent, volume, market_cap, pe_ratio, fifty_two_week_high, fifty_two_week_low, timestamp}
    Некоторые поля (market_cap, pe_ratio) могут быть недоступны и заполняются как "N/A"/0.0.
    """
    raw_symbol = (stock_symbol or "").strip()
    symbol_up = raw_symbol.upper()
    if not raw_symbol:
        raise ValueError("Укажите тикер, например: AAPL")

    last_working_variant: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None
    for variant in _stooq_variants(raw_symbol):
        try:
            h = _stooq_fetch_history(variant)
            if h and len(h) >= 1 and h[-1].get("Close") and h[-1]["Close"].lower() != "null":
                history = h
                last_working_variant = variant
                break
        except Exception:
            continue

    if not history or not last_working_variant:
        raise ValueError(f"Не удалось получить данные для тикера: {symbol_up}")

    # Имя компании
    company_name = _stooq_fetch_name(last_working_variant) or symbol_up

    # Последняя и предыдущая свечи
    # В CSV Stooq порядок по дате от старой к новой. Возьмём последние 2 валидные строки.
    valid_rows = [r for r in history if r.get("Close") and r["Close"].lower() != "null"]
    if len(valid_rows) == 0:
        raise ValueError(f"Нет валидных цен для тикера: {symbol_up}")
    last = valid_rows[-1]
    prev = valid_rows[-2] if len(valid_rows) >= 2 else None

    def _to_float(v: Optional[str]) -> float:
        try:
            return float(v) if v is not None else 0.0
        except Exception:
            return 0.0

    current_price = _to_float(last.get("Close"))
    previous_close = _to_float(prev.get("Close")) if prev else current_price
    change = current_price - previous_close
    change_percent = (change / previous_close * 100.0) if previous_close else 0.0
    volume = int(float(last.get("Volume") or 0))

    # 52 недели: возьмём последние 365 календарных дней
    def _to_date(s: str) -> Optional[datetime]:
        try:
            return datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            return None

    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    window_rows = [r for r in valid_rows if (_to_date(r.get("Date", "")) or datetime.now(timezone.utc)) >= one_year_ago]
    if not window_rows:
        window_rows = valid_rows[-252:]  # ~252 торговых дня

    highs = [_to_float(r.get("High")) for r in window_rows if r.get("High")]
    lows = [_to_float(r.get("Low")) for r in window_rows if r.get("Low")]
    fifty_two_week_high = max(highs) if highs else current_price
    fifty_two_week_low = min(lows) if lows else current_price

    # timestamp из последней даты
    last_date = last.get("Date")
    if last_date:
        timestamp = f"{last_date}T00:00:00Z"
    else:
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "symbol": symbol_up,
        "company_name": company_name,
        "current_price": float(current_price),
        "change": float(change),
        "change_percent": float(change_percent),
        "volume": volume,
        "market_cap": "N/A",
        "pe_ratio": 0.0,
        "fifty_two_week_high": float(fifty_two_week_high),
        "fifty_two_week_low": float(fifty_two_week_low),
        "timestamp": timestamp,
    }


tools = [get_stock_price]


def _metal_code(metal: str) -> Optional[str]:
    m = (metal or "").strip().lower()
    mapping = {
        "gold": "XAU",
        "xau": "XAU",
        "silver": "XAG",
        "xag": "XAG",
        "platinum": "XPT",
        "xpt": "XPT",
        "palladium": "XPD",
        "xpd": "XPD",
    }
    return mapping.get(m)


@tool(return_direct=True)
def get_metal_price(metal: str, currency: str = "USD"):
    """Цена драгоценных металлов по бесплатному API Stooq.

    Поддерживаемые металлы: gold (XAU), silver (XAG), platinum (XPT), palladium (XPD).
    Валюта котировки (currency) по умолчанию USD. Возвращает последние дневные данные.

    Возвращает: {symbol, metal, currency, current_price, change, change_percent, fifty_two_week_high, fifty_two_week_low, timestamp}
    """
    code = _metal_code(metal)
    if not code:
        raise ValueError("Укажите один из металлов: gold, silver, platinum, palladium")

    cur = (currency or "USD").strip().upper()
    pair_symbol = f"{code}{cur}"
    stooq_symbol = pair_symbol.lower()  # пример: xauusd

    history = _stooq_fetch_history(stooq_symbol)
    valid_rows = [r for r in history if r.get("Close") and r["Close"].lower() != "null"]
    if not valid_rows:
        raise ValueError(f"Нет данных для пары: {pair_symbol}")

    last = valid_rows[-1]
    prev = valid_rows[-2] if len(valid_rows) >= 2 else None

    def _to_float(v: Optional[str]) -> float:
        try:
            return float(v) if v is not None else 0.0
        except Exception:
            return 0.0

    current_price = _to_float(last.get("Close"))
    previous_close = _to_float(prev.get("Close")) if prev else current_price
    change = current_price - previous_close
    change_percent = (change / previous_close * 100.0) if previous_close else 0.0

    # 52W окно
    def _to_date(s: str) -> Optional[datetime]:
        try:
            return datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            return None

    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    window_rows = [r for r in valid_rows if (_to_date(r.get("Date", "")) or datetime.now(timezone.utc)) >= one_year_ago]
    if not window_rows:
        window_rows = valid_rows[-252:]  # ~252 торговых дня

    highs = [_to_float(r.get("High")) for r in window_rows if r.get("High")]
    lows = [_to_float(r.get("Low")) for r in window_rows if r.get("Low")]
    fifty_two_week_high = max(highs) if highs else current_price
    fifty_two_week_low = min(lows) if lows else current_price

    last_date = last.get("Date")
    timestamp = f"{last_date}T00:00:00Z" if last_date else datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "symbol": pair_symbol,
        "metal": code,
        "currency": cur,
        "current_price": float(current_price),
        "change": float(change),
        "change_percent": float(change_percent),
        "fifty_two_week_high": float(fifty_two_week_high),
        "fifty_two_week_low": float(fifty_two_week_low),
        "timestamp": timestamp,
        "source": "stooq",
    }


BACKEND_API_BASE_URL = os.getenv("BACKEND_API_BASE_URL", "http://api:8000")


@tool(return_direct=True)
def get_rfqs(partnumber: Optional[str] = None, brand: Optional[str] = None, page: int = 1):
    """Получить список RFQ из Django.

    Параметры фильтрации: partnumber, brand (частичное совпадение). Пагинация: page.
    Возвращает ответ пагинации DRF с полем results.
    """
    try:
        params = []
        if partnumber:
            params.append(("partnumber", partnumber))
        if brand:
            params.append(("brand", brand))
        params.append(("page", str(page)))
        query = "&".join([f"{k}={urllib.parse.quote(v)}" for k, v in params]) if params else ""
        url = f"{BACKEND_API_BASE_URL}/api/rfqs/" + (f"?{query}" if query else "")
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
        return data
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}", "detail": e.read().decode("utf-8", errors="ignore")}
    except Exception as e:
        return {"error": str(e)}


@tool(return_direct=True)
def create_rfq(partnumber: str, brand: str, qty: int, target_price: Optional[float] = None):
    """Создать RFQ в Django (POST /api/rfqs/).

    Обязательные поля: partnumber, brand, qty. Необязательное: target_price.
    Возвращает созданный объект.
    """
    try:
        url = f"{BACKEND_API_BASE_URL}/api/rfqs/"
        payload = {
            "partnumber": (partnumber or "").strip(),
            "brand": (brand or "").strip(),
            "qty": int(qty),
        }
        if target_price is not None:
            try:
                payload["target_price"] = float(target_price)
            except Exception:
                pass
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
        return data
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}", "detail": e.read().decode("utf-8", errors="ignore")}
    except Exception as e:
        return {"error": str(e)}


tools = [get_stock_price, get_metal_price, get_rfqs, create_rfq]
