import { ProductionItem, DailyLog, InvoiceItem } from '../types';

const SPREADSHEET_ID = '1-4Bd7MeYXMkkTWgkIbzrsn_eNz3Dzw5FgTxC7lFgsB0';
const INVOICE_SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';
const SHEET_NAME = 'Sheet';
const IN_SHEET_NAME = 'IN';

const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
const IN_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${INVOICE_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${IN_SHEET_NAME}`;

const normalizeDate = (v: any): Date | null => {
  if (v instanceof Date) return v;
  if (v === null || v === undefined) return null;
  const str = v.toString().trim();
  if (!str) return null;

  const gvizMatch = str.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (gvizMatch) {
    // Note: GViz months are 0-based
    return new Date(parseInt(gvizMatch[1]), parseInt(gvizMatch[2]), parseInt(gvizMatch[3]));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const parseProductionInfo = (val: any): { date: string; line: string } => {
  if (!val) return { date: '', line: 'N/A' };
  const str = val.toString().trim();

  const gvizMatch = str.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (gvizMatch) {
    const year = gvizMatch[1];
    const month = (parseInt(gvizMatch[2]) + 1).toString().padStart(2, '0');
    const day = gvizMatch[3].padStart(2, '0');
    return { date: `${year}-${month}-${day}`, line: 'N/A' };
  }

  const lineFullDateMatch = str.match(/[\[【]Line\s*(\d+)[\]】]\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (lineFullDateMatch) {
    const lineNum = lineFullDateMatch[1];
    const day = lineFullDateMatch[2].padStart(2, '0');
    const month = lineFullDateMatch[3].padStart(2, '0');
    const year = lineFullDateMatch[4];
    return { date: `${year}-${month}-${day}`, line: `Line ${lineNum}` };
  }

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
    if (!rows || rows.length < 5) return [];

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
          dailyProduction.push({ ...header, qty: typeof val === 'number' ? val : parseFloat(val.toString()) || 0 });
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
    throw new Error("Connection failed.");
  }
};

const getQtyStatus = (rows: any[], rowIdx: number, qtyIn: number, targetCol: number, targetDate: Date | null): string => {
  const invoiceList: { colIndex: number; date: Date | null; hasDate: boolean; qty: number }[] = [];
  const rowC = rows[rowIdx].c;

  for (let col = 14; col < rows[0].c.length; col++) {
    const invQty = Number(rowC[col]?.v || 0);
    if (invQty <= 0) continue;

    const rawDate = rows[1].c[col]?.v;
    const date = normalizeDate(rawDate);

    invoiceList.push({
      colIndex: col,
      date: date,
      hasDate: !!date,
      qty: invQty
    });
  }

  invoiceList.sort((a, b) => {
    if (a.hasDate !== b.hasDate) return a.hasDate ? -1 : 1;
    if (a.date && b.date) {
      const diff = a.date.getTime() - b.date.getTime();
      if (diff !== 0) return diff;
    }
    return a.colIndex - b.colIndex;
  });

  let remainingIn = qtyIn;

  for (const inv of invoiceList) {
    if (inv.colIndex === targetCol) {
      return remainingIn >= inv.qty ? "READY" : "NOT READY";
    }

    if (inv.hasDate && targetDate) {
      if (inv.date!.getTime() < targetDate.getTime()) {
        remainingIn -= inv.qty;
      } else if (inv.date!.getTime() === targetDate.getTime() && inv.colIndex < targetCol) {
        remainingIn -= inv.qty;
      }
    }
  }
  return "NOT READY";
};

const getInvStatus = (targetDate: Date | null, todayDate: Date): string => {
  if (!targetDate) return "TBA";
  
  const targetT = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const todayT = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime();

  if (targetT > todayT) return "Will be Export on " + targetDate.toLocaleDateString();
  if (targetT === todayT) return "Will Export Today";
  if (targetT < todayT) return "Exported";
  return "TBA";
};

export const fetchInvoiceData = async (brandInput: string, invoiceInput: string): Promise<InvoiceItem[]> => {
  try {
    const response = await fetch(IN_GVIZ_URL);
    const text = await response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonStr);
    const rows = json.table.rows;
    if (!rows || rows.length < 5) return [];

    brandInput = (brandInput || "").trim().toUpperCase();
    invoiceInput = (invoiceInput || "").trim().toUpperCase();

    const todayVal = rows[0].c[10]?.v;
    const todayDate = normalizeDate(todayVal) || new Date();

    let targetCol = -1;
    const brandRow = rows[0].c;
    const invNoRow = rows[4].c;

    for (let col = 14; col < brandRow.length; col++) {
      const brandCell = (brandRow[col]?.v || "").toString().trim().toUpperCase();
      const invCell = (invNoRow[col]?.v || "").toString().trim().toUpperCase();
      if (brandCell === brandInput && invCell === invoiceInput) {
        targetCol = col;
        break;
      }
    }

    if (targetCol === -1) return [];

    const targetDate = normalizeDate(rows[1].c[targetCol]?.v);
    const results: InvoiceItem[] = [];

    for (let rowIdx = 5; rowIdx < rows.length; rowIdx++) {
      const c = rows[rowIdx].c;
      if (!c) continue;
      
      const qty = Number(c[targetCol]?.v || 0);
      if (qty <= 0) continue;

      const po = c[0]?.v?.toString() || '-';
      const type = c[4]?.v?.toString() || '-';
      const size = c[5]?.v?.toString() || '-';
      const color = c[7]?.v?.toString() || '-';
      const qtyIn = Number(c[9]?.v || 0);
      const rework = Number(c[13]?.v || 0);
      
      const qtyStatus = getQtyStatus(rows, rowIdx, qtyIn, targetCol, targetDate);
      const invStatus = getInvStatus(targetDate, todayDate);

      results.push({
        PO: po,
        TYPE: type,
        COLOR: color,
        SIZE: size,
        QTY: qty,
        REWORK: rework,
        QTY_STATUS: qtyStatus,
        INV_STATUS: invStatus
      });
    }
    return results;
  } catch (err) {
    console.error("Invoice search error:", err);
    return [];
  }
};

export const calculateStats = (data: ProductionItem[]) => {
  const totalOrder = data.reduce((acc, curr) => acc + curr.orderQty, 0);
  const totalProduced = data.reduce((acc, curr) => acc + curr.producedQty, 0);
  const totalRemaining = data.reduce((acc, curr) => acc + curr.remainingQty, 0);
  const completionRate = totalOrder > 0 ? (totalProduced / totalOrder) * 100 : 0;
  return { totalOrder, totalProduced, totalRemaining, completionRate };
};
