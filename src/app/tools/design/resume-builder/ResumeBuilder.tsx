'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

interface Work {
  id: string; title: string; company: string; dates: string; bullets: string;
}
interface Education {
  id: string; school: string; degree: string; year: string;
}

export default function ResumeBuilder() {
  const [personal, setPersonal] = useState({ name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', location: 'New York, NY', links: 'linkedin.com/in/johndoe' });
  const [summary, setSummary] = useState('Experienced professional with a track record of success...');
  const [work, setWork] = useState<Work[]>([{ id: '1', title: 'Software Engineer', company: 'Tech Corp', dates: '2020 - Present', bullets: 'Developed amazing features.\nImproved performance by 50%.' }]);
  const [education, setEducation] = useState<Education[]>([{ id: '1', school: 'University of State', degree: 'B.S. Computer Science', year: '2020' }]);
  const [skills, setSkills] = useState('React, Next.js, TypeScript, Tailwind');
  const [theme, setTheme] = useState('modern');

  const printRef = useRef<HTMLDivElement>(null);

  const addWork = () => setWork([...work, { id: Math.random().toString(), title: '', company: '', dates: '', bullets: '' }]);
  const addEdu = () => setEducation([...education, { id: Math.random().toString(), school: '', degree: '', year: '' }]);

  const updateWork = (id: string, field: keyof Work, val: string) => setWork(work.map(w => w.id === id ? { ...w, [field]: val } : w));
  const updateEdu = (id: string, field: keyof Education, val: string) => setEducation(education.map(e => e.id === id ? { ...e, [field]: val } : e));

  const handleDownload = () => {
    window.print();
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'slate': return 'font-sans text-slate-800 bg-white';
      case 'navy': return 'font-serif text-slate-900 bg-white';
      default: return 'font-sans text-gray-900 bg-white';
    }
  };

  const getHeaderClasses = () => {
    switch (theme) {
      case 'slate': return 'border-b-2 border-slate-300 pb-2 mb-4';
      case 'navy': return 'border-b-2 border-blue-900 pb-2 mb-4 text-blue-900';
      default: return 'border-b-2 border-gray-300 pb-2 mb-4';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-8 print:bg-white print:py-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 print:p-0">
        <div className="mb-8 print:hidden">
          <nav className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link> / Resume Builder
          </nav>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resume Builder</h1>
              <p className="text-gray-600 dark:text-slate-300">Create and download a professional resume easily.</p>
            </div>
            <div className="flex gap-4">
              <select value={theme} onChange={e => setTheme(e.target.value)} className="rounded-xl border border-gray-300 dark:border-slate-700 p-2">
                <option value="modern">Modern Clean</option>
                <option value="slate">Minimalist Slate</option>
                <option value="navy">Executive Navy</option>
              </select>
              <button onClick={handleDownload} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2 font-semibold">
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        <div className="print:hidden">
          <AdSlot format="horizontal" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8 print:block print:m-0">
          
          {/* Editor (Hidden on Print) */}
          <div className="flex-1 space-y-6 print:hidden h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Personal Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Name" value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} className="w-full rounded-xl border p-3" />
                <input type="email" placeholder="Email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} className="w-full rounded-xl border p-3" />
                <input type="text" placeholder="Phone" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} className="w-full rounded-xl border p-3" />
                <input type="text" placeholder="Location" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} className="w-full rounded-xl border p-3" />
                <input type="text" placeholder="Links (e.g. LinkedIn)" value={personal.links} onChange={e => setPersonal({...personal, links: e.target.value})} className="col-span-2 w-full rounded-xl border p-3" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Professional Summary</h2>
              <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} className="w-full rounded-xl border p-3"></textarea>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Work Experience</h2>
                <button onClick={addWork} className="text-sm bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-xl">+ Add</button>
              </div>
              {work.map((w, i) => (
                <div key={w.id} className="mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <input type="text" placeholder="Job Title" value={w.title} onChange={e => updateWork(w.id, 'title', e.target.value)} className="w-full rounded-xl border p-3" />
                    <input type="text" placeholder="Company" value={w.company} onChange={e => updateWork(w.id, 'company', e.target.value)} className="w-full rounded-xl border p-3" />
                    <input type="text" placeholder="Dates (e.g. 2020 - 2023)" value={w.dates} onChange={e => updateWork(w.id, 'dates', e.target.value)} className="col-span-2 w-full rounded-xl border p-3" />
                  </div>
                  <textarea rows={3} placeholder="Bullet points (one per line)" value={w.bullets} onChange={e => updateWork(w.id, 'bullets', e.target.value)} className="w-full rounded-xl border p-3"></textarea>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Education</h2>
                <button onClick={addEdu} className="text-sm bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-xl">+ Add</button>
              </div>
              {education.map(e => (
                <div key={e.id} className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <input type="text" placeholder="School" value={e.school} onChange={evt => updateEdu(e.id, 'school', evt.target.value)} className="w-full rounded-xl border p-3" />
                  <input type="text" placeholder="Degree" value={e.degree} onChange={evt => updateEdu(e.id, 'degree', evt.target.value)} className="w-full rounded-xl border p-3" />
                  <input type="text" placeholder="Year" value={e.year} onChange={evt => updateEdu(e.id, 'year', evt.target.value)} className="col-span-2 w-full rounded-xl border p-3" />
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Skills</h2>
              <input type="text" placeholder="Comma separated skills" value={skills} onChange={e => setSkills(e.target.value)} className="w-full rounded-xl border p-3" />
            </div>
          </div>

          {/* Preview / Print Area */}
          <div className="flex-[1.2] print:w-full">
            <div ref={printRef} className={`p-10 min-h-[1056px] w-full shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0 ${getThemeClasses()}`}>
              
              <div className="text-center mb-6">
                <h1 className={`text-4xl font-bold uppercase mb-2 ${theme === 'navy' ? 'text-blue-900' : ''}`}>{personal.name}</h1>
                <p className="text-sm">
                  {personal.email} | {personal.phone} | {personal.location} <br/> {personal.links}
                </p>
              </div>

              {summary && (
                <div className="mb-6">
                  <h2 className={`text-xl font-bold uppercase tracking-wider ${getHeaderClasses()}`}>Professional Summary</h2>
                  <p className="text-sm leading-relaxed">{summary}</p>
                </div>
              )}

              {work.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xl font-bold uppercase tracking-wider ${getHeaderClasses()}`}>Experience</h2>
                  {work.map(w => (
                    <div key={w.id} className="mb-4">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{w.title} - {w.company}</span>
                        <span className="text-sm font-normal">{w.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 text-sm space-y-1">
                        {w.bullets.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {education.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-xl font-bold uppercase tracking-wider ${getHeaderClasses()}`}>Education</h2>
                  {education.map(e => (
                    <div key={e.id} className="mb-2 flex justify-between text-sm">
                      <div>
                        <span className="font-bold">{e.school}</span>
                        <div>{e.degree}</div>
                      </div>
                      <div>{e.year}</div>
                    </div>
                  ))}
                </div>
              )}

              {skills && (
                <div>
                  <h2 className={`text-xl font-bold uppercase tracking-wider ${getHeaderClasses()}`}>Skills</h2>
                  <p className="text-sm">{skills}</p>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mt-8 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-slate-300">
            <li>Fill out your personal information, summary, experience, education, and skills on the left panel.</li>
            <li>Select a theme from the top right dropdown to change the styling.</li>
            <li>Preview your resume in real-time on the right.</li>
            <li>Click "Print / Save PDF" to download or print your resume instantly.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
