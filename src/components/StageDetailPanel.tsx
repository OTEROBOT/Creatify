import React from 'react';
import { StageConfig, FeatureMetrics, AlphaSignal, RiskCheckResult, BotSettings } from '../types/pipeline';
import { Terminal, Shield, Cpu, Activity, Send, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface StageDetailPanelProps {
  stage: StageConfig;
  features: FeatureMetrics;
  signal: AlphaSignal | null;
  riskResult: RiskCheckResult | null;
  settings: BotSettings;
  onUpdateSettings: (patch: Partial<BotSettings>) => void;
  language: 'TH' | 'EN';
  onSelectNext: () => void;
  onSelectPrev: () => void;
}

export const StageDetailPanel: React.FC<StageDetailPanelProps> = ({
  stage,
  features,
  signal,
  riskResult,
  settings,
  onUpdateSettings,
  language,
  onSelectNext,
  onSelectPrev,
}) => {
  return (
    <div className="w-full rounded-[28px] bg-[#141416] border border-[#27272b] p-6 sm:p-8 transition-colors">
      {/* Exact Visual Header matching user screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#172554] text-[#60a5fa] flex items-center justify-center font-mono font-semibold text-[18px] shrink-0 tabular-nums">
            {stage.id}
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#f4f4f5] leading-tight">
            {stage.name}
          </h2>
        </div>

        <div className="px-5 py-2 rounded-[22px] border border-[#2e2e34] bg-[#121215] font-mono text-[14px] sm:text-[16px] text-[#a1a1aa] leading-snug shrink-0">
          {stage.tech}
        </div>
      </div>

      {/* COMPONENT ROLE & TECHNICAL PURPOSE */}
      <div className="mt-6 space-y-5">
        <div>
          <div className="font-mono text-[12px] sm:text-[13px] tracking-[0.16em] text-[#71717a] uppercase">
            COMPONENT ROLE
          </div>
          <div className="mt-1 text-[19px] sm:text-[21px] font-medium text-[#f4f4f5] leading-snug">
            {language === 'TH' ? stage.thaiRole : stage.role}
          </div>
        </div>

        <div>
          <div className="font-mono text-[12px] sm:text-[13px] tracking-[0.16em] text-[#71717a] uppercase">
            TECHNICAL PURPOSE
          </div>
          <p className="mt-1.5 text-[16px] sm:text-[18px] text-[#d4d4d8] leading-[1.55] font-normal">
            {language === 'TH' ? stage.thaiPurpose : stage.purpose}
          </p>
        </div>
      </div>

      {/* STAGE LIVE WORKBENCH & FUNCTIONAL CONTROLS */}
      <div className="mt-7 pt-5 border-t border-[#232329]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#60a5fa]">
            <Activity className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">
              {language === 'TH' ? 'สถานะประมวลผลจริง (Live Stage State)' : 'Live Stage Runtime State'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectPrev}
              className="px-2.5 py-1 text-xs text-[#a1a1aa] hover:text-white bg-[#1a1a1e] rounded-lg cursor-pointer"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={onSelectNext}
              className="px-2.5 py-1 text-xs text-[#f4f4f5] bg-[#1e293b] hover:bg-[#28374f] rounded-lg cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Panel depending on which Stage is selected */}
        {stage.id === 1 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-3">
            <div className="text-xs text-[#a1a1aa]">
              {language === 'TH'
                ? 'กระดานเทรดที่เชื่อมต่อและสตรีมสด:'
                : 'Active Exchange Feed Configuration:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">EXCHANGE</div>
                <div className="text-[#f4f4f5] font-semibold mt-0.5">{settings.exchange} Futures</div>
              </div>
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">STREAM TYPE</div>
                <div className="text-[#4ade80] font-semibold mt-0.5">L2 Orderbook @100ms</div>
              </div>
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">P99 INGESTION</div>
                <div className="text-[#93b4fa] font-semibold mt-0.5">{stage.latencyMs} ms</div>
              </div>
            </div>
          </div>
        )}

        {stage.id === 2 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-3 font-mono text-xs">
            <div className="text-[#a1a1aa] font-sans">
              {language === 'TH'
                ? 'ฟีเจอร์เชิงปริมาณที่คำนวณจากราคาเรียลไทม์ (Microstructure Factors):'
                : 'Computed Microstructure Factor Matrix:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">OFI Z-SCORE</div>
                <div className="text-[#f4f4f5] font-bold text-sm mt-0.5 tabular-nums">
                  {features.ofiZScore > 0 ? `+${features.ofiZScore}` : features.ofiZScore}σ
                </div>
              </div>
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">RSI (14-PERIOD)</div>
                <div className="text-[#f4f4f5] font-bold text-sm mt-0.5 tabular-nums">
                  {features.rsi14}
                </div>
              </div>
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">MICRO-PRICE</div>
                <div className="text-[#93b4fa] font-bold text-sm mt-0.5 tabular-nums">
                  ${features.microPrice.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-[#16161b] rounded-lg border border-[#272730]">
                <div className="text-[#71717a]">REALIZED VOL</div>
                <div className="text-[#f4f4f5] font-bold text-sm mt-0.5 tabular-nums">
                  {features.realizedVol}%
                </div>
              </div>
            </div>
          </div>
        )}

        {stage.id === 3 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[#a1a1aa]">
                {language === 'TH' ? 'สัญญาณที่ AI ประเมินล่าสุด:' : 'Latest Model Inference Output:'}
              </div>
              {signal && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[#71717a]">DECISION:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      signal.direction === 'BUY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : signal.direction === 'SELL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {signal.direction} ({(signal.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#16161b] rounded-lg border border-[#272730] text-xs">
              <div className="text-[#71717a] font-mono mb-1">INFERENCE REASONING:</div>
              <div className="text-[#e4e4e7] leading-relaxed">
                {signal ? signal.reason : 'Waiting for incoming tick frame...'}
              </div>
            </div>

            {/* Parameter slider for AI Confidence */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#a1a1aa]">
                  {language === 'TH' ? 'เกณฑ์ความมั่นใจขั้นต่ำ (Confidence Hurdle)' : 'Min Confidence Hurdle'}
                </span>
                <span className="font-mono text-[#60a5fa] font-bold">
                  {(settings.minConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.90"
                step="0.02"
                value={settings.minConfidence}
                onChange={(e) => onUpdateSettings({ minConfidence: parseFloat(e.target.value) })}
                className="w-full accent-[#60a5fa] cursor-pointer"
              />
            </div>
          </div>
        )}

        {stage.id === 4 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a1a1aa]">
                {language === 'TH' ? 'ผลการตรวจสอบ Pre-Trade Risk:' : 'Pre-Trade Guardrail Gate:'}
              </span>
              {riskResult && (
                <span
                  className={`font-mono font-semibold flex items-center gap-1 ${
                    riskResult.passed ? 'text-[#4ade80]' : 'text-[#f87171]'
                  }`}
                >
                  {riskResult.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {riskResult.passed ? 'PASSED & SIZED' : 'INTERCEPTED & BLOCKED'}
                </span>
              )}
            </div>

            <div className="p-3 bg-[#16161b] rounded-lg border border-[#272730] text-xs">
              <div className="text-[#71717a] font-mono mb-1">RISK ENGINE VERDICT:</div>
              <div className="text-[#e4e4e7] leading-relaxed">
                {riskResult ? riskResult.reason : 'No signal active.'}
              </div>
            </div>

            {/* Adjustable Risk Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">Max Daily Drawdown</span>
                  <span className="font-mono text-[#f59e0b] font-bold">{settings.maxDrawdownLimitPct}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={settings.maxDrawdownLimitPct}
                  onChange={(e) => onUpdateSettings({ maxDrawdownLimitPct: parseFloat(e.target.value) })}
                  className="w-full accent-[#f59e0b] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">Kelly Multiplier</span>
                  <span className="font-mono text-[#60a5fa] font-bold">{settings.kellyFraction}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={settings.kellyFraction}
                  onChange={(e) => onUpdateSettings({ kellyFraction: parseFloat(e.target.value) })}
                  className="w-full accent-[#60a5fa] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {stage.id === 5 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-3 text-xs">
            <div className="text-[#a1a1aa]">
              {language === 'TH' ? 'ตั้งค่าการซอยคำสั่งและการจับคู่:' : 'Execution Slicing Algorithm & Routing:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#71717a] block mb-1">ALGORITHM</label>
                <select
                  value={settings.executionAlgo}
                  onChange={(e) => onUpdateSettings({ executionAlgo: e.target.value as any })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5]"
                >
                  <option value="VWAP Post-Only Maker">VWAP Post-Only (Rebate Capture)</option>
                  <option value="TWAP Micro-Slices">TWAP Micro-Slices (Low Impact)</option>
                  <option value="IOC Direct Fill">IOC Immediate-or-Cancel</option>
                </select>
              </div>

              <div>
                <label className="text-[#71717a] block mb-1">MAX SLIPPAGE TOLERANCE</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={settings.maxSlippageBps}
                    onChange={(e) => onUpdateSettings({ maxSlippageBps: parseFloat(e.target.value) })}
                    className="w-full accent-[#60a5fa] cursor-pointer"
                  />
                  <span className="font-mono font-bold text-[#f4f4f5] w-14 text-right">
                    {settings.maxSlippageBps} bps
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage.id === 6 && (
          <div className="p-4 rounded-xl bg-[#0f0f12] border border-[#232329] space-y-3 text-xs">
            <div className="text-[#a1a1aa]">
              {language === 'TH' ? 'ปลายทางแจ้งเตือนคำสั่งซื้อขายจริง:' : 'External Webhook Dispatch Targets:'}
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[#71717a] block mb-1">DISCORD WEBHOOK URL</label>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={settings.discordWebhookUrl}
                  onChange={(e) => onUpdateSettings({ discordWebhookUrl: e.target.value })}
                  className="w-full bg-[#18181c] border border-[#2e2e36] rounded-lg px-3 py-2 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b]"
                />
              </div>
              <div className="flex items-center gap-4 pt-1 text-xs text-[#a1a1aa]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertOnExecution}
                    onChange={(e) => onUpdateSettings({ alertOnExecution: e.target.checked })}
                    className="rounded accent-[#60a5fa]"
                  />
                  <span>Alert on Trade Execution</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertOnRiskReject}
                    onChange={(e) => onUpdateSettings({ alertOnRiskReject: e.target.checked })}
                    className="rounded accent-[#60a5fa]"
                  />
                  <span>Alert on Risk Veto</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
