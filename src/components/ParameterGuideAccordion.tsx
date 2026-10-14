import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, RotateCcw, Sparkles } from 'lucide-react';

interface ParameterGuideAccordionProps {
  language: 'TH' | 'EN';
  onOpenQuiz: () => void;
  onResetDefaults: () => void;
}

export const ParameterGuideAccordion: React.FC<ParameterGuideAccordionProps> = ({
  language,
  onOpenQuiz,
  onResetDefaults,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="w-full bg-[#090b14] border border-[#1e2238] rounded-[24px] overflow-hidden transition-all shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Header bar with Toggle & Quick Actions */}
      <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 bg-[#0d101c] border-b border-[#1b1f33]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
              <span>
                {language === 'TH'
                  ? 'คู่มืออธิบายการปรับแต่งพารามิเตอร์ (Parameter Explanation Guide)'
                  : 'Parameter Tuning Guide & Explanations'}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-0.5 ml-2 cursor-pointer font-medium transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span>ซ่อนรายละเอียด</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>แสดงรายละเอียด</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">
              {language === 'TH'
                ? 'คำอธิบายของแต่ละปุ่มปรับในก้อน 3, 4, 5 อย่างละเอียด เพื่อให้เข้าใจก่อนตั้งค่าจริง'
                : 'Understand what Confidence Hurdle, Max Drawdown, Kelly Sizing, and Algos mean.'}
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons: Take Quiz Anytime + Reset to Defaults */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 border border-purple-400/40 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] btn-micro active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>{language === 'TH' ? 'ทำแบบสอบถามช่วยตั้งค่าอัตโนมัติ' : 'Take Auto-Config Quiz'}</span>
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3 py-1.5 text-xs font-medium text-[#9ca3af] hover:text-[#f4f4f5] bg-[#121524] hover:bg-[#1a1f33] border border-[#232840] rounded-xl flex items-center gap-1 transition-all cursor-pointer btn-micro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'TH' ? 'รีเซ็ตค่ามาตรฐาน' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Explanation Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs leading-relaxed divide-y md:divide-y-0 md:divide-x divide-[#23232b]">
          {/* Section 1: Stage 3 AI Strategy */}
          <div className="space-y-3 pt-3 md:pt-0">
            <div className="flex items-center gap-2 font-mono font-bold text-[#60a5fa] text-xs">
              <span className="w-5 h-5 rounded-full bg-[#172554] flex items-center justify-center text-[11px]">3</span>
              <span>AI STRATEGY ENGINE</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  เกณฑ์ความมั่นใจขั้นต่ำ (Confidence Hurdle %)
                </span>
                <p className="text-[#a1a1aa] text-[11.5px] mt-0.5">
                  <strong className="text-[#d4d4d8]">ความหมาย:</strong> คือ &ldquo;ระดับความชัวร์ของ AI&rdquo; ก่อนที่จะกล้าส่งสัญญาณเปิดออเดอร์
                </p>
                <div className="mt-1 p-2 rounded-lg bg-[#17171d] border border-[#262630] space-y-1 text-[11px]">
                  <div className="text-[#e4e4e7]">
                    • <span className="text-[#f59e0b]">ตั้ง 50% - 60%:</span> บอทจะเทรดบ่อย มีสัญญาณนิดหน่อยก็เข้าทันที (เหมาะกับช่วงตลาดเหวี่ยง แต่ความเสี่ยงสูงขึ้น)
                  </div>
                  <div className="text-[#e4e4e7]">
                    • <span className="text-[#4ade80]">ตั้ง 70% - 80% (แนะนำ):</span> บอทจะคัดเฉพาะจังหวะที่มีโอกาสชนะสูงจริงๆ เท่านั้น ออเดอร์อาจจะเข้าน้อยลงแต่แม่นยำขึ้น
                  </div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  ประเภทโมเดล AI (ML Ensemble Type)
                </span>
                <ul className="text-[11px] text-[#a1a1aa] space-y-1 mt-1">
                  <li>
                    • <strong className="text-[#93b4fa]">XGBoost + Transformer:</strong> เหมาะกับตลาดที่มีเทรนด์ชัดเจน จับการเคลื่อนไหวของราคาและโมเมนตัม
                  </li>
                  <li>
                    • <strong className="text-[#93b4fa]">DeepLOB Orderbook:</strong> วิเคราะห์แรงซื้อแรงขายในช่อง Bid/Ask (Orderbook Imbalance) เหมาะกับการเทรดสั้น (Scalping)
                  </li>
                  <li>
                    • <strong className="text-[#93b4fa]">Statistical Arbitrage:</strong> จับจังหวะราคาหลุดกรอบแล้วดีดกลับเข้าหาค่าเฉลี่ย (Mean Reversion)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Stage 4 Risk Management */}
          <div className="space-y-3 pt-3 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 font-mono font-bold text-[#f59e0b] text-xs">
              <span className="w-5 h-5 rounded-full bg-[#422006] flex items-center justify-center text-[11px]">4</span>
              <span>RISK MANAGEMENT</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  เพดานขาดทุนสูงสุดประจำวัน (Daily Max Drawdown %)
                </span>
                <p className="text-[#a1a1aa] text-[11.5px] mt-0.5">
                  <strong className="text-[#d4d4d8]">ความหมาย:</strong> คือ &ldquo;เบรกเกอร์ตัดไฟ&rdquo; ถ้าระหว่างวันเกิดเหตุไม่คาดฝัน แล้วพอร์ตขาดทุนติดลบถึงตัวเลขนี้ (เช่น 3.0%) ระบบจะ <strong>หยุดเทรดและบล็อกออเดอร์ใหม่ทันที</strong> เพื่อรักษาเงินต้นส่วนใหญ่ไว้
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  ตัวคูณขนาดไม้ตามสูตรเคลลี่ (Kelly Multiplier)
                </span>
                <p className="text-[#a1a1aa] text-[11.5px] mt-0.5">
                  <strong className="text-[#d4d4d8]">ความหมาย:</strong> ใช้คำนวณว่าควรลงเงินกี่บาทต่อ 1 ไม้ตามทฤษฎีความน่าจะเป็น (Kelly Criterion)
                </p>
                <div className="mt-1 p-2 rounded-lg bg-[#17171d] border border-[#262630] space-y-1 text-[11px]">
                  <div className="text-[#e4e4e7]">
                    • <span className="text-[#4ade80]">0.1x - 0.25x (แนะนำ):</span> ปลอดภัยสูง ลงเงินต่อไม้ประมาณ 5-10% ของพอร์ต แม้จะแพ้ติดกันหลายตาก็ไม่กระทบเงินต้น
                  </div>
                  <div className="text-[#e4e4e7]">
                    • <span className="text-[#f87171]">0.4x - 0.5x:</span> เล่นไม้ใหญ่ขึ้น กำไรเร็วขึ้น แต่ถ้าตลาดสวนทาง drawdown จะลึก
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Stage 5 Execution */}
          <div className="space-y-3 pt-3 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 font-mono font-bold text-[#4ade80] text-xs">
              <span className="w-5 h-5 rounded-full bg-[#052e16] flex items-center justify-center text-[11px]">5</span>
              <span>ORDER EXECUTION</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  ลักษณะการเคาะซื้อขาย (Execution Slicing Algo)
                </span>
                <ul className="text-[11px] text-[#a1a1aa] space-y-1.5 mt-1">
                  <li>
                    • <strong className="text-[#d4d4d8]">VWAP Post-Only Maker:</strong> ส่งคำสั่งแบบ Limit เพื่อรอจับคู่ (ได้ค่าธรรมเนียม Maker ถูกกว่า ไม่เสีย Slippage)
                  </li>
                  <li>
                    • <strong className="text-[#d4d4d8]">TWAP Micro-Slices:</strong> ซอยออเดอร์ใหญ่เป็นไม้ย่อยๆ ส่งทีละนิดทุกๆ ไม่กี่วินาที เพื่อไม่ให้ราคาในกระดานกระตุก
                  </li>
                  <li>
                    • <strong className="text-[#d4d4d8]">IOC Direct Fill:</strong> แมตช์ทันทีตามสภาพคล่องในตลาด สำหรับคนต้องการเข้าออเดอร์ไว
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-semibold text-[#f4f4f5] block">
                  Max Slippage (bps)
                </span>
                <p className="text-[#a1a1aa] text-[11.5px] mt-0.5">
                  <strong className="text-[#d4d4d8]">ความหมาย:</strong> ยอมให้ราคาคลาดเคลื่อนได้ไม่เกินกี่จุด (เช่น 3.5 bps = 0.035%) ถ้าราคาไหลเกินนี้ระบบจะยกเลิกทันทีเพื่อป้องกันการซื้อของแพงเกินจริง
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
