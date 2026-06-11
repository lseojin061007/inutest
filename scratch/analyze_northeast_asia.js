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
  const univIdx = headers.indexOf('대학(원)');
  const deptIdx = headers.indexOf('학과(부)');
  
  const matched = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;
    
    const u = row[univIdx];
    const d = row[deptIdx];
    
    if (d.includes('IBE') || d.includes('동북아') || d.includes('스마트물류') || u.includes('동북아')) {
      matched.push({ univ: u, dept: d, name: row[headers.indexOf('교과목명')] });
    }
  }
  
  console.log('Total matched:', matched.length);
  const uniqPairs = {};
  matched.forEach(m => {
    const key = `${m.univ} -> ${m.dept}`;
    uniqPairs[key] = (uniqPairs[key] || 0) + 1;
  });
  console.log('Unique pairs:', uniqPairs);
}

run();
