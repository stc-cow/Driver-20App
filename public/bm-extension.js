(() => {
  const BM_START = new Date(2026, 8, 9);
  BM_START.setHours(0, 0, 0, 0);

  function parseShortDate(value) {
    const match = String(value || "").trim().match(/^(\d{1,2})\s+([A-Za-z]{3})$/);
    if (!match) return null;
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const month = months.indexOf(match[2].toLowerCase());
    if (month < 0) return null;
    const date = new Date(2026, month, Number(match[1]));
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function appendBM(row, qualifies) {
    const siteCell = row.cells?.[0];
    if (!siteCell || !qualifies) return;
    const name = siteCell.textContent.trim();
    if (!name.endsWith(" - BM")) siteCell.textContent = name + " - BM";
  }

  function updateBMExtensions() {
    ["overdueTableBody", "todayTableBody"].forEach((id) => {
      document.querySelectorAll("#" + id + " tr").forEach((row) => {
        const date = parseShortDate(row.cells?.[2]?.textContent);
        appendBM(row, date && date >= BM_START);
      });
    });

    document.querySelectorAll("#comingTableBody tr").forEach((row) => {
      const days = Number(row.cells?.[2]?.textContent.trim());
      if (!Number.isFinite(days)) return;
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + days);
      appendBM(row, date >= BM_START);
    });
  }

  function parseExportDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    const text = String(value || "").trim();
    let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

    match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function addBMToExport(workbook, filename) {
    if (!filename?.startsWith("Central_Fuel_Plan_")) return;

    const sheet = workbook.Sheets?.["Central Fuel Plan"];
    if (!sheet?.["!ref"]) return;

    const range = XLSX.utils.decode_range(sheet["!ref"]);
    const headers = {};
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
      if (cell?.v) headers[String(cell.v).trim().toLowerCase()] = col;
    }

    const siteCol = headers["site name"];
    const dateCol = headers["next fueling plan"];
    if (siteCol === undefined || dateCol === undefined) return;

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const siteCell = sheet[XLSX.utils.encode_cell({ r: row, c: siteCol })];
      const dateCell = sheet[XLSX.utils.encode_cell({ r: row, c: dateCol })];
      const date = parseExportDate(dateCell?.v);

      if (siteCell?.v && date && date >= BM_START) {
        const siteName = String(siteCell.v);
        if (!siteName.endsWith(" - BM")) {
          siteCell.v = siteName + " - BM";
          siteCell.w = siteCell.v;
        }
      }
    }
  }

  if (window.XLSX?.writeFile) {
    const originalWriteFile = window.XLSX.writeFile.bind(window.XLSX);
    window.XLSX.writeFile = function (workbook, filename, options) {
      addBMToExport(workbook, filename);
      return originalWriteFile(workbook, filename, options);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateBMExtensions();
    const observer = new MutationObserver(updateBMExtensions);
    ["overdueTableBody", "todayTableBody", "comingTableBody"].forEach((id) => {
      const body = document.getElementById(id);
      if (body) observer.observe(body, { childList: true, subtree: true });
    });
  });
})();
