import { google } from "googleapis";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

function getAuth() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64 || "";
  const json = Buffer.from(b64, "base64").toString("utf-8");
  const creds = JSON.parse(json) as ServiceAccount;
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

export async function getSheetData(
  spreadsheetId: string,
  range: string
): Promise<(string | number | boolean | null)[][]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as (string | number | boolean | null)[][]) || [];
}

export async function getSheetInfo(spreadsheetId: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return res.data;
}

export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean | null)[][]
) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
  return res.data;
}