export interface Tool {
  name: string;
  description: string;
  slug: string;
  icon: string;
  category: string;
  categorySlug: string;
  color: string;
  keywords?: string[];
}

export function getToolUrl(tool: { categorySlug?: string; slug: string }): string {
  return "/tools/" + (tool.categorySlug || "organize-pdf") + "/" + tool.slug;
}

export function searchTools(toolList: Tool[], query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return toolList;

  // Split query into individual clean tokens
  const tokens = q
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/gi, '').toLowerCase())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return toolList;

  interface ScoredTool {
    tool: Tool;
    score: number;
    matchReason?: string;
  }

  const scored: ScoredTool[] = [];

  for (const tool of toolList) {
    const nameLower = tool.name.toLowerCase();
    const slugLower = tool.slug.toLowerCase();
    const descLower = tool.description.toLowerCase();
    const catLower = tool.category.toLowerCase();
    const keywords = (tool.keywords || []).map((k) => k.toLowerCase());

    let score = 0;
    let matchReason: string | undefined;

    // 1. Exact match with tool name or slug
    if (nameLower === q || slugLower === q) {
      score += 1000;
      matchReason = tool.name;
    }
    // 2. Exact match with one of the keywords
    else if (keywords.includes(q)) {
      score += 850;
      matchReason = keywords.find((k) => k === q);
    }
    // 3. Name starts with query or contains query as a whole phrase
    else if (nameLower.startsWith(q)) {
      score += 600;
      matchReason = tool.name;
    } else if (nameLower.includes(q)) {
      score += 450;
      matchReason = tool.name;
    }
    // 4. Any keyword contains full query as a phrase or query contains the keyword
    else if (keywords.some((k) => k.includes(q) || q.includes(k))) {
      score += 350;
      matchReason = keywords.find((k) => k.includes(q) || q.includes(k));
    }
    // 5. Description contains full query phrase
    else if (descLower.includes(q)) {
      score += 250;
    }
    // 6. Slug contains full query
    else if (slugLower.includes(q)) {
      score += 200;
    }

    // 7. Token-based matching (Multi-word intent, e.g. "make pdf text readable", "optical character recognition")
    let matchedTokensCount = 0;
    for (const token of tokens) {
      const inName = nameLower.includes(token);
      const inKeyword = keywords.some((k) => k.includes(token));
      const inDesc = descLower.includes(token);
      const inSlug = slugLower.includes(token);
      const inCat = catLower.includes(token);

      if (inName || inKeyword || inDesc || inSlug || inCat) {
        matchedTokensCount++;
        if (inName) score += 40;
        else if (inKeyword) score += 30;
        else if (inSlug) score += 20;
        else if (inDesc) score += 15;
        else score += 10;
      }
    }

    // Bonus for matching all tokens in a multi-word search
    if (tokens.length > 1 && matchedTokensCount === tokens.length) {
      score += 250;
      if (!matchReason) {
        // Find best matching keyword for badge preview
        matchReason = keywords.find((k) => tokens.some((t) => k.includes(t)));
      }
    } else if (tokens.length >= 3 && matchedTokensCount >= tokens.length - 1) {
      score += 120;
    }

    if (score > 0 && (matchedTokensCount === tokens.length || score >= 80)) {
      scored.push({ tool, score, matchReason });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.tool);
}

export interface ToolCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const CATEGORIES: ToolCategory[] = [
  { name: "Convert from PDF", slug: "convert-from-pdf", description: "Convert PDF files to Word, JPG, Excel, PowerPoint, Text, and HTML.", icon: "🔄" },
  { name: "Convert to PDF", slug: "convert-to-pdf", description: "Convert Images, Office documents, and Text to high-quality PDF.", icon: "📄" },
  { name: "Organize PDF", slug: "organize-pdf", description: "Merge, split, remove, rotate, and rearrange PDF document pages.", icon: "📑" },
  { name: "Optimize PDF", slug: "optimize-pdf", description: "Compress, repair, OCR, and optimize PDF files for fast sharing.", icon: "🗜️" },
  { name: "Edit PDF", slug: "edit-pdf", description: "Add text, watermarks, page numbers, and crop PDF pages.", icon: "✏️" },
  { name: "PDF Security", slug: "pdf-security", description: "Sign, encrypt with password, unlock, and redact PDF files.", icon: "🔒" },
  { name: "Office", slug: "office", description: "Process Word, Excel, and PowerPoint documents without Microsoft Office.", icon: "📊" },
  { name: "Media", slug: "media", description: "Compress, convert, and resize images in your browser privately.", icon: "🖼️" },
  { name: "Calculators", slug: "calculators", description: "Fast calculations for finance, health, academics, and units.", icon: "🧮" },
  { name: "Developer", slug: "developer", description: "Inspect, format, encode, and decode developer payloads.", icon: "💻" },
  { name: "Text", slug: "text", description: "Word count, case conversion, and text cleaning utilities.", icon: "📝" },
  { name: "Design", slug: "design", description: "Color palettes, shadows, QR codes, and resume generation.", icon: "🎨" },
];

