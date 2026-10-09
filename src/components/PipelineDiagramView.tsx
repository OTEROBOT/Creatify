import React from 'react';
import { StageConfig } from '../types/pipeline';

interface PipelineDiagramViewProps {
  stages: StageConfig[];
  selectedStageId: number;
  onSelectStage: (id: number) => void;
  activePulseStageId: number | null;
  isRunning: boolean;
}

export const PipelineDiagramView: React.FC<PipelineDiagramViewProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  activePulseStageId,
  isRunning,
}) => {
  const getStage = (id: number) => stages.find((s) => s.id === id)!;

  const renderStageNode = (id: number) => {
    const stage = getStage(id);
    const isSelected = selectedStageId === id;
    const isPulsing = isRunning && activePulseStageId === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelectStage(id)}
        aria-pressed={isSelected}
        className={`group relative w-full min-h-[78px] sm:min-h-[86px] px-4 py-3 rounded-[38px] text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7aa2f7] cursor-pointer flex flex-col items-center justify-center select-none ${
          isSelected
            ? 'bg-[#1a223a] border-[1.75px] border-[#7aa2f7] shadow-[0_0_24px_rgba(96,138,245,0.4)]'
            : isPulsing
            ? 'bg-[#172033] border border-[#60a5fa] shadow-[0_0_16px_rgba(96,165,250,0.25)]'
            : 'bg-[#151518] border border-[#323238] hover:border-[#52525b] hover:bg-[#19191d]'
        }`}
      >
        <span
          className={`text-[14px] sm:text-[15px] font-semibold tracking-tight leading-snug transition-colors ${
            isSelected
              ? 'text-[#f8fafc]'
              : 'text-[#a1a1aa] group-hover:text-[#e4e4e7]'
          }`}
        >
          {stage.name}
        </span>
        <span
          className={`mt-0.5 text-[11px] sm:text-[12.5px] font-mono italic leading-tight transition-colors ${
            isSelected
              ? 'text-[#93b4fa]'
              : 'text-[#71717a] group-hover:text-[#a1a1aa]'
          }`}
        >
          {stage.subtitle}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full rounded-[28px] bg-[#141416] border border-[#27272b] px-4 py-6 sm:px-7 sm:py-7">
      <div className="grid grid-cols-11 items-center">
        {/* ROW 1: Stage 1 Exchange API -> Edge -> Stage 2 Data Preprocessing */}
        <div className="col-span-4">{renderStageNode(1)}</div>

        {/* Edge 1 -> 2: Live Prices & Volume */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#52525b]" />
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 -ml-1 transition-transform duration-150 ${
                  activePulseStageId === 1
                    ? 'bg-[#7dcfff] scale-150 shadow-[0_0_8px_#7dcfff]'
                    : 'bg-[#60a5fa]'
                }`}
              />
            </div>

            <span className="px-2 text-[10px] sm:text-[12px] font-mono italic text-[#e4e4e7] whitespace-nowrap tracking-tight">
              Live Prices &amp; Volume
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#52525b]" />
              <svg
                className="w-3 h-3 text-[#a1a1aa] -ml-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M4 2.5L8 6L4 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(2)}</div>

        {/* CONNECTOR ROW 1->2: Vertical Edge 2 -> 3 */}
        <div className="col-span-7" />
        <div className="col-span-4 flex flex-col items-center justify-center py-2">
          <div className="h-3 border-l border-dotted border-[#52525b]" />
          <span
            className={`w-2 h-1 rounded-t-full transition-all duration-150 ${
              activePulseStageId === 2
                ? 'bg-[#7dcfff] scale-125 shadow-[0_0_8px_#7dcfff]'
                : 'bg-[#60a5fa]'
            }`}
          />
          <span className="my-0.5 text-[11px] sm:text-[12px] font-mono italic text-[#e4e4e7] whitespace-nowrap">
            Cleaned Data
          </span>
          <div className="h-3 border-l border-dotted border-[#52525b]" />
          <svg
            className="w-3 h-3 text-[#a1a1aa] -mt-1"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8.5L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ROW 2: Stage 4 Risk Management <- Edge <- Stage 3 AI Strategy Engine */}
        <div className="col-span-4">{renderStageNode(4)}</div>

        {/* Edge 3 -> 4: Trade Signals (Buy/Sell) */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <svg
                className="w-3 h-3 text-[#a1a1aa] -mr-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M8 2.5L4 6L8 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="w-full border-b border-dotted border-[#52525b]" />
            </div>

            <span
              className={`px-2 text-[10px] sm:text-[12px] font-mono italic whitespace-nowrap tracking-tight transition-colors ${
                activePulseStageId === 3 ? 'text-[#7dcfff]' : 'text-[#e4e4e7]'
              }`}
            >
              Trade Signals (Buy/Sell)
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#52525b]" />
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(3)}</div>

        {/* CONNECTOR ROW 2->3: Vertical Edge 4 -> 5 */}
        <div className="col-span-4 flex flex-col items-center justify-center py-2">
          <div className="h-3 border-l border-dotted border-[#52525b]" />
          <span
            className={`w-2 h-1 rounded-t-full transition-all duration-150 ${
              activePulseStageId === 4
                ? 'bg-[#7dcfff] scale-125 shadow-[0_0_8px_#7dcfff]'
                : 'bg-[#60a5fa]'
            }`}
          />
          <span className="my-0.5 text-[11px] sm:text-[12px] font-mono italic text-[#e4e4e7] whitespace-nowrap">
            Approved Orders
          </span>
          <div className="h-3 border-l border-dotted border-[#52525b]" />
          <svg
            className="w-3 h-3 text-[#a1a1aa] -mt-1"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8.5L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="col-span-7" />

        {/* ROW 3: Stage 5 Order Execution -> Edge -> Stage 6 Notifications */}
        <div className="col-span-4">{renderStageNode(5)}</div>

        {/* Edge 5 -> 6: Trade Confirmations */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#52525b]" />
            </div>

            <span
              className={`px-2 text-[10px] sm:text-[12px] font-mono italic whitespace-nowrap tracking-tight transition-colors ${
                activePulseStageId === 5 ? 'text-[#7dcfff]' : 'text-[#e4e4e7]'
              }`}
            >
              Trade Confirmations
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#52525b]" />
              <svg
                className="w-3 h-3 text-[#a1a1aa] -ml-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M4 2.5L8 6L4 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(6)}</div>
      </div>
    </div>
  );
};
