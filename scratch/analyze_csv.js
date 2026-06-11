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
  
  const uniqClass = {};
  const uniqCredits = {};
  const uniqMethods = {};
  const uniqForeign = {};
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;
    
    const classification = row[headers.indexOf('이수구분')];
    const credits = row[headers.indexOf('학점')];
    const method = row[headers.indexOf('수업방법')];
    const foreign = row[headers.indexOf('원어강의')];
    
    uniqClass[classification] = (uniqClass[classification] || 0) + 1;
    uniqCredits[credits] = (uniqCredits[credits] || 0) + 1;
    uniqMethods[method] = (uniqMethods[method] || 0) + 1;
    uniqForeign[foreign] = (uniqForeign[foreign] || 0) + 1;
  }
  
  console.log('Class:', uniqClass);
  console.log('Credits:', uniqCredits);
  console.log('Methods:', uniqMethods);
  console.log('Foreign:', uniqForeign);
}

run();
