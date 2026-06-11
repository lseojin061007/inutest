const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../종합강의시간표_1학기_전체.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function run() {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;
  
  const headers = parseCSVLine(lines[0]);
  const schedIdx = headers.indexOf('시간표(교시)');
  const timeIdx = headers.indexOf('시간표(시간)');
  
  const sample = [];
  for (let i = 1; i < Math.min(lines.length, 100); i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;
    sample.push({ sched: row[schedIdx], time: row[timeIdx] });
  }
  
  console.log('Sample rows:', sample);
}

run();
