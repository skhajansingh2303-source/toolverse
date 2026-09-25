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
  dataUrl?: string;
}

export default function PowerpointToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('presentation.pptx');
  const [slides, setSlides] = useState<ParsedSlide[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(960);
  const [slideHeight, setSlideHeight] = useState<number>(540);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.9);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [isExporting, setIsExporting] = useState<boolean>(false);

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

  const renderSlidesToCanvas = async (parsedSlides: ParsedSlide[], w: number, h: number, currentScale: number, currentFormat: string, currentQuality: number) => {
    const renderedSlides = [];
    
    for (const slide of parsedSlides) {
      const canvas = document.createElement('canvas');
      canvas.width = w * currentScale;
      canvas.height = h * currentScale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(currentScale, currentScale);
      
      ctx.fillStyle = currentFormat === 'png' ? 'rgba(0,0,0,0)' : '#ffffff';
      if (currentFormat !== 'png') {
        ctx.fillRect(0, 0, w, h);
      }
      
      for (const el of slide.elements) {
        if (el.type === 'shape') {
          if (el.fill) {
            ctx.fillStyle = el.fill;
            ctx.fillRect(el.x, el.y, el.w, el.h);
          }
          if (el.text && el.text.trim()) {
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.fillText(el.text, el.x, el.y + 20);
          }
        } else if (el.type === 'image' && el.imgData) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, el.x, el.y, el.w, el.h);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = el.imgData!;
          });
        }
      }
      const mime = `image/${currentFormat === 'jpg' ? 'jpeg' : currentFormat}`;
      renderedSlides.push({ ...slide, dataUrl: canvas.toDataURL(mime, currentQuality) });
    }
    return renderedSlides;
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
        const rSlides = await renderSlidesToCanvas(pSlides, slideWidth, slideHeight, scaleFactor, format, quality);
        setSlides(rSlides);
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
    setFileName('Sample_Images_Demo.pptx');
    setIsProcessing(true);
    setSlideWidth(960);
    setSlideHeight(540);
    
    const demoSlides: ParsedSlide[] = [];
    for (let i = 1; i <= 3; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 960 * 2;
      canvas.height = 540 * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      
      const grad = ctx.createLinearGradient(0, 0, 960, 540);
      grad.addColorStop(0, '#db2777');
      grad.addColorStop(1, '#9d174d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 960, 540);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(`Image Slide ${i}`, 100, 200);
      
      ctx.font = '24px sans-serif';
      ctx.fillText('Programmatically generated for demo purposes.', 100, 260);
      
      demoSlides.push({ id: `demo-${i}`, elements: [], dataUrl: canvas.toDataURL('image/png') });
    }
    
    setTimeout(() => {
      setSlides(demoSlides);
      setIsProcessing(false);
    }, 500);
  };

  const downloadZip = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (slide.dataUrl) {
          const base64Data = slide.dataUrl.split(',')[1];
          zip.file(`slide_${i + 1}.${format}`, base64Data, { base64: true });
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toolsverse-toast', { detail: { message: 'Images downloaded successfully!', type: 'success' } })
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  const updateRendering = async () => {
    if (!file || slides.length === 0) return;
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pSlides = await parsePptx(buffer);
      const rSlides = await renderSlidesToCanvas(pSlides, slideWidth, slideHeight, scaleFactor, format, quality);
      setSlides(rSlides);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-pink-600 dark:hover:text-pink-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">PowerPoint to Images</span>
        </nav>

        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            PowerPoint to Images Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert PowerPoint presentations (.pptx) into individual images (PNG, JPG, WebP).
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
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-pink-500 rounded-3xl p-12 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-6 text-center">
              <input
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFile}
              />
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload PPTX File</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Drag and drop or click to browse</p>
            </div>
            <div className="text-center">
              <button onClick={loadDemo} className="text-sm text-pink-600 hover:underline">Load Sample Presentation</button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white">{fileName}</h3>
              <button
                onClick={() => setSlides([])}
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-pink-600"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Format</label>
                <select value={format} onChange={(e) => { setFormat(e.target.value as any); setTimeout(updateRendering, 100); }} className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700">
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Scale</label>
                <select value={scaleFactor} onChange={(e) => { setScaleFactor(Number(e.target.value)); setTimeout(updateRendering, 100); }} className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700">
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Quality</label>
                <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => { setQuality(Number(e.target.value)); setTimeout(updateRendering, 100); }} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {slides.map((slide, idx) => (
                <div key={slide.id} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden relative group">
                  {slide.dataUrl && <img src={slide.dataUrl} alt={`Slide ${idx + 1}`} className="w-full h-auto" />}
                  <div className="p-2 text-center text-xs text-gray-500 dark:text-slate-400">Slide {idx + 1}</div>
                  <a href={slide.dataUrl} download={`slide_${idx+1}.${format}`} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                    Download
                  </a>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={downloadZip}
                disabled={isExporting}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
              >
                {isExporting ? 'Zipping...' : 'Download All as ZIP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
