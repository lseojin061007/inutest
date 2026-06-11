const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../종합강의시간표_1학기_전체.csv');
const outputPath = path.resolve(__dirname, '../lib/supabase/mockCourses.ts');

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
  
  if (lines.length === 0) {
    console.error('CSV is empty');
    return;
  }
  
  const headers = parseCSVLine(lines[0]);
  
  // Find indices
  const idxUniv = headers.indexOf('대학(원)');
  const idxDept = headers.indexOf('학과(부)');
  const idxGrade = headers.indexOf('학년');
  const idxClassification = headers.indexOf('이수구분');
  const idxCode = headers.indexOf('학수번호');
  const idxName = headers.indexOf('교과목명');
  const idxProfessor = headers.indexOf('담당교수');
  const idxRoom = headers.indexOf('강의실');
  const idxSchedule = headers.indexOf('시간표(교시)');
  const idxCredits = headers.indexOf('학점');
  const idxDescription = headers.indexOf('비고');
  const idxCapacity = headers.indexOf('정원');
  const idxEnrolled = headers.indexOf('수강');
  const idxForeign = headers.indexOf('원어강의');
  
  // Map college names in CSV to our college IDs
  const collegeMap = {
    '기초교육원': 'liberal-arts-edu',
    '교양': 'liberal-arts-edu',
    '인문대학': 'humanities',
    '자연과학대학': 'natural-sciences',
    '사회과학대학': 'social-sciences',
    '글로벌정경대학': 'global-politics',
    '공과대학': 'engineering',
    '정보기술대학': 'it',
    '경영대학': 'business',
    '예술체육대학': 'arts-sports',
    '사범대학': 'education',
    '도시과학대학': 'urban-sciences',
    '생명과학기술대학': 'life-sciences',
    '융합자유전공대학': 'integrated-liberal-arts',
    '동북아국제통상물류학부': 'northeast-asia-logistics',
    '법학부': 'law'
  };

  const collegeDepts = {};
  const courses = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;
    
    const rawUniv = row[idxUniv];
    const rawDept = row[idxDept];
    
    let collegeId = collegeMap[rawUniv];
    const rawDeptStr = rawDept || '';
    if (rawDeptStr.includes('IBE') || rawDeptStr.includes('동북아') || rawDeptStr.includes('스마트물류')) {
      collegeId = 'northeast-asia-logistics';
    }
    if (!collegeId) {
      if (rawUniv.includes('인문')) collegeId = 'humanities';
      else if (rawUniv.includes('자연')) collegeId = 'natural-sciences';
      else if (rawUniv.includes('사회')) collegeId = 'social-sciences';
      else if (rawUniv.includes('정경')) collegeId = 'global-politics';
      else if (rawUniv.includes('공과')) collegeId = 'engineering';
      else if (rawUniv.includes('정보기술') || rawUniv.includes('정통')) collegeId = 'it';
      else if (rawUniv.includes('경영')) collegeId = 'business';
      else if (rawUniv.includes('예술') || rawUniv.includes('체육')) collegeId = 'arts-sports';
      else if (rawUniv.includes('사범') || rawUniv.includes('교육')) collegeId = 'education';
      else if (rawUniv.includes('도시')) collegeId = 'urban-sciences';
      else if (rawUniv.includes('생명')) collegeId = 'life-sciences';
      else if (rawUniv.includes('자유전공')) collegeId = 'integrated-liberal-arts';
      else if (rawUniv.includes('동북아') || rawUniv.includes('물류')) collegeId = 'northeast-asia-logistics';
      else if (rawUniv.includes('법학')) collegeId = 'law';
      else collegeId = 'liberal-arts-edu';
    }
    
    let rawDeptName = rawDept || '일반';
    if (collegeId === 'liberal-arts-edu') {
      rawDeptName = '교양';
    }
    let deptId = rawDeptName
      .replace(/[^a-zA-Z0-9가-힣]/g, '')
      .toLowerCase();
    if (!deptId) deptId = 'general';
    
    if (!collegeDepts[collegeId]) {
      collegeDepts[collegeId] = {};
    }
    collegeDepts[collegeId][deptId] = rawDeptName;
    
    const gradeRaw = row[idxGrade];
    let grade = parseInt(gradeRaw) || 1;
    if (grade < 1 || grade > 4) grade = 1;
    
    const creditsRaw = row[idxCredits];
    let credits = parseInt(creditsRaw) || 3;
    
    let schedule = row[idxSchedule] || '시간표 없음';
    schedule = schedule.replace(/[\[\]"]/g, '').trim();
    if (schedule.includes(':')) {
      schedule = schedule.split(':')[1] || schedule;
    }
    
    let room = row[idxRoom] || '강의실 미지정';
    room = room.replace(/[\[\]"]/g, '').trim();
    if (room.includes('호관')) {
      const match = room.match(/제?(\d+)호관\s*([^,]+)/);
      if (match) {
        room = `${match[1]}호관 ${match[2].split(' ')[0] || ''}`.trim();
      }
    }
    
    const capacity = parseInt(row[idxCapacity]) || 0;
    const enrolled = parseInt(row[idxEnrolled]) || 0;
    const isForeign = row[idxForeign] === 'Y';
    const idxMethod = headers.indexOf('수업방법');
    const teachingMethod = idxMethod !== -1 ? (row[idxMethod] || '') : '';
    
    const course = {
      id: `c_${i}`,
      code: row[idxCode],
      name: row[idxName],
      collegeId: collegeId,
      departmentId: deptId,
      professor: row[idxProfessor] || '미지정',
      grade: grade,
      classification: row[idxClassification],
      credits: credits,
      schedule: schedule,
      room: room,
      description: row[idxDescription] || '',
      capacity: capacity,
      enrolled: enrolled,
      isForeign: isForeign,
      teachingMethod: teachingMethod
    };
    
    courses.push(course);
  }
  
  console.log(`Parsed ${courses.length} courses with full metrics`);

  // Build academicStructure
  const academicStructure = [
    { id: 'all', name: '대학전체', departments: [] }
  ];
  
  const collegeOrder = [
    { id: 'liberal-arts-edu', name: '기초교육원', hasLinkIcon: true },
    { id: 'humanities', name: '인문대학' },
    { id: 'natural-sciences', name: '자연과학대학' },
    { id: 'social-sciences', name: '사회과학대학' },
    { id: 'global-politics', name: '글로벌정경대학' },
    { id: 'engineering', name: '공과대학' },
    { id: 'it', name: '정보기술대학' },
    { id: 'business', name: '경영대학' },
    { id: 'arts-sports', name: '예술체육대학' },
    { id: 'education', name: '사범대학' },
    { id: 'urban-sciences', name: '도시과학대학' },
    { id: 'life-sciences', name: '생명과학기술대학' },
    { id: 'integrated-liberal-arts', name: '융합자유전공대학' },
    { id: 'northeast-asia-logistics', name: '동북아국제통상물류학부' },
    { id: 'law', name: '법학부' }
  ];
  
  collegeOrder.forEach(col => {
    const deptsObj = collegeDepts[col.id] || {};
    const departments = Object.keys(deptsObj).map(id => ({
      id: id,
      name: deptsObj[id]
    }));
    
    if (col.id === 'northeast-asia-logistics') {
      const order = ['IBE전공', '동북아국제통상전공', '스마트물류공학전공'];
      departments.sort((a, b) => {
        const idxA = order.indexOf(a.name);
        const idxB = order.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name, 'ko');
      });
    } else {
      departments.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
    
    academicStructure.push({
      id: col.id,
      name: col.name,
      departments: departments,
      hasLinkIcon: col.hasLinkIcon || false
    });
  });

  const tsContent = `export interface Department {
  id: string;
  name: string;
}

export interface College {
  id: string;
  name: string;
  departments: Department[];
  hasLinkIcon?: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  collegeId: string;
  departmentId: string;
  professor: string;
  grade: number;
  classification: string;
  credits: number;
  schedule: string;
  room: string;
  description: string;
  capacity: number;
  enrolled: number;
  isForeign: boolean;
  teachingMethod: string;
}

export const academicStructure: College[] = ${JSON.stringify(academicStructure, null, 2)};

export const mockCourses: Course[] = ${JSON.stringify(courses, null, 2)};
`;

  fs.writeFileSync(outputPath, tsContent, 'utf8');
  console.log('Successfully wrote courses to', outputPath);
}

run();
