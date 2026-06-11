"use client"

import React, { useState, useEffect, useMemo } from "react"
import { createClient } from "../lib/supabase/client"
import { academicStructure, mockCourses, Course, College, Department } from "../lib/supabase/mockCourses"

const HorizontalBar = ({ label, value, max, isGold, unit = "value" }: { label: string; value: number; max: number; isGold?: boolean; unit?: string }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 group relative">
      <div className="w-20 text-slate-700 font-medium text-xs text-right truncate shrink-0">{label}</div>
      <div className="flex-1 bg-slate-100/80 rounded-full h-4 overflow-hidden relative border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isGold 
              ? "bg-[#fbbf24]" 
              : "bg-gradient-to-r from-indigo-300 to-indigo-100 border-r border-indigo-400/30"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-14 text-slate-500 font-mono text-xs text-left shrink-0">{value.toLocaleString()}</div>
      
      {/* Tooltip */}
      <div className="absolute left-[calc(80px+10%+20px)] top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mt-6 ml-4">
        <div className="bg-slate-100/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-lg py-2 px-3 text-[11px] text-slate-700 flex flex-col gap-1 whitespace-nowrap min-w-[80px]">
          <span className="font-semibold text-xs">{label}</span>
          <span className="font-medium">{unit === "value" ? `value : ${value.toLocaleString()}` : `${unit} : ${value.toLocaleString()}개`}</span>
        </div>
      </div>
    </div>
  )
}

