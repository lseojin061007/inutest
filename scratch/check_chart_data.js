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

function classifyTime(sched) {
  if (!sched || sched === '시간표 없음') return null;
  // Look for morning periods: 1, 2, 3
  if (/\b[1-3]\b/.test(sched) || /\b[1-3]B\b/.test(sched) || /\b[1-3]A\b/.test(sched) || /1-2A|2B-3/.test(sched)) {
    return '오전 9-12시';
  }
  // Look for midday periods: 4, 5, 6
  if (/\b[4-6]\b/.test(sched) || /\b[4-6]B\b/.test(sched) || /\b[4-6]A\b/.test(sched) || /4-5A|5B-6/.test(sched)) {
    return '12-15시';
  }
  // Look for afternoon periods: 7, 8, 9
  if (/\b[7-9]\b/.test(sched) || /\b[7-9]B\b/.test(sched) || /\b[7-9]A\b/.test(sched) || /7-8A|8B-9/.test(sched)) {
    return '15-18시';
  }
  // Check evening
  if (sched.includes('야')) {
    return '15-18시'; // fold evening into afternoon or 15-18시
  }
  return '12-15시'; // fallback
}

function run() {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;
  
  const headers = parseCSVLine(lines[0]);
  const schedIdx = headers.indexOf('시간표(교시)');
  
  const dayCounts = { "월": 0, "화": 0, "수": 0, "목": 0, "금": 0, "토": 0 };
  const timeCounts = { "오전 9-12시": 0, "12-15시": 0, "15-18시": 0 };
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;
    
    let sched = row[schedIdx] || '시간표 없음';
    sched = sched.replace(/[\[\]"]/g, '').trim();
    if (sched.includes(':')) {
      sched = sched.split(':')[1] || sched;
    }
    
    // Days
    Object.keys(dayCounts).forEach(day => {
      if (sched.includes(day)) {
        dayCounts[day]++;
      }
    });
    
    // Time
    const t = classifyTime(sched);
    if (t) {
      timeCounts[t]++;
    }
  }
  
  console.log('Day counts:', dayCounts);
  console.log('Time counts:', timeCounts);
}

run();
