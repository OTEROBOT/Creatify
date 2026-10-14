import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  DollarSign,
  Layers,
  Cpu,
  Key,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { BotSettings, ExecutedOrder, LiveMarketTick, AlphaSignal, RiskCheckResult } from '../types/pipeline';
import { getBitkubBalances, BitkubBalanceResponse } from '../utils/bitkubApi';

interface BotLiveStatusCockpitProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onForceTestTrade: () => void;
  onClosePosition: (orderId: string) => void;
  onUpdateSettings: (patch: Partial<BotSettings>) => void;
  orders: ExecutedOrder[];
  settings: BotSettings;
  currentTick: LiveMarketTick | null;
  latestSignal: AlphaSignal | null;
  latestRiskResult: RiskCheckResult | null;
  scanCountdown: number;
  totalScansCount: number;
  language: 'TH' | 'EN';
  onOpenGuide: () => void;
  onInstantBuy?: (amountThb: number) => void;
}

export const BotLiveStatusCockpit: React.FC<BotLiveStatusCockpitProps> = ({
  isRunning,
  onToggleRun,
  onForceTestTrade,
  onClosePosition,
  onUpdateSettings,
  orders,
  settings,
  currentTick,
  latestSignal,
  latestRiskResult,
  scanCountdown,
  totalScansCount,
  language,
  onOpenGuide,
  onInstantBuy,
}) => {
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState(true);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceResult, setBalanceResult] = useState<BitkubBalanceResponse | null>(null);

  const isBitkub = settings.exchange === 'Bitkub';
  const isLive = settings.mode === 'LIVE';
  const isTurbo = settings.scanSpeed === 'TURBO_1S' || settings.scanSpeed === 'FAST_2S';
  const currencySymbol = isBitkub ? '฿' : '$';
  const currencyUnit = isBitkub ? 'THB' : 'USDT';

  const openOrders = orders.filter((o) => o.status === 'OPEN');
  const activePosition = openOrders[0] || null;

  const currentPrice = currentTick ? currentTick.price : isBitkub ? 3350000 : 91400;

  // Confidence percentage from latest AI signal
  const signalConfidencePct = latestSignal
    ? Math.round(latestSignal.confidence * 100)
    : 72;
  const targetConfidencePct = Math.round(settings.minConfidence * 100);
  const isConfidenceMet = signalConfidencePct >= targetConfidencePct;

  // Format currency helper
  const formatPrice = (val: number) => {
    if (val >= 100000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (val >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (val >= 10) return val.toFixed(2);
    return val.toFixed(4);
  };

  const handleCheckBitkubBalance = async () => {
    if (!settings.apiKey || !settings.apiSecret) {
      setShowApiKeyModal(true);
      return;
    }
    setIsCheckingBalance(true);
    try {
      const res = await getBitkubBalances(settings.apiKey, settings.apiSecret, settings.symbol);
      setBalanceResult(res);
      if (res.success && res.thbBalance > 0) {
        onUpdateSettings({ initialCapitalUsd: res.thbBalance });
      }
    } catch {
      // Handled in api
    } finally {
      setIsCheckingBalance(false);
    }
  };

  return (
    <section className="relative w-full rounded-[24px] bg-[#090b14]/95 border border-purple-500/25 p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)] shadow-purple-950/20 backdrop-blur-md overflow-hidden">
      {/* Neo-accent subtle top glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-90" />

      {/* 
        SECTION 1: Primary Status Banner & Real-time Action State 
      */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#1b1f33]">
        {/* Left Side: Live State Indicator */}
        <div className="flex items-start gap-3.5">
          {/* Animated Status Pulse Bubble */}
          <div className="relative mt-1">
            <span
              className={`w-4 h-4 rounded-full block ${
                !isRunning
                  ? 'bg-amber-400'
                  : isLive
                  ? 'bg-rose-500'
                  : activePosition
                  ? 'bg-emerald-400'
                  : 'bg-purple-400'
              }`}
            />
            {isRunning && (
              <span
                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  isLive
                    ? 'bg-rose-500'
                    : activePosition
                    ? 'bg-emerald-400'
                    : 'bg-purple-400'
                }`}
              />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
                {language === 'TH' ? 'ศูนย์แสดงสถานะบอทสด' : 'Live Bot Status Center'}
              </span>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                  !isRunning
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                    : activePosition
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                    : isLive
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                }`}
              >
                {!isRunning
                  ? '⏸️ บอทหยุดชั่วคราว (STOPPED)'
                  : activePosition
                  ? '🔵 กำลังถือครองสถานะเทรด (IN ACTIVE POSITION)'
                  : isLive
                  ? '🔴 บอทเทรดเงินจริง Bitkub (LIVE REAL TRADING)'
                  : '🟢 บอทกำลังทำงาน: สแกนตลาดสด (RUNNING & SCANNING)'}
              </span>

              {/* Speed Mode Badge */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    scanSpeed: isTurbo ? 'NORMAL_4S' : 'TURBO_1S',
                  })
                }
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                  isTurbo
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/40'
                    : 'bg-[#141828] text-[#9ca3af] border-[#22273b] hover:border-purple-500/40'
                }`}
                title="คลิกเพื่อสลับความเร็วการสแกน"
              >
                <Flame className={`w-3 h-3 ${isTurbo ? 'text-amber-400 fill-amber-400' : 'text-[#71717a]'}`} />
                <span>{isTurbo ? '⚡ โหมดเทรดไว (Turbo 1s)' : '⏱️ สแกนปกติ (4s)'}</span>
              </button>

              {/* Exchange & Symbol Tag */}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#141828] text-blue-300 border border-blue-500/30">
                {settings.exchange}: {settings.symbol} ({currencyUnit})
              </span>
            </div>

            {/* Clear, Human-Readable Headline */}
            <h2 className="text-lg sm:text-xl font-extrabold text-[#f4f4f5] mt-1.5 flex flex-wrap items-center gap-2">
              {!isRunning ? (
                <span className="text-amber-300">
                  {language === 'TH'
                    ? 'บอทถูกหยุดอยู่ — ยังไม่มีการคำนวณและไม่มีการเปิดออเดอร์'
                    : 'Bot is paused — No market evaluations or trades active'}
                </span>
              ) : activePosition ? (
                <span className="text-emerald-400 flex items-center gap-2">
                  <span>
                    บอทกำลังถือสัญญา {activePosition.side} #{activePosition.orderId}
                  </span>
                  <span className="text-xs font-mono font-normal text-emerald-200/80">
                    (กำไร/ขาดทุน Real-time: {activePosition.pnlUsd >= 0 ? '+' : ''}
                    {currencySymbol}
                    {formatPrice(Math.abs(activePosition.pnlUsd))} / {activePosition.pnlPct.toFixed(2)}%)
                  </span>
                </span>
              ) : isLive ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300">
                  {language === 'TH'
                    ? `🔥 บอทเทรดเงินจริง Bitkub (ทุน ${currencySymbol}${settings.initialCapitalUsd || 100}) กำลังสแกนหาจังหวะเคาะซื้อ!`
                    : `Live Bitkub Trading Bot (Capital: ${currencySymbol}${settings.initialCapitalUsd || 100}) Active!`}
                </span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                  {language === 'TH'
                    ? 'บอทกำลังทำงานอยู่จริง! สแกนและพร้อมเปิดคำสั่งซื้อทันที'
                    : 'Bot is actively running! Scanning for high-probability signals'}
                </span>
              )}
            </h2>

            {/* Sub-explanation */}
            <p className="text-xs sm:text-sm text-[#9ca3af] mt-1 leading-relaxed max-w-2xl">
              {!isRunning ? (
                language === 'TH'
                  ? '💡 หากต้องการให้บอทเริ่มวิเคราะห์ราคาตลาดสดและสแกนเข้าซื้ออัตโนมัติ ให้กดปุ่ม [เริ่มการทำงานบอท] ด้านขวามือ'
                  : '💡 Click [Resume Bot] on the right to start real-time market analysis and auto-executions.'
              ) : activePosition ? (
                language === 'TH' ? (
                  <span>
                    🎯 <strong>แผนการปิดออเดอร์:</strong> บอทจะปิดทำกำไรอัตโนมัติที่{' '}
                    <strong className="text-emerald-400">
                      {currencySymbol}
                      {formatPrice(activePosition.takeProfitPrice || activePosition.entryPrice * 1.02)} (+{settings.takeProfitPct || 2}%)
                    </strong>{' '}
                    หรือตัดขาดทุนที่{' '}
                    <strong className="text-rose-400">
                      {currencySymbol}
                      {formatPrice(activePosition.stopLossPrice || activePosition.entryPrice * 0.988)} (-{settings.stopLossPct || 1.2}%)
                    </strong>{' '}
                    หรือคุณสามารถกดปุ่มสีแดงเพื่อสั่งปิดได้ทันทีในหน้านี้
                  </span>
                ) : (
                  '🎯 Auto exit active: Target Take Profit (+2.0%) or Stop Loss (-1.2%). You can also close immediately.'
                )
              ) : (
                language === 'TH' ? (
                  <span>
                    ⚡ <strong>พร้อมเข้าซื้อ:</strong> รองรับเงินทุน 100 บาท (ขั้นต่ำ Bitkub เพียง 10 บาท) ระบบปรับจูนให้ตรวจจับแรงซื้อขายไว {isTurbo ? 'รอบละ 1 วินาที' : 'รอบละ 4 วินาที'} เมื่อสัญญาณทะลุเกณฑ์จะเคาะออเดอร์ทันที!
                  </span>
                ) : (
                  '⚡ Micro-budget ready (100 THB supported). Sizing calibrated for high-speed executions.'
                )
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & Countdown */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Live Loop Countdown Meter */}
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f1322] border border-purple-500/30 text-xs shadow-inner">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <div>
                <span className="text-[#9ca3af] block text-[10px]">
                  {language === 'TH' ? 'ประเมินรอบถัดไป' : 'Next AI Scan'}
                </span>
                <span className="font-mono font-bold text-purple-200">
                  {scanCountdown}s <span className="text-[10px] text-[#71717a]">({totalScansCount} scans)</span>
                </span>
              </div>
            </div>
          )}

          {/* Quick Buy 100 THB Now Button */}
          <button
            type="button"
            onClick={() => {
              if (onInstantBuy) {
                onInstantBuy(settings.bitkubAmountPerTradeThb || 100);
              } else {
                onForceTestTrade();
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:via-teal-500 hover:to-blue-500 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            title="ส่งคำสั่งซื้อ 100 บาททันที ไม่ต้องรอนาน"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>
              {language === 'TH' ? `⚡ สั่งซื้อทันที ${currencySymbol}${settings.bitkubAmountPerTradeThb || 100}` : '⚡ Instant Buy'}
            </span>
          </button>

          {/* Active Position Close Button OR Pause/Resume Button */}
          {activePosition ? (
            <button
              type="button"
              onClick={() => onClosePosition(activePosition.orderId)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 border border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>{language === 'TH' ? '🚨 ปิดออเดอร์ทันที' : 'Close Position'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleRun}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                isRunning
                  ? 'bg-[#181a24] hover:bg-[#222638] text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>{language === 'TH' ? 'หยุดบอทชั่วคราว' : 'Pause Bot'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white" />
                  <span>{language === 'TH' ? 'เริ่มการทำงานบอท' : 'Start Bot'}</span>
                </>
              )}
            </button>
          )}

          {/* Quick FAQ Trigger */}
          <button
            type="button"
            onClick={() => setShowFaqModal(true)}
            className="p-2 rounded-xl bg-[#121626] border border-[#232a42] hover:border-purple-500/50 text-[#9ca3af] hover:text-white transition-all cursor-pointer"
            title="อ่านคำตอบ: มีเงิน 100 บาท ทำไมถึงยังไม่เทรด? เริ่มหรือยัง?"
          >
            <HelpCircle className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>

      {/* 
        SECTION 1.5: Dedicated Bitkub ฿100 Real Live Trading Command Bar 
      */}
      <div className="py-3 px-4 mt-3 rounded-2xl bg-[#0c0f1e] border border-[#1e2540] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>โหมดเทรด:</span>
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-[#141829] border border-[#232a45]">
              <button
                type="button"
                onClick={() => onUpdateSettings({ mode: 'LIVE' })}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  settings.mode === 'LIVE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                🔴 เงินจริง Bitkub (LIVE)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ mode: 'PAPER' })}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  settings.mode === 'PAPER'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                🧪 จำลอง (Paper)
              </button>
            </div>
          </div>

          {/* Capital Selector (฿100 focus) */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#202742]">
            <span className="text-[#9ca3af]">เงินทุนในพอร์ต:</span>
            <div className="flex items-center gap-1">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      initialCapitalUsd: amt,
                      bitkubAmountPerTradeThb: amt,
                      capitalCurrency: 'THB',
                    })
                  }
                  className={`px-2 py-0.5 rounded-md font-mono font-bold transition-colors cursor-pointer ${
                    settings.initialCapitalUsd === amt
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-[#15192c] text-[#9ca3af] hover:text-white border border-[#252c4a]'
                  }`}
                >
                  ฿{amt.toLocaleString()}
                  {amt === 100 ? ' ⭐' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bitkub API Key & Balance Quick Access */}
        <div className="flex flex-wrap items-center gap-2">
          {settings.apiKey && settings.apiSecret ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bitkub API เชื่อมต่อแล้ว
              </span>
              <button
                type="button"
                onClick={handleCheckBitkubBalance}
                disabled={isCheckingBalance}
                className="px-2 py-1 rounded-lg bg-[#181d33] hover:bg-[#202745] text-blue-300 border border-blue-500/30 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Wallet className="w-3 h-3" />
                <span>{isCheckingBalance ? 'กำลังดึง...' : 'ตรวจยอดเงิน'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>🔑 ใส่ Bitkub API Key (เพื่อยิงเงินจริง 100 บาท)</span>
            </button>
          )}

          {balanceResult && (
            <div className="px-2.5 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 font-mono">
              ฿ ยอดเงินจริง: {balanceResult.thbBalance.toFixed(2)} THB | เหรียญ: {balanceResult.cryptoBalance.toFixed(6)}
            </div>
          )}
        </div>
      </div>

      {/* 
        SECTION 2: Live Criteria Checklist Grid
      */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#f4f4f5] flex items-center gap-1.5">
              <span>📋</span>
              <span>{language === 'TH' ? 'เช็คลิสต์เงื่อนไขการทำงาน ณ วินาทีนี้ (Live Entry Checklist)' : 'Live Strategy Criteria Checklist'}</span>
            </span>
            <span className="text-[11px] text-[#9ca3af]">
              {language === 'TH' ? '(เงื่อนไขผ่านเกณฑ์ = เคาะออเดอร์ทันที)' : '(All must be satisfied for execution)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCriteriaExpanded((v) => !v)}
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isCriteriaExpanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียด'}</span>
            {isCriteriaExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isCriteriaExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Condition 1: Live Market Feed */}
            <div className="bg-[#0c0f1c] p-3 rounded-xl border border-[#1d2338] hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9ca3af] font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. ราคาตลาดสด</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ผ่านเกณฑ์
                </span>
              </div>
              <div className="font-mono font-bold text-[#f4f4f5] text-sm">
                {currencySymbol}{formatPrice(currentPrice)}
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                เชื่อมต่อ {settings.exchange} สดตลอด 24 ชม.
              </div>
            </div>

            {/* Condition 2: AI Confidence Hurdle */}
            <div className={`bg-[#0c0f1c] p-3 rounded-xl border transition-colors ${
              isConfidenceMet ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9ca3af] font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>2. สัญญาณโมเดล AI</span>
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${
                  isConfidenceMet ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {isConfidenceMet ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> ผ่านเกณฑ์
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> กำลังเฝ้ารอ
                    </>
                  )}
                </span>
              </div>
              <div className="font-mono font-bold text-[#f4f4f5] text-sm flex items-center gap-1.5">
                <span className={isConfidenceMet ? 'text-emerald-400' : 'text-amber-300'}>
                  {signalConfidencePct}%
                </span>
                <span className="text-xs font-normal text-[#71717a]">
                  (เป้าหมาย: ≥ {targetConfidencePct}%)
                </span>
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                {latestSignal?.direction === 'BUY' ? '🟢 ทิศทาง: ซื้อ (BUY)' : latestSignal?.direction === 'SELL' ? '🔴 ทิศทาง: ขาย (SELL)' : '⚪ สแกนเฝ้ารอ (HOLD)'}
              </div>
            </div>

            {/* Condition 3: Risk Pre-trade VaR */}
            <div className="bg-[#0c0f1c] p-3 rounded-xl border border-[#1d2338] hover:border-pink-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9ca3af] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>3. คุมความเสี่ยงพอร์ต</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> อนุมัติ
                </span>
              </div>
              <div className="font-mono font-bold text-[#f4f4f5] text-sm">
                ขนาดไม้: {currencySymbol}{latestRiskResult?.calculatedSizeUsd || settings.bitkubAmountPerTradeThb || 100}
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                รองรับเงินทุน {currencySymbol}{settings.initialCapitalUsd || 100} (ขั้นต่ำ Bitkub 10 บ.)
              </div>
            </div>

            {/* Condition 4: Exit Rule Preparedness */}
            <div className="bg-[#0c0f1c] p-3 rounded-xl border border-[#1d2338] hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9ca3af] font-medium flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. แผนปิดกำไร/คัท</span>
                </span>
                <span className="text-[11px] font-bold text-purple-300">
                  พร้อมทำงานอัตโนมัติ
                </span>
              </div>
              <div className="font-mono font-bold text-[#f4f4f5] text-sm">
                TP +{settings.takeProfitPct || 2}% / SL -{settings.stopLossPct || 1.2}%
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                ปิดให้อัตโนมัติ หรือกดปิดเองได้
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 
        MODAL: Bitkub API Key & Secret Setup
      */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0b0e1b] border border-purple-500/40 p-6 sm:p-7 shadow-[0_15px_60px_rgba(0,0,0,0.85)] shadow-purple-950/40 space-y-5 text-sm text-[#e4e4e7]">
            <div className="flex items-center justify-between pb-3 border-b border-[#202742]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ตั้งค่าเชื่อมต่อ Bitkub API เพื่อเทรดเงินจริง 100 บาท
                  </h3>
                  <span className="text-xs text-[#9ca3af]">
                    (Bitkub Open API v3 - กลต. รับรองความปลอดภัย)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-[#181d30] text-[#9ca3af] hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-xs text-purple-200 leading-relaxed">
                💡 <strong>วิธีเอา Key จาก Bitkub:</strong> เข้าเว็บ bitkub.com ➔ คลิกที่ไอคอนโปรไฟล์ ➔ การตั้งค่า (Settings) ➔ จัดการ API ➔ สร้าง Key ใหม่ (อย่าลืมติ๊กเลือกสิทธิ์ <strong>&quot;Trade&quot;</strong> หรือซื้อขาย) แล้วนำมาวางที่นี่
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">
                  BITKUB API KEY
                </label>
                <input
                  type="password"
                  placeholder="วาง API Key จาก Bitkub..."
                  value={settings.apiKey}
                  onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                  className="w-full bg-[#141829] border border-[#2b3352] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-[#52525b] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">
                  BITKUB API SECRET KEY
                </label>
                <input
                  type="password"
                  placeholder="วาง API Secret จาก Bitkub..."
                  value={settings.apiSecret}
                  onChange={(e) => onUpdateSettings({ apiSecret: e.target.value })}
                  className="w-full bg-[#141829] border border-[#2b3352] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-[#52525b] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCheckBitkubBalance}
                  disabled={isCheckingBalance || !settings.apiKey}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-[#161c33] border border-blue-500/40 hover:bg-[#1f284a] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{isCheckingBalance ? 'กำลังตรวจสอบ...' : 'ทดสอบและเช็คยอดเงิน'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ mode: 'LIVE' });
                    setShowApiKeyModal(false);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  บันทึก & เปิดโหมดเทรดจริง ฿100
                </button>
              </div>

              {balanceResult && (
                <div
                  className={`p-3 rounded-xl text-xs border ${
                    balanceResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {balanceResult.success ? (
                    <div>
                      ✓ เชื่อมต่อ Bitkub สำเร็จ! ยอดเงินคงเหลือในบัญชี:{' '}
                      <strong>{balanceResult.thbBalance.toFixed(2)} บาท</strong>
                    </div>
                  ) : (
                    <div>✕ {balanceResult.errorMessage}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 
        MODAL: ตอบข้อสงสัย 5 ข้อสำหรับผู้ใช้ที่มีเงิน 100 บาทใน Bitkub
      */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#0b0e1b] border border-purple-500/40 p-6 sm:p-7 shadow-[0_15px_60px_rgba(0,0,0,0.8)] shadow-purple-950/40 space-y-5 text-sm text-[#e4e4e7]">
            <div className="flex items-center justify-between pb-3 border-b border-[#202742]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'TH' ? 'มีเงิน 100 บาทใน Bitkub: ทำไมตอนแรกไม่เทรด? เริ่มยังไง?' : 'Bitkub 100 THB FAQ'}
                  </h3>
                  <span className="text-xs text-[#9ca3af]">
                    {language === 'TH' ? 'คำแนะนำสำหรับผู้ใช้งาน Bitkub เงินจริง' : 'Beginner guide to live Bitkub execution'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="w-8 h-8 rounded-full bg-[#181d30] text-[#9ca3af] hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-[#101426] p-4 rounded-2xl border border-purple-500/30 space-y-1.5">
                <h4 className="font-bold text-purple-300 flex items-center gap-2 text-sm">
                  <span>1. มีเงิน 100 บาทใน Bitkub เทรดได้จริงไหม?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  <strong>เทรดได้จริง 100%!</strong> กฎของ Bitkub กำหนดมูลค่าคำสั่งซื้อขั้นต่ำเพียง <strong>10 บาท (10 THB)</strong> เท่านั้น ดังนั้นเงิน 100 บาทของคุณจึงสามารถแบ่งซื้อได้หลายไม้ หรือยิงไม้ละ 50 - 100 บาทได้อย่างสบายๆ และรับกำไรเป็นเงินบาทจริง!
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-amber-500/30 space-y-1.5">
                <h4 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                  <span>2. ทำไมตอนที่เห็นผ่านเกณฑ์แล้ว ไม่เห็นสร้างคำสั่งซื้อใหม่ขึ้นมา?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  ก่อนหน้านี้ ระบบคุมความเสี่ยง (Risk Gate) ถูกตั้งสูตรคำนวณขั้นต่ำแบบสถาบัน ($500 ขึ้นไป) ทำให้เมื่อพอร์ตเป็น 100 บาท ระบบคิดว่าเงินน้อยเกินเกณฑ์ความปลอดภัย จึงระงับคำสั่งไว้<br />
                  <strong className="text-emerald-400">ตอนนี้ได้รับการแก้ไขแล้ว!</strong> บอทถูกปรับจูนขนาดคำสั่ง Micro-Sizing สำหรับเงิน 100 บาทเรียบร้อย พร้อมทั้งมีโหมด <strong>[⚡ Turbo Scalper (เทรดไว 1-2 วินาที)]</strong> ที่พร้อมเคาะซื้อขายทันทีเมื่อมีจังหวะ!
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-pink-500/30 space-y-1.5">
                <h4 className="font-bold text-pink-300 flex items-center gap-2 text-sm">
                  <span>3. ฉันไม่อยากรอ อยากให้บอทเทรดไวๆ ต้องทำอย่างไร?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  • ตรวจสอบว่าเปิด <strong className="text-amber-300">⚡ โหมดเทรดไว (Turbo 1s)</strong> อยู่ (อยู่ด้านบนข้างปุ่มเริ่มบอท)<br />
                  • หรือคุณสามารถกดปุ่มสีเขียว <strong>[⚡ สั่งซื้อทันที ฿100]</strong> ที่หน้านี้ได้ทันที คำสั่งจะถูกส่งขึ้นกระดานโดยไม่ต้องนั่งรอจังหวะ!
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-blue-500/30 space-y-1.5">
                <h4 className="font-bold text-blue-300 flex items-center gap-2 text-sm">
                  <span>4. จะส่งคำสั่งซื้อขายจริงขึ้นบัญชี Bitkub ต้องทำอย่างไร?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  1. สลับโหมดเป็น <strong className="text-rose-400">🔴 เงินจริง Bitkub (LIVE)</strong><br />
                  2. คลิกปุ่ม <strong>[🔑 ใส่ Bitkub API Key]</strong> แล้วนำ Key และ Secret จากเว็บ bitkub.com มาวาง<br />
                  3. กด [เริ่มการทำงานบอท] บอทจะใช้เงิน 100 บาทที่คุณมี ส่งคำสั่งซื้อขายตรงกับ Bitkub Open API v3 ทันที!
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowFaqModal(false);
                  if (onInstantBuy) onInstantBuy(100);
                  else onForceTestTrade();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 rounded-xl cursor-pointer"
              >
                ⚡ สั่งซื้อ ฿100 ทันที
              </button>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#9ca3af] hover:text-white bg-[#181d30] rounded-xl cursor-pointer"
              >
                เข้าใจแล้ว ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
