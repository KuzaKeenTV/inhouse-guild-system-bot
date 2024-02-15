const authorize = require("../sheets");
const { SPREADSHEET_ID } = require("../config.js");

async function deleteGuildData(guildRoleID) {
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

    // Find the row index that matches the provided guildRoleID
    const rowIndex = data.values.findIndex((row) => row[1] === guildRoleID);

    if (rowIndex >= 0) {
      // Delete the row from the spreadsheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: data.sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex + 1,
                  endIndex: rowIndex + 2,
                },
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error deleting guild data:", error);
    throw error;
  }
}

module.exports = deleteGuildData;
