window.analyzeDiscrepancies = function analyzeDiscrepancies() {
  const CONSUMPTION_PER_DAY = 116;
  const RUNTIME_BUFFER = 2;

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

  // Step 1: Group invoices by site name
  const siteGroups = {};
  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename || "";
    if (!siteName.trim()) return;

    if (!siteGroups[siteName]) {
      siteGroups[siteName] = [];
    }
    siteGroups[siteName].push(invoice);
  });

  // Step 2: Keep only duplicated sites and sort by LastFuelingDate ASC (oldest first)
  const duplicatedSites = Object.entries(siteGroups)
    .filter(([_, invoices]) => invoices.length > 1)
    .map(([siteName, invoices]) => ({
      siteName,
      invoices: invoices.sort(
        (a, b) =>
          new Date(a.fuelingdate || a.lastfuelingdate || 0) -
          new Date(b.fuelingdate || b.lastfuelingdate || 0),
      ),
    }));

  if (duplicatedSites.length === 0) {
    document.getElementById("discrepancyNoData").style.display = "block";
    document.getElementById("discrepancyLoading").style.display = "none";
    document.getElementById("riskNoData").style.display = "block";
    document.getElementById("riskLoading").style.display = "none";
    return;
  }

  // Step 3: Analyze each duplicated site
  const discrepancies = [];
  const riskSummary = [];

  duplicatedSites.forEach(({ siteName, invoices }) => {
    // Find corresponding Energy Dashboard record
    const energyDashboardSite = analysisData.energyDashboard.find(
      (site) =>
        site.sitename && site.sitename.toUpperCase() === siteName.toUpperCase(),
    );

    const tankCapacity = energyDashboardSite
      ? parseFloat(energyDashboardSite.tankcapacity || 0)
      : 0;
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

    // Step 4: Analyze each consecutive pair (i-1 vs i), sorted ASC (oldest first)
    for (let i = 1; i < invoices.length; i++) {
      const prevInvoice = invoices[i - 1];
      const currInvoice = invoices[i];

      const prevDate = new Date(
        prevInvoice.fuelingdate || prevInvoice.lastfuelingdate || 0,
      );
      const currDate = new Date(
        currInvoice.fuelingdate || currInvoice.lastfuelingdate || 0,
      );

      if (isNaN(prevDate.getTime()) || isNaN(currDate.getTime())) {
        continue;
      }

      // Get fuel quantities from PREVIOUS invoice (what was added before)
      const prevTotalQty = parseFloat(
        prevInvoice.fuelquantity || prevInvoice.lastfuelingqty || 0,
      );
      const currTotalQty = parseFloat(
        currInvoice.fuelquantity || currInvoice.lastfuelingqty || 0,
      );

      if (isNaN(prevTotalQty) || prevTotalQty <= 0) {
        continue;
      }

      // Safety Check: Current TotalQTY should not exceed tank capacity by 5%
      if (tankCapacity > 0 && currTotalQty > tankCapacity * 1.05) {
        continue;
      }

      // Fuel Runtime Logic:
      // FuelRuntimeDays = TotalQTY(previous) / 116
      const fuelRuntimeDays = prevTotalQty / CONSUMPTION_PER_DAY;
      
      // ActualGapDays = DATEDIFF(LastFuelingDate(current), LastFuelingDate(previous))
      const actualGapDays = Math.round(
        (currDate - prevDate) / (1000 * 60 * 60 * 24),
      );

      if (actualGapDays <= 0) {
        continue;
      }

      // Decision Logic
      let pairStatus = "Normal";
      let rootCauseHint = "Fuel cycle aligns with consumption";
      const expectedUsed = actualGapDays * CONSUMPTION_PER_DAY;

      // CHECK 1: Impossible Consumption (Theft/Leak)
      // IF ExpectedUsed > TotalQTY(previous) THEN TheftFlag = TRUE
      if (expectedUsed > prevTotalQty) {
        pairStatus = "Theft";
        rootCauseHint = `Fuel consumption (${expectedUsed.toFixed(2)} L in ${actualGapDays} days) exceeds previous fueling quantity (${prevTotalQty.toFixed(2)} L) - Impossible consumption detected`;
      }
      // CHECK 2: Early Refuel (Suspicious)
      // IF ActualGapDays < FuelRuntimeDays − 2 THEN EarlyRefuel = TRUE
      else if (actualGapDays < fuelRuntimeDays - RUNTIME_BUFFER) {
        pairStatus = "Early Refuel";
        rootCauseHint = `Refueling after ${actualGapDays} days, but fuel should last ~${fuelRuntimeDays.toFixed(1)} days. Refueled ${(fuelRuntimeDays - actualGapDays).toFixed(1)} days early`;
      }
      // DEFAULT: NORMAL
      // IF ActualGapDays >= FuelRuntimeDays − 2 THEN Status = NORMAL

      // Add to discrepancies
      discrepancies.push({
        sitename: siteName,
        planneddate: prevDate.toISOString().split("T")[0],
        actualdate: currDate.toISOString().split("T")[0],
        span: actualGapDays,
        expectedconsumption: expectedUsed.toFixed(2),
        actualfueladded: prevTotalQty.toFixed(2),
        variance: ((expectedUsed - prevTotalQty) / prevTotalQty * 100).toFixed(2) + "%",
        status: pairStatus,
      });

      // Add to risk summary if not normal (avoid duplicates)
      if (pairStatus !== "Normal" && !riskSummary.some(r => r.sitename === siteName && r.issuetype === pairStatus)) {
        riskSummary.push({
          sitename: siteName,
          issuetype: pairStatus,
          rootcausehint: rootCauseHint,
        });
      }
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
