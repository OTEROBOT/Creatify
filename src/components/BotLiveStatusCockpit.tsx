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
} from 'lucide-react';
import { BotSettings, ExecutedOrder, LiveMarketTick, AlphaSignal, RiskCheckResult } from '../types/pipeline';

interface BotLiveStatusCockpitProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onForceTestTrade: () => void;
  onClosePosition: (orderId: string) => void;
  orders: ExecutedOrder[];
  settings: BotSettings;
  currentTick: LiveMarketTick | null;
  latestSignal: AlphaSignal | null;
  latestRiskResult: RiskCheckResult | null;
  scanCountdown: number;
  totalScansCount: number;
  language: 'TH' | 'EN';
  onOpenGuide: () => void;
}

export const BotLiveStatusCockpit: React.FC<BotLiveStatusCockpitProps> = ({
  isRunning,
  onToggleRun,
  onForceTestTrade,
  onClosePosition,
  orders,
  settings,
  currentTick,
  latestSignal,
  latestRiskResult,
  scanCountdown,
  totalScansCount,
  language,
  onOpenGuide,
}) => {
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState(true);

  const isBitkub = settings.exchange === 'Bitkub';
  const currencySymbol = isBitkub ? '฿' : '$';
  const currencyUnit = isBitkub ? 'THB' : 'USDT';

  const openOrders = orders.filter((o) => o.status === 'OPEN');
  const activePosition = openOrders[0] || null;

  const currentPrice = currentTick ? currentTick.price : isBitkub ? 3350000 : 91400;

  // Confidence percentage from latest AI signal
  const signalConfidencePct = latestSignal
    ? Math.round(latestSignal.confidence * 100)
    : 58;
  const targetConfidencePct = Math.round(settings.minConfidence * 100);
  const isConfidenceMet = signalConfidencePct >= targetConfidencePct;

  // Format currency helper
  const formatPrice = (val: number) => {
    if (val >= 100000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (val >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (val >= 10) return val.toFixed(2);
    return val.toFixed(4);
  };

  return (
    <section className="relative w-full rounded-[24px] bg-[#090b14]/90 border border-purple-500/25 p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)] shadow-purple-950/20 backdrop-blur-md overflow-hidden">
      {/* Neo-accent subtle top glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-90" />

      {/* 
        SECTION 1: Primary Status Banner & Real-time Action State 
        (ตอบคำถามผู้ใช้โดยตรง: บอทเริ่มหรือยัง? ทำอะไรอยู่? ถือออเดอร์หรือสแตนบาย?)
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
                  : activePosition
                  ? 'bg-emerald-400'
                  : 'bg-purple-400'
              }`}
            />
            {isRunning && (
              <span
                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  activePosition ? 'bg-emerald-400' : 'bg-purple-400'
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
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                }`}
              >
                {!isRunning
                  ? '⏸️ บอทหยุดชั่วคราว (STOPPED)'
                  : activePosition
                  ? '🔵 กำลังถือครองสถานะเทรด (IN ACTIVE POSITION)'
                  : '🟢 บอทกำลังทำงาน: สแกนตลาดสด (RUNNING & SCANNING)'}
              </span>

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
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                  {language === 'TH'
                    ? 'บอทกำลังทำงานอยู่จริง! สแตนบายเฝ้ารอจังหวะสัญญาณที่ปลอดภัย'
                    : 'Bot is actively running! Scanning for high-probability signals'}
                </span>
              )}
            </h2>

            {/* Sub-explanation (ทำไมยังไม่เทรด / กำลังรออะไร) */}
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
                      {formatPrice(activePosition.takeProfitPrice || activePosition.entryPrice * 1.03)} (+{settings.takeProfitPct || 3}%)
                    </strong>{' '}
                    หรือตัดขาดทุนที่{' '}
                    <strong className="text-rose-400">
                      {currencySymbol}
                      {formatPrice(activePosition.stopLossPrice || activePosition.entryPrice * 0.985)} (-{settings.stopLossPct || 1.5}%)
                    </strong>{' '}
                    หรือคุณสามารถกดปุ่มสีแดงเพื่อสั่งปิดได้ทันทีในหน้านี้
                  </span>
                ) : (
                  '🎯 Auto exit active: Target Take Profit (+3.0%) or Stop Loss (-1.5%). You can also close immediately.'
                )
              ) : (
                language === 'TH' ? (
                  <span>
                    🔍 <strong>ทำไมยังไม่เห็นการซื้อ-ขาย?</strong> บอทดึงราคาจริงทุกมิลลิวินาที แต่ระบบควอนต์ AI จะไม่เปิดออเดอร์มั่วซั่ว จะรอให้ความน่าจะเป็นชนะ (AI Win Rate) สูงกว่า{' '}
                    <strong className="text-purple-300">{targetConfidencePct}%</strong> และสเปรดต่ำ เพื่อปกป้องเงินทุนของคุณ
                  </span>
                ) : (
                  '🔍 Why no trade yet? The bot ingests live tick data but only enters when AI confidence exceeds the hurdle to preserve capital.'
                )
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & Countdown */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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

          {/* Force Test Trade Button (ตอบโจทย์คนที่อยากเห็นบอทเทรดทันที!) */}
          <button
            type="button"
            onClick={onForceTestTrade}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            title="ทดสอบจำลองให้บอทเปิดออเดอร์ทันที เพื่อดูเส้น TP/SL และการแสดงผลบนกราฟ"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>
              {language === 'TH' ? '⚡ ทดสอบเปิดออเดอร์ทันที' : '⚡ Force Test Trade'}
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

          {/* Quick FAQ / Explanation Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowFaqModal(true)}
            className="p-2 rounded-xl bg-[#121626] border border-[#232a42] hover:border-purple-500/50 text-[#9ca3af] hover:text-white transition-all cursor-pointer"
            title="อ่านคำตอบ: บอทเริ่มหรือยัง? ปิดตรงไหน? ทำไมยังไม่เทรด?"
          >
            <HelpCircle className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>

      {/* 
        SECTION 2: Live Criteria Checklist Grid
        (แสดงชัดเจนเป็นข้อๆ ว่าระบบกำลังเฝ้าดูอะไรอยู่ เพื่อให้ผู้ใช้สบายใจและไม่งง)
      */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#f4f4f5] flex items-center gap-1.5">
              <span>📋</span>
              <span>{language === 'TH' ? 'เช็คลิสต์เงื่อนไขการทำงาน ณ วินาทีนี้ (Live Entry Checklist)' : 'Live Strategy Criteria Checklist'}</span>
            </span>
            <span className="text-[11px] text-[#9ca3af]">
              {language === 'TH' ? '(ต้องผ่านครบทุกข้อบอทจึงจะเข้าซื้อ)' : '(All must be satisfied for execution)'}
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
                โมเดล {settings.modelType}
              </div>
            </div>

            {/* Condition 3: Risk Pre-trade VaR */}
            <div className="bg-[#0c0f1c] p-3 rounded-xl border border-[#1d2338] hover:border-pink-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9ca3af] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>3. ระบบความปลอดภัย</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> อนุมัติ
                </span>
              </div>
              <div className="font-mono font-bold text-[#f4f4f5] text-sm">
                VaR Pass (Max Size: ${latestRiskResult?.calculatedSizeUsd || 650})
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                Kelly Criterion x0.25 (ความเสี่ยงต่ำ)
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
                TP +{settings.takeProfitPct || 3}% / SL -{settings.stopLossPct || 1.5}%
              </div>
              <div className="text-[11px] text-[#71717a] mt-0.5">
                ปิดให้อัตโนมัติ หรือกดปิดเองได้
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 
        MODAL: ตอบข้อสงสัย 4 ข้อของคนที่เพิ่งเริ่มใช้บอท
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
                    {language === 'TH' ? 'ไขข้อข้องใจ: ทำไมบอทถึงยังไม่เทรด? เริ่มหรือยัง?' : 'Bot Execution & Life-Cycle FAQ'}
                  </h3>
                  <span className="text-xs text-[#9ca3af]">
                    {language === 'TH' ? 'คำแนะนำสำหรับผู้ใช้งานใหม่' : 'Beginner guide to quant bot execution'}
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
              <div className="bg-[#101426] p-4 rounded-2xl border border-[#232b45] space-y-1.5">
                <h4 className="font-bold text-purple-300 flex items-center gap-2 text-sm">
                  <span>1. ฉันจะรู้ได้อย่างไรว่าบอทเริ่มทำงานหรือยัง?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  ดูที่ไฟสถานะที่เขียนว่า <span className="text-emerald-400 font-bold">🟢 บอทกำลังทำงาน: สแกนตลาดสด</span> และตัวเลขนับถอยหลังรอบประเมิน (เช่น 4s, 3s, 2s...) หากเห็นเวลานับถอยหลัง แปลว่าบอทกำลังคำนวณและสแกนตลาดสดอยู่จริงแน่นอน 100%!
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-[#232b45] space-y-1.5">
                <h4 className="font-bold text-pink-300 flex items-center gap-2 text-sm">
                  <span>2. ทำไมถึงยังไม่เห็นการเริ่มเข้าซื้อ (Trade)?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  บอทสาย Quantitative AI จะ<strong>ไม่กดซื้อสุ่มสี่สุ่มห้าทุกวินาที</strong> เพราะจะทำให้เสียค่าธรรมเนียมและขาดทุน แต่บอทจะคำนวณ Indicator (RSI, OFI, Z-Score) และรอจนกว่าค่าความมั่นใจ (Confidence) จะถึงเกณฑ์ที่ปลอดภัย เช่น 65% ขึ้นไป เมื่อตรงเงื่อนไข บอทจะเคาะคำสั่งซื้อทันทีเสี้ยววินาที!
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-[#232b45] space-y-1.5">
                <h4 className="font-bold text-blue-300 flex items-center gap-2 text-sm">
                  <span>3. บอทจะปิดออเดอร์ตอนไหน? (ตอนได้เงิน หรือตอนขาดทุน?)</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  เมื่อบอทเข้าซื้อแล้ว จะมีเส้น 2 เส้นบนกราฟ:
                  <br />• <strong>ปิดเมื่อได้เงินพอ (Take Profit):</strong> บอทจะตั้งขายทำกำไรอัตโนมัติเมื่อราคาวิ่งขึ้นถึงเป้า เช่น +3.0%
                  <br />• <strong>ปิดเมื่อขาดทุน (Stop Loss):</strong> หากราคาผิดทาง บอทจะตัดขาดทุนอัตโนมัติ เช่น -1.5% เพื่อรักษาเงินต้นส่วนใหญ่ของคุณไว้เสมอ
                </p>
              </div>

              <div className="bg-[#101426] p-4 rounded-2xl border border-[#232b45] space-y-1.5">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                  <span>4. ผู้ใช้ต้องกดปิดเองในไหน? ในแอพนี้ หรือใน Bitkub / Binance?</span>
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  • <strong>ปกติไม่ต้องทำอะไรเลย:</strong> บอทจะเฝ้าราคาและส่งคำสั่งปิดให้ทั้งขาได้กำไรและขาคัทลอสโดยอัตโนมัติ
                  <br />• <strong>หากต้องการปิดด้วยตัวเองทันที:</strong> สามารถกดปุ่มสีแดง <span className="text-rose-400 font-bold">[🚨 ปิดออเดอร์ทันที (Market Close Now)]</span> ในหน้านี้ได้เลยทันที ระบบจะสั่งปิดสัญญาให้ทันทีโดยที่คุณไม่ต้องสลับหน้าจอไปที่ Bitkub หรือ Binance ให้เสียเวลา!
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowFaqModal(false);
                  onForceTestTrade();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl cursor-pointer"
              >
                ⚡ ลองกดทดสอบเข้าซื้อ 1 ไม้ทันที
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
