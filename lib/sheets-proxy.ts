import { google } from "googleapis";

export type SheetRow = Record<string, string>;

export interface SheetData {
  data: SheetRow[];
  meta: { total: number; cached: boolean };
}

function applyFilter(
  rows: SheetRow[],
  query: Record<string, string>
): SheetRow[] {
  return rows.filter((row) => {
    for (const [key, val] of Object.entries(query)) {
      // Skip pagination params
      if (["page", "limit", "_row_id"].includes(key)) continue;
      // suffix operators: _gt, _lt, _gte, _lte, _ne
      if (key.endsWith("_gt")) {
        const field = key.slice(0, -3);
        if (Number(row[field]) <= Number(val)) return false;
      } else if (key.endsWith("_lt")) {
        const field = key.slice(0, -3);
        if (Number(row[field]) >= Number(val)) return false;
      } else if (key.endsWith("_gte")) {
        const field = key.slice(0, -4);
        if (Number(row[field]) < Number(val)) return false;
      } else if (key.endsWith("_lte")) {
        const field = key.slice(0, -4);
        if (Number(row[field]) > Number(val)) return false;
      } else if (key.endsWith("_ne")) {
        const field = key.slice(0, -3);
        if (row[field] === val) return false;
      } else {
        // exact match
        if (row[key] !== val) return false;
      }
    }
    return true;
  });
}

export async function readSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  query: Record<string, string> = {}
): Promise<SheetData> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  });

  const values = res.data.values ?? [];
  if (values.length === 0) {
    return { data: [], meta: { total: 0, cached: false } };
  }

  const [headers, ...rawRows] = values;
  const rows: SheetRow[] = rawRows.map((row, i) =>
    Object.fromEntries([
      ["_row_id", String(i + 2)], // row 1 = header, data starts at 2
      ...(headers as string[]).map((h, j) => [h, (row as string[])[j] ?? ""]),
    ])
  );

  const page = parseInt(query.page ?? "1", 10);
  const limit = Math.min(parseInt(query.limit ?? "100", 10), 1000);
  const filtered = applyFilter(rows, query);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    meta: { total: filtered.length, cached: false },
  };
}

export async function appendRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  body: SheetRow
): Promise<{ rowIndex: number }> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  // Get headers first
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });
  const headers = (headerRes.data.values?.[0] ?? []) as string[];

  const row = headers.map((h) => body[h] ?? "");

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  const updatedRange = appendRes.data.updates?.updatedRange ?? "";
  // Extract row number from range like "Sheet1!A5:B5"
  const match = updatedRange.match(/(\d+):/);
  const rowIndex = match ? parseInt(match[1], 10) : -1;

  return { rowIndex };
}

export async function updateRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowId: number,
  body: SheetRow
): Promise<void> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  // Get current row
  const rowRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${rowId}:${rowId}`,
  });
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const headers = (headerRes.data.values?.[0] ?? []) as string[];
  const currentRow = (rowRes.data.values?.[0] ?? []) as string[];
  const updated = headers.map((h, i) => body[h] ?? currentRow[i] ?? "");

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowId}:ZZ${rowId}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [updated] },
  });
}

export async function deleteRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowId: number,
  softDelete = false
): Promise<void> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  if (softDelete) {
    // Soft delete: set _deleted column
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    const headers = (headerRes.data.values?.[0] ?? []) as string[];
    const deletedIdx = headers.indexOf("_deleted");
    if (deletedIdx >= 0) {
      const col = String.fromCharCode(65 + deletedIdx);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!${col}${rowId}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["true"]] },
      });
      return;
    }
  }

  // Get spreadsheet ID for batchUpdate
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowId - 1,
              endIndex: rowId,
            },
          },
        },
      ],
    },
  });
}

export async function listSpreadsheets(
  accessToken: string
): Promise<Array<{ id: string; name: string }>> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: "files(id, name)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id ?? "",
    name: f.name ?? "",
  }));
}

export async function listSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<Array<{ title: string; sheetId: number }>> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return (res.data.sheets ?? []).map((s) => ({
    title: s.properties?.title ?? "",
    sheetId: s.properties?.sheetId ?? 0,
  }));
}

export async function previewSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<SheetRow[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:ZZ6`, // header + 5 rows
  });

  const values = res.data.values ?? [];
  if (values.length === 0) return [];

  const [headers, ...rawRows] = values;
  return rawRows.map((row, i) =>
    Object.fromEntries([
      ["_row_id", String(i + 2)],
      ...(headers as string[]).map((h, j) => [h, (row as string[])[j] ?? ""]),
    ])
  );
}
