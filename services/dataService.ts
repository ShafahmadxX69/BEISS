
import { ProductionItem, DailyLog } from '../types';

const SPREADSHEET_ID = '1-4Bd7MeYXMkkTWgkIbzrsn_eNz3Dzw5FgTxC7lFgsB0';
const SHEET_NAME = 'Sheet';
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

/**
 * Enhanced parsing to handle various formats in Column A:
 * 1. Standard Google Date: Date(2026,0,26)
 * 2. New bracketed format: [Line 8] 26-01-2026
 * 3. Alt bracketed format: 【Line 8】26-01-2026
 * 4. Fallback for month/day only: 【Line 8】1/26 (assumes 2026)
 */
const parseProductionInfo = (val: any): { date: string; line: string } => {
  if (!val) return { date: '', line: 'N/A' };
  const str = val.toString().trim();

  // 1. Handle standard Google Date(Y,M,D)
  const gvizMatch = str.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (gvizMatch) {
    const year = gvizMatch[1];
    const month = (parseInt(gvizMatch[2]) + 1).toString().padStart(2, '0');
    const day = gvizMatch[3].padStart(2, '0');
    return { date: `${year}-${month}-${day}`, line: 'N/A' };
  }

  // 2. Handle [Line 8] 26-01-2026 or 【Line 8】26-01-2026
  // Regex: matches [ or 【, then Line, then digits, then ] or 】, then a date like DD-MM-YYYY
  const lineFullDateMatch = str.match(/[\[【]Line\s*(\d+)[\]】]\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (lineFullDateMatch) {
    const lineNum = lineFullDateMatch[1];
    const day = lineFullDateMatch[2].padStart(2, '0');
    const month = lineFullDateMatch[3].padStart(2, '0');
    const year = lineFullDateMatch[4];
    // Return in YYYY-MM-DD for standard JS Date parsing
    return { date: `${year}-${month}-${day}`, line: `Line ${lineNum}` };
  }

  // 3. Handle [Line 8] 1/26 or 【Line 8】1/26 (assume year 2026)
  const lineShortDateMatch = str.match(/[\[【]Line\s*(\d+)[\]】]\s*(\d{1,2})[-\/](\d{1,2})/);
  if (lineShortDateMatch) {
    const lineNum = lineShortDateMatch[1];
    const month = lineShortDateMatch[2].padStart(2, '0');
    const day = lineShortDateMatch[3].padStart(2, '0');
    return { date: `2026-${month}-${day}`, line: `Line ${lineNum}` };
  }

  return { date: str, line: 'N/A' };
};

export const fetchProductionData = async (): Promise<ProductionItem[]> => {
  try {
    const response = await fetch(GVIZ_URL);
    const text = await response.text();
    
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonStr);
    const rows = json.table.rows;

    if (!rows || rows.length < 5) {
      return [];
    }

    const firstRow = rows[0].c;
    const secondRow = rows[1].c;
    const thirdRow = rows[2].c;

    const dailyHeaders: { date: string; line: string; shift: string }[] = [];
    for (let i = 12; i < (firstRow?.length || 0); i++) {
      const info = parseProductionInfo(firstRow[i]?.v);
      dailyHeaders.push({
        date: info.date,
        line: secondRow[i]?.v?.toString() || info.line,
        shift: thirdRow[i]?.v?.toString() || ''
      });
    }

    const productionData: ProductionItem[] = [];

    for (let i = 4; i < rows.length; i++) {
      const c = rows[i].c;
      if (!c || (!c[3]?.v && !c[3]?.f)) continue;

      const { date, line } = parseProductionInfo(c[0]?.f || c[0]?.v);

      const dailyProduction: DailyLog[] = [];
      dailyHeaders.forEach((header, idx) => {
        const val = c[12 + idx]?.v;
        if (val !== undefined && val !== null) {
          dailyProduction.push({
            ...header,
            qty: typeof val === 'number' ? val : parseFloat(val.toString()) || 0
          });
        }
      });

      productionData.push({
        productionDate: date,
        uliPo: c[1]?.f || c[1]?.v?.toString() || '-',
        beisPo: c[2]?.f || c[2]?.v?.toString() || '-',
        woNumber: c[3]?.f || c[3]?.v?.toString() || '-',
        modelType: c[5]?.v?.toString() || '-',
        size: c[6]?.v?.toString() || '-',
        color: c[8]?.v?.toString() || '-',
        orderQty: typeof c[9]?.v === 'number' ? c[9].v : parseFloat(c[9]?.f?.replace(/,/g, '') || '0'),
        producedQty: typeof c[10]?.v === 'number' ? c[10].v : parseFloat(c[10]?.f?.replace(/,/g, '') || '0'),
        remainingQty: typeof c[11]?.v === 'number' ? c[11].v : parseFloat(c[11]?.f?.replace(/,/g, '') || '0'),
        dailyProduction,
        extractedLine: line 
      });
    }

    return productionData;
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    throw new Error("Connection failed. Please ensure the Spreadsheet is shared.");
  }
};

export const calculateStats = (data: ProductionItem[]) => {
  const totalOrder = data.reduce((acc, curr) => acc + curr.orderQty, 0);
  const totalProduced = data.reduce((acc, curr) => acc + curr.producedQty, 0);
  const totalRemaining = data.reduce((acc, curr) => acc + curr.remainingQty, 0);
  const completionRate = totalOrder > 0 ? (totalProduced / totalOrder) * 100 : 0;

  return { totalOrder, totalProduced, totalRemaining, completionRate };
};
