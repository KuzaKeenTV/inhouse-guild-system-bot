// utils/fetchGuildData.js
const authorize = require("../sheets");

/**
 * Fetches guild data from the spreadsheet.
 * @param {string} guildLeaderId The ID of the guild leader.
 * @param {string} SPREADSHEET_ID The ID of the Google Sheets spreadsheet.
 * @returns {Promise<{ guildRoleId: string | undefined }>} A promise that resolves to an object containing the guild leader role ID.
 */

async function fetchGuildData(guildLeaderId, SPREADSHEET_ID) {
  try {
    // Fetch guild data from the spreadsheet
    const sheets = await authorize();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "GUILDS DATABASE!A:E",
    });
    const guildData = response.data.values;
    let guildRoleId;

    guildData.forEach((row) => {
      const [leaderId, roleId] = row;
      if (leaderId === guildLeaderId) {
        guildRoleId = roleId;
      }
    });

    return { guildRoleId };
  } catch (error) {
    console.error("Error fetching guild data:", error);
    throw new Error("An error occurred while fetching guild data.");
  }
}

module.exports = fetchGuildData;
