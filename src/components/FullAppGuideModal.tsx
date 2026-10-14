import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, KeyRound, Wifi, Play, History, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react';

interface FullAppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'TH' | 'EN';
}

export const FullAppGuideModal: React.FC<FullAppGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'bot' | 'history' | 'apiguide' | 'sync' | 'radar' | 'chartguide'>('status');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#090b14] border border-[#1e2238] rounded-[28px] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] shadow-purple-950/20 relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1b1f33] shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4 text-pink-400" />
              <span>คู่มือไขข้อข้องใจแบบละเอียด (Comprehensive App Guide)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#f4f4f5] tracking-tight">
              รวมทุกคำอธิบายในแอป &amp; วิธีนำ API และ Token มาใส่ทีละขั้นตอน
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#9ca3af] hover:text-[#f4f4f5] px-3 py-1.5 rounded-xl bg-[#121524] hover:bg-[#1a1f33] border border-[#232840] cursor-pointer btn-micro transition-all"
          >
            ปิดหน้าต่าง ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0d101c] rounded-xl border border-[#1e2238] mt-4 shrink-0 overflow-x-auto">
          {[
            { id: 'status', label: '1. ไฟสถานะ Binance Live / Synthetic' },
            { id: 'bot', label: '2. ปุ่ม "หยุดบอท" คืออะไร' },
            { id: 'history', label: '3. "ประวัติทั้ง 6 ขั้นตอน" คืออะไร' },
            { id: 'apiguide', label: '4. วิธีเอา Bitkub API & LINE Notify' },
            { id: 'sync', label: '5. จำเหรียญดาว & ซิงค์มือถือ/iPad' },
            { id: 'radar', label: '6. แนะนำเหรียญ วัน/เดือน/ปี/ตลอดกาล' },
            { id: 'chartguide', label: '7. กราฟสด & จุดปิดเมื่อได้เงินพอ/ขาดทุน' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-950/70 to-blue-950/70 text-purple-200 font-bold border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#131626]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="mt-4 overflow-y-auto flex-1 pr-1 text-xs leading-relaxed text-[#d4d4d8] space-y-4">
          {activeTab === 'status' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f5]">
                <Wifi className="w-4 h-4 text-[#4ade80]" />
                <span>ที่กระพริบ &ldquo;Binance Live&rdquo; กับ &ldquo;Synthetic Feed&rdquo; คืออะไร?</span>
              </div>
              <p>
                มันคือ <strong>&ldquo;ไฟสถานะการรับข้อมูลราคาตลาด (Data Feed Source)&rdquo;</strong> ที่มุมขวาบนของเว็บ:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#131b14] border border-[#22542a] rounded-xl space-y-1">
                  <div className="font-bold text-[#4ade80] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                    Binance Live (สีเขียว)
                  </div>
                  <p className="text-[#a1a1aa] text-[11.5px]">
                    แปลว่าเว็บต่อเชื่อม <strong>WebSocket สดตรงกับ Binance สำเร็จ</strong> ข้อมูลราคา Bitcoin ที่ขยับในหน้าจอคือราคาจับคู่ซื้อขายจริงในตลาดโลกวินาทีต่อวินาที
                  </p>
                </div>

                <div className="p-3 bg-[#241c14] border border-[#5c3e1e] rounded-xl space-y-1">
                  <div className="font-bold text-[#f59e0b] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                    Synthetic Feed (สีส้ม)
                  </div>
                  <p className="text-[#a1a1aa] text-[11.5px]">
                    เกิดขึ้นเมื่อเบราว์เซอร์หรือเครือข่ายบล็อกการต่อ WebSocket สด ระบบจะเปิด <strong>ระบบสร้างราคาจำลองเสมือนจริงอัตโนมัติ (Synthetic Fallback)</strong> ทันที เพื่อให้คุณทดสอบบอทต่อได้โดยไม่ค้าง
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bot' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f5]">
                <Play className="w-4 h-4 text-[#60a5fa]" />
                <span>ปุ่ม &ldquo;หยุดบอท / เริ่มบอทอัตโนมัติ&rdquo; มีไว้ทำไม?</span>
              </div>
              <p>
                ปกติหุ่นยนต์เทรดจะทำงานแบบ <strong>&ldquo;Loop อัตโนมัติ&rdquo;</strong> วนตรวจสอบราคาทุกๆ 4-5 วินาทีตลอด 24 ชั่วโมง:
              </p>
              <ul className="space-y-2 pl-2">
                <li>
                  • <strong className="text-[#f87171]">เมื่อกด &ldquo;หยุดบอท (Pause Loop)&rdquo;:</strong> บอทจะหยุดการยิงออเดอร์อัตโนมัติชั่วคราว เหมาะสำหรับเวลาที่คุณอยากหยุดดูสถิติ นั่งอ่านคำอธิบาย หรือกำลังแก้ไขพารามิเตอร์
                </li>
                <li>
                  • <strong className="text-[#4ade80]">เมื่อกด &ldquo;เริ่มบอทอัตโนมัติ (Start Auto Loop)&rdquo;:</strong> บอทจะกลับมาทำงานเฝ้าตลาดอัตโนมัติ เมื่อไหร่ที่ AI เจอสัญญาณสวยๆ และผ่านยามคุมความเสี่ยง บอทจะเปิดออเดอร์ให้เองทันที
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f5]">
                <History className="w-4 h-4 text-[#93b4fa]" />
                <span>แท็บ &ldquo;ประวัติทั้ง 6 ขั้นตอน (Pipeline Audit Trail)&rdquo; คืออะไร?</span>
              </div>
              <p>
                แท็บนี้เปรียบเสมือน <strong>&ldquo;กล่องดำบันทึกการบิน (Flight Data Recorder)&rdquo;</strong> ของบอท:
              </p>
              <div className="space-y-1.5 p-3 rounded-xl bg-[#111116] border border-[#23232b]">
                <div>• บันทึกทุกครั้งที่มีราคาเข้ามา (Stage 1)</div>
                <div>• บันทึกค่าคำนวณ Z-score และ RSI ที่สกัดออกมา (Stage 2)</div>
                <div>• บันทึกว่า AI ให้คะแนนความมั่นใจกี่ % และให้เหตุผลอะไร (Stage 3)</div>
                <div>• บันทึกว่า ยามคุมความเสี่ยงตรวจผ่าน หรือ สั่งระงับเพราะอะไร (Stage 4)</div>
                <div>• บันทึกรายละเอียดการจับคู่ ราคาเฉลี่ยที่ได้ และ Slippage (Stage 5)</div>
                <div>• บันทึกการส่งแจ้งเตือนเข้า Discord/LINE (Stage 6)</div>
              </div>
              <p className="text-[#93c5fd]">
                👉 คุณสามารถ <strong>คลิกที่แถวประวัติใดก็ได้</strong> ในตาราง หน้าจอจะสลับไปโฟกัสที่ขั้นตอน (Stage) นั้นๆ ให้ดูทันที!
              </p>
            </div>
          )}

          {activeTab === 'apiguide' && (
            <div className="space-y-4">
              {/* Bitkub Tutorial */}
              <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#4ade80] flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    วิธีเอา Bitkub API Key &amp; API Secret มาใส่
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#102416] text-[#4ade80] border border-[#22542a]">
                    กระดานไทย
                  </span>
                </div>
                <ol className="space-y-1.5 pl-4 list-decimal text-[#d4d4d8] text-[11.5px]">
                  <li>เข้าสู่ระบบเว็บไซต์ <strong>bitkub.com</strong> บนคอมพิวเตอร์หรือมือถือ</li>
                  <li>คลิกที่รูปโปรไฟล์มุมขวาบน ➔ เลือกเมนู <strong>&ldquo;การตั้งค่าบัญชี (Account Settings)&rdquo;</strong></li>
                  <li>เลือกแถบ <strong>&ldquo;การจัดการ API (API Management)&rdquo;</strong> ทางด้านซ้าย</li>
                  <li>กดปุ่ม <strong>&ldquo;สร้าง API Key ใหม่ (Create API Key)&rdquo;</strong> ➔ ตั้งชื่อ เช่น <code>AutoTradingBot</code></li>
                  <li>
                    <strong className="text-[#f59e0b]">⚠️ ขั้นตอนสำคัญด้านความปลอดภัย:</strong>
                    <br />
                    • ติ๊กถูกที่: <strong>&ldquo;อ่านข้อมูล (Read)&rdquo;</strong> และ <strong>&ldquo;ซื้อขาย (Trade)&rdquo;</strong>
                    <br />
                    • <strong className="text-[#f87171]">ห้ามติ๊ก &ldquo;ถอนเงิน (Withdraw)&rdquo; เด็ดขาด!</strong> (เพื่อความปลอดภัย เงินจะออกจากบัญชีไม่ได้)
                  </li>
                  <li>กดยืนยันด้วยรหัส 2FA ➔ คัดลอก <strong>API Key</strong> และ <strong>API Secret</strong> นำมาวางในแท็บ &ldquo;การตั้งค่าจริง &amp; API&rdquo; ของเว็บนี้</li>
                </ol>
              </div>

              {/* LINE Notify Tutorial */}
              <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#60a5fa] flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    วิธีเอา LINE Notify Access Token มาใส่
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#12233f] text-[#60a5fa] border border-[#24497e]">
                    แจ้งเตือนเข้ามือถือฟรี
                  </span>
                </div>
                <ol className="space-y-1.5 pl-4 list-decimal text-[#d4d4d8] text-[11.5px]">
                  <li>เปิดเบราว์เซอร์เข้าไปที่เว็บ <strong>notify-bot.line.me</strong></li>
                  <li>กดปุ่ม <strong>&ldquo;เข้าสู่ระบบ (Log in)&rdquo;</strong> ด้วยบัญชี LINE ของคุณ</li>
                  <li>คลิกที่ชื่อโปรไฟล์มุมขวาบน ➔ เลือก <strong>&ldquo;หน้าของฉัน (My page)&rdquo;</strong></li>
                  <li>เลื่อนลงมาด้านล่างสุด จะเจอปุ่มสีเขียว <strong>&ldquo;ออก Token (Generate token)&rdquo;</strong> ให้กดปุ่มนี้</li>
                  <li>ตั้งชื่อการแจ้งเตือน เช่น <code>Bot-Alert</code> และเลือกห้องแชท (เช่น แชทส่วนตัว 1-on-1 หรือกลุ่มที่ต้องการให้เด้ง)</li>
                  <li>กดออก Token ➔ คุณจะได้รหัสตัวอักษรยาวๆ ➔ กดปุ่ม <strong>&ldquo;คัดลอก (Copy)&rdquo;</strong> แล้วนำมาวางในช่อง LINE Notify Token ได้ทันที!</li>
                </ol>
              </div>

              {/* Discord Webhook Tutorial */}
              <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-2">
                <span className="font-bold text-sm text-[#93b4fa] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  วิธีเอา Discord Webhook URL มาใส่
                </span>
                <p className="text-[11.5px] text-[#a1a1aa]">
                  ในโปรแกรม Discord ➔ คลิกขวาที่ห้องแชทของคุณ ➔ เลือก <strong>Edit Channel (แก้ไขช่อง)</strong> ➔ ไปที่ <strong>Integrations</strong> ➔ เลือก <strong>Webhooks</strong> ➔ กด <strong>New Webhook</strong> ➔ กด <strong>Copy Webhook URL</strong> แล้วนำมาวาง
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-4">
              <div className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
                <span>📱 กดดาวแล้วจะจำยังไง? และจะเอาไปใช้ในมือถือหรือ iPad ได้อย่างไร?</span>
              </div>

              <div className="p-3 bg-[#111622] border border-[#233554] rounded-xl space-y-2">
                <div className="font-bold text-[#60a5fa] text-xs">
                  1. ในเครื่องปัจจุบันที่คุณกำลังใช้งาน:
                </div>
                <p className="text-[11.5px] text-[#cbd5e1] leading-relaxed">
                  ระบบจะบันทึกเหรียญที่คุณกดดาว ⭐ รวมถึงการตั้งค่าบอททั้งหมดลงใน <strong>เบราว์เซอร์อัตโนมัติ (LocalStorage)</strong> ทันทีที่คุณกด ไม่ต้องกังวลว่ารีเฟรชหน้าจอ (F5) หรือปิดคอมแล้วจะหาย มันจะถูกจำไว้ในเครื่องนี้ตลอดไป
                </p>
              </div>

              <div className="p-3 bg-[#171926] border border-[#2f354f] rounded-xl space-y-2">
                <div className="font-bold text-[#a78bfa] text-xs">
                  2. ถ้าต้องการนำไปเปิดต่อในมือถือ หรือ iPad:
                </div>
                <p className="text-[11.5px] text-[#cbd5e1] leading-relaxed">
                  เพราะมือถือกับคอมพิวเตอร์เป็นคนละเครื่องกัน คุณสามารถย้ายข้อมูลไปได้ง่ายๆ ใน 2 ขั้นตอน:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11.5px] text-[#94a3b8]">
                  <li>
                    กดปุ่ม <strong>&ldquo;📱 ซิงค์ข้ามมือถือ / iPad&rdquo;</strong> ที่แถบด้านบน หรือที่กล่องรายการเหรียญ
                  </li>
                  <li>
                    กด <strong>&ldquo;คัดลอกลิงก์&rdquo;</strong> แล้วส่งลิงก์ไปเปิดใน Safari/Chrome บนมือถือ หรือ iPad ➔ ระบบจะดึงเหรียญดาวมาโชว์ให้ทันที 1 วินาที!
                  </li>
                  <li>
                    หรือกด <strong>&ldquo;คัดลอกรหัสโปรไฟล์ (Sync Code)&rdquo;</strong> นำไปวางในช่องนำเข้าบนมือถือได้เช่นกัน
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-4">
              <div className="text-sm font-bold text-[#f4f4f5] flex items-center gap-2">
                <span>🎯 ระบบแนะนำเหรียญน่าเทรดตามกรอบเวลา (วัน / เดือน / ปี / ตลอดกาล)</span>
              </div>
              <p className="text-[11.5px] text-[#cbd5e1]">
                เรดาร์วิเคราะห์เหรียญ (Coin Recommendation Radar) จะคัดเลือกเหรียญน่าเทรดแยกตามลักษณะความเสี่ยงและรอบเวลา 4 แบบ:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                <div className="p-3 bg-[#241c0e] border border-[#593d14] rounded-xl space-y-1">
                  <div className="font-bold text-[#fbbf24]">☀️ แนะนำประจำวัน (Daily Picks)</div>
                  <p className="text-[#d4d4d8]">
                    เหมาะสำหรับบอทสไนเปอร์ / Scalping คัดเหรียญที่มี Volume พุ่งแรงใน 24 ชม. เช่น <strong>SOL, SUI, DOGE, PEPE</strong> กราฟเหวี่ยงแรงมีรอบเก็บกำไรรายวัน
                  </p>
                </div>

                <div className="p-3 bg-[#131b2e] border border-[#213764] rounded-xl space-y-1">
                  <div className="font-bold text-[#60a5fa]">🌙 แนะนำประจำเดือน (Monthly Trends)</div>
                  <p className="text-[#d4d4d8]">
                    เหมาะสำหรับบอท Trend Following และ Grid คัดเหรียญที่มีเทรนด์ 30 วันแข็งแกร่ง เช่น <strong>ETH, NEAR, RENDER, KUB</strong> มีปัจจัยหนุนระดับเดือน
                  </p>
                </div>

                <div className="p-3 bg-[#211633] border border-[#482875] rounded-xl space-y-1">
                  <div className="font-bold text-[#c084fc]">🏆 แนะนำประจำปี (Yearly Growth)</div>
                  <p className="text-[#d4d4d8]">
                    เหรียญที่มีโครงสร้างพื้นฐานระดับแถวหน้า เติบโตมั่นคงตลอดทั้งปี เช่น <strong>BTC, SOL, BNB, LINK</strong> ทนทานทุกสภาพตลาด
                  </p>
                </div>

                <div className="p-3 bg-[#0d2319] border border-[#174e37] rounded-xl space-y-1">
                  <div className="font-bold text-[#34d399]">💎 ตลอดกาล / บลูชิปปลอดภัย (All-Time)</div>
                  <p className="text-[#d4d4d8]">
                    เหรียญราชาที่ไม่เคยตาย สภาพคล่องโลกอันดับ 1 เช่น <strong>BTC, ETH, USDT</strong> เหมาะกับผู้เริ่มต้นหรือคนที่ต้องการปล่อยบอทระยะยาวแบบนอนหลับสบาย
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#111216] border border-[#21232e] rounded-xl text-[11.5px] text-[#93c5fd]">
                💡 <strong>เคล็ดลับ:</strong> คุณสามารถกดปุ่ม <strong>&ldquo;เลือกคู่นี้ให้บอทเทรดทันที&rdquo;</strong> หรือกดรูปดาว ⭐ ในแต่ละการ์ด เพื่อให้บอทสลับคู่เทรดได้ในคลิกเดียว!
              </div>
            </div>
          )}

          {activeTab === 'chartguide' && (
            <div className="p-4 rounded-2xl bg-[#18181f] border border-[#262630] space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f5]">
                <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                <span>การดูกราฟสด และทำความเข้าใจ: จะปิดตอนได้เงินพอหรือขาดทุน หรือปิดเองในไหน?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#121927] border border-[#254173] rounded-xl space-y-2">
                  <div className="font-bold text-[#93c5fd] flex items-center gap-1.5">
                    <span>🇹🇭 Bitkub (THB) vs 🌐 Binance (USDT)</span>
                  </div>
                  <p className="text-[#cbd5e1]">
                    คุณสามารถสลับกระดานเทรดได้ทันทีที่หัวมุมกราฟ:
                    <br />• <strong>Bitkub:</strong> ราคาวิ่งเป็นเงินบาทไทย (THB) เช่น ฿3,350,000 ต่อ 1 BTC
                    <br />• <strong>Binance:</strong> ราคาวิ่งเป็นดอลลาร์ดิจิทัล (USDT) เช่น $91,500 ต่อ 1 BTC
                    <br />• <strong>ปรับดูเวลา (Timeframes):</strong> มีปุ่มเลือก 1s (ติ๊กสด), 5s, 1m (1 นาที), 5m, 15m, 1h, 1D ให้กดดูได้ตลอดเวลา
                  </p>
                </div>

                <div className="p-3.5 bg-[#121c16] border border-[#235832] rounded-xl space-y-2">
                  <div className="font-bold text-[#4ade80] flex items-center gap-1.5">
                    <span>3 เส้นสำคัญบนกราฟ (Entry, TP, SL)</span>
                  </div>
                  <p className="text-[#cbd5e1]">
                    • <strong>เส้นสีฟ้า (Entry):</strong> จุดที่บอทเคาะเข้าซื้อ
                    <br />• <strong>เส้นสีเขียว (Take Profit):</strong> จุดเป้าหมายกำไร เมื่อราคาขึ้นมาถึงตรงนี้ บอทจะเคาะขายปิดทำกำไรอัตโนมัติทันที (+3.0%)
                    <br />• <strong>เส้นสีแดง (Stop Loss):</strong> จุดตัดขาดทุน ถ้าราคาร่วงหลุด บอทจะตัดไฟขายคัทลอสทันที (-1.5%) เพื่อรักษาเงินต้น
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#141419] border border-[#2b2b36] rounded-xl space-y-3">
                <div className="font-bold text-sm text-[#fcd34d]">
                  ❓ คำถาม: แล้วจะปิดตอนได้เงินพอหรือขาดทุน หรือผู้ใช้จะต้องกดปิดเองในไหน?
                </div>
                <div className="space-y-2 text-[#e4e4e7]">
                  <div className="p-2.5 bg-[#0e1712] border border-[#1b3b27] rounded-lg">
                    <strong className="text-[#4ade80]">1) บอทปิดให้อัตโนมัติเมื่อได้เงินพอ (Take Profit):</strong>
                    <span className="block text-[#a7f3d0] mt-0.5">
                      บอทล็อกจุดกำไรไว้ล่วงหน้า ทันทีที่ราคาวิ่งขึ้นไปแตะเส้นเขียว บอทจะส่งคำสั่งขายคืนพอร์ตทันที เงินกำไรเข้ากระเป๋าอัตโนมัติโดยไม่ต้องเฝ้าหน้าจอ
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#1c0f0f] border border-[#441a1a] rounded-lg">
                    <strong className="text-[#f87171]">2) บอทปิดให้อัตโนมัติเมื่อราคาลง (Stop Loss &amp; Max Drawdown):</strong>
                    <span className="block text-[#fecaca] mt-0.5">
                      ถ้าราคาผิดทางร่วงหลุดเส้นแดง หรือพอร์ตขาดทุนแตะเพดานประจำวัน (เช่น 3%) บอทจะตัดไฟสั่งขายคัทลอสทันที เพื่อรักษาเงินต้นส่วนใหญ่ 97-98.5% ไว้ ไม่ปล่อยให้พอร์ตแตก
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#111929] border border-[#223d6b] rounded-lg">
                    <strong className="text-[#93c5fd]">3) ผู้ใช้กดปิดเองได้ทันทีในแอพนี้ (Manual Close Now):</strong>
                    <span className="block text-[#bfdbfe] mt-0.5">
                      บนกราฟและในตารางออเดอร์ จะมีปุ่มสีแดง <em>&ldquo;🚨 ปิดออเดอร์ทันที (Market Close Now)&rdquo;</em> ถ้าคุณพอใจกำไรตอนนี้หรืออยากออกของทันที กดปุ่มนี้คลิกเดียว บอทจะสั่งขายปิดออเดอร์ทันที
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#1a1820] border border-[#3b3552] rounded-lg">
                    <strong className="text-[#c084fc]">4) เข้าไปกดปิดเองในแอพ Bitkub หรือ Binance บนมือถือได้ไหม?:</strong>
                    <span className="block text-[#e9d5ff] mt-0.5">
                      <strong>ทำได้ 100%!</strong> หากเปิดใช้งานโหมด LIVE ออเดอร์จะอยู่บนกระดานเทรดจริง คุณสามารถเปิดแอพ Bitkub หรือ Binance บนมือถือของคุณ แล้วกดขายเหรียญหรือกดยกเลิกได้โดยตรงเลยเช่นกัน ระบบบอทจะตรวจจับยอดเหรียญและยอดเงินที่เปลี่ยนไป แล้วอัปเดตให้อัตโนมัติ!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-[#24242c] flex items-center justify-between text-xs text-[#71717a] shrink-0">
          <span>คลิก &ldquo;ปิดหน้าต่าง&rdquo; หรือกดพื้นที่ว่างเพื่อกลับไปยังหน้าแดชบอร์ด</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#0e0e11] bg-[#60a5fa] hover:bg-[#93c5fd] rounded-xl cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
