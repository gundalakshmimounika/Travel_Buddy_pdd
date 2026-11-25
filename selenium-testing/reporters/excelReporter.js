const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class SeleniumExcelReporter {
  constructor(outputPath = path.join(__dirname, '../Selenium_Web_Test_Report.xlsx')) {
    this.outputPath = outputPath;
    this.results = [];
    this.startTime = new Date();
  }

  addResult({ id, suite, name, status, durationMs, error = null, screenshot = null }) {
    this.results.push({
      id: id || `TC-SEL-${String(this.results.length + 1).padStart(2, '0')}`,
      suite: suite || 'Web E2E Regression',
      name,
      status: status ? status.toUpperCase() : 'PASS',
      durationMs: durationMs || 0,
      error: error ? (error.message || String(error)) : 'N/A',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      screenshot: screenshot || 'N/A'
    });
  }

  async generateReport() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TravelBuddy Selenium Automation Engine';
    workbook.created = new Date();

    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const totalDuration = this.results.reduce((acc, curr) => acc + curr.durationMs, 0);

    // Styling constants
    const navyFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D233A' } };
    const subNavyFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } };
    const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    const passFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1E7DD' } };
    const failFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    // -------------------------------------------------------------
    // Tab 1: Executive Overview
    // -------------------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary & Metrics', {
      views: [{ showGridLines: true }]
    });

    summarySheet.columns = [
      { width: 4 },
      { width: 28 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 20 }
    ];

    summarySheet.mergeCells('B2:G2');
    summarySheet.getCell('B2').value = 'TravelBuddy - Selenium Web E2E Test Execution Analysis';
    summarySheet.getCell('B2').font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };

    summarySheet.mergeCells('B3:G3');
    summarySheet.getCell('B3').value = `Automated Browser Test Report Generated on ${new Date().toUTCString()}`;
    summarySheet.getCell('B3').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };

    // KPI Cards
    const kpiData = [
      { cell: 'B', title: 'Total Tests', val: total, color: 'FF1E40AF' },
      { cell: 'C', title: 'Passed', val: passed, color: 'FF16A34A' },
      { cell: 'D', title: 'Failed', val: failed, color: 'FFDC2626' },
      { cell: 'E', title: 'Pass Rate (%)', val: `${passRate}%`, color: 'FF4F46E5' },
      { cell: 'F', title: 'Total Duration', val: `${(totalDuration / 1000).toFixed(2)}s`, color: 'FF0D9488' }
    ];

    kpiData.forEach(k => {
      summarySheet.getCell(`${k.cell}5`).value = k.title;
      summarySheet.getCell(`${k.cell}5`).font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      summarySheet.getCell(`${k.cell}5`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.color } };
      summarySheet.getCell(`${k.cell}5`).alignment = { horizontal: 'center', vertical: 'middle' };

      summarySheet.getCell(`${k.cell}6`).value = k.val;
      summarySheet.getCell(`${k.cell}6`).font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };
      summarySheet.getCell(`${k.cell}6`).fill = zebraFill;
      summarySheet.getCell(`${k.cell}6`).alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getCell(`${k.cell}6`).border = thinBorder;
    });

    // Run Information
    const envInfo = [
      ['Application Under Test', 'TravelBuddy Web Frontend (Single Page App)'],
      ['Test Engine', 'Selenium WebDriver 4.x (Node.js)'],
      ['Browser & Mode', 'Google Chrome (Headless Chromium Engine)'],
      ['Base URL', 'http://localhost:8085/index.html'],
      ['Execution Status', failed === 0 ? 'SUCCESS - ALL TESTS PASSED' : `${failed} TEST(S) FAILED`]
    ];

    let rowNum = 9;
    envInfo.forEach(([label, val]) => {
      summarySheet.getCell(`B${rowNum}`).value = label;
      summarySheet.getCell(`B${rowNum}`).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } };
      summarySheet.getCell(`B${rowNum}`).fill = zebraFill;
      summarySheet.getCell(`B${rowNum}`).border = thinBorder;

      summarySheet.mergeCells(`C${rowNum}:G${rowNum}`);
      summarySheet.getCell(`C${rowNum}`).value = val;
      summarySheet.getCell(`C${rowNum}`).font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
      summarySheet.getCell(`C${rowNum}`).border = thinBorder;
      rowNum++;
    });

    // -------------------------------------------------------------
    // Tab 2: Test Case Execution Details
    // -------------------------------------------------------------
    const detailSheet = workbook.addWorksheet('Execution Details', {
      views: [{ state: 'frozen', ySplit: 2, showGridLines: true }]
    });

    detailSheet.columns = [
      { header: 'Test ID', key: 'id', width: 14 },
      { header: 'Test Suite', key: 'suite', width: 24 },
      { header: 'Test Name / Scenario', key: 'name', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (ms)', key: 'durationMs', width: 15 },
      { header: 'Execution Timestamp', key: 'timestamp', width: 24 },
      { header: 'Error Log / Stack', key: 'error', width: 45 }
    ];

    const dHeader = detailSheet.getRow(1);
    dHeader.values = ['Test ID', 'Test Suite', 'Test Name / Scenario', 'Status', 'Duration (ms)', 'Execution Timestamp', 'Error Log / Stack'];
    dHeader.eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = subNavyFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });
    dHeader.height = 26;

    this.results.forEach((r, idx) => {
      const row = detailSheet.addRow([
        r.id,
        r.suite,
        r.name,
        r.status,
        r.durationMs,
        r.timestamp,
        r.error
      ]);

      const isEven = idx % 2 === 0;
      const rowFill = isEven ? zebraFill : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
        cell.fill = rowFill;
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };

        // Status badge
        if (colNumber === 4) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (r.status === 'PASS') {
            cell.fill = passFill;
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF16A34A' } };
          } else {
            cell.fill = failFill;
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFDC2626' } };
          }
        }

        if (colNumber === 5) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });
      row.height = 24;
    });

    detailSheet.autoFilter = 'A1:G1';

    await workbook.xlsx.writeFile(this.outputPath);
    console.log(`[SeleniumExcelReporter] Report successfully saved to: ${this.outputPath}`);
    return this.outputPath;
  }
}

module.exports = SeleniumExcelReporter;
