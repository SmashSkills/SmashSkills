import type { WorksheetData } from "../worksheet.types"; // Nur WorksheetData importieren

/**
 * Generates a unique identifier for worksheets.
 * @returns {string} A unique ID combining timestamp and random number.
 */
export const generateUniqueId = (): string =>
  `sheet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Creates a default worksheet with initial content.
 * @returns {WorksheetData} A new worksheet with default title and body.
 */
export const createDefaultWorksheet = (): WorksheetData => ({
  id: generateUniqueId(),
  content: {
    title: "Mein Arbeitsblatt",
    body: "Klicken Sie hier, um zu beginnen...",
  },
});
