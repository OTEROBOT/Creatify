import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Bot, BellRing, Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksExplainerProps {
  language: 'TH' | 'EN';
  onOpenSettings: () => void;
}

export const HowItWorksExplainer: React.FC<HowItWorksExplainerProps> = ({
  language,
  onOpenSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/35 via-[#0c0e1a] to-blue-950/35 border border-purple-500/40 rounded-[26px] p-5 sm:p-7 shadow-[0_10px_35px_rgba(168,85,247,0.12)] transition-all">
      {/* Header bar with toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1e2338]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-blue-600/30 border border-purple-500/40 text-purple-200 flex items-center justify-center font-bold text-base shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            💡
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#f4f4f5] tracking-tight">
              {language === 'TH'
                ? 'ไขข้อข้องใจ: บอทตัวนี้ทำงานยังไง? (เทรดให้อัตโนมัติ หรือ ส่งซิกแนลให้เรากดเอง?)'
                : 'How It Works: Fully Automated Execution vs Signal Alerts'}
            </h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              {language === 'TH'
                ? 'คำตอบสั้นๆ ชัดเจนสำหรับคนที่เพิ่งเข้ามาและไม่รู้เรื่องมาก่อนเลย'
                : 'Clear plain-English explanation for total beginners'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-200 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/40 transition-all flex items-center gap-1.5 cursor-pointer btn-micro shadow-xs"
        >
          {isExpanded ? (
            <>
              <span>ซ่อนคำอธิบาย</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>กดเปิดอ่านคำอธิบาย</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Expandable Explanation Body */}
      {isExpanded && (
        <div className="mt-5 space-y-5 text-xs sm:text-sm text-[#d4d4d8] leading-relaxed">
          {/* Main Direct Answer Highlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0d101c] to-blue-950/40 border border-purple-500/40 space-y-3 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
            <div className="flex items-center gap-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
              <span className="text-base">🎯</span>
              <span>คำตอบชัดๆ: ระบบนี้เป็นได้ทั้ง 2 แบบ ขึ้นอยู่กับคุณเลือกใช้งาน!</span>
            </div>
            <p className="text-[#e4e4e7] text-xs sm:text-[13.5px]">
              &ldquo;แอปนี้คือ <strong>ระบบหุ่นยนต์เทรดอัตโนมัติเต็มรูปแบบ (Full Automated Bot)</strong> ที่ถูกสร้างขึ้นมาเพื่อให้คุณเลือกว่าจะให้มันจัดการให้เอง 100% หรือจะใช้มันเป็นผู้ช่วยส่งสัญญาณแจ้งเตือนเข้ามือถือ&rdquo;
            </p>
          </div>

          {/* 2 Ways Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Full Auto */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0c1612] to-[#070e0b] border border-emerald-500/40 space-y-2.5 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <Bot className="w-4 h-4" />
                <span>แบบที่ 1: ปล่อยให้บอทเทรดเองอัตโนมัติ 100% (รับเงินเข้ากระเป๋าเอง)</span>
              </div>
              <p className="text-xs text-[#9ca3af]">
                <strong>หลักการทำงาน:</strong> เมื่อคุณใส่ <strong>API Key ของกระดานเทรด (เช่น Bitkub หรือ Binance)</strong> และเปิดโหมด <strong>LIVE EXCHANGE</strong>
              </p>
              <ul className="text-xs space-y-1.5 text-[#d4d4d8] pl-2">
                <li>• บอทจะเฝ้าจอ 24 ชั่วโมง สแกนราคาตลอดเวลา</li>
                <li>• เมื่อ AI มั่นใจ ➔ <strong>บอทจะส่งคำสั่งซื้อและขายบนกระดานให้เองโดยที่คุณไม่ต้องกดอะไรเลย!</strong></li>
                <li>• กำไร/ขาดทุนจะเข้าพอร์ต Bitkub หรือ Binance ของคุณโดยตรง</li>
                <li>• ปลอดภัยด้วยด่านคุมความเสี่ยง (Risk Management) ที่จะสั่งหยุดอัตโนมัติถ้าตลาดเหวี่ยงเกินเกณฑ์</li>
              </ul>
            </div>

            {/* Mode 2: Signal / Semi-Auto */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#18142a] to-[#0f0c1a] border border-purple-500/40 space-y-2.5 shadow-[0_0_15px_rgba(168,85,247,0.08)]">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-300">
                <Smartphone className="w-4 h-4 text-pink-400" />
                <span>แบบที่ 2: ให้บอทเป็นผู้ช่วย &ldquo;เด้งเตือนเข้า LINE/Discord&rdquo; แล้วเรากดเอง</span>
              </div>
              <p className="text-xs text-[#9ca3af]">
                <strong>หลักการทำงาน:</strong> ถ้าคุณยังไม่อยากใส่ API Key ซื้อขายจริง หรืออยากตัดสินใจด้วยตัวเองก่อน
              </p>
              <ul className="text-xs space-y-1.5 text-[#d4d4d8] pl-2">
                <li>• เปิดบอททิ้งไว้ใน <strong>Paper Mode (โหมดจำลอง)</strong></li>
                <li>• ใส่ <strong>LINE Notify Token</strong> หรือ <strong>Discord Webhook</strong></li>
                <li>• เมื่อ AI สแกนเจอตลาดสวยๆ บอทจะ <strong>เด้งข้อความเข้ามือถือคุณทันที</strong> เช่น <em>&ldquo;🚨 BUY BTC ที่ราคา 91,400 บาท (มั่นใจ 78%)&rdquo;</em></li>
                <li>• คุณสามารถเปิดแอป Bitkub ในมือถือแล้วเข้าไปกดซื้อ/ขายตาม หรือกดปิดออเดอร์ตามที่คุณพอใจได้เลย!</li>
              </ul>
            </div>
          </div>

          {/* Practical Checklist: What to do now */}
          <div className="p-4 rounded-2xl bg-[#171c2a] border border-[#2a3c61] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#93c5fd] block">
                👉 สรุปสิ่งที่ควรทำตอนนี้สำหรับคนที่ไม่เคยใช้:
              </span>
              <span className="text-[#a1a1aa] mt-0.5 block">
                ให้คุณเล่นใน <strong>Paper Mode</strong> ตอนนี้ก่อน (เงินสมมติ $10,000 ปลอดภัย 100%) ลองกดปุ่มสีฟ้า <strong>&ldquo;ทดลองส่ง 1 ออเดอร์ทันที&rdquo;</strong> เพื่อดูการทำงานของมัน เมื่อเข้าใจระบบค่อยไปใส่ LINE หรือ API เพื่อใช้งานจริงครับ
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#283852] text-[#f4f4f5] border border-[#3d537e] font-semibold transition-colors cursor-pointer shrink-0"
            >
              ไปที่หน้าตั้งค่า API &amp; LINE Notify →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
