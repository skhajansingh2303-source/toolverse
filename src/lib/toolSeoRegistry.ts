import { tools, Tool, getToolUrl } from '@/lib/tools';

export interface StepItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoData {
  toolName: string;
  toolSlug: string;
  categoryName: string;
  categorySlug: string;
  steps: StepItem[];
  faqs: FaqItem[];
  relatedSlugs: string[];
}

export function getToolSeoData(slug: string): ToolSeoData | null {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return null;

  const categoryName = tool.category;
  const categorySlug = tool.categorySlug;
  const toolName = tool.name;

  // Get related tools in the same category
  const relatedSlugs = tools
    .filter((t) => t.categorySlug === categorySlug && t.slug !== slug)
    .slice(0, 4)
    .map((t) => t.slug);

  // Fallback to cross-category top tools if category has few items
  if (relatedSlugs.length < 4) {
    const extraSlugs = ['compress-pdf', 'merge-pdf', 'split-pdf', 'image-compressor', 'qr-code-generator']
      .filter((s) => s !== slug && !relatedSlugs.includes(s))
      .slice(0, 4 - relatedSlugs.length);
    relatedSlugs.push(...extraSlugs);
  }

  // Tailored steps and FAQs based on category
  let steps: StepItem[] = [];
  let faqs: FaqItem[] = [];

  if (categorySlug === 'calculators') {
    steps = [
      {
        title: 'Enter Parameters & Values',
        description: `Input your figures into the ${toolName}. You can switch units or adjust sliders in real time.`,
      },
      {
        title: 'Review Instant Results',
        description: 'The calculation engine recalculates outputs immediately without requiring page reloads.',
      },
      {
        title: 'Export, Copy, or Save',
        description: 'Copy the computed metrics to your clipboard or print the breakdown directly from your browser.',
      },
    ];
    faqs = [
      {
        question: `How accurate is the ${toolName}?`,
        answer: `The ${toolName} uses standardized mathematical, actuarial, and medical formulas (such as WHO standards for health tools and standard banking formulas for finance) for 100% precision.`,
      },
      {
        question: 'Are my personal calculations or numbers stored?',
        answer: 'Never. All calculations run strictly inside your client browser memory. Zero figures are logged, saved, or sent over the internet.',
      },
      {
        question: 'Can I use this calculator offline or on mobile?',
        answer: 'Yes! ToolsVerse is an offline-ready Progressive Web App (PWA). You can use this calculator on smartphones, tablets, and laptops without an internet connection.',
      },
      {
        question: 'Is there any fee or daily limit?',
        answer: 'No. The calculator is 100% free with unlimited calculations forever. No registration or email required.',
      },
    ];
  } else if (categorySlug === 'developer') {
    steps = [
      {
        title: 'Input Raw Payload or Code',
        description: `Paste your code snippet, payload, or file into the ${toolName} workspace.`,
      },
      {
        title: 'Configure Options & Filters',
        description: 'Choose your desired indentation, parsing flags, or encoding parameters.',
      },
      {
        title: 'Copy or Download Formatted Output',
        description: 'Inspect the live syntax-highlighted output and copy with one click or export to file.',
      },
    ];
    faqs = [
      {
        question: `Are sensitive tokens, API keys, or code uploaded to your servers?`,
        answer: 'Never. ToolsVerse operates 100% client-side in your local browser sandbox. Not a single character or byte is transmitted to any remote server.',
      },
      {
        question: 'Can this tool process large payloads without crashing?',
        answer: 'Yes! The engine is engineered with optimized WebAssembly and modern streaming APIs to handle large files smoothly.',
      },
      {
        question: `How does ${toolName} compare to command line utilities?`,
        answer: 'It offers identical precision and RFC compliance with the convenience of a modern, visual interface and zero software installation.',
      },
      {
        question: 'Is it completely free for commercial and enterprise projects?',
        answer: 'Yes, 100% free forever for individual developers, startups, and enterprise engineering teams.',
      },
    ];
  } else if (categorySlug === 'media') {
    steps = [
      {
        title: 'Select Image or Photo Files',
        description: `Drag and drop your images into the ${toolName}. Supports PNG, JPG, WEBP, SVG, and HEIC.`,
      },
      {
        title: 'Adjust Quality & Visual Settings',
        description: 'Fine-tune compression levels, dimensions, or format parameters with instant live preview.',
      },
      {
        title: 'Download Optimized Images',
        description: 'Download your processed images individually or packaged in a single ZIP archive.',
      },
    ];
    faqs = [
      {
        question: 'Will my images lose visual clarity or sharpness?',
        answer: `No. ${toolName} uses psycho-visual perceptual algorithms that preserve crisp edges and accurate colors while eliminating redundant bytes.`,
      },
      {
        question: 'Are private family or business photos stored on your cloud?',
        answer: 'Zero uploads. Your photos are decoded and processed directly on your local device GPU/CPU via HTML5 canvas and WebAssembly.',
      },
      {
        question: 'Is there a limit on how many images I can process?',
        answer: 'No batch limits! Process as many images as you need without paywalls, countdown timers, or subscriptions.',
      },
      {
        question: 'Does this tool work on iPhone and Android mobile browsers?',
        answer: 'Yes, fully optimized for Safari, Chrome, Samsung Internet, and Firefox on mobile devices.',
      },
    ];
  } else if (categorySlug === 'office') {
    steps = [
      {
        title: 'Select Office Document',
        description: `Upload your Word (.docx), Excel (.xlsx), or PowerPoint (.pptx) file to ${toolName}.`,
      },
      {
        title: 'Inspect & Configure Output',
        description: 'Review page orientation, layout boundaries, and formatting options.',
      },
      {
        title: 'Download Ready File',
        description: 'Export your converted or edited document instantly with zero software licenses needed.',
      },
    ];
    faqs = [
      {
        question: 'Do I need Microsoft Office or Microsoft 365 installed?',
        answer: 'No! ToolsVerse includes native browser parsers that process Microsoft Office documents without requiring any installed software.',
      },
      {
        question: 'Are my confidential business spreadsheets and contracts private?',
        answer: '100% private. Files never leave your local computer or phone. Processing occurs entirely in-memory.',
      },
      {
        question: 'Will tables, fonts, and cell layouts be preserved?',
        answer: 'Yes, our high-fidelity layout engine preserves font styling, table structures, column widths, and cell alignment.',
      },
      {
        question: 'Is this tool free for business and commercial use?',
        answer: 'Yes, 100% free with unlimited conversions. No daily task quotas or watermark additions.',
      },
    ];
  } else if (categorySlug === 'design' || categorySlug === 'text') {
    steps = [
      {
        title: 'Input Content or Set Parameters',
        description: `Enter your text, copy, or styling parameters into the ${toolName} workspace.`,
      },
      {
        title: 'Inspect Live Real-Time Preview',
        description: 'Watch the generated output update dynamically as you type or adjust controls.',
      },
      {
        title: 'Export or Copy with One Click',
        description: 'Download the generated high-resolution assets or copy formatted text to your clipboard.',
      },
    ];
    faqs = [
      {
        question: `Is ${toolName} free for commercial projects?`,
        answer: 'Yes! Any assets, code snippets, or documents generated with this tool are 100% yours to use in commercial, client, or personal projects.',
      },
      {
        question: 'Are my inputs or designs tracked or saved?',
        answer: 'Never. ToolsVerse operates in strict privacy mode with zero server logs, zero database saves, and zero telemetry tracking.',
      },
      {
        question: 'Does this tool work offline without an internet connection?',
        answer: 'Yes! Once loaded, ToolsVerse runs offline using local service workers and browser memory.',
      },
      {
        question: 'Why choose ToolsVerse over other online tools?',
        answer: 'ToolsVerse has zero advertising watermarks, zero subscription paywalls, and executes 100% client-side for unmatched speed and privacy.',
      },
    ];
  } else {
    // Default PDF Suite category (organize-pdf, optimize-pdf, edit-pdf, pdf-security, convert-to-pdf, convert-from-pdf)
    steps = [
      {
        title: 'Upload Your PDF File',
        description: `Select or drag and drop your document into the ${toolName}. Loaded instantly into memory.`,
      },
      {
        title: 'Configure Tool Settings & Live Preview',
        description: 'Adjust page options, compression levels, or security settings with real-time feedback.',
      },
      {
        title: 'Download Optimized Document',
        description: 'Download your processed PDF file with native vector clarity and zero server delays.',
      },
    ];
    faqs = [
      {
        question: `Are my confidential PDF documents uploaded to remote servers?`,
        answer: `Never. ${toolName} executes 100% inside your browser sandbox via WebAssembly. Your files never travel over the internet or touch any third-party server.`,
      },
      {
        question: 'Will using this tool degrade my document quality or text clarity?',
        answer: 'No. Vector text glyphs, embedded fonts, and layout structures are preserved losslessly according to ISO PDF standards.',
      },
      {
        question: 'Is there a file size or page count limit?',
        answer: 'No! Because processing happens on your local device CPU, you can process documents of any size without paying for premium licenses.',
      },
      {
        question: 'Why is ToolsVerse better than iLovePDF or Adobe Acrobat?',
        answer: 'ToolsVerse offers 100% client-side privacy (no file uploads), unlimited free usage with zero daily caps, zero paywalled features, and embedded live previews before download.',
      },
    ];
  }

  return {
    toolName,
    toolSlug: slug,
    categoryName,
    categorySlug,
    steps,
    faqs,
    relatedSlugs,
  };
}
