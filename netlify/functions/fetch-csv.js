const fetch = require("node-fetch");

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1uWbVwsJ6mgUl9WxJz-zbxMaiCW-dG3DI_9gvKkEca18/gviz/tq?tqx=out:csv&gid=1149576218";

exports.handler = async (event, context) => {
  try {
    console.log("[Netlify Function] Fetching CSV from Google Sheets...");

    const response = await fetch(CSV_URL, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    if (!response.ok) {
      console.error(
        `[Netlify Function] Google Sheets returned status ${response.status}`,
      );
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Failed to fetch CSV: ${response.statusText}`,
        }),
      };
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      console.warn("[Netlify Function] CSV is empty");
      return {
        statusCode: 204,
        body: "",
      };
    }

    console.log(
      `[Netlify Function] CSV fetched successfully (${csvText.length} bytes)`,
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60",
      },
      body: csvText,
    };
  } catch (error) {
    console.error("[Netlify Function] Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
