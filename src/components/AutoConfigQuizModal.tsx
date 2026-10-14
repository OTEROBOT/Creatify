import React, { useState } from 'react';
import { BotSettings } from '../types/pipeline';
import { Sparkles, CheckCircle2, X, Wallet, ShieldAlert } from 'lucide-react';
import { SUPPORTED_EXCHANGES } from '../data/coinCatalog';

interface AutoConfigQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySettings: (settingsPatch: Partial<BotSettings>, profileTitle: string, newBalance: number) => void;
  currentCapital: number;
}

export const AutoConfigQuizModal: React.FC<AutoConfigQuizModalProps> = ({
  isOpen,
  onClose,
  onApplySettings,
  currentCapital,
}) => {
  // Question 1: User's Capital (Thai Baht or USD)
  const [currency, setCurrency] = useState<'THB' | 'USD'>('THB');
  const [capitalInput, setCapitalInput] = useState<number>(30000); // Default 30,000 THB

  // Question 2: Risk Appetite
  const [riskAppetite, setRiskAppetite] = useState<'LOW' | 'BALANCED' | 'HIGH'>('BALANCED');

  // Question 3: Trading Style / Frequency
  const [frequency, setFrequency] = useState<'SCALP' | 'TREND' | 'RELAXED'>('TREND');

  // Question 4: Preferred Exchange
  const [exchangeChoice, setExchangeChoice] = useState<string>('Bitkub');

  if (!isOpen) return null;

  const handleCalculateAndApply = () => {
    let patch: Partial<BotSettings> = {};
    let profileTitle = '';

    // Convert user capital to USD equivalent for internal quant engine engine
    const capitalUsd = currency === 'THB' ? Math.round(capitalInput / 36.5) : capitalInput;

    // Calculate dynamic safe order size based on user capital
    let calculatedMaxOrder = 100;
    if (capitalUsd <= 500) {
      calculatedMaxOrder = Math.max(20, Math.round(capitalUsd * 0.2));
    } else if (capitalUsd <= 2000) {
      calculatedMaxOrder = Math.round(capitalUsd * 0.15);
    } else {
      calculatedMaxOrder = Math.round(capitalUsd * 0.10);
    }

    if (riskAppetite === 'LOW') {
      patch = {
        minConfidence: 0.80, // High hurdle 80%
        maxDrawdownLimitPct: 2.0, // Strict 2% breaker
        kellyFraction: 0.15, // Conservative sizing 0.15x
        maxOrderNotionalUsd: calculatedMaxOrder,
        executionAlgo: 'VWAP Post-Only Maker',
        maxSlippageBps: 2.0,
      };
      profileTitle = `สายเซฟเน้นปลอดภัยสูง (ทุน ${capitalInput.toLocaleString()} ${currency} | ไม้ละ ~${Math.round(calculatedMaxOrder * (currency === 'THB' ? 36.5 : 1)).toLocaleString()} ${currency})`;
    } else if (riskAppetite === 'HIGH') {
      patch = {
        minConfidence: 0.58, // Lower hurdle for frequent entry
        maxDrawdownLimitPct: 5.0, // High drawdown tolerance
        kellyFraction: 0.40, // Aggressive sizing 0.40x
        maxOrderNotionalUsd: Math.round(calculatedMaxOrder * 1.5),
        executionAlgo: frequency === 'SCALP' ? 'IOC Direct Fill' : 'TWAP Micro-Slices',
        maxSlippageBps: 5.0,
      };
      profileTitle = `สายบู๊เน้นรอบไว (ทุน ${capitalInput.toLocaleString()} ${currency} | ไม้ละ ~${Math.round(calculatedMaxOrder * 1.5 * (currency === 'THB' ? 36.5 : 1)).toLocaleString()} ${currency})`;
    } else {
      // BALANCED
      patch = {
        minConfidence: 0.70, // Recommended 70%
        maxDrawdownLimitPct: 3.0, // Standard 3% breaker
        kellyFraction: 0.25, // Recommended 0.25x
        maxOrderNotionalUsd: calculatedMaxOrder,
        executionAlgo: 'VWAP Post-Only Maker',
        maxSlippageBps: 3.5,
      };
      profileTitle = `สายสมดุลแนะนำสำหรับมือใหม่ (ทุน ${capitalInput.toLocaleString()} ${currency} | ไม้ละ ~${Math.round(calculatedMaxOrder * (currency === 'THB' ? 36.5 : 1)).toLocaleString()} ${currency})`;
    }

    // Model selection based on frequency
    if (frequency === 'SCALP') {
      patch.modelType = 'DeepLOB Orderbook';
    } else if (frequency === 'TREND') {
      patch.modelType = 'XGBoost + Transformer';
    } else {
      patch.modelType = 'Statistical Arbitrage';
    }

    patch.exchange = exchangeChoice as any;
    patch.symbol = exchangeChoice === 'Bitkub' || exchangeChoice === 'Bitazza' ? 'THB_BTC' : 'BTCUSDT';
    patch.initialCapitalUsd = capitalUsd;
    patch.capitalCurrency = currency;

    onApplySettings(patch, profileTitle, capitalUsd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141418] border border-[#2e2e38] rounded-[26px] p-5 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#71717a] hover:text-[#f4f4f5] p-1.5 rounded-lg bg-[#1c1c22] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-mono text-[#60a5fa] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>แบบสอบถามวิเคราะห์พอร์ต &amp; ช่วยตั้งค่าอัตโนมัติ (Portfolio Sizing Quiz)</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[#f4f4f5] tracking-tight">
          บอกขนาดเงินทุนและสไตล์ของคุณ ให้ระบบคำนวณและตั้งค่าบอทให้ทันที
        </h3>
        <p className="text-xs text-[#a1a1aa] mt-0.5">
          ระบบจะคำนวณขนาดไม้ที่เหมาะสม (Position Size), เพดานความเสี่ยง (Max Drawdown) และเกณฑ์ความมั่นใจให้สอดคล้องกับเงินทุนของคุณ
        </p>

        <div className="space-y-4 mt-5 overflow-y-auto flex-1 pr-1 text-xs">
          {/* Question 1: Capital Amount & Currency */}
          <div className="p-4 rounded-2xl bg-[#18181f] border border-[#272733] space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#f4f4f5] flex items-center gap-1.5 text-xs sm:text-sm">
                <Wallet className="w-4 h-4 text-[#60a5fa]" />
                <span>1. ตอนนี้ในพอร์ตของคุณมีเงินทุนประมาณเท่าไหร่?</span>
              </label>

              {/* Currency Selector */}
              <div className="flex items-center gap-1 p-0.5 bg-[#121216] rounded-lg border border-[#2b2b36]">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('THB');
                    if (capitalInput < 1000) setCapitalInput(30000);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                    currency === 'THB' ? 'bg-[#1e293b] text-[#60a5fa]' : 'text-[#71717a]'
                  }`}
                >
                  บาท (THB ฿)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD');
                    if (capitalInput > 50000) setCapitalInput(1000);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                    currency === 'USD' ? 'bg-[#1e293b] text-[#60a5fa]' : 'text-[#71717a]'
                  }`}
                >
                  ดอลลาร์ (USDT $)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={100}
                step={currency === 'THB' ? 1000 : 50}
                value={capitalInput}
                onChange={(e) => setCapitalInput(Math.max(10, parseFloat(e.target.value) || 0))}
                className="flex-1 bg-[#121216] border border-[#2e2e3a] rounded-xl px-4 py-2.5 text-sm sm:text-base font-mono font-bold text-[#f4f4f5] focus:outline-none focus:border-[#60a5fa]"
              />
              <span className="font-mono text-xs font-semibold text-[#a1a1aa] whitespace-nowrap">
                {currency === 'THB' ? 'บาทไทย' : 'USDT'}
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 pt-0.5 overflow-x-auto">
              <span className="text-[11px] text-[#71717a]">กดเลือกด่วน:</span>
              {(currency === 'THB' ? [5000, 10000, 30000, 50000, 100000] : [100, 300, 500, 1000, 3000]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCapitalInput(preset)}
                  className="px-2.5 py-1 rounded-lg bg-[#202029] hover:bg-[#2b2b38] text-[11px] font-mono text-[#d4d4d8] cursor-pointer"
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Risk Appetite */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#e4e4e7] block">
              2. ระดับความเสี่ยงที่คุณรับได้มากที่สุด?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'LOW', title: 'เน้นปลอดภัยสูง', desc: 'กลัวเงินต้นหาย มั่นใจ 80%+ ค่อยเข้า' },
                { id: 'BALANCED', title: 'สมดุล (แนะนำ)', desc: 'เข้าตามระบบ แม่น 70% พอร์ตโตเรื่อยๆ' },
                { id: 'HIGH', title: 'เน้นโตไวกล้าเสี่ยง', desc: 'เปิดบ่อย ไม้ใหญ่ ยอมรับเหวี่ยงได้' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRiskAppetite(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    riskAppetite === opt.id
                      ? 'bg-[#1e273f] border-[#60a5fa] text-[#f4f4f5]'
                      : 'bg-[#18181d] border-[#292933] text-[#a1a1aa] hover:border-[#3d3d4b]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#f4f4f5]">{opt.title}</span>
                  <span className="text-[10px] text-[#71717a] mt-1 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Frequency / Model */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#e4e4e7] block">
              3. สไตล์รอบการเทรดที่คุณต้องการ?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'TREND', title: 'เกาะเทรนด์ใหญ่', desc: 'ถือตามแนวโน้ม ใช้ Transformer' },
                { id: 'SCALP', title: 'สไนเปอร์สั้นๆ', desc: 'เฝ้า Bid/Ask Orderbook ไวๆ' },
                { id: 'RELAXED', title: 'ราคากลับสู่ค่าเฉลี่ย', desc: 'ดักซื้อตอนราคาหลุดกรอบสถิติ' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFrequency(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    frequency === opt.id
                      ? 'bg-[#1e273f] border-[#60a5fa] text-[#f4f4f5]'
                      : 'bg-[#18181d] border-[#292933] text-[#a1a1aa] hover:border-[#3d3d4b]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#f4f4f5]">{opt.title}</span>
                  <span className="text-[10px] text-[#71717a] mt-1 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Exchanges List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#e4e4e7] block">
              4. เลือกกระดานเทรดหลักที่คุณจะนำไปใช้?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_EXCHANGES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setExchangeChoice(ex.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    exchangeChoice === ex.id
                      ? 'bg-[#1e273f] border-[#60a5fa] text-[#f4f4f5]'
                      : 'bg-[#18181d] border-[#292933] text-[#a1a1aa] hover:border-[#3d3d4b]'
                  }`}
                >
                  <div className="font-semibold text-xs truncate">{ex.id}</div>
                  <div className="text-[10px] text-[#71717a] mt-0.5">{ex.country} · {ex.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 pt-3 border-t border-[#23232c] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleCalculateAndApply}
            className="px-5 py-2.5 text-xs font-bold text-[#0e0e11] bg-[#60a5fa] hover:bg-[#93c5fd] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>คำนวณขนาดไม้ &amp; บันทึกการตั้งค่าทันที</span>
          </button>
        </div>
      </div>
    </div>
  );
};
