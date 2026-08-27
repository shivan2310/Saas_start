"use client";

import React from "react";

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  categories?: SpendingCategory[];
  size?: number;
  strokeWidth?: number;
}

const DEFAULT_CATEGORIES: SpendingCategory[] = [
  { name: "Shopping", amount: 500, color: "#8FAF9F" },
  { name: "Food", amount: 40, color: "#F0A878" },
];

export const DonutChart: React.FC<DonutChartProps> = ({
  categories = DEFAULT_CATEGORIES,
  size = 180,
  strokeWidth = 20,
}) => {
  const validCategories = categories.filter((c) => c.amount > 0);
  const total = validCategories.reduce((sum, c) => sum + c.amount, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-dash-text-muted text-sm">
        No spending data yet.
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;

  const segments = validCategories.map((cat) => {
    const percentage = cat.amount / total;
    const dashLength = circumference * percentage;
    const gapLength = circumference - dashLength;
    const segment = {
      ...cat,
      percentage,
      strokeDasharray: `${dashLength} ${gapLength}`,
      strokeDashoffset: -currentOffset,
    };
    currentOffset += dashLength;
    return segment;
  });

  const legendItems = [...validCategories].sort((a, b) => b.amount - a.amount);

  const totalFormatted =
    total >= 100000
      ? `₹${(total / 100000).toFixed(1)}L`
      : total >= 1000
      ? `₹${(total / 1000).toFixed(1)}K`
      : `₹${total.toLocaleString()}`;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Donut ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#222526"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx={center}
            cy={center}
            r={radius}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: seg.strokeDasharray,
              strokeDashoffset: seg.strokeDashoffset,
            }}
          />
        ))}
        {/* Center label */}
        <text
          x={center}
          y={center - 7}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#F2F2F0"
          fontSize={Math.round(size * 0.115)}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {totalFormatted}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#737777"
          fontSize={Math.round(size * 0.065)}
          fontWeight="500"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.06em"
        >
          TOTAL
        </text>
      </svg>

      {/* Legend */}
      <div className="w-full space-y-2.5 px-1">
        {legendItems.map((cat) => {
          const percentage = ((cat.amount / total) * 100).toFixed(1);
          return (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[13px] text-dash-text-secondary font-medium">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-[13px] text-dash-text font-semibold">
                  ₹{cat.amount.toLocaleString()}
                </span>
                <span className="text-[12px] text-dash-text-muted w-10 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};