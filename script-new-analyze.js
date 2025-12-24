window.analyzeDiscrepancies = function analyzeDiscrepancies() {
  const DAILY_CONSUMPTION = 116;

  if (
    !analysisData.invoiceArchive ||
    analysisData.invoiceArchive.length === 0
  ) {
    document.getElementById("discrepancyNoData").style.display = "block";
    document.getElementById("discrepancyLoading").style.display = "none";
    document.getElementById("riskNoData").style.display = "block";
    document.getElementById("riskLoading").style.display = "none";
    return;
  }

  // Step 1: Group records by site with proper date parsing
  const sitesMap = {};
  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename || "";
    const dateStr = invoice.fuelingdate || invoice.lastfuelingdate || "";
    
    if (!siteName.trim() || !dateStr.trim()) return;

    const date = parseDateDMY(dateStr);
    const qty = parseFloat(invoice.fuelquantity || invoice.lastfuelingqty || 0);

    if (!date || qty <= 0) return;

    if (!sitesMap[siteName]) {
      sitesMap[siteName] = [];
    }
    sitesMap[siteName].push({
      siteName: siteName,
      date: date,
      qty: qty,
      raw: invoice,
    });
  });

  // Step 2: Analyze each site
  const discrepancies = [];
  const riskSummary = [];

  Object.keys(sitesMap).forEach((siteName) => {
    const records = sitesMap[siteName]
      .filter((r) => r.date && r.qty > 0)
      .sort((a, b) => a.date - b.date);

    // Ignore non-duplicated sites
    if (records.length < 2) return;

    // Find corresponding Energy Dashboard record for OFF-AIR protection
    const energyDashboardSite = analysisData.energyDashboard.find(
      (site) =>
        site.sitename && site.sitename.toUpperCase() === siteName.toUpperCase(),
    );

    const siteStatus = energyDashboardSite
      ? (energyDashboardSite.status || "").toUpperCase()
      : "";

    // OFF-AIR Protection: Skip non-active sites
    if (siteStatus !== "ON-AIR" && siteStatus !== "IN PROGRESS") {
      riskSummary.push({
        sitename: siteName,
        issuetype: "Data Issue",
        rootcausehint: `Site status is ${siteStatus} (not ON-AIR)`,
      });
      return;
    }

    let siteIsTheft = false;
    let siteIsEarly = false;

    // Step 3: Analyze each consecutive pair (i-1 vs i)
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];

      const gapDays = Math.floor(
        (curr.date - prev.date) / (1000 * 60 * 60 * 24),
      );
      const expectedRuntimeDays = prev.qty / DAILY_CONSUMPTION;

      // NORMAL CONDITION: If gap >= runtime - 2, skip this pair (it's OK)
      if (gapDays >= expectedRuntimeDays - 2) {
        continue;
      }

      // EARLY REFUEL: Gap is less than expected runtime minus buffer
      siteIsEarly = true;

      // IMPOSSIBLE CONSUMPTION -> THEFT: Expected usage exceeds available fuel
      if (gapDays * DAILY_CONSUMPTION > prev.qty) {
        siteIsTheft = true;
      }

      // Add pair-level discrepancy record
      const expectedUsed = gapDays * DAILY_CONSUMPTION;
      discrepancies.push({
        sitename: siteName,
        planneddate: prev.date.toISOString().split("T")[0],
        actualdate: curr.date.toISOString().split("T")[0],
        span: gapDays,
        expectedconsumption: expectedUsed.toFixed(2),
        actualfueladded: prev.qty.toFixed(2),
        variance: ((expectedUsed - prev.qty) / prev.qty * 100).toFixed(2) + "%",
        status: siteIsTheft ? "Theft" : siteIsEarly ? "Early Refuel" : "Normal",
      });
    }

    // WORST STATUS WINS for the site
    let siteStatus_ = "Normal";
    let rootCauseHint = "All fuel cycles align with consumption";

    if (siteIsTheft) {
      siteStatus_ = "Theft";
      rootCauseHint = "Impossible fuel consumption detected across one or more cycles";
    } else if (siteIsEarly) {
      siteStatus_ = "Early Refuel";
      rootCauseHint = "Site refueled earlier than expected in one or more cycles";
    }

    // Add site-level risk summary if not normal
    if (siteStatus_ !== "Normal") {
      riskSummary.push({
        sitename: siteName,
        issuetype: siteStatus_,
        rootcausehint: rootCauseHint,
      });
    }
  });

  // Store data for filtering
  window.discrepancyAnalysisData = { discrepancies, riskSummary };

  // Populate tables
  populateDiscrepancyTable(discrepancies);
  populateRiskSummaryTable(riskSummary);

  document.getElementById("discrepancyNoData").style.display =
    discrepancies.length === 0 ? "block" : "none";
  document.getElementById("discrepancyLoading").style.display = "none";

  document.getElementById("riskNoData").style.display =
    riskSummary.length === 0 ? "block" : "none";
  document.getElementById("riskLoading").style.display = "none";
};
