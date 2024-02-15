// utils/setGuildPoints.js
const authorize = require("../sheets");

async function setGuildPoints(guildLeaderID, guildRoleID, teamAPoints, teamBPoints, totalPoints, SPREADSHEET_ID) {
  try {
    // Authorize and get access to Google Sheets API
    const sheets = await authorize();

    // Fetch data from the spreadsheet
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "GUILDS DATABASE!A:E",
    });

    // Check if data is available
    if (!data || !data.values) {
      console.log("No data found.");
      return;
    }

    // Find the row that matches the provided guildRoleID
    const rowIndex = data.values.findIndex((row) => row[1] === guildRoleID);

    if (rowIndex >= 0) {
      // Update the existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `GUILDS DATABASE!B${rowIndex + 1}:E${rowIndex + 1}`,
        valueInputOption: "RAW",
        resource: {
          values: [[guildRoleID, teamAPoints, teamBPoints, totalPoints]],
        },
      });
    } else {
      // Append a new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "GUILDS DATABASE!A2:E",
        valueInputOption: "RAW",
        resource: {
          values: [[guildLeaderID, guildRoleID, teamAPoints, teamBPoints, totalPoints]],
        },
      });
    }
  } catch (error) {
    console.error("Error setting guild points:", error);
    // Handle the error gracefully, e.g., by logging it or re-throwing it
    throw error;
  }
}

module.exports = setGuildPoints;