'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import AdSlot from '@/components/AdSlot';

interface SlideItem {
  id: string;
  pageNumber: number;
  originalPageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  rotation: number;
}

type AspectRatioMode = '16:9' | '4:3' | 'original';

export default function PdfToPowerpoint() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('presentation.pdf');
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('16:9');
  const [scaleFactor, setScaleFactor] = useState<number>(2.0); // 2x for sharp PPTX
  const [selectedZoomSlide, setSelectedZoomSlide] = useState<SlideItem | null>(null);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfjsLoaded(true);
    }
  };

  // Convert PDF pages into slide images
  const processPdf = async (pdfFile: File) => {
    if (!(window as any).pdfjsLib) {
      setErrorMessage('PDF.js engine is still loading. Please wait a second and retry.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSlides([]);
    setProgress({ current: 0, total: 0 });

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const loadedSlides: SlideItem[] = [];

      for (let pNum = 1; pNum <= numPages; pNum++) {
        setProgress({ current: pNum, total: numPages });
        const page = await pdf.getPage(pNum);
        const viewport = page.getViewport({ scale: scaleFactor });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), 'image/png')
          );

          if (blob) {
            const dataUrl = canvas.toDataURL('image/png');
            loadedSlides.push({
              id: `slide-${pNum}-${Date.now()}`,
              pageNumber: pNum,
              originalPageNumber: pNum,
              dataUrl,
              blob,
              width: viewport.width,
              height: viewport.height,
              rotation: 0,
            });
          }
        }
      }

      setSlides(loadedSlides);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message || 'Failed to render PDF slides. Please verify file integrity.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      processPdf(selected);
    }
  };

  // Generate Sample Presentation Deck
  const loadDemoPresentation = () => {
    setFile(null);
    setFileName('ToolsVerse_Strategy_Pitch.pdf');
    setIsProcessing(true);
    setErrorMessage(null);

    const sampleThemes = [
      {
        title: 'Q4 Product Roadmap & Vision',
        subtitle: 'Scalable In-Browser Office Tools & Utilities',
        tag: 'EXECUTIVE OVERVIEW',
        bg: ['#1e1b4b', '#312e81'],
        accent: '#6366f1',
      },
      {
        title: 'Key Milestones & Growth Metrics',
        subtitle: '100% Client-Side Architecture • 0 Server Storage • Instant Speed',
        tag: 'PERFORMANCE ANALYSIS',
        bg: ['#0f172a', '#1e293b'],
        accent: '#10b981',
      },
      {
        title: 'Enterprise Next Steps',
        subtitle: 'Accelerating Document Automation Across Global Teams',
        tag: 'CONCLUSION & Q&A',
        bg: ['#18181b', '#27272a'],
        accent: '#f59e0b',
      },
    ];

    setTimeout(() => {
      const demoSlides: SlideItem[] = sampleThemes.map((theme, idx) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d')!;

        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, theme.bg[0]);
        grad.addColorStop(1, theme.bg[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Header accent pill
        ctx.fillStyle = theme.accent;
        ctx.beginPath();
        ctx.roundRect(140, 160, 260, 42, 21);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(theme.tag, 270, 187);

        // Slide title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(theme.title, 140, 310);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '32px sans-serif';
        ctx.fillText(theme.subtitle, 140, 380);

        // Grid mockup cards
        for (let c = 0; c < 3; c++) {
          const cardX = 140 + c * 560;
          const cardY = 480;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, 520, 420, 24);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = theme.accent;
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(`KPI Module 0${c + 1}`, cardX + 40, cardY + 70);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = '20px sans-serif';
          ctx.fillText('• Ultra high-resolution 16:9 layout', cardX + 40, cardY + 140);
          ctx.fillText('• Native OpenXML PresentationML', cardX + 40, cardY + 190);
          ctx.fillText('• Editable Microsoft PowerPoint Deck', cardX + 40, cardY + 240);
          ctx.fillText('• Zero server file transmission', cardX + 40, cardY + 290);
        }

        // Footer banner
        ctx.fillStyle = '#64748b';
        ctx.font = '18px sans-serif';
        ctx.fillText(
          `ToolsVerse PDF to PowerPoint Presentation Engine • Slide ${idx + 1} of 3`,
          140,
          1010
        );

        const dataUrl = canvas.toDataURL('image/png');
        return {
          id: `demo-slide-${idx + 1}`,
          pageNumber: idx + 1,
          originalPageNumber: idx + 1,
          dataUrl,
          blob: new Blob([], { type: 'image/png' }),
          width: 1920,
          height: 1080,
          rotation: 0,
        };
      });

      setSlides(demoSlides);
      setIsProcessing(false);
    }, 400);
  };

  // Reorder Slide Controls
  const moveSlide = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Update displayed page numbers
    newSlides.forEach((s, idx) => {
      s.pageNumber = idx + 1;
    });

    setSlides(newSlides);
  };

  // Rotate slide 90 degrees
  const rotateSlide = (index: number) => {
    const slide = slides[index];
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d')!;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const updatedUrl = canvas.toDataURL('image/png');
      canvas.toBlob((blob) => {
        if (!blob) return;
        setSlides((prev) =>
          prev.map((s, idx) =>
            idx === index
              ? {
                  ...s,
                  dataUrl: updatedUrl,
                  blob,
                  width: canvas.width,
                  height: canvas.height,
                  rotation: (s.rotation + 90) % 360,
                }
              : s
          )
        );
      }, 'image/png');
    };
    img.src = slide.dataUrl;
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    const newSlides = slides.filter((_, idx) => idx !== index);
    newSlides.forEach((s, idx) => {
      s.pageNumber = idx + 1;
    });
    setSlides(newSlides);
    if (selectedZoomSlide?.id === slides[index]?.id) {
      setSelectedZoomSlide(null);
    }
  };

  // Download single slide image
  const downloadSlideImage = (slide: SlideItem) => {
    const a = document.createElement('a');
    a.href = slide.dataUrl;
    const base = fileName.replace(/\.[^/.]+$/, '');
    a.download = `${base}_Slide_${String(slide.pageNumber).padStart(2, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate & Download PowerPoint (.pptx) via JSZip
  const downloadPowerPoint = async () => {
    if (slides.length === 0) return;
    setIsExportingPptx(true);
    setExportProgress(0);

    try {
      const zip = new JSZip();

      // Slide dimensions in EMUs (English Metric Units: 1 inch = 914,400 EMUs)
      // 16:9 Widescreen: 13.333 in x 7.5 in => 12192000 x 6858000 EMUs
      // 4:3 Standard: 10.0 in x 7.5 in => 9144000 x 6858000 EMUs
      const slideWidthEmu = aspectRatio === '4:3' ? 9144000 : 12192000;
      const slideHeightEmu = 6858000;

      const slideOverrides = slides
        .map(
          (_, i) =>
            `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
        )
        .join('\n  ');

      // 1. [Content_Types].xml
      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  ${slideOverrides}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
      );

      // 2. _rels/.rels
      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
      );

      // 3. docProps/core.xml
      const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      zip.file(
        'docProps/core.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${cleanTitle}</dc:title>
  <dc:creator>ToolsVerse PDF to PowerPoint</dc:creator>
  <cp:lastModifiedBy>ToolsVerse</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`
      );

      // 4. docProps/app.xml
      zip.file(
        'docProps/app.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <TotalTime>0</TotalTime>
  <Words>0</Words>
  <Application>ToolsVerse PDF to PowerPoint</Application>
  <PresentationFormat>Custom</PresentationFormat>
  <Paragraphs>0</Paragraphs>
  <Slides>${slides.length}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Theme</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>ToolsVerse Presentation</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>ToolsVerse</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`
      );

      // 5. ppt/presentation.xml
      const sldIdLst = slides
        .map(
          (_, i) =>
            `<p:sldId id="${256 + i}" r:id="rIdSlide${i + 1}"/>`
        )
        .join('\n    ');

      zip.file(
        'ppt/presentation.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="${slideWidthEmu}" cy="${slideHeightEmu}" type="custom"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
      );

      // 6. ppt/_rels/presentation.xml.rels
      const presSlideRels = slides
        .map(
          (_, i) =>
            `<Relationship Id="rIdSlide${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
        )
        .join('\n  ');

      zip.file(
        'ppt/_rels/presentation.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${presSlideRels}
</Relationships>`
      );

      // 7. ppt/slideMasters/slideMaster1.xml
      zip.file(
        'ppt/slideMasters/slideMaster1.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`
      );

      // 8. ppt/slideMasters/_rels/slideMaster1.xml.rels
      zip.file(
        'ppt/slideMasters/_rels/slideMaster1.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
      );

      // 9. ppt/slideLayouts/slideLayout1.xml
      zip.file(
        'ppt/slideLayouts/slideLayout1.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`
      );

      // 10. ppt/slideLayouts/_rels/slideLayout1.xml.rels
      zip.file(
        'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
      );

      // 11. Add slides, slide relationships, and media files
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideNum = i + 1;

        // Calculate aspect ratio fit inside slide canvas
        const imgAspect = (slide.width || 1920) / (slide.height || 1080);
        const targetAspect = slideWidthEmu / slideHeightEmu;

        let picOffX = 0;
        let picOffY = 0;
        let picExtX = slideWidthEmu;
        let picExtY = slideHeightEmu;

        if (aspectRatio !== 'original') {
          if (imgAspect > targetAspect) {
            // Image is wider than slide container -> letterbox top & bottom
            picExtX = slideWidthEmu;
            picExtY = Math.round(slideWidthEmu / imgAspect);
            picOffX = 0;
            picOffY = Math.round((slideHeightEmu - picExtY) / 2);
          } else {
            // Image is taller than slide container -> pillarbox left & right
            picExtY = slideHeightEmu;
            picExtX = Math.round(slideHeightEmu * imgAspect);
            picOffY = 0;
            picOffX = Math.round((slideWidthEmu - picExtX) / 2);
          }
        }

        // ppt/slides/slide{i}.xml
        zip.file(
          `ppt/slides/slide${slideNum}.xml`,
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="Slide Image ${slideNum}"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${picOffX}" y="${picOffY}"/>
            <a:ext cx="${picExtX}" cy="${picExtY}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
        );

        // ppt/slides/_rels/slide{i}.xml.rels
        zip.file(
          `ppt/slides/_rels/slide${slideNum}.xml.rels`,
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${slideNum}.png"/>
</Relationships>`
        );

        // Convert base64 DataURL to binary Uint8Array
        const base64Data = slide.dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`ppt/media/image${slideNum}.png`, base64Data, { base64: true });
      }

      const pptxBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setExportProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(pptxBlob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}_presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PPTX generation error:', err);
      setErrorMessage(
        err?.message || 'Failed to generate PowerPoint file. Please check slide data.'
      );
    } finally {
      setIsExportingPptx(false);
      setExportProgress(0);
    }
  };

  // Download all slide images as a ZIP
  const downloadAllImagesZip = async () => {
    if (slides.length === 0) return;
    setIsExportingZip(true);
    setExportProgress(0);

    try {
      const zip = new JSZip();
      const baseName = fileName.replace(/\.[^/.]+$/, '');

      slides.forEach((slide, idx) => {
        const slideFileName = `${baseName}_Slide_${String(idx + 1).padStart(2, '0')}.png`;
        const base64Data = slide.dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(slideFileName, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setExportProgress(Math.round(metadata.percent));
        }
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_slides_png.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 text-gray-500 dark:text-slate-400">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">PDF to PowerPoint</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
            <span>📽️ Authentic OpenXML PPTX Slide Deck Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            PDF to PowerPoint Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert PDF presentation decks into Microsoft PowerPoint (.pptx) slides with
            custom widescreen aspect ratios, slide reordering, and individual slide image export.
          </p>
        </header>

        {/* Ad Slot */}
        <AdSlot format="horizontal" />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline font-semibold ml-4 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dropzone */}
        {slides.length === 0 ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-10 sm:p-14 transition-all group bg-white dark:bg-slate-900 shadow-sm mb-8 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFile(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-3xl text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                📽️
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Choose PDF Presentation to Convert
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
                Drag and drop your PDF slide deck here, or click to browse files
              </p>
              <span className="px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-block">
                Browse Files
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 dark:text-slate-500 mt-5">
                <span>✓ High-Resolution 16:9 / 4:3 Rendering</span>
                <span>•</span>
                <span>✓ Reorder &amp; Rotate Slides</span>
                <span>•</span>
                <span>✓ Native .pptx Output</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Sample presentation banner when no slides or for quick test */}
        {slides.length === 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  No presentation PDF ready?
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Try our high-resolution executive slide demo deck to see the conversion in action.
                </p>
              </div>
            </div>
            <button
              onClick={loadDemoPresentation}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Load Sample Presentation Deck
            </button>
          </div>
        )}

        {/* Processing Progress State */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm mb-8 space-y-4">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Rendering Slides ({progress.current} / {progress.total || '...'})
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Extracting crisp vector graphics and typography onto widescreen presentation canvases...
              </p>
            </div>
            {progress.total > 0 && (
              <div className="max-w-md mx-auto w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-150"
                  style={{
                    width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Slide Deck Workspace */}
        {slides.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Control Bar */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {fileName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                    {slides.length} Slide{slides.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Drag, rotate, or reorder slides before generating your Microsoft PowerPoint presentation deck.
                </p>
              </div>

              {/* Aspect Ratio & Format Controls */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Slide Aspect Ratio
                  </label>
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === '16:9'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                      }`}
                    >
                      16:9 Widescreen
                    </button>
                    <button
                      onClick={() => setAspectRatio('4:3')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === '4:3'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                      }`}
                    >
                      4:3 Standard
                    </button>
                    <button
                      onClick={() => setAspectRatio('original')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === 'original'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setSlides([]);
                      setFile(null);
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons Banner */}
            <div className="flex flex-wrap items-center gap-4 p-5 bg-gradient-to-r from-primary-900 to-indigo-950 rounded-2xl text-white shadow-md">
              <div className="flex-1">
                <h3 className="font-bold text-base">Export Ready Presentation Deck</h3>
                <p className="text-xs text-primary-200">
                  Embeds crisp slide imagery into standard Microsoft PowerPoint (.pptx) package format.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={downloadPowerPoint}
                  disabled={isExportingPptx}
                  data-keep-light
                  className="flex items-center gap-2 px-6 py-3 bg-white text-primary-900 hover:bg-primary-50 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <span>📥</span>
                  <span>
                    {isExportingPptx
                      ? `Building Deck (${exportProgress}%)...`
                      : 'Download PowerPoint (.pptx)'}
                  </span>
                </button>

                <button
                  onClick={downloadAllImagesZip}
                  disabled={isExportingZip}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  <span>📦</span>
                  <span>
                    {isExportingZip
                      ? `Zipping (${exportProgress}%)...`
                      : 'Download All Slides as ZIP'}
                  </span>
                </button>
              </div>
            </div>

            {/* Slide Deck Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all"
                >
                  {/* Slide Canvas Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Slide {slide.pageNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSlide(index, 'left')}
                        disabled={index === 0}
                        title="Move Left"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => moveSlide(index, 'right')}
                        disabled={index === slides.length - 1}
                        title="Move Right"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => rotateSlide(index)}
                        title="Rotate 90°"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => deleteSlide(index)}
                        title="Delete Slide"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Presentation Container */}
                  <div
                    onClick={() => setSelectedZoomSlide(slide)}
                    className="relative aspect-video bg-gray-100 dark:bg-slate-950 p-2 flex items-center justify-center cursor-pointer overflow-hidden group-hover:opacity-95"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.dataUrl}
                      alt={`Slide ${slide.pageNumber}`}
                      className="max-w-full max-h-full object-contain rounded shadow-xs"
                    />

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <span>🔍 Click to Enlarge</span>
                    </div>
                  </div>

                  {/* Slide Card Footer */}
                  <div className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                      {slide.width} × {slide.height} px
                    </span>
                    <button
                      onClick={() => downloadSlideImage(slide)}
                      className="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/60 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>📥</span> Download Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Fullscreen Slide Zoom Preview */}
        {selectedZoomSlide && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedZoomSlide(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:px-6 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Slide {selectedZoomSlide.pageNumber} Preview
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadSlideImage(selectedZoomSlide)}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Download Slide Image
                  </button>
                  <button
                    onClick={() => setSelectedZoomSlide(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedZoomSlide.dataUrl}
                  alt={`Slide ${selectedZoomSlide.pageNumber}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Convert PDF to PowerPoint Presentation (.pptx)
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-slate-300 space-y-3 text-sm">
            <li>
              <strong>Upload your PDF Slides:</strong> Drag and drop your PDF presentation into the upload box or click &ldquo;Browse Files&rdquo;.
            </li>
            <li>
              <strong>Render Slide Deck:</strong> The converter parses each page with PDF.js at ultra-sharp retina resolution to preserve graphic elements and typography.
            </li>
            <li>
              <strong>Choose Aspect Ratio &amp; Layout:</strong> Select standard <strong>16:9 Widescreen</strong> (modern TVs, monitors, and projectors) or legacy <strong>4:3 Standard</strong> format.
            </li>
            <li>
              <strong>Reorder, Rotate, or Delete Slides:</strong> Organize your deck using the slide control buttons (◀ ▶) to re-sequence slides or rotate individual landscape/portrait orientations.
            </li>
            <li>
              <strong>Download .pptx Presentation:</strong> Click <strong>&ldquo;Download PowerPoint (.pptx)&rdquo;</strong> to generate an authentic Microsoft PowerPoint file ready to present, edit, or share in Office 365, Google Slides, or Keynote.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
