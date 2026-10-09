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
    <div className="w-full rounded-[28px] bg-[#141416] border border-[#27272b] p-6 sm:p-8 flex flex-col h-full">
      {/* Header & Main Bot Controller */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#232329]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-[#f4f4f5]">
              {language === 'TH' ? 'เครื่องยนต์เทรดและการทำงานจริง' : 'Execution Engine & Live Positions'}
            </h2>
            {/* Mode badge */}
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider ${
                settings.mode === 'LIVE'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {settings.mode === 'LIVE' ? 'LIVE EXCHANGE MODE' : 'PAPER SIMULATION MODE'}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#a1a1aa]">
            {language === 'TH'
              ? 'คำสั่งซื้อขายจริงถูกคัดกรองผ่านทั้ง 6 ขั้นตอนโดยอัตโนมัติเมื่อมีสัญญาณความมั่นใจสูง'
              : 'End-to-end execution loop driven by real Binance tick streams and pre-trade VaR guardrails.'}
          </p>
        </div>

        {/* Primary Functional Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isRunning
                ? 'bg-[#311b1b] text-[#f87171] border border-[#5c2828] hover:bg-[#3f2121]'
                : 'bg-[#1d3354] text-[#93c5fd] border border-[#2e5288] hover:bg-[#25416b]'
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
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#e4e4e7] bg-[#1c1c21] hover:bg-[#27272e] border border-[#2e2e36] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>{language === 'TH' ? 'ทดสอบยิง 1 ออเดอร์' : 'Trigger Signal'}</span>
          </button>

          <button
            type="button"
            onClick={exportLedgerCsv}
            disabled={orders.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] bg-[#18181c] hover:bg-[#222228] border border-[#27272d] disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Portfolio & Performance Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#232329]">
        <div>
          <div className="text-xs text-[#71717a]">
            {language === 'TH' ? 'ยอดเงินพอร์ตสุทธิ' : 'Portfolio Balance'}
          </div>
          <div className="mt-0.5 text-xl font-mono font-semibold text-[#f4f4f5] tabular-nums">
            ${portfolioBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#71717a]">
            {language === 'TH' ? 'PnL ที่ยังไม่ปิด (Unrealized)' : 'Unrealized PnL'}
          </div>
          <div
            className={`mt-0.5 text-xl font-mono font-semibold tabular-nums ${
              totalUnrealizedPnl >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
            }`}
          >
            {totalUnrealizedPnl >= 0 ? `+$${totalUnrealizedPnl.toFixed(2)}` : `-$${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#71717a]">
            {language === 'TH' ? 'PnL ประจำวัน (Daily Net)' : 'Daily Realized PnL'}
          </div>
          <div
            className={`mt-0.5 text-xl font-mono font-semibold tabular-nums ${
              dailyPnlUsd >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
            }`}
          >
            {dailyPnlUsd >= 0 ? `+$${dailyPnlUsd.toFixed(2)}` : `-$${Math.abs(dailyPnlUsd).toFixed(2)}`}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#71717a]">
            {language === 'TH' ? 'ราคาตลาดสด (Live Binance)' : 'Live Mark Price'}
          </div>
          <div className="mt-0.5 text-xl font-mono font-semibold text-[#93b4fa] tabular-nums">
            ${currentTick ? currentTick.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
          </div>
        </div>
      </div>

      {/* Workspace Tabs: Open Positions vs Pipeline Audit Trail vs API Settings */}
      <div className="flex items-center justify-between gap-2 pt-4 pb-3">
        <div className="flex items-center gap-1 p-1 bg-[#0e0e11] rounded-xl border border-[#232329]">
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-[#232329] text-[#f4f4f5]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            {language === 'TH' ? 'ออเดอร์ & พอร์ต' : 'Live Positions'} ({openPositions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#232329] text-[#f4f4f5]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            {language === 'TH' ? 'ประวัติทั้ง 6 ขั้นตอน' : 'Pipeline Audit Trail'} ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'keys'
                ? 'bg-[#232329] text-[#f4f4f5]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
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
              <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-[#232329] text-[#71717a] text-[11px]">
                    <th className="py-2.5 pr-2">ID</th>
                    <th className="py-2.5 px-2">SIDE</th>
                    <th className="py-2.5 px-2 text-right">ENTRY</th>
                    <th className="py-2.5 px-2 text-right">MARK</th>
                    <th className="py-2.5 px-2 text-right">SIZE</th>
                    <th className="py-2.5 px-2 text-right">UNREALIZED PNL</th>
                    <th className="py-2.5 px-2">ALGO</th>
                    <th className="py-2.5 pl-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c21]">
                  {openPositions.map((pos) => (
                    <tr key={pos.orderId} className="hover:bg-[#1a1a20] transition-colors">
                      <td className="py-2.5 pr-2 text-[#71717a] whitespace-nowrap">{pos.orderId}</td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            pos.side === 'BUY' ? 'text-[#4ade80]' : 'text-[#f87171]'
                          }`}
                        >
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#f4f4f5] whitespace-nowrap">
                        ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#93b4fa] whitespace-nowrap">
                        ${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#e4e4e7] whitespace-nowrap">
                        ${pos.notionalUsd.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                          pos.pnlUsd >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                        }`}
                      >
                        {pos.pnlUsd >= 0 ? `+$${pos.pnlUsd.toFixed(2)}` : `-$${Math.abs(pos.pnlUsd).toFixed(2)}`} (
                        {pos.pnlPct.toFixed(2)}%)
                      </td>
                      <td className="py-2.5 px-2 text-[#71717a] whitespace-nowrap text-[11px]">
                        {pos.executionAlgo.split(' ')[0]}
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onClosePosition(pos.orderId)}
                          className="px-2 py-1 text-[11px] bg-[#272730] hover:bg-[#343440] text-[#f4f4f5] rounded cursor-pointer"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div className="p-5 rounded-2xl bg-[#0f0f12] border border-[#232329] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-[#f4f4f5]">
                  {language === 'TH' ? 'การตั้งค่าโหมดและกุญแจ API' : 'Execution Environment & API Gateway'}
                </h4>
                <p className="text-[#a1a1aa] mt-0.5">
                  {language === 'TH'
                    ? 'สลับระหว่างโหมดจำลอง (Paper Trading) และโหมดต่อกระดานจริง (Live Exchange)'
                    : 'Switch between risk-free sandbox paper simulation and production exchange routing.'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-[#18181c] rounded-lg border border-[#2e2e36]">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ mode: 'PAPER' })}
                  className={`px-3 py-1.5 rounded-md font-mono font-medium cursor-pointer ${
                    settings.mode === 'PAPER' ? 'bg-[#272730] text-[#4ade80]' : 'text-[#71717a]'
                  }`}
                >
                  PAPER MODE
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ mode: 'LIVE' })}
                  className={`px-3 py-1.5 rounded-md font-mono font-medium cursor-pointer ${
                    settings.mode === 'LIVE' ? 'bg-rose-950 text-rose-300' : 'text-[#71717a]'
                  }`}
                >
                  LIVE EXCHANGE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[#71717a] block mb-1">EXCHANGE VENUE</label>
                <select
                  value={settings.exchange}
                  onChange={(e) => onUpdateSettings({ exchange: e.target.value as any })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                >
                  <option value="Binance">Binance Futures (USDT-M)</option>
                  <option value="Bybit">Bybit Linear Perpetual</option>
                  <option value="OKX">OKX SWAP</option>
                </select>
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">TRADING PAIR</label>
                <select
                  value={settings.symbol}
                  onChange={(e) => onUpdateSettings({ symbol: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                >
                  <option value="BTCUSDT">BTC/USDT Perpetual</option>
                  <option value="ETHUSDT">ETH/USDT Perpetual</option>
                  <option value="SOLUSDT">SOL/USDT Perpetual</option>
                </select>
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">API KEY (TESTNET / PRODUCTION)</label>
                <input
                  type="password"
                  placeholder="Paste Exchange API Key..."
                  value={settings.apiKey}
                  onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                />
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">API SECRET</label>
                <input
                  type="password"
                  placeholder="Paste Exchange API Secret..."
                  value={settings.apiSecret}
                  onChange={(e) => onUpdateSettings({ apiSecret: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
