import React, { useState } from 'react';
import { ExecutedOrder, PipelineAuditLog, BotSettings, LiveMarketTick } from '../types/pipeline';
import { Play, Pause, Zap, Trash2, ArrowUpRight, ArrowDownRight, Settings, ExternalLink, ShieldCheck, Download } from 'lucide-react';

interface LiveExecutionEngineProps {
  orders: ExecutedOrder[];
  auditLogs: PipelineAuditLog[];
  settings: BotSettings;
  onUpdateSettings: (patch: Partial<BotSettings>) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onManualTrigger: () => void;
  onClearLogs: () => void;
  onClosePosition: (orderId: string) => void;
  currentTick: LiveMarketTick | null;
  portfolioBalanceUsd: number;
  dailyPnlUsd: number;
  language: 'TH' | 'EN';
  onInspectStage: (stageId: number) => void;
}

export const LiveExecutionEngine: React.FC<LiveExecutionEngineProps> = ({
  orders,
  auditLogs,
  settings,
  onUpdateSettings,
  isRunning,
  onToggleRun,
  onManualTrigger,
  onClearLogs,
  onClosePosition,
  currentTick,
  portfolioBalanceUsd,
  dailyPnlUsd,
  language,
  onInspectStage,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'audit' | 'keys'>('positions');

  const openPositions = orders.filter((o) => o.status === 'OPEN');
  const closedOrders = orders.filter((o) => o.status === 'CLOSED');

  const totalUnrealizedPnl = openPositions.reduce((acc, o) => acc + o.pnlUsd, 0);

  const exportLedgerCsv = () => {
    if (orders.length === 0) return;
    const header = 'OrderID,Timestamp,Symbol,Side,EntryPrice,CurrentPrice,Qty,NotionalUsd,SlippageBps,Status,PnL_Usd\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderId},${o.timestamp},${o.symbol},${o.side},${o.entryPrice},${o.currentPrice},${o.qty},${o.notionalUsd},${o.slippageBps},${o.status},${o.pnlUsd}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-[28px] bg-[#090b14] border border-[#1e2238] p-6 sm:p-8 flex flex-col h-full shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      {/* Header & Main Bot Controller */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1b1f33]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#f4f4f5]">
              {language === 'TH' ? 'เครื่องยนต์เทรดและการทำงานจริง' : 'Execution Engine & Live Positions'}
            </h2>
            {/* Mode badge with neon borders */}
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold tracking-wider ${
                settings.mode === 'LIVE'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
              }`}
            >
              {settings.mode === 'LIVE' ? 'LIVE EXCHANGE MODE' : 'PAPER SIMULATION MODE'}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#9ca3af]">
            {language === 'TH'
              ? 'คำสั่งซื้อขายจริงถูกคัดกรองผ่านทั้ง 6 ขั้นตอนโดยอัตโนมัติเมื่อมีสัญญาณความมั่นใจสูง'
              : 'End-to-end execution loop driven by real tick streams and pre-trade VaR guardrails.'}
          </p>
        </div>

        {/* Primary Functional Controls with Micro-Interactions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer btn-micro ${
              isRunning
                ? 'bg-rose-950/50 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-blue-950/50 text-blue-200 border border-blue-500/40 hover:bg-blue-900/50 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? 'หยุดบอท' : 'Pause Loop'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? 'เริ่มบอทอัตโนมัติ' : 'Start Auto Loop'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onManualTrigger}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5 transition-all cursor-pointer btn-micro active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>{language === 'TH' ? 'ทดสอบยิง 1 ออเดอร์' : 'Trigger Signal'}</span>
          </button>

          <button
            type="button"
            onClick={exportLedgerCsv}
            disabled={orders.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-medium text-[#9ca3af] hover:text-[#f4f4f5] bg-[#121524] hover:bg-[#1a1f33] border border-[#232840] disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer btn-micro"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Portfolio & Performance Stats Strip with Neon Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#1b1f33]">
        <div className="p-3 bg-[#0d101c] rounded-2xl border border-[#1d2338]">
          <div className="text-xs text-[#9ca3af]">
            {language === 'TH' ? 'ยอดเงินพอร์ตสุทธิ' : 'Portfolio Balance'}
          </div>
          <div className="mt-1 text-xl font-mono font-bold text-[#f4f4f5] tabular-nums">
            ${portfolioBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-3 bg-[#0d101c] rounded-2xl border border-[#1d2338]">
          <div className="text-xs text-[#9ca3af]">
            {language === 'TH' ? 'PnL ที่ยังไม่ปิด (Unrealized)' : 'Unrealized PnL'}
          </div>
          <div
            className={`mt-1 text-xl font-mono font-bold tabular-nums ${
              totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-pink-400'
            }`}
          >
            {totalUnrealizedPnl >= 0 ? `+$${totalUnrealizedPnl.toFixed(2)}` : `-$${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
          </div>
        </div>

        <div className="p-3 bg-[#0d101c] rounded-2xl border border-[#1d2338]">
          <div className="text-xs text-[#9ca3af]">
            {language === 'TH' ? 'PnL ประจำวัน (Daily Net)' : 'Daily Realized PnL'}
          </div>
          <div
            className={`mt-1 text-xl font-mono font-bold tabular-nums ${
              dailyPnlUsd >= 0 ? 'text-emerald-400' : 'text-pink-400'
            }`}
          >
            {dailyPnlUsd >= 0 ? `+$${dailyPnlUsd.toFixed(2)}` : `-$${Math.abs(dailyPnlUsd).toFixed(2)}`}
          </div>
        </div>

        <div className="p-3 bg-[#0d101c] rounded-2xl border border-[#1d2338]">
          <div className="text-xs text-[#9ca3af]">
            {language === 'TH' ? 'ราคาตลาดสด (Live Binance)' : 'Live Mark Price'}
          </div>
          <div className="mt-1 text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 tabular-nums">
            ${currentTick ? currentTick.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
          </div>
        </div>
      </div>

      {/* Workspace Tabs: Open Positions vs Pipeline Audit Trail vs API Settings */}
      <div className="flex items-center justify-between gap-2 pt-4 pb-3">
        <div className="flex items-center gap-1 p-1 bg-[#090b14] rounded-xl border border-[#1e2238]">
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-gradient-to-r from-purple-950/60 to-blue-950/60 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#131626]'
            }`}
          >
            {language === 'TH' ? 'ออเดอร์ & พอร์ต' : 'Live Positions'} ({openPositions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-purple-950/60 to-pink-950/60 text-pink-200 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#131626]'
            }`}
          >
            {language === 'TH' ? 'ประวัติทั้ง 6 ขั้นตอน' : 'Pipeline Audit Trail'} ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'keys'
                ? 'bg-gradient-to-r from-blue-950/60 to-purple-950/60 text-blue-200 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#131626]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'TH' ? 'การตั้งค่าจริง & API' : 'Exchange Credentials'}</span>
          </button>
        </div>

        {activeTab === 'audit' && (
          <button
            type="button"
            onClick={onClearLogs}
            className="text-xs text-[#71717a] hover:text-[#f4f4f5] flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-x-auto min-h-[260px]">
        {activeTab === 'positions' && (
          <div>
            {openPositions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#27272c] rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-[#52525b] mx-auto mb-2" />
                <p className="text-sm text-[#a1a1aa]">
                  {language === 'TH'
                    ? 'ไม่มีสถานะเปิดค้างอยู่ในขณะนี้ (บอทกำลังสแกนหา Alpha และตรวจสอบ VaR)'
                    : 'No open positions. Automated loop is actively monitoring WebSocket orderbook depth.'}
                </p>
                <button
                  type="button"
                  onClick={onManualTrigger}
                  className="mt-3 px-3.5 py-1.5 text-xs font-medium text-[#f4f4f5] bg-[#1e293b] hover:bg-[#28374f] rounded-lg transition-colors cursor-pointer"
                >
                  {language === 'TH' ? 'สร้างสัญญาณทดสอบทันที' : 'Force Generate Alpha Order'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-[#121620] border border-[#202c42] flex items-center justify-between text-xs text-[#93c5fd]">
                  <span className="flex items-center gap-1.5">
                    <span>💡</span>
                    <span>
                      {language === 'TH'
                        ? 'สถานะเปิดอยู่: บอทจะปิดทำกำไรอัตโนมัติเมื่อถึงเป้า TP หรือคัทลอสเมื่อถึง SL (หรือคุณสามารถกดปุ่มสีแดงเพื่อสั่งปิดทันทีได้ตลอดเวลา)'
                        : 'Active positions will auto-close on TP target or SL cutoff, or click Close to exit at current market price.'}
                    </span>
                  </span>
                </div>
                <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-[#232329] text-[#71717a] text-[11px]">
                      <th className="py-2.5 pr-2">ID</th>
                      <th className="py-2.5 px-2">SIDE</th>
                      <th className="py-2.5 px-2 text-right">ENTRY</th>
                      <th className="py-2.5 px-2 text-right">TARGET TP / SL</th>
                      <th className="py-2.5 px-2 text-right">MARK</th>
                      <th className="py-2.5 px-2 text-right">UNREALIZED PNL</th>
                      <th className="py-2.5 pl-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1c21]">
                    {openPositions.map((pos) => {
                      const isBitkub = settings.exchange === 'Bitkub';
                      const symPrefix = isBitkub ? '฿' : '$';
                      return (
                        <tr key={pos.orderId} className="hover:bg-[#1a1a20] transition-colors">
                          <td className="py-2.5 pr-2 text-[#71717a] whitespace-nowrap">
                            <span className="font-bold text-[#e4e4e7] block">{pos.symbol}</span>
                            <span className="text-[10px] text-[#52525b]">{pos.orderId}</span>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                pos.side === 'BUY'
                                  ? 'bg-[#152a1e] text-[#4ade80] border border-[#22c55e]/30'
                                  : 'bg-[#2b1313] text-[#f87171] border border-[#ef4444]/30'
                              }`}
                            >
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right text-[#f4f4f5] whitespace-nowrap">
                            {symPrefix}{pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: isBitkub ? 0 : 2 })}
                          </td>
                          <td className="py-2.5 px-2 text-right whitespace-nowrap text-[11px]">
                            <div className="text-[#4ade80]">
                              TP: {symPrefix}{pos.takeProfitPrice ? pos.takeProfitPrice.toLocaleString(undefined, { minimumFractionDigits: isBitkub ? 0 : 2 }) : (pos.entryPrice * 1.03).toFixed(0)}
                            </div>
                            <div className="text-[#f87171]">
                              SL: {symPrefix}{pos.stopLossPrice ? pos.stopLossPrice.toLocaleString(undefined, { minimumFractionDigits: isBitkub ? 0 : 2 }) : (pos.entryPrice * 0.985).toFixed(0)}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right text-[#93b4fa] whitespace-nowrap">
                            {symPrefix}{pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: isBitkub ? 0 : 2 })}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                              pos.pnlUsd >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                            }`}
                          >
                            {pos.pnlUsd >= 0 ? `+${symPrefix}` : `-${symPrefix}`}
                            {Math.abs(pos.pnlUsd).toFixed(2)} ({pos.pnlPct >= 0 ? '+' : ''}
                            {pos.pnlPct.toFixed(2)}%)
                          </td>
                          <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onClosePosition(pos.orderId)}
                              className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-pink-400/40 rounded-lg cursor-pointer transition-all btn-micro shadow-xs active:scale-95"
                              title="คลิกเพื่อปิดออเดอร์ทันที ณ ราคาตลาด"
                            >
                              {language === 'TH' ? 'ปิดทันที' : 'Close Now'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#71717a]">
                Waiting for pipeline state transitions...
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => onInspectStage(log.stageId)}
                  className="p-2.5 rounded-xl bg-[#101013] border border-[#202026] hover:border-[#383844] transition-colors flex items-center justify-between text-xs font-mono cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#71717a] text-[11px] whitespace-nowrap">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#1a2238] text-[#93b4fa] whitespace-nowrap">
                      Stage {log.stageId}: {log.stageName}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        log.level === 'EXEC'
                          ? 'text-[#4ade80]'
                          : log.level === 'WARN'
                          ? 'text-[#f59e0b]'
                          : log.level === 'SIGNAL'
                          ? 'text-[#60a5fa]'
                          : 'text-[#a1a1aa]'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-[#e4e4e7] truncate max-w-md sm:max-w-lg font-sans">
                      {log.message}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#71717a] hover:text-[#93b4fa] whitespace-nowrap">
                    Inspect →
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="p-5 rounded-2xl bg-[#0f0f12] border border-[#232329] space-y-5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm text-[#f4f4f5]">
                  {language === 'TH' ? 'การตั้งค่าโหมดและกุญแจ API ของกระดานเทรด' : 'Execution Environment & Exchange Gateway'}
                </h4>
                <p className="text-[#a1a1aa] mt-0.5">
                  {language === 'TH'
                    ? 'สลับระหว่างโหมดจำลอง (Paper Trading เงินสมมติ) และโหมดต่อกระดานจริง (Live Exchange เงินจริง)'
                    : 'Switch between risk-free sandbox paper simulation and production exchange routing.'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-[#18181c] rounded-lg border border-[#2e2e36]">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ mode: 'PAPER' })}
                  className={`px-3 py-1.5 rounded-md font-mono font-medium cursor-pointer transition-colors ${
                    settings.mode === 'PAPER' ? 'bg-[#272730] text-[#4ade80] font-bold' : 'text-[#71717a]'
                  }`}
                >
                  PAPER MODE (เงินสมมติ)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ mode: 'LIVE' })}
                  className={`px-3 py-1.5 rounded-md font-mono font-medium cursor-pointer transition-colors ${
                    settings.mode === 'LIVE' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' : 'text-[#71717a]'
                  }`}
                >
                  LIVE EXCHANGE (เงินจริง)
                </button>
              </div>
            </div>

            {/* Explanation card for Live Mode */}
            {settings.mode === 'LIVE' && (
              <div className="p-3 bg-[#2d1515] border border-[#6b2525] rounded-xl text-rose-200 text-xs flex items-start gap-2">
                <span className="font-bold shrink-0">⚠️ คำเตือนโหมดเงินจริง:</span>
                <span>
                  เมื่อเปิด LIVE EXCHANGE ระบบจะใช้ API Key เพื่อส่งคำสั่งซื้อขายจริงบนกระดาน แนะนำให้เปิดสิทธิ์ใน API Key เฉพาะ &ldquo;Can Read&rdquo; และ &ldquo;Can Trade&rdquo; (ห้ามเปิดสิทธิ์ Withdraw หรือถอนเงินเด็ดขาดเพื่อความปลอดภัย)
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[#71717a] block mb-1">
                  EXCHANGE VENUE (กระดานเทรดที่รองรับ)
                </label>
                <select
                  value={settings.exchange}
                  onChange={(e) => onUpdateSettings({ exchange: e.target.value as any })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                >
                  <option value="Bitkub">Bitkub (Thailand Spot THB/BTC - กลต. รับรอง)</option>
                  <option value="Binance">Binance (USDT-M Perpetual &amp; Spot - สภาพคล่องโลก)</option>
                  <option value="Bitazza">Bitazza (Thailand &amp; Global - โบรกเกอร์ไทย)</option>
                  <option value="InnovestX">InnovestX (SCBX Digital Asset - สถาบันการเงินไทย)</option>
                  <option value="Bybit">Bybit (Linear Perpetual - สัญญาล่วงหน้า)</option>
                  <option value="OKX">OKX (Unified Swap &amp; Spot - Web3 Wallet)</option>
                  <option value="Coinbase">Coinbase (ตลาดสหรัฐอเมริกา - ตลาดหลักทรัพย์ NASDAQ)</option>
                  <option value="KuCoin">KuCoin (Global Altcoins &amp; Futures)</option>
                </select>
                <span className="text-[11px] text-[#71717a] mt-1 block">
                  {settings.exchange === 'Bitkub'
                    ? '✓ รองรับคู่เทรด THB เช่น THB_BTC, THB_ETH ผ่าน Bitkub Open API V3'
                    : '✓ รองรับคู่เทรด USDT สัญญา Perpetual และ Spot'}
                </span>
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">TRADING PAIR (เหรียญที่เลือกเทรด)</label>
                <select
                  value={settings.symbol}
                  onChange={(e) => onUpdateSettings({ symbol: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                >
                  {settings.exchange === 'Bitkub' ? (
                    <>
                      <option value="THB_BTC">THB_BTC (บิตคอยน์ / บาท)</option>
                      <option value="THB_ETH">THB_ETH (อีเธอเรียม / บาท)</option>
                      <option value="THB_SOL">THB_SOL (โซลานา / บาท)</option>
                      <option value="THB_USDT">THB_USDT (USDT / บาท)</option>
                    </>
                  ) : (
                    <>
                      <option value="BTCUSDT">BTC/USDT Perpetual</option>
                      <option value="ETHUSDT">ETH/USDT Perpetual</option>
                      <option value="SOLUSDT">SOL/USDT Perpetual</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">
                  API KEY ({settings.exchange.toUpperCase()})
                </label>
                <input
                  type="password"
                  placeholder={`วาง API Key จาก ${settings.exchange}...`}
                  value={settings.apiKey}
                  onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                />
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">
                  API SECRET KEY ({settings.exchange.toUpperCase()})
                </label>
                <input
                  type="password"
                  placeholder={`วาง API Secret จาก ${settings.exchange}...`}
                  value={settings.apiSecret}
                  onChange={(e) => onUpdateSettings({ apiSecret: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                />
              </div>
            </div>

            {/* Notification Channel Multi-Option Section */}
            <div className="pt-4 border-t border-[#232329] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-[#f4f4f5]">
                    {language === 'TH'
                      ? 'ช่องทางส่งข้อความแจ้งเตือนเข้ามือถือ (Notification Dispatch)'
                      : 'Notification Channels & Alerts'}
                  </h5>
                  <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                    {language === 'TH'
                      ? 'เลือกช่องทางที่คุณต้องการให้บอทเด้งเตือนเมื่อมีการซื้อขายสำเร็จหรือสั่งระงับความเสี่ยง'
                      : 'Choose where you want the bot to ping you on executions.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'DISCORD', label: 'Discord Webhook' },
                    { id: 'TELEGRAM', label: 'Telegram Bot' },
                    { id: 'LINE_NOTIFY', label: 'LINE Notify' },
                    { id: 'CUSTOM_WEBHOOK', label: 'Custom HTTP' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onUpdateSettings({ alertChannel: ch.id })}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      settings.alertChannel === ch.id
                        ? 'bg-[#1b2338] border-[#60a5fa] text-[#93c5fd] font-semibold'
                        : 'bg-[#141418] border-[#25252d] text-[#a1a1aa] hover:border-[#383844]'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Dynamic input depending on alert channel */}
              <div className="p-3 bg-[#141418] border border-[#25252d] rounded-xl space-y-2">
                {settings.alertChannel === 'DISCORD' && (
                  <div>
                    <label className="text-[#71717a] block mb-1">DISCORD WEBHOOK URL</label>
                    <input
                      type="text"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={settings.discordWebhookUrl}
                      onChange={(e) => onUpdateSettings({ discordWebhookUrl: e.target.value })}
                      className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                    />
                    <span className="text-[11px] text-[#71717a] mt-1 block">
                      วิธีเอา: ใน Discord ให้คลิก การตั้งค่าห้อง (Edit Channel) ➔ Integrations ➔ Webhooks ➔ Copy Webhook URL
                    </span>
                  </div>
                )}

                {settings.alertChannel === 'TELEGRAM' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#71717a] block mb-1">TELEGRAM BOT TOKEN</label>
                      <input
                        type="text"
                        placeholder="123456789:ABCdefGhI..."
                        value={settings.telegramBotToken}
                        onChange={(e) => onUpdateSettings({ telegramBotToken: e.target.value })}
                        className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                      />
                    </div>
                    <div>
                      <label className="text-[#71717a] block mb-1">TELEGRAM CHAT ID</label>
                      <input
                        type="text"
                        placeholder="เช่น @mychannel หรือ 987654321"
                        value={settings.telegramChatId}
                        onChange={(e) => onUpdateSettings({ telegramChatId: e.target.value })}
                        className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                      />
                    </div>
                  </div>
                )}

                {settings.alertChannel === 'LINE_NOTIFY' && (
                  <div>
                    <label className="text-[#71717a] block mb-1">LINE NOTIFY ACCESS TOKEN</label>
                    <input
                      type="text"
                      placeholder="วาง LINE Notify Personal Access Token..."
                      value={settings.lineNotifyToken}
                      onChange={(e) => onUpdateSettings({ lineNotifyToken: e.target.value })}
                      className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                    />
                    <span className="text-[11px] text-[#71717a] mt-1 block">
                      วิธีเอา: เข้าเว็บ notify-bot.line.me ➔ เข้าสู่ระบบ ➔ หน้าของฉัน (My page) ➔ กด ออก Token (Generate token)
                    </span>
                  </div>
                )}

                {settings.alertChannel === 'CUSTOM_WEBHOOK' && (
                  <div>
                    <label className="text-[#71717a] block mb-1">CUSTOM ENDPOINT URL (POST JSON)</label>
                    <input
                      type="text"
                      placeholder="https://api.yourdomain.com/v1/trade-webhook"
                      value={settings.customWebhookUrl}
                      onChange={(e) => onUpdateSettings({ customWebhookUrl: e.target.value })}
                      className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