const DonutChart = ({ data, total, centerLabel }: { 
  data: { label: string; value: number; color: string; percentage: number }[];
  total: string;
  centerLabel: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  let accumulated = 0;
  const segments = data.map(item => {
    const start = accumulated;
    accumulated += item.percentage;
    return { ...item, start, end: accumulated };
  });

  const gradientParts = segments.map((item) => {
    return `${item.color} ${item.start}% ${item.end}%`
  }).join(", ");

  const conicStyle = {
    background: `conic-gradient(${gradientParts})`
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    const percentage = (angle / 360) * 100;
    
    const foundIndex = segments.findIndex(seg => percentage >= seg.start && percentage <= seg.end);
    setHoveredIndex(foundIndex !== -1 ? foundIndex : null);
  };

  const handleMouseLeave = () => setHoveredIndex(null);

  return (
    <div className="flex items-center gap-6">
      <div 
        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-md border border-slate-200/50 overflow-hidden" 
        style={conicStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute w-22 h-22 bg-white rounded-full flex flex-col items-center justify-center shadow-inner pointer-events-none z-10">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{centerLabel}</span>
          <span className="text-base font-black text-slate-800 font-mono mt-0.5">{total}</span>
        </div>

        {/* Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-slate-900/5 backdrop-blur-[1px]">
            <div className="bg-slate-100/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-lg py-2 px-3 text-[11px] text-slate-700 flex flex-col items-center justify-center gap-1 whitespace-nowrap min-w-[90px]">
              <span className="font-bold text-[10px] text-slate-500 tracking-wider uppercase">{centerLabel}</span>
              <span className="font-black text-sm font-mono leading-none">{total}</span>
              <span className="font-bold mt-0.5" style={{ color: segments[hoveredIndex].color }}>
                강좌 수 : {segments[hoveredIndex].value}개
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between text-xs transition-opacity ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2 text-slate-600 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.label}</span>
            </div>
            <span className="font-bold text-slate-700 font-mono ml-2">{item.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DashboardFooter = () => (
  <footer className="w-full mt-12 pt-8 pb-4 border-t border-slate-200/60 text-slate-500">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Incheon National University Course Dashboard
      </div>
      <div className="flex items-center gap-5 text-[11px] font-bold text-slate-400 tracking-wide">
        <a href="https://www.inu.ac.kr" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">인천대학교 홈페이지</a>
        <a href="https://portal.inu.ac.kr" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">INU 포털</a>
        <a href="https://cyber.inu.ac.kr" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">이러닝</a>
      </div>
    </div>
    <div className="pt-6 border-t border-slate-100/80 flex flex-col items-end gap-1 text-[10px] text-slate-400 px-2">
      <p className="font-semibold text-slate-500">Designed & Developed by 202501183 seojin lee</p>
      <p>© 2026 Incheon National University.</p>
    </div>
  </footer>
)

export default function CourseDashboard() {
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("all")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null)
  
  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<"dashboard" | "catalog">("dashboard")
  
  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiStatus, setAiStatus] = useState<"loading" | "complete">("loading")
  
  // Collapsible sidebar college states (all initially expanded as per instructions)
  const [expandedColleges, setExpandedColleges] = useState<Record<string, boolean>>({
    "liberal-arts-edu": true,
    "humanities": true,
    "natural-sciences": true,
    "social-sciences": true,
    "global-politics": true,
    "engineering": true,
    "it": true,
    "business": true,
    "arts-sports": true,
    "education": true,
    "urban-sciences": true,
    "life-sciences": true,
    "integrated-liberal-arts": true,
    "northeast-asia-logistics": true,
    "law": true,
  })

  // Cart state
  const [cart, setCart] = useState<Course[]>([])
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  
  // Detail panel state
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null)

  // Pagination state for overall dashboard detailed courses list
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCollegeId, selectedDepartmentId])
  
  // Supabase states
  const [supabaseCourses, setSupabaseCourses] = useState<Course[]>([])
  const [useSupabase, setUseSupabase] = useState<boolean>(false)
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "not_initialized" | "error">("checking")
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false)
  const [initializingDb, setInitializingDb] = useState<boolean>(false)

  const supabase = createClient()

  // Toggle college collapse
  const toggleCollege = (collegeId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting college when clicking chevron
    setExpandedColleges(prev => ({
      ...prev,
      [collegeId]: !prev[collegeId]
    }))
  }

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("inu_course_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Save cart to localStorage
  const saveCart = (newCart: Course[]) => {
    setCart(newCart)
    localStorage.setItem("inu_course_cart", JSON.stringify(newCart))
  }

  // Fetch courses from Supabase
  const fetchSupabaseCourses = async () => {
    try {
      setSupabaseStatus("checking")
      const { data, error } = await supabase.from("courses").select("*")
      if (error) {
        throw error
      }
      if (data && data.length > 0) {
        const mappedData: Course[] = data.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          collegeId: item.college_id || item.collegeId,
          departmentId: item.department_id || item.departmentId,
          professor: item.professor,
          grade: item.grade,
          classification: item.classification,
          credits: item.credits,
          schedule: item.schedule,
          room: item.room,
          description: item.description || "",
          capacity: item.capacity !== undefined ? item.capacity : 0,
          enrolled: item.enrolled !== undefined ? item.enrolled : 0,
          isForeign: item.is_foreign !== undefined ? item.is_foreign : (item.isForeign || false),
          teachingMethod: item.teaching_method || item.teachingMethod || ""
        }))
        setSupabaseCourses(mappedData)
        setUseSupabase(true)
        setSupabaseStatus("connected")
      } else {
        setSupabaseStatus("not_initialized")
        setUseSupabase(false)
      }
    } catch (e: any) {
      console.warn("Supabase courses table query failed. Falling back to local mock data.", e.message)
      setSupabaseStatus("not_initialized")
      setUseSupabase(false)
    }
  }

  useEffect(() => {
    fetchSupabaseCourses()
  }, [])

  // Active courses source
  const currentCourses = useMemo(() => {
    return useSupabase ? supabaseCourses : mockCourses
  }, [useSupabase, supabaseCourses])

  // Filtered courses based on selected college and department for the dashboard stats and list
  const dashboardCourses = useMemo(() => {
    if (selectedCollegeId === "all") {
      return currentCourses
    }
    if (selectedDepartmentId) {
      return currentCourses.filter(c => c.collegeId === selectedCollegeId && c.departmentId === selectedDepartmentId)
    }
    return currentCourses.filter(c => c.collegeId === selectedCollegeId)
  }, [currentCourses, selectedCollegeId, selectedDepartmentId])

  // Filter logic for Catalog View
  const filteredCourses = useMemo(() => {
    return currentCourses.filter((course) => {
      // 1. College filter
      if (selectedCollegeId !== "all") {
        if (course.collegeId !== selectedCollegeId) return false
      }
      
      // 2. Department filter
      if (selectedDepartmentId && course.departmentId !== selectedDepartmentId) {
        return false
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = course.name.toLowerCase().includes(query)
        const matchCode = course.code.toLowerCase().includes(query)
        const matchProf = course.professor.toLowerCase().includes(query)
        if (!matchName && !matchCode && !matchProf) return false
      }

      // 4. Grade filter
      if (selectedGrade !== null && course.grade !== selectedGrade) {
        return false
      }

      // 5. Classification filter
      if (selectedClassification !== null && course.classification !== selectedClassification) {
        return false
      }

      return true
    })
  }, [currentCourses, selectedCollegeId, selectedDepartmentId, searchQuery, selectedGrade, selectedClassification])

  // Helper names for breadcrumbs and titles
  const collegeName = useMemo(() => {
    return academicStructure.find(c => c.id === selectedCollegeId)?.name || ""
  }, [selectedCollegeId])

  const departmentName = useMemo(() => {
    return academicStructure.find(c => c.id === selectedCollegeId)?.departments.find(d => d.id === selectedDepartmentId)?.name || ""
  }, [selectedCollegeId, selectedDepartmentId])

  // Calculate dynamic metrics for Catalog View using real CSV-imported fields
  const catalogMetrics = useMemo(() => {
    if (filteredCourses.length === 0) {
      return { courses: 0, students: 0, enrollment: 0, foreign: 0 }
    }
    
    let totalStudents = 0
    let totalCapacity = 0
    let foreignCount = 0
    
    filteredCourses.forEach(course => {
      totalStudents += course.enrolled
      totalCapacity += course.capacity
      if (course.isForeign) foreignCount++
    })
    
    const avgEnrollment = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0
    const foreignRatio = (foreignCount / filteredCourses.length) * 100
    
    return {
      courses: filteredCourses.length,
      students: totalStudents,
      enrollment: avgEnrollment,
      foreign: foreignRatio
    }
  }, [filteredCourses])

  // Calculate dynamic metrics and charts distributions for the Overall Dashboard View
  const dashboardStats = useMemo(() => {
    const targetCourses = dashboardCourses

    const totalCourses = targetCourses.length
    let totalStudents = 0
    let totalCapacity = 0
    let foreignCount = 0
    
    const classCounts: Record<string, number> = {}
    const classStudents: Record<string, number> = {}
    const methodCounts: Record<string, number> = {}
    const creditCounts: Record<string, number> = {}
    const dayCounts: Record<string, number> = { "월": 0, "화": 0, "수": 0, "목": 0, "금": 0, "토": 0 }
    const timeCounts: Record<string, number> = { "오전 9-12시": 0, "12-15시": 0, "15-18시": 0 }
    
    targetCourses.forEach(course => {
      totalStudents += course.enrolled
      totalCapacity += course.capacity
      if (course.isForeign) {
        foreignCount++
      }
      
      const cls = course.classification || "기타"
      classCounts[cls] = (classCounts[cls] || 0) + 1
      classStudents[cls] = (classStudents[cls] || 0) + course.enrolled
      
      // Map teachingMethod to distribution labels
      let methodGroup = "대면수업"
      const tm = course.teachingMethod || ""
      if (tm.includes("온라인(동영상)+오프라인") || tm.includes("화상)+오프라인")) {
        methodGroup = "온라인(동영상)+오프라인(대면)"
      } else if (tm === "온라인(동영상)") {
        methodGroup = "온라인(동영상)"
      } else if (tm.includes("화상")) {
        methodGroup = "온라인(실시간화상)"
      } else if (course.room.includes("온라인") || course.description.includes("온라인")) {
        methodGroup = "온라인(동영상)"
      }
      methodCounts[methodGroup] = (methodCounts[methodGroup] || 0) + 1
      
      const cred = `${course.credits}학점`
      creditCounts[cred] = (creditCounts[cred] || 0) + 1
      
      // Days of the week counts
      const sched = course.schedule || ""
      Object.keys(dayCounts).forEach(day => {
        if (sched.includes(day)) {
          dayCounts[day]++
        }
      })
      
      // Time bucket classification
      let timeBucket = "12-15시" // fallback
      if (sched && sched !== "시간표 없음") {
        if (/\b[1-3]\b/.test(sched) || /\b[1-3]B\b/.test(sched) || /\b[1-3]A\b/.test(sched) || /1-2A|2B-3/.test(sched)) {
          timeBucket = "오전 9-12시"
        } else if (/\b[4-6]\b/.test(sched) || /\b[4-6]B\b/.test(sched) || /\b[4-6]A\b/.test(sched) || /4-5A|5B-6/.test(sched)) {
          timeBucket = "12-15시"
        } else if (/\b[7-9]\b/.test(sched) || /\b[7-9]B\b/.test(sched) || /\b[7-9]A\b/.test(sched) || /7-8A|8B-9/.test(sched) || sched.includes("야")) {
          timeBucket = "15-18시"
        }
      }
      timeCounts[timeBucket]++
    })
    
    const avgEnrollment = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0
    const foreignRatio = totalCourses > 0 ? (foreignCount / totalCourses) * 100 : 0
    
    const sortedClasses = Object.keys(classCounts)
      .map(name => ({
        name,
        count: classCounts[name],
        avgStudents: classCounts[name] > 0 ? Math.round(classStudents[name] / classCounts[name]) : 0
      }))
      .sort((a, b) => b.count - a.count)
      
    const sortedClassesByAvgStudents = [...sortedClasses]
      .sort((a, b) => b.avgStudents - a.avgStudents)
      
    const totalMethodCourses = Object.values(methodCounts).reduce((a, b) => a + b, 0)
    const methodData = [
      { label: "대면수업", value: methodCounts["대면수업"] || 0, color: "#4f46e5" },
      { label: "온라인(동영상)+오프라인(대면)", value: methodCounts["온라인(동영상)+오프라인(대면)"] || 0, color: "#10b981" },
      { label: "온라인(동영상)", value: methodCounts["온라인(동영상)"] || 0, color: "#f59e0b" },
      { label: "온라인(실시간화상)", value: methodCounts["온라인(실시간화상)"] || 0, color: "#cbd5e1" },
    ].map(m => ({
      ...m,
      percentage: totalMethodCourses > 0 ? (m.value / totalMethodCourses) * 100 : 0
    }))
    
    const totalCreditCourses = Object.values(creditCounts).reduce((a, b) => a + b, 0)
    const creditGroups = ["3학점", "1학점", "2학점"]
    let otherCount = 0
    Object.keys(creditCounts).forEach(k => {
      if (!creditGroups.includes(k)) {
        otherCount += creditCounts[k]
      }
    })
    
    const creditData = [
      { label: "3학점", value: creditCounts["3학점"] || 0, color: "#3b82f6" },
      { label: "1학점", value: creditCounts["1학점"] || 0, color: "#10b981" },
      { label: "2학점", value: creditCounts["2학점"] || 0, color: "#fbbf24" },
      { label: "기타", value: otherCount, color: "#e2e8f0" }
    ].map(c => ({
      ...c,
      percentage: totalCreditCourses > 0 ? (c.value / totalCreditCourses) * 100 : 0
    }))
    
    const maxDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, "화")
    const dayData = Object.keys(dayCounts).map(day => ({
      label: day,
      value: dayCounts[day],
      isGold: day === maxDay
    }))
    
    const maxTime = Object.keys(timeCounts).reduce((a, b) => timeCounts[a] > timeCounts[b] ? a : b, "15-18시")
    const timeData = Object.keys(timeCounts).map(time => ({
      label: time,
      value: timeCounts[time],
      isGold: time === maxTime
    }))
    
    return {
      totalCourses,
      totalStudents,
      avgEnrollment,
      foreignRatio,
      classificationsCount: sortedClasses.slice(0, 6),
      classificationsAvgStudents: sortedClassesByAvgStudents.slice(0, 6),
      methodData,
      creditData,
      dayData,
      timeData
    }
  }, [dashboardCourses])

  const maxCountVal = useMemo(() => {
    const vals = dashboardStats.classificationsCount.map(item => item.count)
    return vals.length > 0 ? Math.max(...vals, 4) : 4
  }, [dashboardStats.classificationsCount])

  const maxAvgVal = useMemo(() => {
    const vals = dashboardStats.classificationsAvgStudents.map(item => item.avgStudents)
    return vals.length > 0 ? Math.max(...vals, 4) : 4
  }, [dashboardStats.classificationsAvgStudents])

  const maxDayVal = useMemo(() => {
    const vals = dashboardStats.dayData.map(item => item.value)
    return vals.length > 0 ? Math.max(...vals, 4) : 4
  }, [dashboardStats.dayData])

  const maxTimeVal = useMemo(() => {
    const vals = dashboardStats.timeData.map(item => item.value)
    return vals.length > 0 ? Math.max(...vals, 4) : 4
  }, [dashboardStats.timeData])

  // College-wise summary calculation for overall dashboard overview
  const collegeSummaries = useMemo(() => {
    return academicStructure
      .filter(col => col.id !== "all")
      .map(col => {
        const collegeCourses = currentCourses.filter(c => c.collegeId === col.id)
        let totalEnrolled = 0
        let totalCapacity = 0
        collegeCourses.forEach(c => {
          totalEnrolled += c.enrolled
          totalCapacity += c.capacity
        })
        const avgEnrollment = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0
        return {
          id: col.id,
          name: col.name,
          courseCount: collegeCourses.length,
          totalEnrolled,
          avgEnrollment
        }
      })
      .sort((a, b) => {
        if (b.courseCount !== a.courseCount) {
          return b.courseCount - a.courseCount
        }
        return b.avgEnrollment - a.avgEnrollment
      })
      .slice(0, 10)
  }, [currentCourses])

  // Pagination course slice
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * 10
    const end = start + 10
    return dashboardCourses.slice(start, end)
  }, [dashboardCourses, currentPage])

  const totalPages = Math.ceil(dashboardCourses.length / 10)

  // Generate pagination array like [1, 2, 3, '...', 232]
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }
    return pages
  }, [currentPage, totalPages])

  // Department-wise summary calculation for selected college dashboard
  const departmentSummaries = useMemo(() => {
    if (selectedCollegeId === "all") return []
    const currentCollege = academicStructure.find(c => c.id === selectedCollegeId)
    if (!currentCollege) return []

    return currentCollege.departments
      .map(dept => {
        const deptCourses = currentCourses.filter(
          c => c.collegeId === selectedCollegeId && c.departmentId === dept.id
        )
        let totalEnrolled = 0
        let totalCapacity = 0
        deptCourses.forEach(c => {
          totalEnrolled += c.enrolled
          totalCapacity += c.capacity
        })
        const avgEnrollment = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0
        return {
          id: dept.id,
          name: dept.name,
          courseCount: deptCourses.length,
          totalEnrolled,
          avgEnrollment
        }
      })
      .sort((a, b) => {
        if (b.courseCount !== a.courseCount) {
          return b.courseCount - a.courseCount
        }
        return b.avgEnrollment - a.avgEnrollment
      })
      .slice(0, 10)
  }, [currentCourses, selectedCollegeId])

  // Add course to cart
  const addToCart = (course: Course) => {
    if (cart.some((item) => item.id === course.id)) {
      alert("이미 관심과목에 담긴 교과목입니다.")
      return
    }
    const newCart = [...cart, course]
    saveCart(newCart)
  }

  // Remove course from cart
  const removeFromCart = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id)
    saveCart(newCart)
  }

  // Total credits in cart
  const totalCredits = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.credits, 0)
  }, [cart])

  // Reset all filters
  const resetFilters = () => {
    setSelectedCollegeId("all")
    setSelectedDepartmentId("")
    setSearchQuery("")
    setSelectedGrade(null)
    setSelectedClassification(null)
  }

  // Handle department click (Switches to dashboard view)
  const selectDepartment = (collegeId: string, departmentId: string) => {
    setSelectedCollegeId(collegeId)
    setSelectedDepartmentId(departmentId)
    setCurrentView("dashboard")
  }

  // Handle college click (Switches to dashboard view)
  const selectCollege = (collegeId: string) => {
    setSelectedCollegeId(collegeId)
    setSelectedDepartmentId("") 
    setCurrentView("dashboard")
  }

  // Handle overall dashboard select
  const selectOverallDashboard = () => {
    setSelectedCollegeId("all")
    setSelectedDepartmentId("")
    setCurrentView("dashboard")
  }

  // Push mock data to Supabase
  const pushMockDataToSupabase = async () => {
    try {
      setInitializingDb(true)
      const payload = mockCourses.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        college_id: c.collegeId,
        department_id: c.departmentId,
        professor: c.professor,
        grade: c.grade,
        classification: c.classification,
        credits: c.credits,
        schedule: c.schedule,
        room: c.room,
        description: c.description,
        capacity: c.capacity,
        enrolled: c.enrolled,
        is_foreign: c.isForeign,
        teaching_method: c.teachingMethod
      }))

      const { error } = await supabase.from("courses").insert(payload)
      if (error) throw error

      alert("Supabase 데이터베이스에 교과목 데이터가 성공적으로 주입되었습니다!")
      fetchSupabaseCourses()
    } catch (e: any) {
      alert(`데이터 주입 실패: ${e.message}\n먼저 SQL 가이드를 참고하여 Supabase 테이블을 생성하고 RLS 권한을 부여해주세요.`)
    } finally {
      setInitializingDb(false)
    }
  }

  // Helper component for Horizontal Bar Charts

  const targetScopeName = selectedDepartmentId 
      ? `${collegeName} ${departmentName}` 
      : selectedCollegeId === "all" 
        ? "전체" 
        : collegeName;

  const handleAiAnalysisClick = () => {
    setShowAiModal(true)
    setAiStatus("loading")
    setTimeout(() => {
      setAiStatus("complete")
    }, 2500)
  }

  const getMockAiAnalysis = () => {
    const dateStr = "2026년 6월 8일";
    const modelStr = "Gemini 3.1 Flash-Lite";
    
    // Fallbacks for data to avoid errors if array is empty
    const topClass = dashboardStats.classificationsCount.length > 0 ? dashboardStats.classificationsCount[0].name : "전공심화";
    const topClassCount = dashboardStats.classificationsCount.length > 0 ? dashboardStats.classificationsCount[0].count : 1014;
    const faceToFace = dashboardStats.methodData.find((m: any) => m.label === "대면수업");
    const faceToFaceRatio = faceToFace ? faceToFace.percentage.toFixed(1) : "92.0";

    return `=== AI 강의 데이터 분석 보고서 ===
분석 대상: ${targetScopeName}
일자: ${dateStr}
작성 모델: ${modelStr}

# [분석 보고서] 2026학년도 1학기 인천대학교 교육과정 및 강좌 운영 분석

**작성일:** ${dateStr}
**분석 대상:** 인천대학교 2026학년도 1학기 ${targetScopeName} 강좌 및 수강 데이터

---

## 1. 데이터 요약
본 보고서는 2026학년도 1학기 인천대학교의 교육과정 운영 현황을 데이터 기반으로 분석하였습니다. ${targetScopeName}의 강좌 운영 지표는 다음과 같습니다.

*   **강좌 규모:** 총 ${dashboardStats.totalCourses.toLocaleString()}개의 강좌가 개설되어 운영 중입니다.
*   **수강 규모:** 총 ${dashboardStats.totalStudents.toLocaleString()}명의 학생들이 수강하고 있으며, **평균 수강율은 ${dashboardStats.avgEnrollment.toFixed(1)}%**로 안정적인 수요를 기록하고 있습니다.
*   **글로벌 역량:** 전체 강좌 중 원어(영어) 강의 비율은 **${dashboardStats.foreignRatio.toFixed(1)}%**로, 국제화 교육 환경을 지속적으로 조성하고 있습니다.

---

## 2. 주요 특징 및 트렌드 분석

### 1) 이수구분 및 학점 구성 특성
*   **이수구분별 불균형:** '${topClass}' 강좌가 ${topClassCount.toLocaleString()}개로 가장 높은 비중을 차지하고 있습니다. 눈여겨볼 점은 **'심화교양'의 평균 수강인원이 82.5명**으로 타 이수구분 대비 압도적으로 높다는 점입니다. 이는 대형 강의 위주의 교양 교육이 이루어지고 있음을 시사합니다.
*   **학점 구성:** 3학점 강좌가 **64.1%**로 절대다수를 차지하며 표준적인 학점 구성 체계를 따르고 있습니다. 1~2학점 강좌의 합계 비중도 약 34%로 나타나, 실습이나 세미나 등 다양한 형태의 학점 운영이 병행되고 있습니다.

### 2) 수업방법 비중 및 시사점
*   **대면수업 중심주의:** 전체 강좌의 **${faceToFaceRatio}%가 대면수업**으로 운영되고 있습니다. 이는 대학 교육의 본질인 상호작용과 공동체 의식 함양에 집중하려는 학교 측의 의지로 해석됩니다. 반면, 하이브리드 수업은 5% 내외로 활용도가 낮아, 미래형 디지털 학습 환경 도입에 대한 고민이 필요한 시점입니다.

### 3) 요일 및 시간대별 강좌 배치 현황
*   **요일 쏠림 현상:** 화요일(739개), 수요일(723개)에 강좌가 집중되어 있으며, 금요일(354개)은 월/화/수/목 대비 약 절반 수준으로 강좌 수가 급감합니다. 이는 '금공강(금요일 공강)' 선호 현상과 맞물려 요일별 캠퍼스 이용 밀도 격차를 발생시키고 있습니다.
*   **시간대 쏠림 현상:** 오전 9시부터 오후 6시까지의 데이터를 분석한 결과, 15-18시에 강좌 수가 3,500개로 가장 많습니다. 오전 시간대 대비 오후 시간대 후반에 수업이 집중되는 경향은 학생들의 수강 패턴 및 학습 피로도와 관련이 있을 것으로 분석됩니다.

---

## 3. 문제점 및 개선 아이디어 제언

### [수강율 극대화 및 효율적 운영]
*   **심화교양 강좌 분반 검토:** 심화교양의 평균 수강인원이 82.5명으로 매우 높습니다. 학습 품질 보장을 위해 대형 강좌를 적정 규모로 분반하거나, 온·오프라인 혼합형(Blended Learning)을 도입하여 물리적 공간 제약을 완화할 것을 제언합니다.

### [원어 강의 활성화]
*   **원어 강의 인센티브 설계:** 현재 ${dashboardStats.foreignRatio.toFixed(1)}% 수준의 원어 강의 비율을 단계적으로 상향하기 위해, 전공 핵심 및 심화 과정 내에서의 원어 강의 개설 시 교원 인센티브 부여 및 학생 대상 수강 우선권 제공 등의 정책적 지원이 필요합니다.

### [요일/시간대 분산 전략]
*   **금요일 교육 프로그램 활성화:** 금요일 강좌 부족 현상을 해결하기 위해 금요일에만 운영되는 '특화 역량 강화 프로그램(비교과 프로그램, 집중 이수제)'을 도입하여 캠퍼스 이용의 효율성을 높이고 학생들의 학습권을 균등하게 보장해야 합니다.
*   **학기 시간표 최적화:** 15-18시 쏠림 현상은 학생들의 오후 시간 학습 부담을 가중시킵니다. 데이터 기반 시간표 최적화 시스템을 도입하여 특정 시간대에 강좌가 과밀하게 배치되지 않도록 학과 간 교차 점검이 필요합니다.

---
*본 보고서는 2026학년도 1학기 학사 운영의 효율성을 제고하고, 학생 중심의 최적화된 교육 환경을 마련하기 위한 기초 자료로 활용되길 바랍니다.*`;
  }

  const downloadAiReport = () => {
    const content = getMockAiAnalysis();
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_강의_데이터_분석_보고서_${targetScopeName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f6f9] text-[#1e293b] overflow-hidden font-sans">
      {/* 1. Left Sidebar - White light layout matching screenshot */}
      <aside className="w-72 bg-white border-r border-[#e5e7eb] flex flex-col h-full shrink-0 shadow-sm overflow-hidden z-10">
        {/* Sidebar Header */}
        <div className="p-6 pb-5 border-b border-[#f1f5f9]">
          <h1 className="font-black text-xl leading-tight text-[#1e293b] tracking-tight">
            Incheon National<br />University
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">2026-1 Course Dashboard</p>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {/* 전체 대시보드 (Overall Dashboard Tab) */}
          <div>
            <button
              onClick={selectOverallDashboard}
              className={`w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedCollegeId === "all" && currentView === "dashboard"
                  ? "bg-[#eef2ff] text-[#4f46e5] shadow-sm shadow-[#eef2ff]"
                  : "text-[#334155] hover:bg-slate-50"
              }`}
            >
              <svg className={`w-4 h-4 ${currentView === "dashboard" ? "text-[#4f46e5]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>전체 대시보드</span>
            </button>
          </div>

          <div className="h-[1px] bg-slate-100 mx-2" />

          {/* Colleges list */}
          <div className="space-y-2.5">
            {academicStructure.filter(col => col.id !== "all").map((college) => {
              const isCollegeActive = selectedCollegeId === college.id
              const isExpanded = expandedColleges[college.id]

              return (
                <div key={college.id} className="space-y-1">
                  {/* College Header */}
                  <div
                    onClick={() => selectCollege(college.id)}
                    className={`group flex items-center justify-between py-2 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                      isCollegeActive && !selectedDepartmentId
                        ? "bg-indigo-50/50 text-[#4f46e5]"
                        : "text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-2">{college.name}</span>
                    
                    {/* Collapsible toggle chevron */}
                    {college.departments.length > 0 && (
                      <button
                        onClick={(e) => toggleCollege(college.id, e)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 group-hover:text-slate-600 transition"
                      >
                        <svg className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Expanded Department Submenu (펼쳐진 상태) */}
                  {isExpanded && college.departments.length > 0 && (
                    <div className="pl-4 ml-2 border-l border-slate-100 space-y-1 py-1">
                      {college.departments.map((dept) => {
                        const isDeptActive = selectedDepartmentId === dept.id
                        return (
                          <button
                            key={dept.id}
                            onClick={() => selectDepartment(college.id, dept.id)}
                            className={`w-full text-left py-1.5 px-3 rounded text-xs transition-colors duration-150 ${
                              isDeptActive
                                ? "text-[#4f46e5] font-bold bg-[#eef2ff]/30"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50"
                            }`}
                          >
                            {dept.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>


      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#f4f6f9] overflow-hidden relative">
        
        {/* VIEW 1: Statistics Dashboard (전체 대시보드) */}
        {currentView === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
            {/* Header section matching screenshot */}
            <div className="flex items-center justify-between">
              <div>
                {/* Breadcrumb with home icon */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {selectedCollegeId === "all" ? (
                    <span>홈</span>
                  ) : selectedDepartmentId ? (
                    <>
                      <span className="cursor-pointer hover:text-indigo-600" onClick={selectOverallDashboard}>홈</span>
                      <span>/</span>
                      <span className="cursor-pointer hover:text-indigo-600" onClick={() => selectCollege(selectedCollegeId)}>{collegeName}</span>
                      <span>/</span>
                      <span className="text-slate-800 font-semibold">{departmentName}</span>
                    </>
                  ) : (
                    <>
                      <span className="cursor-pointer hover:text-indigo-600" onClick={selectOverallDashboard}>홈</span>
                      <span>/</span>
                      <span className="text-slate-800 font-semibold">{collegeName}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0f172a] flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                  {selectedDepartmentId ? `${departmentName} 대시보드` : selectedCollegeId === "all" ? "전체 교과목 대시보드" : `${collegeName} 대시보드`}
                  <span className="text-xs text-slate-400 font-normal">
                    {selectedDepartmentId 
                      ? `${collegeName} > ${departmentName}` 
                      : selectedCollegeId === "all" 
                        ? "전체" 
                        : collegeName} | {dashboardStats.totalCourses.toLocaleString()}개 강좌
                  </span>
                </h2>
              </div>

              {/* Sparkle AI Analysis Button */}
              <div>
                <button 
                  onClick={handleAiAnalysisClick}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-full text-xs font-bold text-[#1e293b] shadow-sm hover:shadow-md transition-all duration-200 group relative"
                >
                  <span className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-pink-400 to-indigo-400 opacity-20 group-hover:opacity-40 transition-opacity" style={{ margin: "-1px" }} />
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] to-pink-500 font-extrabold">AI 강의 분석</span>
                </button>
              </div>
            </div>

            {/* 4 Metrics Cards from screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: 총 강좌 수 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">총 강좌 수</span>
                  <span className="text-3xl font-black text-[#0f172a] font-mono leading-none block">{dashboardStats.totalCourses.toLocaleString()}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Card 2: 총 수강인원 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">총 수강인원</span>
                  <span className="text-3xl font-black text-[#0f172a] font-mono leading-none block">{dashboardStats.totalStudents.toLocaleString()}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20H22V18C22 15.7909 20.2091 14 18 14C17.2917 14 16.6277 14.185 16.0506 14.5106M17 20H7M17 20V18C17 16.6341 16.3129 15.4289 15.2678 14.71M7 20H2V18C2 15.7909 3.79086 14 6 14C6.70831 14 7.37225 14.185 7.94939 14.5106M7 20V18C7 16.6341 7.68707 15.4289 8.73223 14.71M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10ZM12 10C14.7614 10 17 12.2386 17 15V17H7V15C7 12.2386 9.23858 10 12 10Z" />
                  </svg>
                </div>
              </div>

              {/* Card 3: 평균 수강율 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">평균 수강율</span>
                  <span className="text-3xl font-black text-[#0f172a] font-mono leading-none block">{dashboardStats.avgEnrollment.toFixed(1)}%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Card 4: 원어강의 비율 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">원어강의 비율</span>
                  <span className="text-3xl font-black text-[#0f172a] font-mono leading-none block">{dashboardStats.foreignRatio.toFixed(1)}%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Charts Section matching screenshot Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart Card 1: 이수구분별 강좌 수 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>이수구분별 강좌 수</h4>
                  </div>
                  
                  <div className="relative space-y-4 py-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-y-0 left-[92px] right-[68px] flex justify-between pointer-events-none">
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                    </div>
                    
                    <div className="relative z-10 space-y-4">
                      {dashboardStats.classificationsCount.map((item, idx) => (
                        <HorizontalBar 
                          key={item.name} 
                          label={item.name} 
                          value={item.count} 
                          max={maxCountVal} 
                          isGold={idx === 0} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Axis */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pl-[92px] pr-[68px] pt-2 border-t border-slate-100">
                  <span>0</span>
                  <span>{Math.round(maxCountVal * 0.25).toLocaleString()}</span>
                  <span>{Math.round(maxCountVal * 0.5).toLocaleString()}</span>
                  <span>{Math.round(maxCountVal * 0.75).toLocaleString()}</span>
                  <span>{maxCountVal.toLocaleString()}</span>
                </div>
              </div>

              {/* Chart Card 2: 이수구분별 평균 수강인원 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>이수구분별 평균 수강인원</h4>
                  </div>

                  <div className="relative space-y-4 py-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-y-0 left-[92px] right-[68px] flex justify-between pointer-events-none">
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                    </div>
                    
                    <div className="relative z-10 space-y-4">
                      {dashboardStats.classificationsAvgStudents.map((item, idx) => (
                        <HorizontalBar 
                          key={item.name} 
                          label={item.name} 
                          value={item.avgStudents} 
                          max={maxAvgVal} 
                          isGold={idx === 0} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Axis */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pl-[92px] pr-[68px] pt-2 border-t border-slate-100">
                  <span>0</span>
                  <span>{Math.round(maxAvgVal * 0.25).toLocaleString()}</span>
                  <span>{Math.round(maxAvgVal * 0.5).toLocaleString()}</span>
                  <span>{Math.round(maxAvgVal * 0.75).toLocaleString()}</span>
                  <span>{maxAvgVal.toLocaleString()}</span>
                </div>
              </div>

              {/* Chart Card 3: 수업방법 유형 분포 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <h4>수업방법 유형 분포</h4>
                </div>

                <DonutChart 
                  centerLabel="TOTAL"
                  total={dashboardStats.totalCourses.toLocaleString()}
                  data={dashboardStats.methodData}
                />
              </div>

              {/* Chart Card 4: 학점 구성 비율 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <h4>학점 구성 비율</h4>
                </div>

                <DonutChart 
                  centerLabel="COURSES"
                  total={dashboardStats.totalCourses.toLocaleString()}
                  data={dashboardStats.creditData}
                />
              </div>

              {/* Chart Card 5: 요일별 수업 강좌 수 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>요일별 수업 강좌 수</h4>
                  </div>

                  <div className="relative space-y-4 py-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-y-0 left-[92px] right-[68px] flex justify-between pointer-events-none">
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                    </div>

                    <div className="relative z-10 space-y-4">
                      {dashboardStats.dayData.map((item) => (
                        <HorizontalBar 
                          key={item.label} 
                          label={item.label} 
                          value={item.value} 
                          max={maxDayVal} 
                          isGold={item.isGold}
                          unit="강좌 수"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Axis */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pl-[92px] pr-[68px] pt-2 border-t border-slate-100">
                  <span>0</span>
                  <span>{Math.round(maxDayVal * 0.25).toLocaleString()}</span>
                  <span>{Math.round(maxDayVal * 0.5).toLocaleString()}</span>
                  <span>{Math.round(maxDayVal * 0.75).toLocaleString()}</span>
                  <span>{maxDayVal.toLocaleString()}</span>
                </div>
              </div>

              {/* Chart Card 6: 수업 시간별 강좌 수 */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>수업 시간별 강좌 수</h4>
                  </div>

                  <div className="relative space-y-4 py-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-y-0 left-[92px] right-[68px] flex justify-between pointer-events-none">
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                      <div className="w-[1px] bg-slate-100/60 h-full" />
                    </div>

                    <div className="relative z-10 space-y-4">
                      {dashboardStats.timeData.map((item) => (
                        <HorizontalBar 
                          key={item.label} 
                          label={item.label} 
                          value={item.value} 
                          max={maxTimeVal} 
                          isGold={item.isGold}
                          unit="강좌 수"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Axis */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pl-[92px] pr-[68px] pt-2 border-t border-slate-100">
                  <span>0</span>
                  <span>{Math.round(maxTimeVal * 0.25).toLocaleString()}</span>
                  <span>{Math.round(maxTimeVal * 0.5).toLocaleString()}</span>
                  <span>{Math.round(maxTimeVal * 0.75).toLocaleString()}</span>
                  <span>{maxTimeVal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Summary Card (Visible for Overall and College Dashboards) */}
              {selectedCollegeId === "all" ? (
                /* 대학(원)별 강좌 분석 요약 */
                <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>대학전체 강좌 수 상위 대학(원)</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4 rounded-l-lg">대학(원)</th>
                          <th className="py-3 px-4 text-right">강좌 수</th>
                          <th className="py-3 px-4 text-right">수강인원 합계</th>
                          <th className="py-3 px-4 text-right rounded-r-lg">평균 수강율(%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {collegeSummaries.map((col) => (
                          <tr key={col.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-700">{col.name}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-semibold">{col.courseCount.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-semibold">{col.totalEnrolled.toLocaleString()}명</td>
                            <td className="py-3.5 px-4 text-right font-mono text-indigo-600 font-bold">{col.avgEnrollment.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : !selectedDepartmentId ? (
                /* 학과별 강좌 분석 요약 (단과대 대시보드인 경우) */
                <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>{collegeName} 강좌 수 상위 학과</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4 rounded-l-lg">학과(부)</th>
                          <th className="py-3 px-4 text-right">강좌 수</th>
                          <th className="py-3 px-4 text-right">수강인원 합계</th>
                          <th className="py-3 px-4 text-right rounded-r-lg">평균 수강율(%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {departmentSummaries.map((dept) => (
                          <tr key={dept.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-700">{dept.name}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-semibold">{dept.courseCount.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-semibold">{dept.totalEnrolled.toLocaleString()}명</td>
                            <td className="py-3.5 px-4 text-right font-mono text-indigo-600 font-bold">{dept.avgEnrollment.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* 2. 상세 강좌 정보 (모든 대시보드 공통) */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <h4>상세 강좌 정보</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                    총 {dashboardCourses.length.toLocaleString()}개 중 {dashboardCourses.length > 0 ? ((currentPage - 1) * 10 + 1).toLocaleString() : 0}-{Math.min(currentPage * 10, dashboardCourses.length).toLocaleString()}번째 표시
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 rounded-l-lg">학수번호</th>
                        <th className="py-3 px-4">교과목명</th>
                        <th className="py-3 px-4">담당교수</th>
                        <th className="py-3 px-4">이수구분</th>
                        <th className="py-3 px-4 text-center">학점</th>
                        <th className="py-3 px-4">시간표</th>
                        <th className="py-3 px-4 rounded-r-lg text-right">수강/정원</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCourses.map((course) => (
                        <tr 
                          key={course.id} 
                          onClick={() => setSelectedCourseDetail(course)}
                          className="hover:bg-indigo-50/20 transition cursor-pointer group"
                        >
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{course.code}</td>
                          <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600 transition truncate max-w-[200px]">{course.name}</td>
                          <td className="py-3 px-4 text-slate-600">{course.professor} 교수</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              course.classification.includes("필수") 
                                ? "bg-rose-50 text-rose-600 border border-rose-100/50"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                            }`}>
                              {course.classification}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{course.credits}</td>
                          <td className="py-3 px-4 text-slate-500 font-semibold">{course.schedule}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                            {course.enrolled} / {course.capacity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {pageNumbers.map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-xs text-slate-400 font-bold">
                            ...
                          </span>
                        )
                      }
                      
                      const isCurrent = currentPage === p
                      return (
                        <button
                          key={`page-${p}`}
                          onClick={() => setCurrentPage(p as number)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition min-w-[32px] text-center ${
                            isCurrent
                              ? "bg-slate-950 text-white font-mono"
                              : "border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
              <DashboardFooter />
            </div>


          </div>
        )}

        {/* VIEW 2: Course Catalog (교과목 리스트) */}
        {currentView === "catalog" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header controls for Catalog View */}
            <header className="p-6 border-b border-[#e5e7eb] bg-white flex items-center justify-between">
              <div>
                {/* Breadcrumbs matching screenshots */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="cursor-pointer hover:text-indigo-600" onClick={selectOverallDashboard}>홈</span>
                  <span>/</span>
                  <span className="cursor-pointer hover:text-indigo-600" onClick={() => selectCollege(selectedCollegeId)}>{collegeName}</span>
                  {selectedDepartmentId && (
                    <>
                      <span>/</span>
                      <span className="text-slate-800 font-semibold">{departmentName}</span>
                    </>
                  )}
                </div>
                
                {/* Title & Subtitle */}
                {selectedDepartmentId ? (
                  // Department View (과 대쉬보드)
                  <>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">
                      {departmentName}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {collegeName} &gt; {departmentName} | {catalogMetrics.courses}개 강좌
                    </p>
                  </>
                ) : (
                  // College View (단과대 대쉬보드)
                  <>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">
                      {collegeName} 대시보드
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {collegeName} | {catalogMetrics.courses}개 강좌
                    </p>
                  </>
                )}
              </div>

              {/* Sparkle AI Analysis Button */}
              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-full text-xs font-bold text-[#1e293b] shadow-sm hover:shadow-md transition-all duration-200 group relative">
                  <span className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-pink-400 to-indigo-400 opacity-20 group-hover:opacity-40 transition-opacity" style={{ margin: "-1px" }} />
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] to-pink-500 font-extrabold">AI 강의 분석</span>
                </button>
              </div>
            </header>

            {/* Catalog Feed Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {/* 4 Metrics Cards Row at the top */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card 1: 총 강좌 수 */}
                <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">총 강좌 수</span>
                    <span className="text-xl font-black text-[#0f172a] font-mono leading-none block">{catalogMetrics.courses}</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Card 2: 총 수강인원 */}
                <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">총 수강인원</span>
                    <span className="text-xl font-black text-[#0f172a] font-mono leading-none block">{catalogMetrics.students.toLocaleString()}명</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20H22V18C22 15.7909 20.2091 14 18 14C17.2917 14 16.6277 14.185 16.0506 14.5106M17 20H7M17 20V18C17 16.6341 16.3129 15.4289 15.2678 14.71M7 20H2V18C2 15.7909 3.79086 14 6 14C6.70831 14 7.37225 14.185 7.94939 14.5106M7 20V18C7 16.6341 7.68707 15.4289 8.73223 14.71M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10ZM12 10C14.7614 10 17 12.2386 17 15V17H7V15C7 12.2386 9.23858 10 12 10Z" />
                    </svg>
                  </div>
                </div>

                {/* Card 3: 평균 수강율 */}
                <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">평균 수강율</span>
                    <span className="text-xl font-black text-[#0f172a] font-mono leading-none block">{catalogMetrics.enrollment.toFixed(1)}%</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>

                {/* Card 4: 원어강의 비율 */}
                <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">원어강의 비율</span>
                    <span className="text-xl font-black text-[#0f172a] font-mono leading-none block">{catalogMetrics.foreign.toFixed(1)}%</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                  <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-bold text-base text-slate-600">조건에 일치하는 교과목이 없습니다</h3>
                  <p className="text-xs text-slate-400 mt-1">검색어나 필터를 리셋하거나 다시 조정해 보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const isInCart = cart.some(item => item.id === course.id)
                    const collegeName = academicStructure.find(c => c.id === course.collegeId)?.name || ""

                    return (
                      <div
                        key={course.id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                        onClick={() => setSelectedCourseDetail(course)}
                      >
                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2 mb-3 text-[10px] font-bold tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200/30">
                                {course.code}
                              </span>
                              {course.isForeign && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                                  원어
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full ${
                              course.classification.includes("필수") 
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                              {course.classification}
                            </span>
                          </div>

                          {/* Course Title */}
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#4f46e5] transition-colors line-clamp-1 mb-1">
                            {course.name}
                          </h3>
                          
                          {/* Department Path */}
                          <p className="text-[10px] text-slate-400 line-clamp-1 mb-4">
                            {collegeName} · {academicStructure.find(c => c.id === course.collegeId)?.departments.find(d => d.id === course.departmentId)?.name || "소속학부"}
                          </p>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">담당</span>
                              <span className="text-slate-700 truncate">{course.professor} 교수</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">학점</span>
                              <span className="text-slate-700 font-bold">{course.credits}학점</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">대상</span>
                              <span className="text-slate-700">{course.grade}학년</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">수강</span>
                              <span className="text-slate-700 font-mono font-bold">
                                {course.enrolled}/{course.capacity}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3" onClick={e => e.stopPropagation()}>
                          <div className="text-[10px] font-semibold text-slate-400 truncate flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{course.schedule}</span>
                          </div>
                          
                          <button
                            onClick={() => isInCart ? removeFromCart(course.id) : addToCart(course)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isInCart
                                ? "bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-slate-500"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                담김
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                담기
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <DashboardFooter />
            </div>
          </div>
        )}
      </main>


      {/* Center Dialog: Course Detail Modal */}
      {selectedCourseDetail && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedCourseDetail(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200/50">
                  {selectedCourseDetail.code}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-2 leading-snug">
                  {selectedCourseDetail.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {academicStructure.find(c => c.id === selectedCourseDetail.collegeId)?.name} · {academicStructure.find(c => c.id === selectedCourseDetail.collegeId)?.departments.find(d => d.id === selectedCourseDetail.departmentId)?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">담당 교수</span>
                  <span className="text-slate-700 font-bold text-xs">{selectedCourseDetail.professor} 교수</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">이수 구분 / 학점</span>
                  <span className="text-slate-700 font-bold text-xs">
                    {selectedCourseDetail.classification} · {selectedCourseDetail.credits}학점
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">강의 요일 및 시간</span>
                  <span className="text-slate-700 font-bold text-xs">{selectedCourseDetail.schedule}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">배정 강의실</span>
                  <span className="text-slate-700 font-bold text-xs">{selectedCourseDetail.room}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">수강 현황 (인원/정원)</span>
                  <span className="text-slate-700 font-bold text-xs">
                    {selectedCourseDetail.enrolled}명 / {selectedCourseDetail.capacity}명 ({selectedCourseDetail.capacity > 0 ? Math.round((selectedCourseDetail.enrolled / selectedCourseDetail.capacity) * 100) : 0}%)
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold block mb-0.5">원어 강의 여부</span>
                  <span className="text-slate-700 font-bold text-xs">
                    {selectedCourseDetail.isForeign ? "원어(영어) 강의" : "한국어 강의"}
                  </span>
                </div>
              </div>

              {/* Course Description */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">교과목 요약 안내</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedCourseDetail.description || "이 과목은 별도의 강의 계획 요약문이 등록되어 있지 않습니다."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex gap-3">
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold rounded-lg transition"
              >
                닫기
              </button>

              {cart.some(item => item.id === selectedCourseDetail.id) ? (
                <button
                  onClick={() => {
                    removeFromCart(selectedCourseDetail.id)
                    setSelectedCourseDetail(null)
                  }}
                  className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold rounded-lg hover:bg-rose-100 transition"
                >
                  꾸러미에서 제거
                </button>
              ) : (
                <button
                  onClick={() => {
                    addToCart(selectedCourseDetail)
                    setSelectedCourseDetail(null)
                  }}
                  className="flex-1 py-2 bg-[#4f46e5] hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/10 transition"
                >
                  꾸러미에 담기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SQL Guide Dialog */}
      {showSqlGuide && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full flex flex-col max-h-[80vh] shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#4f46e5] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
                </svg>
                Supabase SQL Editor 실행 스크립트
              </h3>
              <button
                onClick={() => setShowSqlGuide(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500">
                Supabase SQL Editor에 아래 스크립트를 붙여넣고 실행하여 <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">courses</code> 테이블을 생성한 뒤 데이터 주입 단추를 눌러 활성화하세요.
              </p>
              <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-400 border border-slate-800 leading-relaxed">
{`-- 1. 테이블 생성
CREATE TABLE public.courses (
  id text PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  college_id text NOT NULL,
  department_id text NOT NULL,
  professor text NOT NULL,
  grade integer NOT NULL,
  classification text NOT NULL,
  credits integer NOT NULL,
  schedule text NOT NULL,
  room text NOT NULL,
  description text,
  capacity integer NOT NULL DEFAULT 0,
  enrolled integer NOT NULL DEFAULT 0,
  is_foreign boolean NOT NULL DEFAULT false,
  teaching_method text
);

-- 2. RLS 활성화
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 설정 (누구나 조회 가능, 서비스 역할만 수정 가능)
CREATE POLICY "Allow public select access" ON public.courses
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow service role write access" ON public.courses
  FOR ALL TO service_role USING (true);

-- 4. API 권한(GRANT) 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.courses TO authenticated;
GRANT ALL ON TABLE public.courses TO service_role;`}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowSqlGuide(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-xs rounded-lg font-medium text-slate-600 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-800">AI 강의 데이터 종합 분석</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex-1 overflow-y-auto bg-slate-50 relative min-h-[400px]">
              {aiStatus === "loading" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-[5px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <h4 className="text-[17px] font-bold text-slate-800 mb-2">Gemini 3.1 Flash-Lite 모델이 통계를 분석 중입니다...</h4>
                  <p className="text-sm text-slate-500 font-medium">대시보드 데이터를 종합적으로 해석하여 보고서를 작성하고 있습니다.</p>
                </div>
              ) : (
                <div className="prose prose-sm md:prose-base prose-slate max-w-none animate-fade-in whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                  {getMockAiAnalysis()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
              {aiStatus === "complete" && (
                <button
                  onClick={downloadAiReport}
                  className="px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-sm rounded-xl transition-colors shadow-sm"
                >
                  분석 보고서 다운로드 (.md)
                </button>
              )}
              <button
                onClick={() => setShowAiModal(false)}
                className="px-6 py-2.5 bg-[#1a1f2e] text-white hover:bg-slate-800 font-bold text-sm rounded-xl transition-colors shadow-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Warmup helper for database injection
  async function pushMockDataToWarmup() {
    await pushMockDataToSupabase()
  }
}
