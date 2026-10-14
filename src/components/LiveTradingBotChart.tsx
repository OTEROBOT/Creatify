import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BotSettings, ExecutedOrder, LiveMarketTick } from '../types/pipeline';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Crosshair,
  ShieldAlert,
  Target,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  DollarSign,
  ArrowRight,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export type ChartTimeframe = '1s' | '5s' | '1m' | '5m' | '15m' | '1h' | '1D';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LiveTradingBotChartProps {
  settings: BotSettings;
  onUpdateSettings: (patch: Partial<BotSettings>) => void;
  currentTick: LiveMarketTick | null;
  orders: ExecutedOrder[];
  isRunning: boolean;
  onToggleRun: () => void;
  onManualTrigger: () => void;
  onClosePosition: (orderId: string) => void;
  language: 'TH' | 'EN';
}

export const LiveTradingBotChart: React.FC<LiveTradingBotChartProps> = ({
  settings,
  onUpdateSettings,
  currentTick,
  orders,
  isRunning,
  onToggleRun,
  onManualTrigger,
  onClosePosition,
  language,
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1m');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [showExitExplainer, setShowExitExplainer] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [isAdjustingTargets, setIsAdjustingTargets] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const openPositions = useMemo(() => orders.filter((o) => o.status === 'OPEN'), [orders]);
  const activePosition = openPositions[0] || null;

  const isBitkub = settings.exchange === 'Bitkub';
  const currencySymbol = isBitkub ? '฿' : '$';
  const currencyUnit = isBitkub ? 'THB' : 'USDT';

  // Base price generator depending on coin and exchange
  const basePrice = useMemo(() => {
    if (currentTick && currentTick.price) return currentTick.price;
    const sym = settings.symbol.toUpperCase();
    if (isBitkub) {
      if (sym.includes('BTC')) return 3350000;
      if (sym.includes('ETH')) return 130000;
      if (sym.includes('SOL')) return 7800;
      if (sym.includes('DOGE')) return 14.5;
      if (sym.includes('XRP')) return 78.0;
      return 3350000;
    } else {
      if (sym.includes('BTC')) return 91500;
      if (sym.includes('ETH')) return 3550;
      if (sym.includes('SOL')) return 215;
      if (sym.includes('DOGE')) return 0.40;
      if (sym.includes('XRP')) return 2.25;
      return 91500;
    }
  }, [currentTick, settings.symbol, isBitkub]);

  // Generate synthetic but realistic candle history based on timeframe & base price
  const [candles, setCandles] = useState<CandleData[]>(() => {
    const arr: CandleData[] = [];
    const count = 35;
    const now = Date.now();
    const stepMs = 60000;
    let prevClose = 91400;

    for (let i = count; i >= 0; i--) {
      const time = now - i * stepMs;
      const volatility = prevClose * 0.0015;
      const change = (Math.random() - 0.49) * volatility;
      const open = +(prevClose).toFixed(2);
      const close = +(open + change).toFixed(2);
      const high = +(Math.max(open, close) + Math.random() * volatility * 0.8).toFixed(2);
      const low = +(Math.min(open, close) - Math.random() * volatility * 0.8).toFixed(2);
      const volume = +(10 + Math.random() * 45).toFixed(2);
      arr.push({ time, open, high, low, close, volume });
      prevClose = close;
    }
    return arr;
  });

  // Re-seed candles when symbol, exchange, or timeframe changes
  useEffect(() => {
    const count = 35;
    const now = Date.now();
    let stepMs = 60000;
    if (timeframe === '1s') stepMs = 1000;
    else if (timeframe === '5s') stepMs = 5000;
    else if (timeframe === '1m') stepMs = 60000;
    else if (timeframe === '5m') stepMs = 300000;
    else if (timeframe === '15m') stepMs = 900000;
    else if (timeframe === '1h') stepMs = 3600000;
    else if (timeframe === '1D') stepMs = 86400000;

    const arr: CandleData[] = [];
    let prevClose = basePrice;
    const volFactor = isBitkub ? basePrice * 0.0012 : basePrice * 0.0015;

    for (let i = count; i >= 0; i--) {
      const time = now - i * stepMs;
      const change = (Math.random() - 0.49) * volFactor;
      const open = +(prevClose).toFixed(2);
      const close = +(open + change).toFixed(2);
      const high = +(Math.max(open, close) + Math.random() * volFactor * 0.7).toFixed(2);
      const low = +(Math.min(open, close) - Math.random() * volFactor * 0.7).toFixed(2);
      const volume = +(15 + Math.random() * 60).toFixed(2);
      arr.push({ time, open, high, low, close, volume });
      prevClose = close;
    }
    setCandles(arr);
  }, [settings.symbol, settings.exchange, timeframe]);

  // Update latest candle with real tick prices
  useEffect(() => {
    if (!currentTick) return;
    const price = currentTick.price;
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updatedLast: CandleData = {
        ...last,
        close: price,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        volume: +(last.volume + 0.15).toFixed(2),
      };
      return [...prev.slice(0, prev.length - 1), updatedLast];
    });
  }, [currentTick]);

  // Calculate prices for Entry, TP, and SL lines
  const currentMarkPrice = currentTick ? currentTick.price : basePrice;

  const entryPrice = useMemo(() => {
    if (activePosition) return activePosition.entryPrice;
    return +(currentMarkPrice * 0.996).toFixed(2);
  }, [activePosition, currentMarkPrice]);

  const tpPct = settings.takeProfitPct || 3.0;
  const slPct = settings.stopLossPct || 1.5;

  const takeProfitPrice = useMemo(() => {
    if (activePosition && activePosition.takeProfitPrice) return activePosition.takeProfitPrice;
    return +(entryPrice * (1 + tpPct / 100)).toFixed(2);
  }, [activePosition, entryPrice, tpPct]);

  const stopLossPrice = useMemo(() => {
    if (activePosition && activePosition.stopLossPrice) return activePosition.stopLossPrice;
    return +(entryPrice * (1 - slPct / 100)).toFixed(2);
  }, [activePosition, entryPrice, slPct]);

  // Calculate distance & percentage to TP and SL
  const distToTpPct = +(
    ((takeProfitPrice - currentMarkPrice) / currentMarkPrice) *
    100
  ).toFixed(2);
  const distToSlPct = +(
    ((currentMarkPrice - stopLossPrice) / currentMarkPrice) *
    100
  ).toFixed(2);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const paddingRight = 85;
  const paddingLeft = 15;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Scale ranges
  const minPrice = useMemo(() => {
    const candleMin = Math.min(...candles.map((c) => c.low));
    const allMin = Math.min(candleMin, stopLossPrice * 0.998, currentMarkPrice * 0.998);
    return allMin;
  }, [candles, stopLossPrice, currentMarkPrice]);

  const maxPrice = useMemo(() => {
    const candleMax = Math.max(...candles.map((c) => c.high));
    const allMax = Math.max(candleMax, takeProfitPrice * 1.002, currentMarkPrice * 1.002);
    return allMax;
  }, [candles, takeProfitPrice, currentMarkPrice]);

  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    const normalized = (val - minPrice) / priceRange;
    return paddingTop + chartH - normalized * chartH;
  };

  const candleW = Math.max(3, (chartW / candles.length) * 0.65);

  const formatPrice = (val: number) => {
    if (val >= 100000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (val >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (val >= 10) return val.toFixed(2);
    return val.toFixed(4);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    if (timeframe === '1s' || timeframe === '5s') {
      return d.toTimeString().slice(3, 8);
    }
    if (timeframe === '1D') {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return d.toTimeString().slice(0, 5);
  };

  return (
    <div className="w-full rounded-[28px] bg-[#090b14] border border-[#1e2238] p-5 sm:p-7 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] shadow-purple-950/10">
      {/* 
        1. Header: Exchange Switcher, Coin, Timeframe & Mode 
        จัด Layout ให้สะอาดตา มีช่องไฟ และสีเน้น ม่วง ชมพู น้ำเงิน
      */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1b1f33]">
        {/* Left: Coin & Exchange Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Exchange Switcher pill with modern transitions */}
          <div className="flex items-center gap-1 p-1 bg-[#0f121e] rounded-xl border border-[#232840]">
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({
                  exchange: 'Bitkub',
                  symbol: 'THB_BTC',
                  capitalCurrency: 'THB',
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isBitkub
                  ? 'bg-[#12281e] text-[#4ade80] border border-[#22c55e]/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                  : 'text-[#9ca3af] hover:text-[#f4f4f5]'
              }`}
            >
              <span>🇹🇭</span>
              <span>Bitkub (THB)</span>
              {isBitkub && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />}
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateSettings({
                  exchange: 'Binance',
                  symbol: 'BTCUSDT',
                  capitalCurrency: 'USD',
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                !isBitkub
                  ? 'bg-[#242113] text-[#facc15] border border-[#eab308]/50 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                  : 'text-[#9ca3af] hover:text-[#f4f4f5]'
              }`}
            >
              <span>🌐</span>
              <span>Binance (USDT)</span>
              {!isBitkub && <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse" />}
            </button>
          </div>

          {/* Active Coin Badge with glowing border */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold font-mono text-[#f4f4f5] tracking-tight">
              {settings.symbol}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold ${
                isBitkub
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/50 text-amber-300 border border-amber-500/40'
              }`}
            >
              {currencyUnit}
            </span>
            <span className="text-xs text-[#9ca3af] hidden md:inline">
              {isBitkub ? '(เงินบาทไทย - รองรับกลต.)' : '(สภาพคล่องระดับโลก)'}
            </span>
          </div>
        </div>

        {/* Right: Timeframe Switcher & Chart View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector with Purple/Pink/Blue active glow */}
          <div className="flex items-center gap-0.5 p-1 bg-[#0f121e] rounded-xl border border-[#232840]">
            {(['1s', '5s', '1m', '5m', '15m', '1h', '1D'] as ChartTimeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1a1f33]'
                }`}
                title={`เลือกกรอบเวลา ${tf}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Candle vs Line Toggle */}
          <div className="flex items-center gap-0.5 p-1 bg-[#0f121e] rounded-xl border border-[#232840]">
            <button
              type="button"
              onClick={() => setChartType('candle')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                chartType === 'candle'
                  ? 'bg-purple-950/50 text-purple-200 border border-purple-500/40 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-[#9ca3af] hover:text-[#f4f4f5]'
              }`}
            >
              🕯️ แท่งเทียน
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-blue-950/50 text-blue-200 border border-blue-500/40 font-semibold shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                  : 'text-[#9ca3af] hover:text-[#f4f4f5]'
              }`}
            >
              📈 กราฟเส้น
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Bot Action Radar ("ตอนนี้บอทกำลังทำอะไรอยู่") */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
          activePosition
            ? 'bg-gradient-to-r from-emerald-950/40 via-[#091510] to-emerald-950/30 border-emerald-500/40 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
            : isRunning
            ? 'bg-gradient-to-r from-purple-950/30 via-[#0d101c] to-blue-950/30 border-purple-500/35 shadow-[0_0_25px_rgba(168,85,247,0.12)]'
            : 'bg-[#181512] border-amber-500/35'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Headline */}
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full shrink-0 animate-pulse ${
                activePosition
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                  : isRunning
                  ? 'bg-purple-400 shadow-[0_0_12px_#c084fc]'
                  : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  {language === 'TH' ? 'สถานะการทำงานของบอทขณะนี้' : 'Active Bot Operation Status'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#131726] text-purple-200 border border-purple-500/30">
                  {isRunning ? 'LOOP: RUNNING 🟢' : 'LOOP: PAUSED ⏸️'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#f4f4f5] mt-0.5">
                {activePosition ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <span>🟢 บอทกำลังถือสัญญา {activePosition.side} ({activePosition.symbol})</span>
                    <span className="text-xs font-mono text-[#9ca3af]">#{activePosition.orderId}</span>
                  </span>
                ) : isRunning ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 font-bold">
                    🔍 บอทกำลังสแกนตลาดสด &amp; วิเคราะห์สัญญาณด้วย {settings.modelType}
                  </span>
                ) : (
                  <span className="text-amber-300">⏸️ บอทหยุดการทำงานชั่วคราว (กดเริ่มบอทเพื่อทำงานต่อ)</span>
                )}
              </h3>
            </div>
          </div>

          {/* Instant Action Button if Open Position */}
          {activePosition && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onClosePosition(activePosition.orderId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 border border-pink-400/50 shadow-lg shadow-pink-950/50 flex items-center gap-1.5 transition-all cursor-pointer btn-micro active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>🚨 ปิดออเดอร์ทันที (Market Close Now)</span>
              </button>
            </div>
          )}

          {!activePosition && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onManualTrigger}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 border border-purple-400/40 shadow-[0_0_18px_rgba(168,85,247,0.35)] flex items-center gap-1.5 transition-all cursor-pointer btn-micro active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>ทดสอบเข้าซื้อ 1 ออเดอร์ (Open Test Position)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Metric Bar for Active Position */}
        {activePosition ? (
          <div className="mt-3 pt-3 border-t border-[#1a3325] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0b140f] p-2.5 rounded-xl border border-[#183624]">
              <span className="text-[#71717a] block text-[11px]">จุดเข้าซื้อ (Entry Price)</span>
              <span className="font-mono font-bold text-[#f4f4f5] text-sm">
                {currencySymbol}{formatPrice(activePosition.entryPrice)}
              </span>
            </div>

            <div className="bg-[#0b140f] p-2.5 rounded-xl border border-[#183624]">
              <span className="text-[#71717a] block text-[11px]">กำไร/ขาดทุนปัจจุบัน (PnL)</span>
              <span
                className={`font-mono font-bold text-sm ${
                  activePosition.pnlUsd >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                }`}
              >
                {activePosition.pnlUsd >= 0 ? '+' : ''}
                {currencySymbol}{formatPrice(Math.abs(activePosition.pnlUsd))} ({activePosition.pnlPct.toFixed(2)}%)
              </span>
            </div>

            <div className="bg-[#0b140f] p-2.5 rounded-xl border border-[#183624]">
              <span className="text-[#4ade80] block text-[11px] font-semibold">
                🎯 ปิดเมื่อได้เงินพอ (Take Profit)
              </span>
              <span className="font-mono font-bold text-[#4ade80] text-sm">
                {currencySymbol}{formatPrice(takeProfitPrice)} (+{tpPct}%)
              </span>
              <span className="text-[10px] text-[#71717a] block">
                {distToTpPct > 0 ? `(ขาดอีก ${distToTpPct}% จะชนเป้า)` : '✓ แตะเป้ากำไรแล้ว'}
              </span>
            </div>

            <div className="bg-[#0b140f] p-2.5 rounded-xl border border-[#183624]">
              <span className="text-[#f87171] block text-[11px] font-semibold">
                🛡️ ปิดเมื่อขาดทุน (Stop Loss)
              </span>
              <span className="font-mono font-bold text-[#f87171] text-sm">
                {currencySymbol}{formatPrice(stopLossPrice)} (-{slPct}%)
              </span>
              <span className="text-[10px] text-[#71717a] block">
                {distToSlPct > 0 ? `(ห่างจากจุดคัท ${distToSlPct}%)` : '⚠️ แตะจุดคัทลอสแล้ว'}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#f1f5f9]">โมเดลคำนวณ:</span>
              <span className="font-mono text-[#93c5fd]">{settings.modelType}</span>
              <span className="text-[#64748b]">|</span>
              <span className="font-semibold text-[#f1f5f9]">เกณฑ์ความมั่นใจขั้นต่ำ:</span>
              <span className="font-mono text-[#93c5fd]">{(settings.minConfidence * 100).toFixed(0)}%</span>
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              💡 เมื่อบอทเห็นสัญญาณความมั่นใจถึงเกณฑ์ บอทจะเคาะเปิดออเดอร์และตั้งจุดขายทำกำไร/คัทลอสให้ทันที
            </div>
          </div>
        )}
      </div>

      {/* 3. The Interactive Chart Canvas / SVG */}
      <div
        ref={chartContainerRef}
        className="relative w-full rounded-2xl bg-[#0a0a0d] border border-[#202028] p-2 sm:p-4 overflow-hidden select-none"
      >
        {/* Price & Level Overlay Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-mono px-2">
          {/* Legend for Visual Levels */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#4ade80] font-semibold">
              <span className="w-3 h-0.5 bg-[#4ade80] rounded" />
              <span>🎯 Take Profit: {currencySymbol}{formatPrice(takeProfitPrice)} (+{tpPct}%)</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#60a5fa] font-semibold">
              <span className="w-3 h-0.5 bg-[#60a5fa] rounded" />
              <span>🔹 Entry (จุดเข้า): {currencySymbol}{formatPrice(entryPrice)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#f87171] font-semibold">
              <span className="w-3 h-0.5 bg-[#f87171] rounded" />
              <span>🛡️ Stop Loss: {currencySymbol}{formatPrice(stopLossPrice)} (-{slPct}%)</span>
            </div>
          </div>

          {/* Current Live Mark Price */}
          <div className="flex items-center gap-2">
            <span className="text-[#71717a] text-[11px]">MARK PRICE:</span>
            <span className="font-bold text-sm text-[#fef08a] bg-[#221f10] px-2 py-0.5 rounded border border-[#eab308]/40 tabular-nums">
              {currencySymbol}{formatPrice(currentMarkPrice)}
            </span>
          </div>
        </div>

        {/* The SVG Chart Graphic */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[380px] overflow-visible"
        >
          {/* Background Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = paddingTop + chartH * ratio;
            const priceAtY = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1c1c24"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - paddingRight + 6}
                  y={y + 3}
                  fill="#52525b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {formatPrice(priceAtY)}
                </text>
              </g>
            );
          })}

          {/* Volume bars at bottom */}
          {candles.map((c, i) => {
            const x = paddingLeft + (i / candles.length) * chartW + candleW / 2;
            const maxVol = Math.max(...candles.map((v) => v.volume)) || 1;
            const volH = Math.min(35, (c.volume / maxVol) * 35);
            const isUp = c.close >= c.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleW / 2}
                y={svgHeight - paddingBottom - volH}
                width={candleW}
                height={volH}
                fill={isUp ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)'}
              />
            );
          })}

          {/* Candlesticks or Line */}
          {chartType === 'candle' ? (
            candles.map((c, i) => {
              const x = paddingLeft + (i / candles.length) * chartW + candleW / 2;
              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const isUp = c.close >= c.open;
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));
              const color = isUp ? '#22c55e' : '#ef4444';

              return (
                <g
                  key={`candle-${i}`}
                  onMouseEnter={() => setHoveredCandle(c)}
                  onMouseLeave={() => setHoveredCandle(null)}
                  className="cursor-crosshair"
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleW / 2}
                    y={bodyTop}
                    width={candleW}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          ) : (
            /* Line Chart View */
            <g>
              <path
                d={candles
                  .map((c, i) => {
                    const x = paddingLeft + (i / candles.length) * chartW + candleW / 2;
                    const y = getY(c.close);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
              />
              <path
                d={`${candles
                  .map((c, i) => {
                    const x = paddingLeft + (i / candles.length) * chartW + candleW / 2;
                    const y = getY(c.close);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')} L ${paddingLeft + chartW} ${svgHeight - paddingBottom} L ${paddingLeft} ${
                  svgHeight - paddingBottom
                } Z`}
                fill="url(#lineGradient)"
                opacity="0.25"
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </g>
          )}

          {/* 🎯 TAKE PROFIT HORIZONTAL LINE (จุดขายเมื่อได้เงินพอ) */}
          {takeProfitPrice <= maxPrice && takeProfitPrice >= minPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(takeProfitPrice)}
                x2={svgWidth - paddingRight}
                y2={getY(takeProfitPrice)}
                stroke="#22c55e"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              {/* TP Label badge on right */}
              <rect
                x={svgWidth - paddingRight}
                y={getY(takeProfitPrice) - 10}
                width={80}
                height={20}
                fill="#153621"
                stroke="#22c55e"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={svgWidth - paddingRight + 5}
                y={getY(takeProfitPrice) + 4}
                fill="#4ade80"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                TP: +{tpPct}%
              </text>
            </g>
          )}

          {/* 🔹 ENTRY LEVEL HORIZONTAL LINE (จุดเข้าซื้อของบอท) */}
          {entryPrice <= maxPrice && entryPrice >= minPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(entryPrice)}
                x2={svgWidth - paddingRight}
                y2={getY(entryPrice)}
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Entry Label badge */}
              <rect
                x={svgWidth - paddingRight}
                y={getY(entryPrice) - 10}
                width={80}
                height={20}
                fill="#13233c"
                stroke="#3b82f6"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={svgWidth - paddingRight + 5}
                y={getY(entryPrice) + 4}
                fill="#93c5fd"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ENTRY
              </text>
            </g>
          )}

          {/* 🛡️ STOP LOSS HORIZONTAL LINE (จุดตัดขาดทุนเมื่อราคาลง) */}
          {stopLossPrice <= maxPrice && stopLossPrice >= minPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(stopLossPrice)}
                x2={svgWidth - paddingRight}
                y2={getY(stopLossPrice)}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              {/* SL Label badge */}
              <rect
                x={svgWidth - paddingRight}
                y={getY(stopLossPrice) - 10}
                width={80}
                height={20}
                fill="#381515"
                stroke="#ef4444"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={svgWidth - paddingRight + 5}
                y={getY(stopLossPrice) + 4}
                fill="#fca5a5"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                SL: -{slPct}%
              </text>
            </g>
          )}

          {/* 🟡 CURRENT MARK PRICE LINE */}
          {currentMarkPrice <= maxPrice && currentMarkPrice >= minPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(currentMarkPrice)}
                x2={svgWidth - paddingRight}
                y2={getY(currentMarkPrice)}
                stroke="#eab308"
                strokeWidth="1.5"
              />
              {/* Glowing Mark Price Marker */}
              <circle
                cx={paddingLeft + chartW}
                cy={getY(currentMarkPrice)}
                r="4"
                fill="#fde047"
                stroke="#ca8a04"
                strokeWidth="2"
              />
              <rect
                x={svgWidth - paddingRight}
                y={getY(currentMarkPrice) - 11}
                width={80}
                height={22}
                fill="#2e2709"
                stroke="#eab308"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={svgWidth - paddingRight + 4}
                y={getY(currentMarkPrice) + 4}
                fill="#fef08a"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {formatPrice(currentMarkPrice)}
              </text>
            </g>
          )}

          {/* Order Placement Visual Marker on candle */}
          {activePosition && (
            <g>
              <circle
                cx={paddingLeft + chartW * 0.45}
                cy={getY(activePosition.entryPrice)}
                r="6"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={paddingLeft + chartW * 0.45 - 20}
                y={getY(activePosition.entryPrice) - 10}
                fill="#93c5fd"
                fontSize="9"
                fontWeight="bold"
              >
                BUY FILL
              </text>
            </g>
          )}

          {/* X Axis Time Labels */}
          {candles.filter((_, idx) => idx % 7 === 0).map((c, i) => {
            const x = paddingLeft + (candles.indexOf(c) / candles.length) * chartW + candleW / 2;
            return (
              <text
                key={`time-${i}`}
                x={x - 10}
                y={svgHeight - 12}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
              >
                {formatTime(c.time)}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip if hovering over candle */}
        {hoveredCandle && (
          <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#141419]/95 border border-[#2e2e3a] backdrop-blur-md text-[11px] font-mono text-[#e4e4e7] space-y-0.5 shadow-xl pointer-events-none">
            <div className="text-[#93b4fa] font-bold">{formatTime(hoveredCandle.time)} (TF: {timeframe})</div>
            <div>O: {currencySymbol}{formatPrice(hoveredCandle.open)}</div>
            <div>H: {currencySymbol}{formatPrice(hoveredCandle.high)}</div>
            <div>L: {currencySymbol}{formatPrice(hoveredCandle.low)}</div>
            <div>C: {currencySymbol}{formatPrice(hoveredCandle.close)}</div>
            <div className="text-[#71717a]">Vol: {hoveredCandle.volume}</div>
          </div>
        )}
      </div>

      {/* 4. "แล้วจะปิดตอนได้เงินพอหรือปิดตอนขาดทุน หรือผู้ใช้จะต้องกดปิดเองในไหน?" (Crystal Clear Explainer & Action Center) */}
      <div className="rounded-2xl bg-[#0d101c] border border-[#212740] p-5 space-y-4 shadow-lg shadow-purple-950/5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1d2338]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm sm:text-base font-bold text-[#f4f4f5]">
              {language === 'TH'
                ? 'คำถามยอดฮิต: แล้วบอทจะปิดออเดอร์ตอนไหน? ปิดเมื่อได้เงินพอหรือขาดทุน? หรือต้องกดปิดเองในไหน?'
                : 'How Positions are Closed: Auto TP/SL vs Manual App Close vs Exchange Close'}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowExitExplainer((prev) => !prev)}
            className="text-xs text-purple-300 hover:text-white font-medium cursor-pointer transition-colors"
          >
            {showExitExplainer ? 'ซ่อนคำอธิบาย ▲' : 'เปิดดูคำอธิบาย ▼'}
          </button>
        </div>

        {showExitExplainer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Pillar 1: Auto Take-Profit (เมื่อได้เงินพอ) */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#0c1c14] to-[#08120d] border border-emerald-500/40 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>1. ปิดอัตโนมัติเมื่อได้เงินพอ (Take Profit)</span>
              </div>
              <p className="text-[#a7f3d0] leading-relaxed">
                บอทจะคำนวณราคาเป้าหมายให้ล่วงหน้า (เช่น <strong>+{tpPct}%</strong> หรือแตะเส้นเขียวบนกราฟ)
                ทันทีที่ราคาตลาดวิ่งขึ้นไปถึง <strong>บอทจะส่งคำสั่งขายปิดทำกำไรให้อัตโนมัติ 100%</strong> เข้ากระเป๋าทันที โดยที่คุณไม่ต้องมานั่งเฝ้าจอเลย
              </p>
              <div className="text-[11px] text-emerald-300 font-mono bg-[#091710] p-2 rounded-lg border border-emerald-500/30">
                ✓ ล็อกกำไรอัตโนมัติ ไม่ต้องกลัวกำไรทิพย์
              </div>
            </div>

            {/* Pillar 2: Auto Stop-Loss & Max Drawdown (เมื่อขาดทุน) */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#220f14] to-[#160a0d] border border-pink-500/40 space-y-2 shadow-[0_0_15px_rgba(244,63,94,0.08)]">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-pink-400" />
                <span>2. ปิดอัตโนมัติเมื่อขาดทุน (Stop Loss)</span>
              </div>
              <p className="text-[#fecdd3] leading-relaxed">
                ถ้าราคาตลาดผิดทางหลุดต่ำกว่าแนวรับที่ตั้งไว้ (เช่น <strong>-{slPct}%</strong> หรือแตะเส้นแดง) หรือพอร์ตติดลบถึงเกณฑ์ประจำวัน (Daily Max Drawdown 3%)
                <strong>บอทจะสั่งขายตัดไฟคัทลอสทันที</strong> เพื่อรักษาเงินต้น 97-98.5% ของคุณไว้ ไม่ให้พอร์ตแตก
              </p>
              <div className="text-[11px] text-pink-300 font-mono bg-[#1a0c10] p-2 rounded-lg border border-pink-500/30">
                ✓ เบรกเกอร์ตัดไฟ รักษาเงินต้นให้ปลอดภัย
              </div>
            </div>

            {/* Pillar 3: Manual Close (กดปิดเองในแอพ หรือใน Bitkub) */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#13172e] to-[#0c0f1e] border border-blue-500/40 space-y-2 shadow-[0_0_15px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>3. ผู้ใช้กดปิดเองได้ตลอดเวลา (2 ช่องทาง)</span>
              </div>
              <p className="text-[#cbd5e1] leading-relaxed">
                <strong>• กดปิดในแอพนี้:</strong> มีปุ่มสีแดง <em>&ldquo;🚨 ปิดออเดอร์ทันที (Market Close Now)&rdquo;</em> ทั้งบนกราฟและในตารางออเดอร์ กดปุ๊บบอทจะปิดไม้นั้นให้ทันที
                <br />
                <strong>• กดปิดใน Bitkub หรือ Binance เอง:</strong> ทำได้ 100%! เปิดแอพ Bitkub/Binance ในมือถือ แล้วกดขายเหรียญได้เลย บอทจะซิงค์ยอดเงินให้เอง
              </p>
              <div className="text-[11px] text-blue-300 font-mono bg-[#0f1326] p-2 rounded-lg border border-blue-500/30">
                ✓ คุณมีอำนาจสูงสุด สามารถแทรกแซงปิดได้ทุกนาที
              </div>
            </div>
          </div>
        )}

        {/* 5. Quick Live Adjustment of TP% and SL% */}
        <div className="pt-3 border-t border-[#1d2338] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-[#f4f4f5]">ปรับตั้งเป้ากำไร (TP) และคัทลอส (SL) เร็ว:</span>
            <span>(ปรับแล้วเส้นบนกราฟจะขยับตามทันที)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono">
            {/* Take Profit slider with neon green/pink styling */}
            <div className="flex items-center gap-2 bg-[#090c16] px-3.5 py-1.5 rounded-xl border border-emerald-500/30 shadow-xs">
              <span className="text-emerald-400 font-semibold">เป้ากำไร TP:</span>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={settings.takeProfitPct || 3.0}
                onChange={(e) => onUpdateSettings({ takeProfitPct: parseFloat(e.target.value) })}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
              <span className="text-emerald-300 font-bold">+{settings.takeProfitPct || 3.0}%</span>
            </div>

            {/* Stop Loss slider with rose/pink styling */}
            <div className="flex items-center gap-2 bg-[#090c16] px-3.5 py-1.5 rounded-xl border border-pink-500/30 shadow-xs">
              <span className="text-pink-400 font-semibold">คัทลอส SL:</span>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={settings.stopLossPct || 1.5}
                onChange={(e) => onUpdateSettings({ stopLossPct: parseFloat(e.target.value) })}
                className="w-20 accent-pink-500 cursor-pointer"
              />
              <span className="text-pink-300 font-bold">-{settings.stopLossPct || 1.5}%</span>
            </div>

            {/* Close Position trigger button if position is open */}
            {activePosition && (
              <button
                type="button"
                onClick={() => onClosePosition(activePosition.orderId)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-pink-400/40 shadow-sm cursor-pointer btn-micro active:scale-95"
              >
                ปิดออเดอร์ #{activePosition.orderId.slice(-4)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
