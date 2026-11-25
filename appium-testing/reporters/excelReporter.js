const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class AppiumExcelReporter {
  constructor(outputPath = path.join(__dirname, '../Appium_Android_Test_Report.xlsx')) {
    this.outputPath = outputPath;
    this.results = [];
    this.startTime = new Date();
  }

  addResult({ id, suite, activity, name, status, durationMs, error = null }) {
    this.results.push({
      id: id || `TC-APM-${String(this.results.length + 1).padStart(2, '0')}`,
      suite: suite || 'Android Mobile Regression',
      activity: activity || 'MainActivity',
      name,
      status: status ? status.toUpperCase() : 'PASS',
      durationMs: durationMs || 0,
      error: error ? (error.message || String(error)) : 'N/A',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    });
  }

  async generateReport() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TravelBuddy Appium Automation Engine';
    workbook.created = new Date();

    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const totalDuration = this.results.reduce((acc, curr) => acc + curr.durationMs, 0);

    // Styling
    const primaryNavy = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    const sectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
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
    // Tab 1: Executive Mobile Dashboard
    // -------------------------------------------------------------
    const summarySheet = workbook.addWorksheet('Mobile Overview & KPIs', {
      views: [{ showGridLines: true }]
    });

    summarySheet.columns = [
      { width: 4 },
      { width: 28 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 22 },
      { width: 22 }
    ];

    summarySheet.mergeCells('B2:G2');
    summarySheet.getCell('B2').value = 'TravelBuddy - Native Android Appium Test Execution Analysis';
    summarySheet.getCell('B2').font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF0F172A' } };

    summarySheet.mergeCells('B3:G3');
    summarySheet.getCell('B3').value = `Automated Mobile Test Report (UiAutomator2 Engine) - Generated ${new Date().toUTCString()}`;
    summarySheet.getCell('B3').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };

    // KPI Cards
    const kpiCards = [
      { cell: 'B', title: 'Total Mobile Tests', val: total, color: 'FF1E40AF' },
      { cell: 'C', title: 'Passed', val: passed, color: 'FF16A34A' },
      { cell: 'D', title: 'Failed', val: failed, color: 'FFDC2626' },
      { cell: 'E', title: 'Pass Rate (%)', val: `${passRate}%`, color: 'FF4F46E5' },
      { cell: 'F', title: 'Total Duration', val: `${(totalDuration / 1000).toFixed(2)}s`, color: 'FF0D9488' }
    ];

    kpiCards.forEach(k => {
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

    // Device & Application Metadata
    const deviceSpecs = [
      ['Target Android Package', 'com.simats.travelbuddy'],
      ['Main Launch Activity', '.SplashActivity -> .MainActivity'],
      ['Automation Driver', 'Appium UiAutomator2 (Node.js)'],
      ['Target Android API Levels', 'API 29 to 34 (Android 10 - 14)'],
      ['Test Capabilities Checked', 'Activities, Intents, Fragments, SQLite/Room, Retrofit API'],
      ['Overall Outcome', failed === 0 ? 'PASSED - ALL MOBILE TESTS SATISFIED' : `${failed} FAILED`]
    ];

    let rowNum = 9;
    deviceSpecs.forEach(([label, val]) => {
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
      { header: 'Mobile Suite', key: 'suite', width: 24 },
      { header: 'Target Activity', key: 'activity', width: 24 },
      { header: 'Scenario / Assertion', key: 'name', width: 42 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (ms)', key: 'durationMs', width: 15 },
      { header: 'Execution Timestamp', key: 'timestamp', width: 22 },
      { header: 'Log / Diagnostics', key: 'error', width: 40 }
    ];

    const dHeader = detailSheet.getRow(1);
    dHeader.values = ['Test ID', 'Mobile Suite', 'Target Activity', 'Scenario / Assertion', 'Status', 'Duration (ms)', 'Execution Timestamp', 'Log / Diagnostics'];
    dHeader.eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = sectionFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });
    dHeader.height = 26;

    this.results.forEach((r, idx) => {
      const row = detailSheet.addRow([
        r.id,
        r.suite,
        r.activity,
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
        if (colNumber === 5) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (r.status === 'PASS') {
            cell.fill = passFill;
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF16A34A' } };
          } else {
            cell.fill = failFill;
            cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFDC2626' } };
          }
        }

        if (colNumber === 6) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });
      row.height = 24;
    });

    detailSheet.autoFilter = 'A1:H1';

    await workbook.xlsx.writeFile(this.outputPath);
    console.log(`[AppiumExcelReporter] Mobile report successfully saved to: ${this.outputPath}`);
    return this.outputPath;
  }
}

module.exports = AppiumExcelReporter;
