'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SlideElement {
  type: 'shape' | 'image';
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fill?: string;
  imgData?: string | null;
}

interface ParsedSlide {
  id: string;
  elements: SlideElement[];
}

export default function PowerpointToHtml() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('presentation.pptx');
  const [slides, setSlides] = useState<ParsedSlide[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(960);
  const [slideHeight, setSlideHeight] = useState<number>(540);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [presentationMode, setPresentationMode] = useState<'scrollable' | 'slider'>('scrollable');
  
  const parsePptx = async (buffer: ArrayBuffer) => {
    const zip = await JSZip.loadAsync(buffer);
    const presXml = await zip.file('ppt/presentation.xml')?.async('text');
    let cx = 12192000, cy = 6858000;
    
    if (presXml) {
      const presDoc = new DOMParser().parseFromString(presXml, 'application/xml');
      const sldSz = presDoc.getElementsByTagName('p:sldSz')[0];
      if (sldSz) {
        cx = parseInt(sldSz.getAttribute('cx') || '12192000');
        cy = parseInt(sldSz.getAttribute('cy') || '6858000');
      }
    }

    const width = Math.round(cx * 96 / 914400);
    const height = Math.round(cy * 96 / 914400);
    setSlideWidth(width);
    setSlideHeight(height);

    const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));

    const parsedSlides: ParsedSlide[] = [];

    for (const slideFile of slideFiles) {
      const slideXml = await zip.file(slideFile)?.async('text');
      if (!slideXml) continue;
      
      const slideDoc = new DOMParser().parseFromString(slideXml, 'application/xml');
      const shapes = Array.from(slideDoc.getElementsByTagName('p:sp'));
      const pictures = Array.from(slideDoc.getElementsByTagName('p:pic'));
      const elements: SlideElement[] = [];

      const slideNum = slideFile.match(/\d+/)?.[0];
      const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
      const relsXml = await zip.file(relsFile)?.async('text');
      const rels: Record<string, string> = {};
      
      if (relsXml) {
        const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
        const relsArr = Array.from(relsDoc.getElementsByTagName('Relationship'));
        for (const rel of relsArr) {
          rels[rel.getAttribute('Id') || ''] = rel.getAttribute('Target') || '';
        }
      }

      for (const shape of shapes) {
        const off = shape.getElementsByTagName('a:off')[0];
        const ext = shape.getElementsByTagName('a:ext')[0];
        const x = off ? Math.round(parseInt(off.getAttribute('x') || '0') * 96 / 914400) : 0;
        const y = off ? Math.round(parseInt(off.getAttribute('y') || '0') * 96 / 914400) : 0;
        const w = ext ? Math.round(parseInt(ext.getAttribute('cx') || '0') * 96 / 914400) : 0;
        const h = ext ? Math.round(parseInt(ext.getAttribute('cy') || '0') * 96 / 914400) : 0;

        const tElements = Array.from(shape.getElementsByTagName('a:t'));
        let text = tElements.map(t => t.textContent).join(' ');

        const solidFill = shape.getElementsByTagName('a:solidFill')[0];
        let srgbClr = solidFill?.getElementsByTagName('a:srgbClr')[0];
        let fill = srgbClr ? '#' + srgbClr.getAttribute('val') : undefined;

        elements.push({ type: 'shape', x, y, w, h, text, fill });
      }

      for (const pic of pictures) {
        const off = pic.getElementsByTagName('a:off')[0];
        const ext = pic.getElementsByTagName('a:ext')[0];
        const x = off ? Math.round(parseInt(off.getAttribute('x') || '0') * 96 / 914400) : 0;
        const y = off ? Math.round(parseInt(off.getAttribute('y') || '0') * 96 / 914400) : 0;
        const w = ext ? Math.round(parseInt(ext.getAttribute('cx') || '0') * 96 / 914400) : 0;
        const h = ext ? Math.round(parseInt(ext.getAttribute('cy') || '0') * 96 / 914400) : 0;

        const blip = pic.getElementsByTagName('a:blip')[0];
        const embedId = blip?.getAttribute('r:embed');
        let imgData = null;
        
        if (embedId && rels[embedId]) {
          let target = rels[embedId];
          target = target.replace('../', 'ppt/');
          const imgFile = zip.file(target);
          if (imgFile) {
            const extMatch = target.match(/\.([^\.]+)$/);
            const extName = extMatch ? extMatch[1] : 'png';
            const mimeType = `image/${extName === 'jpg' ? 'jpeg' : extName}`;
            const imgBase64 = await imgFile.async('base64');
            imgData = `data:${mimeType};base64,${imgBase64}`;
          }
        }

        elements.push({ type: 'image', x, y, w, h, imgData });
      }

      parsedSlides.push({ id: `slide-${slideNum}`, elements });
    }

    return parsedSlides;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setIsProcessing(true);
      setErrorMessage(null);
      
      try {
        const buffer = await selected.arrayBuffer();
        const pSlides = await parsePptx(buffer);
        setSlides(pSlides);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Failed to parse PPTX file');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const loadDemo = async () => {
    setFile(null);
    setFileName('Sample_HTML_Demo.pptx');
    setIsProcessing(true);
    setSlideWidth(960);
    setSlideHeight(540);
    
    const demoSlides: ParsedSlide[] = [];
    for (let i = 1; i <= 3; i++) {
      demoSlides.push({
        id: `demo-${i}`,
        elements: [
          { type: 'shape', x: 0, y: 0, w: 960, h: 540, fill: '#0284c7' },
          { type: 'shape', x: 100, y: 200, w: 760, h: 60, text: `HTML Slide ${i}` },
          { type: 'shape', x: 100, y: 280, w: 760, h: 60, text: 'Programmatically generated for demo purposes.' }
        ]
      });
    }
    
    setTimeout(() => {
      setSlides(demoSlides);
      setIsProcessing(false);
    }, 500);
  };

  const generateHtml = () => {
    const bgColor = theme === 'light' ? '#f3f4f6' : '#111827';
    const slideBg = theme === 'light' ? '#ffffff' : '#1f2937';
    const textColor = theme === 'light' ? '#000000' : '#ffffff';

    let css = `
      body { margin: 0; padding: 20px; background: ${bgColor}; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; gap: 20px; }
      .slide { position: relative; width: ${slideWidth}px; height: ${slideHeight}px; background: ${slideBg}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
      .el { position: absolute; box-sizing: border-box; }
      .text-el { display: flex; align-items: center; color: ${textColor}; font-size: 20px; padding: 10px; }
      img { object-fit: contain; }
    `;

    if (presentationMode === 'slider') {
      css += `
        body { padding: 0; height: 100vh; justify-content: center; overflow: hidden; }
        .slide { display: none; }
        .slide.active { display: block; }
        .nav { position: fixed; bottom: 20px; display: flex; gap: 10px; z-index: 100; }
        button { padding: 10px 20px; cursor: pointer; border: none; background: #0ea5e9; color: white; border-radius: 5px; }
      `;
    }

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fileName}</title>
  <style>${css}</style>
