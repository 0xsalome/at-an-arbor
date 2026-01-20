import React from 'react';
import { ContributionWeek } from '../lib/strata-types';

interface GeologicalReportProps {
    text: string;
    weekIndex: number;
    loading: boolean;
    total: number;
    week: ContributionWeek | null;
}

export const GeologicalReport: React.FC<GeologicalReportProps> = ({ text, weekIndex, loading, week }) => {
  // ASCII Bar Chart Logic
  const renderGraph = () => {
    if (!week) return " . . . . . . . ";
    
    const chars = [' ', '.', ':', '|', '║', '█'];
    return week.days.map(d => {
        if (d.count === 0) return ' ';
        if (d.count <= 2) return '.';
        if (d.count <= 5) return ':';
        if (d.count <= 8) return '|';
        if (d.count <= 12) return '║';
        return '█';
    }).join(' ');
  };

  const total = week ? week.days.reduce((acc, d) => acc + d.count, 0) : 0;
  
  // Create a fixed-width string helper
  const fit = (str: string, len: number) => {
      if (str.length > len) return str.substring(0, len);
      return str + ' '.repeat(len - str.length);
  };

  const graphStr = renderGraph();
  const indexStr = (52 - weekIndex).toString().padStart(2, '0');
  const totalStr = total.toString().padStart(3, ' ');
  
  // Determine status string
  let status = "[VOID]";
  if (total > 0) status = "[LOW ]";
  if (total > 10) status = "[MED ]";
  if (total > 25) status = "[HIGH]";
  
  // Format the text into lines of max length ~20 chars
  const textLines = text.match(/.{1,22}/g) || ["SCANNING..."];
  const l1 = fit(textLines[0] || "", 22);
  const l2 = fit(textLines[1] || "", 22);

  return (
    <div className="fixed bottom-8 right-8 z-50 font-mono text-[10px] md:text-xs leading-none text-green-500 select-none pointer-events-none filter drop-shadow-[0_0_5px_rgba(0,255,0,0.4)]">
      <pre className="whitespace-pre bg-black/80 p-2">
{`╔══════════════════════════╗
║ SEC-${indexStr} :: DEPTH-${(weekIndex * 10).toString().padStart(3,'0')}m ║
╠══════════════════════════╣
║ S M T W T F S    STATUS  ║
║ ${graphStr}    ${status}  ║
║                          ║
║ TOTAL_SAMPLES:      ${totalStr}  ║
╠══════════════════════════╣
║ > ANALYSIS_LOG           ║
║ ${l1}   ║
║ ${l2}   ║
${loading ? '║ [ SCANNING...          ] ║' : '║ [ READY                ] ║'}
╚══════════════════════════╝`}
      </pre>
    </div>
  );
};