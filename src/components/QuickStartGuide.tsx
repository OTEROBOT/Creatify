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
    <div className="w-full bg-gradient-to-br from-[#141722] via-[#141418] to-[#121215] border border-[#2b354f] rounded-[24px] p-6 sm:p-7 relative overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#232738]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#60a5fa] font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>
              {language === 'TH' ? 'สรุปเข้าใจง่ายใน 1 นาที (สำหรับผู้เริ่มต้น)' : '1-Minute Visual Explainer for Beginners'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4f4f5] mt-1.5">
            {language === 'TH'
              ? 'ระบบนี้คืออะไร และคุณกำลังดูอะไรอยู่?'
              : 'What is this system and what does it do?'}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed">
            {language === 'TH'
              ? 'หน้านี้คือ "ศูนย์ควบคุมและจำลองหุ่นยนต์เทรดอัตโนมัติ (Algorithmic Trading Bot)" ที่โชว์ขั้นตอนการคิดและการส่งคำสั่งตั้งแต่ต้นจนจบ 6 ขั้นตอน เหมือนสายพานโรงงาน'
              : 'This is an end-to-end Algorithmic Trading Bot Workbench that shows how an automated trading engine receives prices, analyzes data with AI, guards risk, and places orders.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-[#71717a] hover:text-[#d4d4d8] px-2.5 py-1 rounded-md bg-[#1a1a20] cursor-pointer"
        >
          {language === 'TH' ? 'ซ่อนคู่มือ' : 'Dismiss'}
        </button>
      </div>

      {/* 3 Step Interactive Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {/* Step 1 */}
        <div
          onClick={() => setActiveStep(1)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeStep === 1
              ? 'bg-[#1b2338] border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.15)]'
              : 'bg-[#121216] border-[#222228] hover:border-[#383844]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#60a5fa] font-bold">STEP 01</span>
            <LineChart className="w-4 h-4 text-[#71717a]" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '1. ดูสายพาน 6 ขั้นตอน (ฝั่งซ้าย)' : '1. Inspect the 6 Stages'}
          </h3>
          <p className="mt-1.5 text-xs text-[#a1a1aa] leading-relaxed">
            {language === 'TH'
              ? 'เริ่มจากรับราคาตลาดสด (1-2) -> ส่งต่อให้ AI คิดสัญญาณ (3) -> ผ่านด่านความเสี่ยง (4) -> ยิงคำสั่งซื้อ (5-6) คลิกเลือกแต่ละก้อนเพื่อดูหน้าที่และปรับแต่ง'
              : 'Flow starts at Exchange Intake -> Preprocessing -> AI Strategy -> Risk Guard -> Execution -> Webhook alerts.'}
          </p>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => setActiveStep(2)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeStep === 2
              ? 'bg-[#1b2338] border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.15)]'
              : 'bg-[#121216] border-[#222228] hover:border-[#383844]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#60a5fa] font-bold">STEP 02</span>
            <Zap className="w-4 h-4 text-[#71717a]" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '2. ทดสอบให้บอทเริ่มทำงาน (ฝั่งขวา)' : '2. Run Live Automation'}
          </h3>
          <p className="mt-1.5 text-xs text-[#a1a1aa] leading-relaxed">
            {language === 'TH'
              ? 'ระบบตั้งค่าเป็น "Paper Mode (เทรดจำลอง)" ปลอดภัย 100% เงินไม่หาย คุณสามารถกดปุ่ม "ทดสอบยิง 1 ออเดอร์" เพื่อดูว่าคำสั่งไหลผ่านทั้ง 6 ขั้นตอนอย่างไร'
              : 'Starts in 100% safe Paper Mode. Click "Trigger Signal" to watch a live order pass through every filter.'}
          </p>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => setActiveStep(3)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeStep === 3
              ? 'bg-[#1b2338] border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.15)]'
              : 'bg-[#121216] border-[#222228] hover:border-[#383844]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#60a5fa] font-bold">STEP 03</span>
            <ShieldCheck className="w-4 h-4 text-[#71717a]" />
          </div>
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            {language === 'TH' ? '3. ถ้าต้องการต่อใช้งานจริง' : '3. Go Live When Ready'}
          </h3>
          <p className="mt-1.5 text-xs text-[#a1a1aa] leading-relaxed">
            {language === 'TH'
              ? 'ไปที่แท็บ "การตั้งค่าจริง & API" เพื่อใส่ Binance API Key หรือใส่ Discord Webhook URL ให้บอทส่งข้อความแจ้งเตือนเข้ามือถือของคุณทันทีที่มีการซื้อขาย'
              : 'Connect your Binance API Keys or Discord Webhook to receive instant execution alerts to your phone.'}
          </p>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="mt-5 pt-4 border-t border-[#232738] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#93c5fd] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
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
            className="px-3 py-1.5 text-xs font-medium text-[#d4d4d8] hover:text-white bg-[#1a1a22] hover:bg-[#252530] rounded-lg transition-colors cursor-pointer"
          >
            {language === 'TH' ? 'ดูโมเดล AI (Stage 3)' : 'Inspect AI Model (Stage 3)'}
          </button>
          <button
            type="button"
            onClick={onQuickSimulate}
            className="px-4 py-1.5 text-xs font-bold text-[#0e0e11] bg-[#60a5fa] hover:bg-[#93c5fd] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'TH' ? 'กดทดลองส่ง 1 ออเดอร์ทันที' : 'Try 1 Test Order Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