</head>
<body>
`;

    slides.forEach((slide, i) => {
      html += `<div class="slide ${i === 0 && presentationMode === 'slider' ? 'active' : ''}" id="slide-${i}">\n`;
      slide.elements.forEach(el => {
        const style = `left:${el.x}px; top:${el.y}px; width:${el.w}px; height:${el.h}px;`;
        if (el.type === 'shape') {
          const bg = el.fill ? `background:${el.fill};` : '';
          html += `<div class="el text-el" style="${style} ${bg}">${el.text || ''}</div>\n`;
        } else if (el.type === 'image' && el.imgData) {
          html += `<img class="el" style="${style}" src="${el.imgData}" />\n`;
        }
      });
      html += `</div>\n`;
    });

    if (presentationMode === 'slider') {
      html += `
  <div class="nav">
    <button onclick="prev()">Previous</button>
    <button onclick="next()">Next</button>
  </div>
  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    function show(n) {
      slides[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
    }
    function prev() { show(current - 1); }
    function next() { show(current + 1); }
  </script>`;
    }

    html += `
</body>
</html>`;
    
    return html;
  };

  const downloadHtml = () => {
    if (slides.length === 0) return;
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">PowerPoint to HTML</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            PowerPoint to HTML Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert PowerPoint presentations (.pptx) into responsive HTML web presentations.
          </p>
        </header>

        <AdSlot format="horizontal" />

        {errorMessage && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        {slides.length === 0 ? (
          <div>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-cyan-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6 text-center">
              <input
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFile}
              />
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload PPTX File</h3>
              <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
            </div>
            <div className="text-center">
              <button onClick={loadDemo} className="text-sm text-cyan-600 hover:underline">Load Sample Presentation</button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white">{fileName}</h3>
              <button
                onClick={() => setSlides([])}
                className="text-sm text-gray-500 hover:text-cyan-600"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Presentation Mode</label>
                <select value={presentationMode} onChange={(e) => setPresentationMode(e.target.value as any)} className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700">
                  <option value="scrollable">Scrollable (All slides visible)</option>
                  <option value="slider">Interactive Slider (One slide at a time)</option>
                </select>
              </div>
            </div>

            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 h-[500px]">
              <iframe
                srcDoc={generateHtml()}
                className="w-full h-full bg-white"
                sandbox="allow-scripts"
                title="Preview"
              />
            </div>

            <div className="text-center">
              <button
                onClick={downloadHtml}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md"
              >
                Download HTML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
