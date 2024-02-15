// utils/getGuildPoints.js
const authorize = require("../sheets");

async function getGuildPoints(guildRoleID, SPREADSHEET_ID) {
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
      return { teamAPoints: 0, teamBPoints: 0, totalPoints: 0 };
    }

    // Find the row that matches the provided role ID (column 1)
    const row = data.values.find((row) => row[1] === guildRoleID);

    // Check if a matching row was found
    if (!row) {
      return { teamAPoints: 0, teamBPoints: 0, totalPoints: 0 };
    }

    // Parse the data from the row
    const teamAPoints = parseInt(row[2]) || 0;
    const teamBPoints = parseInt(row[3]) || 0;
    const totalPoints = teamAPoints + teamBPoints;

    return { teamAPoints, teamBPoints, totalPoints };

  } catch (error) {
    console.error("Error fetching role points:", error);
    // Throw the error to be caught by the caller
    throw error;
  }
}

module.exports = getGuildPoints;