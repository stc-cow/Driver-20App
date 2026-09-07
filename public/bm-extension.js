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

  document.addEventListener("DOMContentLoaded", () => {
    updateBMExtensions();
    const observer = new MutationObserver(updateBMExtensions);
    ["overdueTableBody", "todayTableBody", "comingTableBody"].forEach((id) => {
      const body = document.getElementById(id);
      if (body) observer.observe(body, { childList: true, subtree: true });
    });
  });
})();
