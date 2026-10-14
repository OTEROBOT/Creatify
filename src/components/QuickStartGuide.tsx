import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Play, CheckCircle2, ArrowRight, ShieldCheck, Zap, Bell, LineChart } from 'lucide-react';

interface QuickStartGuideProps {
  language: 'TH' | 'EN';
  onQuickSimulate: () => void;
  onJumpToStage: (stageId: number) => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  language,
  onQuickSimulate,
  onJumpToStage,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) {
    return (
      <div className="w-full bg-[#141417] border border-[#27272c] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1e293b] text-[#60a5fa] flex items-center justify-center font-bold text-sm">
            ?
          </div>
          <div>
            <div className="text-sm font-semibold text-[#f4f4f5]">
              {language === 'TH' ? 'คู่มือสำหรับมือใหม่: ระบบนี้คืออะไร & ใช้งานอย่างไร?' : 'Beginner Guide: What is this system & How to use it?'}
            </div>
            <div className="text-xs text-[#a1a1aa]">
              {language === 'TH' ? 'คลิกเปิดดูคำอธิบายทีละขั้นตอนอย่างเข้าใจง่าย' : 'Click to expand the 3-step interactive onboarding guide'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-1.5 text-xs font-medium text-[#f4f4f5] bg-[#1e293b] hover:bg-[#28374f] rounded-lg transition-colors cursor-pointer"
        >
          {language === 'TH' ? 'เปิดคู่มือ' : 'Show Guide'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#090b14] border border-[#1e2238] rounded-[26px] p-6 sm:p-7 relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#1b1f33]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-pink-400" />
            <span>
              {language === 'TH' ? 'สรุปเข้าใจง่ายใน 1 นาที (สำหรับผู้เริ่มต้น)' : '1-Minute Visual Explainer for Beginners'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4f4f5] mt-1.5">
            {language === 'TH'
              ? 'ระบบนี้คืออะไร และคุณกำลังดูอะไรอยู่?'
              : 'What is this system and what does it do?'}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#9ca3af] max-w-3xl leading-relaxed">
            {language === 'TH'
              ? 'หน้านี้คือ "ศูนย์ควบคุมและจำลองหุ่นยนต์เทรดอัตโนมัติ (Algorithmic Trading Bot)" ที่โชว์ขั้นตอนการคิดและการส่งคำสั่งตั้งแต่ต้นจนจบ 6 ขั้นตอน เหมือนสายพานโรงงาน'
              : 'This is an end-to-end Algorithmic Trading Bot Workbench that shows how an automated trading engine receives prices, analyzes data with AI, guards risk, and places orders.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-[#9ca3af] hover:text-[#f4f4f5] px-2.5 py-1 rounded-lg bg-[#121524] hover:bg-[#1a1f33] border border-[#232840] cursor-pointer btn-micro transition-all"
        >
          {language === 'TH' ? 'ซ่อนคู่มือ' : 'Dismiss'}
        </button>
      </div>

      {/* 3 Step Interactive Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {/* Step 1 */}
        <div
          onClick={() => setActiveStep(1)}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer btn-micro ${
            activeStep === 1
              ? 'bg-gradient-to-b from-[#181a33] to-[#101222] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
              : 'bg-[#0d101c] border-[#1e2338] hover:border-purple-500/40 hover:bg-[#121626]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-purple-300 font-bold">STEP 01</span>
            <LineChart className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '1. ดูสายพาน 6 ขั้นตอน (ฝั่งซ้าย)' : '1. Inspect the 6 Stages'}
          </h3>
          <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
            {language === 'TH'
              ? 'เริ่มจากรับราคาตลาดสด (1-2) -> ส่งต่อให้ AI คิดสัญญาณ (3) -> ผ่านด่านความเสี่ยง (4) -> ยิงคำสั่งซื้อ (5-6) คลิกเลือกแต่ละก้อนเพื่อดูหน้าที่และปรับแต่ง'
              : 'Flow starts at Exchange Intake -> Preprocessing -> AI Strategy -> Risk Guard -> Execution -> Webhook alerts.'}
          </p>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => setActiveStep(2)}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer btn-micro ${
            activeStep === 2
              ? 'bg-gradient-to-b from-[#181a33] to-[#101222] border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-1 ring-pink-400'
              : 'bg-[#0d101c] border-[#1e2338] hover:border-pink-500/40 hover:bg-[#121626]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-pink-300 font-bold">STEP 02</span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '2. ทดสอบให้บอทเริ่มทำงาน (ฝั่งขวา)' : '2. Run Live Automation'}
          </h3>
          <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
            {language === 'TH'
              ? 'ระบบตั้งค่าเป็น "Paper Mode (เทรดจำลอง)" ปลอดภัย 100% เงินไม่หาย คุณสามารถกดปุ่ม "ทดสอบยิง 1 ออเดอร์" เพื่อดูว่าคำสั่งไหลผ่านทั้ง 6 ขั้นตอนอย่างไร'
              : 'Starts in 100% safe Paper Mode. Click "Trigger Signal" to watch a live order pass through every filter.'}
          </p>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => setActiveStep(3)}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer btn-micro ${
            activeStep === 3
              ? 'bg-gradient-to-b from-[#181a33] to-[#101222] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-400'
              : 'bg-[#0d101c] border-[#1e2338] hover:border-blue-500/40 hover:bg-[#121626]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-blue-300 font-bold">STEP 03</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '3. ถ้าต้องการต่อใช้งานจริง' : '3. Go Live When Ready'}
          </h3>
          <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
            {language === 'TH'
              ? 'ไปที่แท็บ "การตั้งค่าจริง & API" เพื่อใส่ Binance API Key หรือใส่ Discord Webhook URL ให้บอทส่งข้อความแจ้งเตือนเข้ามือถือของคุณทันทีที่มีการซื้อขาย'
              : 'Connect your Binance API Keys or Discord Webhook to receive instant execution alerts to your phone.'}
          </p>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="mt-5 pt-4 border-t border-[#1b1f33] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-purple-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'TH'
              ? 'คำแนะนำด่วน: ลองกดปุ่มด้านขวา เพื่อสั่งบอทจำลองการประมวลผล 1 รอบทันที'
              : 'Quick action: Click the button to trigger a test order through all 6 stages right now!'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onJumpToStage(3)}
            className="px-3 py-1.5 text-xs font-medium text-[#d4d4d8] hover:text-white bg-[#121524] hover:bg-[#1a1f33] border border-[#232840] rounded-xl transition-all cursor-pointer btn-micro"
          >
            {language === 'TH' ? 'ดูโมเดล AI (Stage 3)' : 'Inspect AI Model (Stage 3)'}
          </button>
          <button
            type="button"
            onClick={onQuickSimulate}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 border border-purple-400/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] btn-micro active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'TH' ? 'กดทดลองส่ง 1 ออเดอร์ทันที' : 'Try 1 Test Order Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
