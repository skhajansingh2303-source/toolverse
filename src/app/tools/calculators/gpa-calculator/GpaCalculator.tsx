'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
  isHonors: boolean;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D': 1.0, 'F': 0.0
};

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', grade: 'A', credits: 3, isHonors: false }
  ]);
  const [priorGpa, setPriorGpa] = useState<number>(0);
  const [priorCredits, setPriorCredits] = useState<number>(0);
  const [gpa, setGpa] = useState<number>(0);
  const [distinction, setDistinction] = useState<string>('');

  const addCourse = () => {
    setCourses([...courses, { id: Math.random().toString(), name: '', grade: 'A', credits: 3, isHonors: false }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  useEffect(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    if (priorGpa > 0 && priorCredits > 0) {
      totalPoints += priorGpa * priorCredits;
      totalCredits += priorCredits;
    }

    courses.forEach(course => {
      let pts = GRADE_POINTS[course.grade] || 0;
      if (course.isHonors) pts += 0.5; // Honors/AP bump
      totalPoints += pts * course.credits;
      totalCredits += course.credits;
    });

    const calculated = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    setGpa(Number(calculated.toFixed(2)));

    if (calculated >= 3.9) setDistinction('Summa Cum Laude');
    else if (calculated >= 3.7) setDistinction('Magna Cum Laude');
    else if (calculated >= 3.5) setDistinction('Cum Laude');
    else if (calculated >= 3.0) setDistinction("Dean's List");
    else setDistinction('');
  }, [courses, priorGpa, priorCredits]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link> / GPA Calculator
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">GPA Calculator</h1>
          <p className="text-gray-600">Track and calculate your current or cumulative GPA for school.</p>
        </div>

        <AdSlot format="horizontal" />

        <div className="grid md:grid-cols-3 gap-8 mb-8 mt-8">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Courses</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prior Cumulative GPA (Optional)</label>
                <input type="number" step="0.01" min="0" max="5" value={priorGpa || ''} onChange={e => setPriorGpa(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" placeholder="e.g. 3.5" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prior Credits (Optional)</label>
                <input type="number" min="0" value={priorCredits || ''} onChange={e => setPriorCredits(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 p-3" placeholder="e.g. 60" />
              </div>
            </div>

            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="flex flex-wrap gap-2 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input type="text" placeholder="Course Name" value={course.name} onChange={e => updateCourse(course.id, 'name', e.target.value)} className="flex-1 rounded-xl border border-gray-300 p-2 min-w-[120px]" />
                  <select value={course.grade} onChange={e => updateCourse(course.id, 'grade', e.target.value)} className="rounded-xl border border-gray-300 p-2">
                    {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" min="1" max="10" value={course.credits} onChange={e => updateCourse(course.id, 'credits', Number(e.target.value))} className="w-20 rounded-xl border border-gray-300 p-2" title="Credits" />
                  <label className="flex items-center text-sm gap-1 ml-2">
                    <input type="checkbox" checked={course.isHonors} onChange={e => updateCourse(course.id, 'isHonors', e.target.checked)} className="rounded text-primary-600" />
                    AP/Honors
                  </label>
                  <button onClick={() => removeCourse(course.id)} className="ml-auto text-red-500 hover:bg-red-50 p-2 rounded-xl">×</button>
                </div>
              ))}
            </div>
            <button onClick={addCourse} className="mt-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl px-4 py-2 font-semibold text-sm">
              + Add Course
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-gray-500 font-medium mb-2">Cumulative GPA</h3>
            <div className="relative w-48 h-48 flex items-center justify-center mb-4 transition-all duration-500">
              <svg viewBox="0 0 36 36" className="w-full h-full text-primary-500">
                <path
                  className="text-gray-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3"
                />
                <path
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={`${(gpa / 4.0) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3"
                />
              </svg>
              <div className="absolute text-4xl font-bold text-gray-900">{gpa.toFixed(2)}</div>
            </div>
            {distinction && (
              <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-semibold">
                {distinction}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>(Optional) Enter your previous cumulative GPA and total credits to calculate your overall GPA.</li>
            <li>Add your current courses, selecting the letter grade and credit hours for each.</li>
            <li>Check the "AP/Honors" box if the class is weighted (adds 0.5 points).</li>
            <li>Your GPA and honors distinction will update automatically in real-time.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
