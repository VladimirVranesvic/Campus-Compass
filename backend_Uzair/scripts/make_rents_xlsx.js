// NSW Rental Bond seeder (cell-address based): builds medians by (postcode, dwelling)
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const inFile  = path.resolve(__dirname, "../src/data_raw/nsw_rental_bond_jul2025.xlsx");
const outFile = path.resolve(__dirname, "../src/data/rent_medians.json");

if (!fs.existsSync(inFile)) {
  console.error("❌ Input XLSX not found:", inFile);
  process.exit(1);
}
console.log("📖 Reading:", inFile);

const toStr = v => String(v ?? "").trim();
const low   = v => toStr(v).toLowerCase();
const toNum = v => {
  const n = Number(toStr(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const bedroomsToDwelling = b => {
  const n = Number(b);
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "studio";
  return `${n}-bed`;
};
const median = arr => {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a,b)=>a-b);
  const m = Math.floor(s.length/2);
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
};

// Read workbook
const wb = XLSX.readFile(inFile, { cellDates: true });
const outMap = new Map(); // "postcode|dwelling" -> array of rents

for (const name of wb.SheetNames) {
  const sh = wb.Sheets[name];
  if (!sh || !sh["!ref"]) continue;

  // Find header row by scanning for a cell whose value looks like "Postcode"
  let headerRow = -1;
  for (const addr of Object.keys(sh)) {
    if (!/^[A-Z]+[0-9]+$/.test(addr)) continue; // skip meta keys
    const v = toStr(sh[addr].v);
    if (/post\s*code|postcode|poa/i.test(v)) {
      headerRow = parseInt(addr.match(/\d+/)[0], 10);
      break;
    }
  }
  if (headerRow === -1) {
    console.warn(`⚠️  Skipping sheet '${name}' (couldn't find header row).`);
    continue;
  }

  // Read the sheet range, then collect header names & column indices
  const range = XLSX.utils.decode_range(sh["!ref"]);
  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ c, r: headerRow - 1 });
    headers[c] = toStr(sh[addr]?.v ?? "");
  }

  // Locate the columns we need
  const findCol = (cands) => {
    const idx = headers.findIndex(h => cands.some(c => low(h).includes(low(c))));
    return idx; // -1 if not found
  };

  const cPostcode = findCol(["Postcode","POA","Post code"]);
  const cBedrooms = findCol(["Bedrooms"]);
  const cWeekly   = findCol(["Weekly Rent","Weekly\nRent","Weekly  Rent"]);

  if (cPostcode === -1 || cBedrooms === -1 || cWeekly === -1) {
    console.warn(`⚠️  '${name}': missing one of [Postcode, Bedrooms, Weekly Rent]. Headers:`, headers);
    continue;
  }

  // Walk rows after the headerRow
  for (let r = headerRow; r <= range.e.r; r++) {
    const cell = (c) => sh[XLSX.utils.encode_cell({ c, r })];
    const postcode = toStr(cell(cPostcode)?.v).replace(/[^0-9]/g, "");
    const dwelling = bedroomsToDwelling(cell(cBedrooms)?.v);
    const rent     = toNum(cell(cWeekly)?.v);

    if (!postcode || postcode.length < 4) continue;
    if (!dwelling) continue;
    if (!Number.isFinite(rent)) continue;

    const key = `${postcode}|${dwelling}`;
    if (!outMap.has(key)) outMap.set(key, []);
    outMap.get(key).push(rent);
  }
}

// Build medians
const out = [];
for (const [key, rents] of outMap.entries()) {
  const [postcode, dwelling_type] = key.split("|");
  const med = median(rents);
  if (Number.isFinite(med)) {
    out.push({ postcode, dwelling_type, median_weekly_rent: Math.round(med) });
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(`✅ Wrote ${out.length} rows -> ${outFile}`);
