import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || ''
const TAB = process.env.GOOGLE_SHEETS_SURVEY_TAB || 'survey in articles'

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service account envs')
  }
  privateKey = privateKey.replace(/\\n/g, '\n')
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return auth
}

async function getSheets() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  return sheets
}

export async function ensurePollRow(pollId: string, question: string) {
  if (!SHEET_ID) throw new Error('Missing GOOGLE_SHEETS_ID')
  const sheets = await getSheets()
  const range = `${TAB}!A:E`
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
  const rows = res.data.values || []
  // Expect columns: A Question ID, B Question text, C Option 1, D Option 2, E Total votes
  let rowIndex = -1
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === pollId) {
      rowIndex = i
      break
    }
  }
  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[pollId, question, 0, 0, 0]],
      },
    })
  }
}

export async function incrementPollVote(pollId: string, option: 1 | 2) {
  if (!SHEET_ID) throw new Error('Missing GOOGLE_SHEETS_ID')
  const sheets = await getSheets()
  const range = `${TAB}!A:E`
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
  const rows = res.data.values || []
  let rowIndex = -1
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === pollId) {
      rowIndex = i
      break
    }
  }
  if (rowIndex === -1) {
    // If not exists, create then recurse
    await ensurePollRow(pollId, '')
    return incrementPollVote(pollId, option)
  }
  const row = rows[rowIndex]
  const c1 = parseInt(row[2] || '0', 10) || 0
  const c2 = parseInt(row[3] || '0', 10) || 0
  const newC1 = option === 1 ? c1 + 1 : c1
  const newC2 = option === 2 ? c2 + 1 : c2
  const total = newC1 + newC2
  const updateRange = `${TAB}!C${rowIndex + 1}:E${rowIndex + 1}`
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: updateRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[newC1, newC2, total]] },
  })
}

export async function getPollTotals(pollId: string): Promise<{ c1: number; c2: number; total: number } | null> {
  if (!SHEET_ID) throw new Error('Missing GOOGLE_SHEETS_ID')
  const sheets = await getSheets()
  const range = `${TAB}!A:E`
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
  const rows = res.data.values || []
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === pollId) {
      const c1 = parseInt(rows[i][2] || '0', 10) || 0
      const c2 = parseInt(rows[i][3] || '0', 10) || 0
      const total = parseInt(rows[i][4] || '0', 10) || c1 + c2
      return { c1, c2, total }
    }
  }
  return null
}