export const tools: Tool[] = [
  // ─── PDF Suite (Inspired by iLovePDF & PDF24) ───
  {
    name: 'Sign PDF (E-Signature)',
    description: 'Draw or type your digital signature and place it anywhere on your PDF document. 100% legal & private.',
    slug: 'sign-pdf',
    icon: '✍️',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-blue-600 to-indigo-700',
    keywords: ["sign pdf","e-sign pdf","digital signature","fill and sign pdf","draw signature on pdf","electronic signature online","sign contract pdf free","docusign free alternative","ilovepdf sign","sign pdf without uploading"],
  },
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document with reordering. 100% private.',
    slug: 'merge-pdf',
    icon: '📎',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-red-500 to-rose-600',
    keywords: ["merge pdf","combine pdf","join pdf files","combine multiple pdf into one","merge pdf free no limit","pdf binder","ilovepdf merge alternative","pdf combiner online","unir pdf","merge pdf without upload"],
  },
  {
    name: 'Split PDF',
    description: 'Extract specific pages from a PDF or split every page into separate files visually.',
    slug: 'split-pdf',
    icon: '✂️',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-orange-500 to-amber-600',
    keywords: ["split pdf","separate pdf pages","extract pages from pdf","cut pdf pages","split pdf online free","divide pdf","ilovepdf split alternative","split pdf by page range","extract single page from pdf"],
  },
  {
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining document clarity for email attachments and portal uploads.',
    slug: 'compress-pdf',
    icon: '🗜️',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-rose-500 to-red-600',
    keywords: ["compress pdf","reduce pdf size","shrink pdf","pdf compressor online free","compress pdf without losing quality","make pdf smaller","downsample pdf","ilovepdf compress alternative","smallpdf compress alternative"],
  },
  {
    name: 'Image to PDF',
    description: 'Convert JPG, PNG, and WebP images into clean, formatted PDF documents.',
    slug: 'image-to-pdf',
    icon: '🖼️',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-sky-500 to-blue-600',
    keywords: ["image to pdf","jpg to pdf","png to pdf","convert photo to pdf","combine images into pdf","jpeg to pdf converter online free","picture to pdf free no watermark"],
  },
  {
    name: 'PDF to JPG',
    description: 'Convert PDF document pages into high-resolution JPG images for presentations and sharing.',
    slug: 'pdf-to-jpg',
    icon: '📷',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-emerald-500 to-teal-600',
    keywords: ["pdf to jpg","convert pdf to image","save pdf pages as jpg","extract jpg from pdf","pdf to picture high quality free","ilovepdf pdf to jpg","pdf to jpeg online"],
  },
  {
    name: 'PDF to Text Extractor',
    description: 'Extract plain text from PDF pages for research, study notes, and speech-to-text.',
    slug: 'pdf-to-text',
    icon: '📜',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-amber-600 to-orange-600',
    keywords: ["pdf to text","extract text from pdf","pdf to txt","convert pdf text online free","copy text from scanned pdf","pdf text stripper","export pdf to text"],
  },
  {
    name: 'Text & Notes to PDF',
    description: 'Turn written text, essays, meeting notes, and letters into clean, formatted PDF documents.',
    slug: 'text-to-pdf',
    icon: '📝',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-cyan-600 to-blue-600',
    keywords: ["text to pdf","convert txt to pdf","notepad to pdf","notes to pdf converter online free","essay to pdf","plain text to pdf document"],
  },
  {
    name: 'Redact PDF (Blackout)',
    description: 'Permanently blackout confidential text, bank numbers, and sensitive details on PDF pages.',
    slug: 'redact-pdf',
    icon: '⬛',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-gray-700 to-slate-900',
    keywords: ["redact pdf","blackout text in pdf","hide sensitive info in pdf","censor pdf online free","permanently remove text from pdf","mask ssn in pdf","sanitize confidential pdf"],
  },
  {
    name: 'Crop PDF',
    description: 'Trim excess page margins and crop page dimensions for printing or handheld reading.',
    slug: 'crop-pdf',
    icon: '📐',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-teal-600 to-emerald-700',
    keywords: ["crop pdf","trim pdf margins","cut pdf white borders","crop pdf pages online free","crop pdf canvas size","remove margin from pdf"],
  },
  {
    name: 'Scan to PDF',
    description: 'Capture document pages using your webcam or photos and compile into a scanned PDF.',
    slug: 'scan-to-pdf',
    icon: '📠',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-violet-600 to-indigo-600',
    keywords: ["scan to pdf","camera to pdf","scan document with phone","photo scanner to pdf online","convert camera capture to pdf","free document scanner"],
  },
  {
    name: 'Rotate PDF',
    description: 'Rotate PDF pages 90°, 180°, or 270° clockwise or counter-clockwise.',
    slug: 'rotate-pdf',
    icon: '🔃',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-emerald-500 to-green-600',
    keywords: ["rotate pdf","turn pdf pages","rotate upside down pdf","save rotated pdf permanently","rotate pdf online free","change pdf orientation portrait landscape"],
  },
  {
    name: 'Add Watermark to PDF',
    description: 'Add custom text watermarks with transparency, angle, and position controls.',
    slug: 'watermark-pdf',
    icon: '💧',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-cyan-500 to-teal-600',
    keywords: ["watermark pdf","add watermark to pdf","stamp confidential on pdf","add logo to pdf","pdf watermark maker free","custom text watermark pdf"],
  },
  {
    name: 'Remove PDF Pages',
    description: 'Delete unwanted pages from any PDF document and download the cleaned version.',
    slug: 'remove-pdf-pages',
    icon: '🗑️',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-rose-600 to-red-700',
    keywords: ["remove pdf pages","delete pages from pdf","remove blank pages from pdf","delete specific page pdf free","drop pdf pages online"],
  },
  {
    name: 'Add Page Numbers to PDF',
    description: 'Insert header or footer page numbers (e.g. Page X of Y) into PDF documents.',
    slug: 'number-pdf',
    icon: '🔢',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-blue-600 to-indigo-600',
    keywords: ["number pdf","add page numbers to pdf","bates numbering pdf","footer page numbers pdf online free","header and footer pagination pdf"],
  },
  {
    name: 'PDF Metadata Editor',
    description: 'View and update PDF metadata: Title, Author, Subject, Keywords, and Creator.',
    slug: 'pdf-metadata',
    icon: '🏷️',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-purple-600 to-violet-700',
    keywords: ["pdf metadata editor","edit pdf author title","change pdf properties","remove metadata from pdf","clean pdf exif metadata","pdf tags editor"],
  },

  // ─── Student, Teacher & Career Essentials ───
  {
    name: 'GPA & Grade Calculator',
    description: 'Calculate semester and cumulative GPA on 4.0 scale with weighted credit hours for students & teachers.',
    slug: 'gpa-calculator',
    icon: '🎓',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-indigo-600 to-purple-600',
    keywords: ["gpa calculator","college gpa calculator","calculate weighted gpa","cgpa to percentage calculator","semester grade calculator","cumulative gpa calculator 4.0 scale"],
  },
  {
    name: 'Resume & CV Builder',
    description: 'Build modern, ATS-friendly resumes for students, teachers, and employees with instant PDF export.',
    slug: 'resume-builder',
    icon: '💼',
    category: "Design",
    categorySlug: "design",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["resume builder","free cv maker","online resume generator","ats friendly resume template","software engineer resume maker","download resume pdf free","modern cv templates"],
  },
  {
    name: 'Handwriting Studio Generator',
    description: 'Convert PDFs and text into realistic handwritten notes with custom fonts, diagrams, ruled paper, and vector PDF export.',
    slug: 'handwriting-studio-generator',
    icon: '✍️',
    category: "Design",
    categorySlug: "design",
    color: 'from-indigo-600 to-violet-700',
    keywords: ["handwriting generator","text to handwriting","assignment writing generator","convert typed notes to handwriting","handwritten notes maker","homework handwriting font generator"],
  },

  // ─── Image & Media Tools ───
  {
    name: 'Image Compressor',
    description: 'Compress PNG, JPG, and WebP images in your browser with live before/after preview.',
    slug: 'image-compressor',
    icon: '🗜️',
    category: "Media",
    categorySlug: "media",
    color: 'from-rose-500 to-pink-500',
    keywords: ["image compressor","compress jpg","compress png","shrink image size online","reduce photo size in kb","tinypng alternative free","lossless photo compression","compress webp"],
  },
  {
    name: 'Image Resizer',
    description: 'Resize image dimensions by custom width, height, or percentage while maintaining aspect ratio.',
    slug: 'image-resizer',
    icon: '📐',
    category: "Media",
    categorySlug: "media",
    color: 'from-indigo-500 to-purple-600',
    keywords: ["image resizer","resize photo dimensions","change image width height","crop and resize image","social media image resizer free","scale photo pixels"],
  },
  {
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG, WebP, and BMP instantly in your browser.',
    slug: 'image-converter',
    icon: '🔄',
    category: "Media",
    categorySlug: "media",
    color: 'from-amber-500 to-orange-600',
    keywords: ["image converter","convert image format","png to jpg","webp to png","jpg to webp","free batch image converter","heic png jpg converter"],
  },
  {
    name: 'Image Color Picker & Eyedropper',
    description: 'Upload any photo and click anywhere to sample, inspect, and copy Hex and RGB colors.',
    slug: 'image-color-picker',
    icon: '🎯',
    category: "Media",
    categorySlug: "media",
    color: 'from-teal-500 to-emerald-600',
    keywords: ["color picker from image","eyedropper tool online","extract hex colors from image","find rgb code from image","palette extractor","image hex finder"],
  },
  {
    name: 'SVG Viewer & Optimizer',
    description: 'Inspect, preview, clean, and minify raw SVG vector code with syntax highlighting.',
    slug: 'svg-viewer-optimizer',
    icon: '⚡',
    category: "Media",
    categorySlug: "media",
    color: 'from-cyan-500 to-blue-500',
    keywords: ["svg viewer","svg optimizer","svgo online","minify svg","view svg online","clean svg code","reduce svg file size"],
  },
  {
    name: 'Favicon Generator',
    description: 'Generate standard website favicons (16x16, 32x32, 48x48, 180x180 Apple Touch) from an image.',
    slug: 'favicon-generator',
    icon: '⭐',
    category: "Media",
    categorySlug: "media",
    color: 'from-yellow-500 to-amber-600',
    keywords: ["favicon generator","create ico file","convert png to favicon.ico","website favicon maker","generate apple touch icon","multi-size favicon generator"],
  },

  // ─── Developer & Security Tools ───
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data with line & column syntax diagnostics.',
    slug: 'json-formatter',
    icon: '{ }',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-blue-500 to-cyan-500',
    keywords: ["json formatter","json beautifier","validate json","json parser online","pretty print json","format json string","json validator and fixer"],
  },
  {
    name: 'JWT Decoder & Inspector',
    description: 'Decode JSON Web Tokens (Header, Payload, Claims, Expiration) client-side securely.',
    slug: 'jwt-decoder',
    icon: '🔑',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-violet-600 to-purple-700',
    keywords: ["jwt decoder","decode json web token","jwt debugger online","inspect jwt payload","jwt io alternative","view jwt claims without secret"],
  },
  {
    name: 'UUID / GUID Generator',
    description: 'Generate standard Version-4 UUIDs in bulk (1 to 1000) with hyphens and uppercase options.',
    slug: 'uuid-generator',
    icon: '🆔',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-emerald-500 to-teal-600',
    keywords: ["uuid generator","guid generator","generate v4 uuid","bulk uuid generator online free","random uuid maker","rfc4122 v4 uuid"],
  },
  {
    name: 'Code Beautifier & Minifier',
    description: 'Beautify or minify HTML, CSS, and JavaScript code snippets for clean formatting.',
    slug: 'code-beautifier-minifier',
    icon: '</>',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-blue-600 to-indigo-700',
    keywords: ["code beautifier","code minifier","format javascript css html","minify js css online","prettify source code","html css js compress"],
  },
  {
    name: 'SQL Query Formatter',
    description: 'Format and indent SQL queries (SELECT, INSERT, UPDATE, JOINs) for readability.',
    slug: 'sql-formatter',
    icon: '🗄️',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-cyan-600 to-blue-700',
    keywords: ["sql formatter","format sql query","beautify sql queries online","indent sql statements free","sql pretty printer","mysql postgresql query format"],
  },
  {
    name: 'Cron Expression Generator',
    description: 'Build cron schedules visually and understand what cron syntax means in plain English.',
    slug: 'cron-generator',
    icon: '⏰',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-amber-600 to-red-600',
    keywords: ["cron expression generator","crontab generator","cron schedule maker","explain cron syntax online","cron timer helper","cron guru alternative"],
  },
  {
    name: 'Regex Tester',
    description: 'Test regular expressions with real-time flag customization and group capture parsing.',
    slug: 'regex-tester',
    icon: '.*',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-yellow-500 to-orange-500',
    keywords: ["regex tester","test regular expression","regex playground online","regular expression evaluator","regex match debugger","regex101 alternative free"],
  },
  {
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode Base64 strings with byte size statistics and quick swap.',
    slug: 'base64-encoder-decoder',
    icon: '🔄',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-indigo-500 to-blue-500',
    keywords: ["base64 encode","base64 decode","convert string to base64","base64 to image decoder online free","utf8 base64 converter","binary to base64"],
  },
  {
    name: 'URL Encoder / Decoder',
    description: 'Encode and decode URLs and inspect query parameters in a formatted table.',
    slug: 'url-encoder-decoder',
    icon: '🔗',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-violet-500 to-purple-500',
    keywords: ["url encode","url decode","percent encoding decoder","urldecode online free","query string encoder","escape url characters"],
  },
  {
    name: 'Timestamp Converter',
    description: 'Convert Unix epoch timestamps to human-readable dates across international timezones.',
    slug: 'timestamp-converter',
    icon: '⏱️',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-pink-500 to-rose-500',
    keywords: ["timestamp converter","epoch to date","unix timestamp to readable date converter","current epoch time online","millis to date converter","utc timestamp parser"],
  },
  {
    name: 'Password Generator',
    description: 'Generate strong, secure passwords with custom lengths, character sets, and bulk export.',
    slug: 'password-generator',
    icon: '🔐',
    category: "Design",
    categorySlug: "design",
    color: 'from-green-500 to-emerald-500',
    keywords: ["password generator","strong password maker","secure random password generator","generate strong random password online","passphrase generator","cybersecurity password creator"],
  },
  {
    name: 'Hash Generator',
    description: 'Compute SHA-256, SHA-1, SHA-384, and SHA-512 cryptographic hashes for text and files.',
    slug: 'hash-generator',
    icon: '#️⃣',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-slate-600 to-gray-800',
    keywords: ["hash generator","md5 hash generator","sha256 generator online","calculate sha512 checksum","sha1 hash generator free","keccak sha3 hash online"],
  },

  // ─── Design, CSS & Styling ───
  {
    name: 'Color Palette Generator',
    description: 'Generate complementary, analogous, and triadic color schemes with spacebar & CSS export.',
    slug: 'color-palette-generator',
    icon: '🎨',
    category: "Design",
    categorySlug: "design",
    color: 'from-orange-500 to-red-500',
    keywords: ["color palette generator","color scheme generator","coolors alternative","hex color palettes for web design","complementary color palette maker","ui colors generator"],
  },
  {
    name: 'CSS Box Shadow & Glassmorphism',
    description: 'Visual sliders for box shadows, blur, spread, elevation, and frosted glass CSS code.',
    slug: 'css-box-shadow-generator',
    icon: '🧊',
    category: "Design",
    categorySlug: "design",
    color: 'from-fuchsia-500 to-pink-600',
    keywords: ["box shadow generator","css glassmorphism generator","soft shadow generator css","neumorphism box shadow maker","tailwind box shadow generator"],
  },
  {
    name: 'Aspect Ratio Calculator',
    description: 'Calculate 16:9, 4:3, 1:1, 9:16 aspect ratios, scaling dimensions, and crop pixel values.',
    slug: 'aspect-ratio-calculator',
    icon: '📏',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-teal-600 to-cyan-700',
    keywords: ["aspect ratio calculator","calculate 16:9 4:3 dimensions","image aspect ratio calculator online free","screen resolution aspect ratio","resize ratio calculator"],
  },
  {
    name: 'QR Code Generator',
    description: 'Generate custom QR codes for URLs, WiFi credentials, emails, and vCards with color themes.',
    slug: 'qr-code-generator',
    icon: '📱',
    category: "Design",
    categorySlug: "design",
    color: 'from-purple-500 to-pink-500',
    keywords: ["qr code generator","create qr code free","wifi qr code generator","qr code with logo free no expiry","custom url qr code","high resolution qr code download"],
  },

  // ─── Text, Content & Data ───
  {
    name: 'Word Counter & Analyzer',
    description: 'Count words, characters, sentences, reading ease grade, and keyword density.',
    slug: 'word-counter',
    icon: '📝',
    category: "Text",
    categorySlug: "text",
    color: 'from-teal-500 to-cyan-500',
    keywords: ["word counter","character count online","sentence counter","reading time calculator","words and letters counter free","essay word length checker"],
  },
  {
    name: 'Case Converter',
    description: 'Convert text to UPPERCASE, lowercase, Title Case (AP style), camelCase, snake_case, etc.',
    slug: 'case-converter',
    icon: 'Aa',
    category: "Text",
    categorySlug: "text",
    color: 'from-fuchsia-500 to-purple-600',
    keywords: ["case converter","convert to uppercase","lowercase to title case","camelcase kebab-case converter","capital letter converter online","snake case pascal case generator"],
  },
  {
    name: 'Text Diff Checker',
    description: 'Compare two text versions side by side with line numbers and added/removed indicators.',
    slug: 'text-diff-checker',
    icon: '🔍',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-lime-500 to-green-600',
    keywords: ["text diff checker","compare two texts online","find difference between texts","diff viewer online free","side by side text comparison","code diff checker"],
  },
  {
    name: 'Markdown Preview',
    description: 'Live split-pane markdown editor with instant HTML formatting and sample preview.',
    slug: 'markdown-preview',
    icon: '📖',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-gray-600 to-gray-800',
    keywords: ["markdown preview","markdown editor live preview","convert markdown to html online free","github flavored markdown editor","render markdown table math"],
  },
  {
    name: 'Lorem Ipsum Generator',
    description: 'Generate dummy placeholder text by words, sentences, or paragraphs with copy feedback.',
    slug: 'lorem-ipsum-generator',
    icon: '📄',
    category: "Text",
    categorySlug: "text",
    color: 'from-amber-500 to-orange-500',
    keywords: ["lorem ipsum generator","dummy text generator","filler text paragraphs words online free","placeholder text maker","latin dummy paragraph generator"],
  },
  {
    name: 'CSV to JSON & JSON to CSV',
    description: 'Convert spreadsheets and tabular CSV data into JSON arrays and vice versa instantly.',
    slug: 'csv-json-converter',
    icon: '📊',
    category: "Developer",
    categorySlug: "developer",
    color: 'from-emerald-600 to-green-700',
    keywords: ["csv to json","json to csv","convert spreadsheet csv to json online","export json as csv free","convert excel csv data to json array"],
  },
  {
    name: 'List Cleaner & Deduplicator',
    description: 'Sort lists, remove duplicate lines, trim whitespace, and add prefixes or suffixes.',
    slug: 'list-cleaner',
    icon: '📋',
    category: "Text",
    categorySlug: "text",
    color: 'from-indigo-600 to-blue-600',
    keywords: ["list cleaner","remove duplicates from list","sort list alphabetically","deduplicate list online free","clean line breaks and spaces","item list filter"],
  },

  // ─── Math, Finance & Calculations ───
  {
    name: 'Universal Unit Converter',
    description: 'Convert Length, Weight, Temperature, Digital Data (Bytes, MB, GB), Area, and Speed.',
    slug: 'unit-converter',
    icon: '⚖️',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-sky-500 to-indigo-600',
    keywords: ["unit converter","convert length weight speed temperature","metric to imperial conversion online","currency kg to lbs celsius to fahrenheit","universal measurement converter"],
  },
  {
    name: 'Percentage Calculator',
    description: 'Calculate what is X% of Y, percentage increase/decrease, and fraction conversions.',
    slug: 'percentage-calculator',
    icon: '%',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-purple-500 to-pink-600',
    keywords: ["percentage calculator","calculate percent increase decrease","what percent of X is Y calculator","percent difference calculator","discount percentage calculation"],
  },
  {
    name: 'Loan & Mortgage EMI Calculator',
    description: 'Calculate monthly loan EMI, total interest payable, and breakdown amortization table.',
    slug: 'loan-calculator',
    icon: '🏦',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["loan emi calculator","mortgage payment calculator","home loan interest calculator","car loan amortization schedule","personal loan monthly repayment calculation"],
  },
  {
    name: 'Age Calculator',
    description: 'Calculate your exact age in years, months, days, hours, and next birthday countdown.',
    slug: 'age-calculator',
    icon: '🎂',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-amber-500 to-rose-500',
    keywords: ["age calculator","calculate exact age from date of birth","chronological age calculator","how old am i in days hours","dob age difference calculator"],
  },
  {
    name: 'BMI Calculator',
    description: 'Calculate Body Mass Index (BMI), health category, and healthy ideal weight range.',
    slug: 'bmi-calculator',
    icon: '🏃',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-teal-500 to-emerald-600',
    keywords: ["bmi calculator","body mass index calculator","ideal weight calculator metric imperial","calculate bmi adult free","healthy weight range bmi chart"],
  },
  {
    name: 'Weight, Calorie & BMR Calculator',
    description: 'Calculate Basal Metabolic Rate (BMR) and daily maintenance calories for weight loss or gain.',
    slug: 'calorie-bmr-calculator',
    icon: '🔥',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-orange-500 to-red-600',
    keywords: ["calorie calculator","bmr calculator","daily calorie maintenance calculator","tdee calculator free","basal metabolic rate weight loss calculator"],
  },
  {
    name: 'SIP Calculator',
    description: 'Calculate mutual fund SIP returns, total investment growth, and compounding wealth accumulation.',
    slug: 'sip-calculator',
    icon: '📈',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-indigo-600 to-emerald-600',
    keywords: ["sip calculator","systematic investment plan return calculator","mutual fund sip calculator","calculate wealth compound interest","sip maturity amount formula"],
  },
  {
    name: 'Compound Interest Calculator',
    description: 'Calculate daily, monthly, and yearly compound interest on investments with recurring deposits.',
    slug: 'compound-interest-calculator',
    icon: '💹',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["compound interest calculator","calculate interest compounding daily monthly annually","future value investment calculator","apy interest calculation online"],
  },
  {
    name: 'GST & Sales Tax Calculator',
    description: 'Calculate and add or remove GST, CGST, SGST, and IGST for tax invoices and billing in real time.',
    slug: 'gst-calculator',
    icon: '🧾',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-amber-500 to-orange-600',
    keywords: ["gst calculator","calculate goods and services tax","add remove gst percentage","gst invoice tax calculator","reverse gst calculation formula"],
  },
  {
    name: 'Salary & Income Tax Calculator',
    description: 'Calculate monthly take-home salary, income tax (New vs Old Regime), EPF deductions, and net in-hand pay.',
    slug: 'salary-calculator',
    icon: '💵',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-emerald-600 to-teal-600',
    keywords: ["salary calculator","take home pay calculator","in hand salary calculator after tax deductions","gross to net salary calculation","annual ctc breakdown monthly pay"],
  },
  {
    name: 'Fixed Deposit (FD) & RD Calculator',
    description: 'Calculate bank Fixed Deposit (FD) and Recurring Deposit (RD) maturity amount, interest income, and compounding yield.',
    slug: 'fd-calculator',
    icon: '🏦',
    category: "Calculators",
    categorySlug: "calculators",
    color: 'from-blue-600 to-indigo-600',
    keywords: ["fd calculator","fixed deposit maturity calculator","recurring deposit rd return calculator","bank fd interest rate payout calculator","compounding fd formula"],
  },
  // ─── PDF24 Super Suite Additions ───
  {
    name: 'Invoice Generator',
    description: 'Create and download professional PDF invoices and receipts with line items, tax, and currency.',
    slug: 'create-invoice',
    icon: '🧾',
    category: "Office",
    categorySlug: "office",
    color: 'from-sky-500 to-indigo-600',
    keywords: ["invoice generator","free invoice maker","create receipt online","download invoice pdf free no watermark","billing invoice template","freelancer client invoice pdf"],
  },
  {
    name: 'Flatten PDF',
    description: 'Lock fillable form fields, checkboxes, and signatures into static read-only PDF graphics.',
    slug: 'flatten-pdf',
    icon: '🔒',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-amber-500 to-red-600',
    keywords: ["flatten pdf","flatten pdf form fields","lock pdf annotations","make fillable pdf read only free online","flatten layers in pdf document"],
  },
  {
    name: 'Pages Per Sheet (N-Up)',
    description: 'Put 2 or 4 pages side-by-side on a single printed sheet to save paper for lecture slides and handouts.',
    slug: 'nup-pdf',
    icon: '🖨️',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-emerald-500 to-teal-600',
    keywords: ["pages per sheet pdf","n-up pdf","multiple pages per sheet print","print 2 pages per sheet pdf online","booklet print 4 up pdf"],
  },
  {
    name: 'Rearrange PDF Pages',
    description: 'Visually sort, reorder, and reverse pages in any multi-page PDF document.',
    slug: 'rearrange-pdf-pages',
    icon: '📑',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-blue-500 to-indigo-600',
    keywords: ["rearrange pdf pages","reorder pdf pages","drag and drop pdf page order online free","sort pages in pdf document","change pdf sequence"],
  },
  {
    name: 'Extract Images from PDF',
    description: 'Extract all photos, diagrams, and figures from your PDF documents as high-resolution PNGs.',
    slug: 'extract-pdf-images',
    icon: '🖼️',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-purple-500 to-pink-600',
    keywords: ["extract images from pdf","rip pictures from pdf","save all images in pdf document free online","pdf image grabber","export photos from pdf"],
  },
  {
    name: 'Edit PDF',
    description: 'Add text, shapes, highlighter annotations, and stamps directly onto PDF pages.',
    slug: 'edit-pdf',
    icon: '✏️',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-amber-500 to-yellow-600',
    keywords: ["edit pdf","online pdf editor","add text to pdf free","modify pdf documents in browser without upload","free pdf annotations highlighter text","write on pdf online"],
  },
  {
    name: 'Universal PDF Converter',
    description: 'Convert PDF to Word, Text, HTML, and Images, or convert files into PDF format.',
    slug: 'pdf-converter',
    icon: '🔄',
    category: "Office",
    categorySlug: "office",
    color: 'from-indigo-600 to-blue-700',
    keywords: ["universal pdf converter","convert any file to pdf","convert pdf to anything","all in one pdf tool online","office image text to pdf","batch pdf converter"],
  },
  {
    name: 'Protect PDF (Password & Lock)',
    description: 'Encrypt your PDF with password security and restrict printing, copying, or editing.',
    slug: 'protect-pdf',
    icon: '🔒',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["protect pdf","password protect pdf","encrypt pdf file","add password to pdf online free","aes 128 256 encryption pdf","lock confidential pdf"],
  },
  {
    name: 'Unlock PDF',
    description: 'Remove passwords and permissions security from protected PDF documents.',
    slug: 'unlock-pdf',
    icon: '🔓',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-rose-500 to-pink-600',
    keywords: ["unlock pdf","remove pdf password","decrypt pdf file","unlock protected pdf online free","remove owner permissions from pdf","strip password from pdf"],
  },
  {
    name: 'Extract PDF Pages',
    description: 'Visually pick specific page numbers or ranges to extract into a new PDF or ZIP file.',
    slug: 'extract-pdf-pages',
    icon: '📑',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-purple-600 to-indigo-600',
    keywords: ["extract pdf pages","save specific pages as new pdf","pull pages out of pdf free online","select and save pages from pdf","pdf page extractor"],
  },
  {
    name: 'Webpage & HTML to PDF',
    description: 'Convert live webpages or custom HTML/CSS code into clean, paginated PDF documents.',
    slug: 'webpage-to-pdf',
    icon: '🌐',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-blue-500 to-cyan-600',
    keywords: ["webpage to pdf","convert html to pdf","save website as pdf","url to pdf converter online free","article webpage to pdf downloader","snapshot full webpage pdf"],
  },
  {
    name: 'PDF OCR (Text Recognition)',
    description: 'Recognize and extract text from scanned documents and create searchable PDFs.',
    slug: 'pdf-ocr',
    icon: '👁️',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-cyan-600 to-teal-700',
    keywords: [
      "pdf ocr",
      "ocr",
      "optical character recognition",
      "optical character recognition pdf",
      "optical character reader",
      "ocr full form",
      "make pdf text readable",
      "make pdf readable",
      "make pdf text searchable",
      "make pdf searchable",
      "searchable pdf",
      "searchable pdf converter",
      "recognize text in scanned pdf",
      "scanned pdf to text",
      "scanned document to text",
      "extract text from scanned pdf",
      "extract text from image pdf",
      "extract scanned text",
      "read text from pdf",
      "read text from scanned pdf",
      "copy text from scanned pdf",
      "convert scanned pdf to searchable pdf",
      "image to searchable pdf tesseract",
      "turn scanned pdf into text",
      "select text in scanned pdf",
      "unsearchable pdf to searchable",
      "ocr online free"
    ],
  },
  {
    name: 'PDF Overlay & Letterhead',
    description: 'Stamp stationery, company letterhead, or watermark templates onto another PDF.',
    slug: 'overlay-pdf',
    icon: '📄',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-violet-600 to-purple-700',
    keywords: ["overlay pdf","add letterhead to pdf","superimpose pdf pages","pdf background overlay online","watermark stamp overlay onto pdf"],
  },
  {
    name: 'Compare PDFs',
    description: 'Side-by-side visual and text diff comparison between two PDF document revisions.',
    slug: 'compare-pdf',
    icon: '⚖️',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-orange-500 to-amber-600',
    keywords: ["compare pdf","compare two pdf files side by side","pdf diff visual checker online free","find differences in pdf documents","spot revisions in contract pdf"],
  },
  {
    name: 'Web Optimize PDF',
    description: 'Linearize, compress streams, and remove bloated metadata for fast web viewing.',
    slug: 'optimize-pdf-web',
    icon: '⚡',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-teal-500 to-emerald-600',
    keywords: ["web optimize pdf","linearize pdf for fast web view","fast streaming pdf optimizer online","fast web view pdf compressor","optimize pdf for browser preview"],
  },
  {
    name: 'Create PDF from Scratch',
    description: 'Design custom PDF documents with rich headings, paragraphs, tables, images, and signatures.',
    slug: 'create-pdf',
    icon: '🪄',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-rose-600 to-red-600',
    keywords: ["create pdf from scratch","make blank pdf document","generate new pdf online free","blank a4 canvas to pdf","design pdf document online"],
  },
  {
    name: 'Repair PDF',
    description: 'Repair corrupted or damaged PDF documents by fixing xref tables, stream headers, and object catalogs.',
    slug: 'repair-pdf',
    icon: '🩹',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-amber-500 to-orange-600',
    keywords: ["repair pdf","fix corrupted pdf","restore damaged pdf document online free","repair unreadable broken pdf","rebuild pdf xref table"],
  },
  {
    name: 'Rasterize PDF',
    description: 'Convert PDF pages into high-resolution flattened images to permanently lock content and eliminate selectable vector layers.',
    slug: 'rasterize-pdf',
    icon: '🧱',
    category: "Optimize PDF",
    categorySlug: "optimize-pdf",
    color: 'from-slate-600 to-zinc-700',
    keywords: ["rasterize pdf","flatten pdf into images","convert vector pdf to bitmap","rasterize pdf pages online","convert pdf text to flat pictures"],
  },
  {
    name: 'PDF to PDF/A',
    description: 'Convert standard PDF documents into ISO-compliant PDF/A format for long-term archiving and legal preservation.',
    slug: 'pdf-to-pdfa',
    icon: '🏛️',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-blue-600 to-indigo-700',
    keywords: ["pdf to pdf/a","convert pdf to archival pdf/a format","pdfa compliance converter online free","long term archiving pdf a1 a2 converter","iso compliant pdfa"],
  },
  {
    name: 'Halve PDF Pages',
    description: 'Split two-page book spreads and side-by-side scans into individual single pages vertically or horizontally.',
    slug: 'halve-pdf-pages',
    icon: '📖',
    category: "Organize PDF",
    categorySlug: "organize-pdf",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["halve pdf pages","split 2-up book scans into single pages","divide pdf pages in half online","split double page spread pdf","slice scanned book pages vertically"],
  },
  {
    name: 'Change PDF Page Size',
    description: 'Resize and rescale PDF pages to standard paper formats like A4, US Letter, A3, Legal, or custom dimensions.',
    slug: 'change-pdf-page-size',
    icon: '📐',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-indigo-500 to-purple-600',
    keywords: ["change pdf page size","resize pdf to a4 letter legal","scale pdf page dimensions online","convert us letter to a4 pdf","fit pdf page to print paper size"],
  },
  {
    name: 'Fill Out PDF Form',
    description: 'Interactively fill in text fields, checkboxes, and radio buttons on official PDF forms and export filled PDFs.',
    slug: 'fill-pdf-form',
    icon: '📝',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-teal-600 to-emerald-700',
    keywords: ["fill pdf form","fill out pdf form online","interactive pdf form filler free","type in pdf form fields","sign and submit fillable pdf form"],
  },
  {
    name: 'Create Fillable PDF',
    description: 'Design and add interactive form fields (text boxes, checkboxes, dropdowns) to any static PDF document.',
    slug: 'create-fillable-pdf',
    icon: '📋',
    category: "PDF Security",
    categorySlug: "pdf-security",
    color: 'from-sky-600 to-blue-700',
    keywords: ["create fillable pdf","add form fields to pdf","make interactive text boxes checkboxes in pdf","build fillable application form pdf","pdf form creator free"],
  },
  {
    name: 'Bookmark PDF',
    description: 'Create, edit, and organize hierarchical bookmarks and table of contents outlines for PDF navigation.',
    slug: 'bookmark-pdf',
    icon: '🔖',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-rose-500 to-pink-600',
    keywords: ["bookmark pdf","add bookmarks to pdf","create pdf table of contents outline free","interactive pdf outline maker","add chapter bookmarks to pdf"],
  },
  {
    name: 'PDF Reader & Viewer',
    description: 'Read and view PDF documents online with smooth page navigation, zooming, thumbnails, search, and presentation mode.',
    slug: 'pdf-reader',
    icon: '👓',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-blue-500 to-cyan-600',
    keywords: ["pdf reader online","view pdf in browser","free online pdf viewer with zoom and search","open pdf without acrobat","read ebook pdf online"],
  },
  {
    name: 'PDF Viewer Preferences',
    description: 'Configure default opening preferences: zoom level, single/two-page spread, fullscreen, and menu bar visibility.',
    slug: 'set-pdf-viewer-preferences',
    icon: '⚙️',
    category: "Edit PDF",
    categorySlug: "edit-pdf",
    color: 'from-violet-500 to-indigo-600',
    keywords: ["set pdf viewer preferences","pdf initial view settings","open pdf in two page spread default","hide pdf viewer toolbar menu","customize acrobat display mode"],
  },
  {
    name: 'PDF to Markdown',
    description: 'Convert PDF documents into structured Markdown (.md) with headings, bullet points, tables, and formatted text.',
    slug: 'pdf-to-markdown',
    icon: '⬇️',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-orange-600 to-red-600',
    keywords: ["pdf to markdown","convert pdf to md","extract pdf text to markdown syntax online free","turn pdf document into github markdown","pdf tables to markdown"],
  },
  {
    name: 'Markdown to PDF',
    description: 'Render formatted Markdown with headers, code blocks, tables, and typography into clean, publication-ready PDFs.',
    slug: 'markdown-to-pdf',
    icon: '⬆️',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-fuchsia-600 to-pink-700',
    keywords: ["markdown to pdf","convert md to pdf","render github markdown as pdf document free","markdown resume to pdf","stylish markdown pdf generator"],
  },
  {
    name: 'PDF to HTML',
    description: 'Convert PDF pages into modern, responsive HTML web pages with clean typography and layout preservation.',
    slug: 'pdf-to-html',
    icon: '🌐',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-amber-500 to-yellow-600',
    keywords: ["pdf to html","convert pdf to webpage","extract pdf to responsive html online free","turn pdf catalog into web page","pdf document to clean html"],
  },
  {
    name: 'PDF to PNG',
    description: 'Convert PDF pages into transparent or white background high-res PNG images with 1-click batch ZIP export.',
    slug: 'pdf-to-png',
    icon: '🖼️',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-emerald-500 to-cyan-600',
    keywords: ["pdf to png","convert pdf to high resolution png","extract png images from pdf online free","save pdf page transparent png","pdf to lossless png"],
  },
  {
    name: 'PDF to SVG',
    description: 'Convert PDF pages into scalable vector SVG graphics suitable for responsive web design and crisp scaling.',
    slug: 'pdf-to-svg',
    icon: '📐',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-cyan-500 to-blue-600',
    keywords: ["pdf to svg","convert pdf vector to svg","extract scalable vector graphics from pdf","vectorize pdf to svg","pdf artwork to svg online free"],
  },
  {
    name: 'Electronic Invoice (Factur-X / ZUGFeRD)',
    description: 'Create and parse standardized electronic invoices with embedded XML data compliant with European & global e-invoicing laws.',
    slug: 'electronic-invoice',
    icon: '🧾',
    category: "Office",
    categorySlug: "office",
    color: 'from-green-600 to-emerald-700',
    keywords: ["electronic invoice generator","factur-x generator","zugferd pdf generator","einvoice compliance free","xml embedded pdf invoice","b2b electronic invoice creator"],
  },
  {
    name: 'PDF to Word (.docx)',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) documents with intact headings, paragraphs, and lists.',
    slug: 'pdf-to-word',
    icon: '📝',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-blue-600 to-indigo-700',
    keywords: ["pdf to word","convert pdf to docx","editable word document from pdf","pdf to doc online free no email","ilovepdf pdf to word","smallpdf convert pdf to word","accurate pdf to docx converter"],
  },
  {
    name: 'Word to PDF (.docx to PDF)',
    description: 'Convert Microsoft Word DOCX files into polished, standardized PDF documents with zero formatting drift.',
    slug: 'word-to-pdf',
    icon: '📄',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-indigo-600 to-purple-700',
    keywords: ["word to pdf","convert docx to pdf","doc to pdf converter","ms word to pdf online free","ilovepdf word to pdf","save word file as pdf","office docx to pdf converter free"],
  },
  {
    name: 'PDF to Excel (.xlsx)',
    description: 'Detect and extract tabular data, matrices, and financial schedules from PDF files into downloadable Excel spreadsheets.',
    slug: 'pdf-to-excel',
    icon: '📊',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-emerald-600 to-green-700',
    keywords: ["pdf to excel","convert pdf table to xlsx","pdf to spreadsheet","extract tables from pdf to excel online free","bank statement pdf to xlsx","ilovepdf pdf to excel"],
  },
  {
    name: 'Excel to PDF (.xlsx to PDF)',
    description: 'Convert Excel spreadsheets, CSV data, and financial tables into paginated, publication-ready PDF reports.',
    slug: 'excel-to-pdf',
    icon: '📈',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-teal-600 to-emerald-700',
    keywords: ["excel to pdf","convert xlsx to pdf","spreadsheet to pdf converter online free","save excel workbook as pdf","fit excel sheet to a4 pdf page"],
  },
  {
    name: 'HEIC to JPG / PNG',
    description: 'Convert Apple iPhone & iPad HEIC / HEIF photos into universal JPG and PNG formats directly in the browser.',
    slug: 'heic-to-jpg',
    icon: '📸',
    category: "Media",
    categorySlug: "media",
    color: 'from-rose-500 to-orange-600',
    keywords: ["heic to jpg","convert iphone heic to jpeg","heic to png converter online free","apple photo to jpg","batch heic converter","open heic image on windows pc"],
  },
  {
    name: 'PDF to PowerPoint (.pptx)',
    description: 'Convert PDF presentation slides into customizable PowerPoint presentation decks with 1-click export.',
    slug: 'pdf-to-powerpoint',
    icon: '📽️',
    category: "Convert from PDF",
    categorySlug: "convert-from-pdf",
    color: 'from-orange-600 to-red-600',
    keywords: ["pdf to powerpoint","convert pdf to pptx","pdf slides to powerpoint presentation online free","turn pdf into editable ppt slides","ilovepdf pdf to ppt"],
  },
  {
    name: 'All-in-One Universal Office Converter',
    description: 'Convert any Word (.docx), Excel (.xlsx), PowerPoint (.pptx), PDF, CSV, or TXT file into your desired format.',
    slug: 'universal-office-converter',
    icon: '🔄',
    category: "Office",
    categorySlug: "office",
    color: 'from-indigo-600 via-purple-600 to-pink-600',
    keywords: ["office converter","convert word excel powerpoint","all in one document converter online free","convert docx xlsx pptx to pdf","cloudconvert free alternative private"],
  },
  {
    name: 'Word to HTML (.docx to HTML)',
    description: 'Convert Microsoft Word (.docx) documents into clean, semantic HTML code with preserved headings, lists, and tables.',
    slug: 'word-to-html',
    icon: '🌐',
    category: "Office",
    categorySlug: "office",
    color: 'from-blue-600 to-cyan-600',
    keywords: ["word to html","convert docx to html code","clean word formatting to web page free","ms word document to clean html tags","word to clean web format"],
  },
  {
    name: 'Word to TXT (.docx to Plain Text)',
    description: 'Extract raw plain text from Microsoft Word (.docx and .doc) files with live character and word counters.',
    slug: 'word-to-txt',
    icon: '📝',
    category: "Office",
    categorySlug: "office",
    color: 'from-sky-600 to-blue-700',
    keywords: ["word to txt","convert docx to plain text","extract text from word document free","strip formatting from docx file","batch word to text converter"],
  },
  {
    name: 'Word to Markdown (.docx to .md)',
    description: 'Convert Microsoft Word (.docx) files into clean GitHub-flavored Markdown with headers, bold, italics, and code.',
    slug: 'word-to-markdown',
    icon: '📑',
    category: "Office",
    categorySlug: "office",
    color: 'from-slate-700 to-indigo-800',
    keywords: ["word to markdown","convert docx to md","word document to github markdown converter free","turn word headings tables to markdown","pandoc docx to md online"],
  },
  {
    name: 'Online Word Document Editor',
    description: 'Full-featured in-browser Word document editor. Open, edit, format typography, and export to DOCX, HTML, or PDF.',
    slug: 'word-editor',
    icon: '📄',
    category: "Office",
    categorySlug: "office",
    color: 'from-blue-700 to-indigo-800',
    keywords: ["online word editor","edit docx in browser","free word processor without microsoft office","google docs alternative online","rich text document editor"],
  },
  {
    name: 'Excel to CSV (.xlsx to .csv)',
    description: 'Convert Microsoft Excel (.xlsx, .xls) workbooks and sheets into clean CSV or TSV files with custom delimiters.',
    slug: 'excel-to-csv',
    icon: '📊',
    category: "Office",
    categorySlug: "office",
    color: 'from-emerald-600 to-teal-700',
    keywords: ["excel to csv","convert xlsx to csv","spreadsheet to comma separated values online free","export excel workbook to csv utf8","batch xlsx to csv converter"],
  },
  {
    name: 'Excel to JSON (.xlsx to .json)',
    description: 'Transform Excel spreadsheets into structured JSON arrays of objects with syntax coloring and schema validation.',
    slug: 'excel-to-json',
    icon: '📦',
    category: "Office",
    categorySlug: "office",
    color: 'from-green-600 to-emerald-700',
    keywords: ["excel to json","convert xlsx to json array","spreadsheet data to json online free","export excel table to json objects","excel to json format converter"],
  },
  {
    name: 'Excel to HTML (.xlsx to HTML Table)',
    description: 'Convert Excel (.xlsx) and CSV spreadsheets into responsive, styled HTML table markup ready for web embedding.',
    slug: 'excel-to-html',
    icon: '🏷️',
    category: "Office",
    categorySlug: "office",
    color: 'from-teal-600 to-cyan-700',
    keywords: ["excel to html table","convert xlsx to html table code","embed excel sheet in website free","responsive html table from spreadsheet","excel table export to html"],
  },
  {
    name: 'PowerPoint to PDF (.pptx to PDF)',
    description: 'Convert Microsoft PowerPoint (.pptx) presentation decks into clean, standardized, printable PDF documents.',
    slug: 'powerpoint-to-pdf',
    icon: '🎯',
    category: "Convert to PDF",
    categorySlug: "convert-to-pdf",
    color: 'from-orange-600 to-amber-700',
    keywords: ["powerpoint to pdf","convert pptx to pdf","presentation slides to pdf online free","save powerpoint presentation as pdf document","export ppt slides to high quality pdf"],
  },
  {
    name: 'PowerPoint to Images (.pptx to JPG/PNG)',
    description: 'Convert PowerPoint (.pptx) slides into high-resolution JPG or PNG images with individual and 1-click ZIP downloads.',
    slug: 'powerpoint-to-images',
    icon: '🖼️',
    category: "Office",
    categorySlug: "office",
    color: 'from-amber-500 to-rose-600',
    keywords: ["powerpoint to images","convert pptx to jpg png","export presentation slides as photos free","save powerpoint slides as pictures","batch pptx to png extractor"],
  },
  {
    name: 'PowerPoint Viewer & Slideshow',
    description: 'Open and present PowerPoint (.pptx) presentation slides directly in your browser with full-screen slideshow mode.',
    slug: 'powerpoint-viewer',
    icon: '📽️',
    category: "Office",
    categorySlug: "office",
    color: 'from-red-600 to-orange-600',
    keywords: ["powerpoint viewer online","view pptx without powerpoint","presentation slideshow player in browser","free online pptx slide viewer","play powerpoint slides online"],
  },
  {
    name: 'PowerPoint to HTML (.pptx to Web Deck)',
    description: 'Convert PowerPoint (.pptx) presentations into responsive HTML5 web slide decks with keyboard navigation.',
    slug: 'powerpoint-to-html',
    icon: '💻',
    category: "Office",
    categorySlug: "office",
    color: 'from-purple-600 to-pink-600',
    keywords: ["powerpoint to html","convert pptx to web slides deck","interactive html slideshow maker free","reveal js html presentation from pptx","export powerpoint to web deck"],
  },
];

