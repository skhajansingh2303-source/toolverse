import fs from 'node:fs';
import path from 'node:path';

const keywordsMap = {
  'sign-pdf': ['sign pdf', 'e-sign pdf', 'digital signature', 'fill and sign pdf', 'draw signature on pdf', 'electronic signature online', 'sign contract pdf free', 'docusign free alternative', 'ilovepdf sign', 'sign pdf without uploading'],
  'merge-pdf': ['merge pdf', 'combine pdf', 'join pdf files', 'combine multiple pdf into one', 'merge pdf free no limit', 'pdf binder', 'ilovepdf merge alternative', 'pdf combiner online', 'unir pdf', 'merge pdf without upload'],
  'split-pdf': ['split pdf', 'separate pdf pages', 'extract pages from pdf', 'cut pdf pages', 'split pdf online free', 'divide pdf', 'ilovepdf split alternative', 'split pdf by page range', 'extract single page from pdf'],
  'compress-pdf': ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor online free', 'compress pdf without losing quality', 'make pdf smaller', 'downsample pdf', 'ilovepdf compress alternative', 'smallpdf compress alternative'],
  'compress-pdf-to-100kb': ['compress pdf to 100kb', 'shrink pdf under 100kb', 'reduce pdf size below 100 kb online', 'compress pdf 100 kb for job application', 'upsc ssc portal pdf 100kb', 'free pdf 100kb compressor', 'pdf size reducer to 100kb'],
  'compress-pdf-to-200kb': ['compress pdf to 200kb', 'reduce pdf size to 200 kb', 'compress pdf below 200kb online', 'shrink pdf to 200kb free', 'govt exam portal 200kb pdf compressor', 'pdf compressor 200 kb online'],
  'compress-pdf-to-500kb': ['compress pdf to 500kb', 'reduce pdf to 500 kb', 'shrink pdf under 500kb', 'compress pdf file size under 500kb online free', 'print ready pdf compression 500kb'],
  'image-to-pdf': ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'combine images into pdf', 'jpeg to pdf converter online free', 'picture to pdf free no watermark'],
  'pdf-to-jpg': ['pdf to jpg', 'convert pdf to image', 'save pdf pages as jpg', 'extract jpg from pdf', 'pdf to picture high quality free', 'ilovepdf pdf to jpg', 'pdf to jpeg online'],
  'pdf-to-text': ['pdf to text', 'extract text from pdf', 'pdf to txt', 'convert pdf text online free', 'copy text from scanned pdf', 'pdf text stripper', 'export pdf to text'],
  'text-to-pdf': ['text to pdf', 'convert txt to pdf', 'notepad to pdf', 'notes to pdf converter online free', 'essay to pdf', 'plain text to pdf document'],
  'redact-pdf': ['redact pdf', 'blackout text in pdf', 'hide sensitive info in pdf', 'censor pdf online free', 'permanently remove text from pdf', 'mask ssn in pdf', 'sanitize confidential pdf'],
  'crop-pdf': ['crop pdf', 'trim pdf margins', 'cut pdf white borders', 'crop pdf pages online free', 'crop pdf canvas size', 'remove margin from pdf'],
  'scan-to-pdf': ['scan to pdf', 'camera to pdf', 'scan document with phone', 'photo scanner to pdf online', 'convert camera capture to pdf', 'free document scanner'],
  'rotate-pdf': ['rotate pdf', 'turn pdf pages', 'rotate upside down pdf', 'save rotated pdf permanently', 'rotate pdf online free', 'change pdf orientation portrait landscape'],
  'watermark-pdf': ['watermark pdf', 'add watermark to pdf', 'stamp confidential on pdf', 'add logo to pdf', 'pdf watermark maker free', 'custom text watermark pdf'],
  'remove-pdf-pages': ['remove pdf pages', 'delete pages from pdf', 'remove blank pages from pdf', 'delete specific page pdf free', 'drop pdf pages online'],
  'number-pdf': ['number pdf', 'add page numbers to pdf', 'bates numbering pdf', 'footer page numbers pdf online free', 'header and footer pagination pdf'],
  'pdf-metadata': ['pdf metadata editor', 'edit pdf author title', 'change pdf properties', 'remove metadata from pdf', 'clean pdf exif metadata', 'pdf tags editor'],
  'gpa-calculator': ['gpa calculator', 'college gpa calculator', 'calculate weighted gpa', 'cgpa to percentage calculator', 'semester grade calculator', 'cumulative gpa calculator 4.0 scale'],
  'resume-builder': ['resume builder', 'free cv maker', 'online resume generator', 'ats friendly resume template', 'software engineer resume maker', 'download resume pdf free', 'modern cv templates'],
  'handwriting-studio-generator': ['handwriting generator', 'text to handwriting', 'assignment writing generator', 'convert typed notes to handwriting', 'handwritten notes maker', 'homework handwriting font generator'],
  'image-compressor': ['image compressor', 'compress jpg', 'compress png', 'shrink image size online', 'reduce photo size in kb', 'tinypng alternative free', 'lossless photo compression', 'compress webp'],
  'image-resizer': ['image resizer', 'resize photo dimensions', 'change image width height', 'crop and resize image', 'social media image resizer free', 'scale photo pixels'],
  'image-converter': ['image converter', 'convert image format', 'png to jpg', 'webp to png', 'jpg to webp', 'free batch image converter', 'heic png jpg converter'],
  'image-color-picker': ['color picker from image', 'eyedropper tool online', 'extract hex colors from image', 'find rgb code from image', 'palette extractor', 'image hex finder'],
  'svg-viewer-optimizer': ['svg viewer', 'svg optimizer', 'svgo online', 'minify svg', 'view svg online', 'clean svg code', 'reduce svg file size'],
  'favicon-generator': ['favicon generator', 'create ico file', 'convert png to favicon.ico', 'website favicon maker', 'generate apple touch icon', 'multi-size favicon generator'],
  'json-formatter': ['json formatter', 'json beautifier', 'validate json', 'json parser online', 'pretty print json', 'format json string', 'json validator and fixer'],
  'jwt-decoder': ['jwt decoder', 'decode json web token', 'jwt debugger online', 'inspect jwt payload', 'jwt io alternative', 'view jwt claims without secret'],
  'uuid-generator': ['uuid generator', 'guid generator', 'generate v4 uuid', 'bulk uuid generator online free', 'random uuid maker', 'rfc4122 v4 uuid'],
  'code-beautifier-minifier': ['code beautifier', 'code minifier', 'format javascript css html', 'minify js css online', 'prettify source code', 'html css js compress'],
  'sql-formatter': ['sql formatter', 'format sql query', 'beautify sql queries online', 'indent sql statements free', 'sql pretty printer', 'mysql postgresql query format'],
  'cron-generator': ['cron expression generator', 'crontab generator', 'cron schedule maker', 'explain cron syntax online', 'cron timer helper', 'cron guru alternative'],
  'regex-tester': ['regex tester', 'test regular expression', 'regex playground online', 'regular expression evaluator', 'regex match debugger', 'regex101 alternative free'],
  'base64-encoder-decoder': ['base64 encode', 'base64 decode', 'convert string to base64', 'base64 to image decoder online free', 'utf8 base64 converter', 'binary to base64'],
  'url-encoder-decoder': ['url encode', 'url decode', 'percent encoding decoder', 'urldecode online free', 'query string encoder', 'escape url characters'],
  'timestamp-converter': ['timestamp converter', 'epoch to date', 'unix timestamp to readable date converter', 'current epoch time online', 'millis to date converter', 'utc timestamp parser'],
  'password-generator': ['password generator', 'strong password maker', 'secure random password generator', 'generate strong random password online', 'passphrase generator', 'cybersecurity password creator'],
  'hash-generator': ['hash generator', 'md5 hash generator', 'sha256 generator online', 'calculate sha512 checksum', 'sha1 hash generator free', 'keccak sha3 hash online'],
  'color-palette-generator': ['color palette generator', 'color scheme generator', 'coolors alternative', 'hex color palettes for web design', 'complementary color palette maker', 'ui colors generator'],
  'css-box-shadow-generator': ['box shadow generator', 'css glassmorphism generator', 'soft shadow generator css', 'neumorphism box shadow maker', 'tailwind box shadow generator'],
  'aspect-ratio-calculator': ['aspect ratio calculator', 'calculate 16:9 4:3 dimensions', 'image aspect ratio calculator online free', 'screen resolution aspect ratio', 'resize ratio calculator'],
  'qr-code-generator': ['qr code generator', 'create qr code free', 'wifi qr code generator', 'qr code with logo free no expiry', 'custom url qr code', 'high resolution qr code download'],
  'word-counter': ['word counter', 'character count online', 'sentence counter', 'reading time calculator', 'words and letters counter free', 'essay word length checker'],
  'case-converter': ['case converter', 'convert to uppercase', 'lowercase to title case', 'camelcase kebab-case converter', 'capital letter converter online', 'snake case pascal case generator'],
  'text-diff-checker': ['text diff checker', 'compare two texts online', 'find difference between texts', 'diff viewer online free', 'side by side text comparison', 'code diff checker'],
  'markdown-preview': ['markdown preview', 'markdown editor live preview', 'convert markdown to html online free', 'github flavored markdown editor', 'render markdown table math'],
  'lorem-ipsum-generator': ['lorem ipsum generator', 'dummy text generator', 'filler text paragraphs words online free', 'placeholder text maker', 'latin dummy paragraph generator'],
  'csv-json-converter': ['csv to json', 'json to csv', 'convert spreadsheet csv to json online', 'export json as csv free', 'convert excel csv data to json array'],
  'list-cleaner': ['list cleaner', 'remove duplicates from list', 'sort list alphabetically', 'deduplicate list online free', 'clean line breaks and spaces', 'item list filter'],
  'unit-converter': ['unit converter', 'convert length weight speed temperature', 'metric to imperial conversion online', 'currency kg to lbs celsius to fahrenheit', 'universal measurement converter'],
  'percentage-calculator': ['percentage calculator', 'calculate percent increase decrease', 'what percent of X is Y calculator', 'percent difference calculator', 'discount percentage calculation'],
  'loan-calculator': ['loan emi calculator', 'mortgage payment calculator', 'home loan interest calculator', 'car loan amortization schedule', 'personal loan monthly repayment calculation'],
  'age-calculator': ['age calculator', 'calculate exact age from date of birth', 'chronological age calculator', 'how old am i in days hours', 'dob age difference calculator'],
  'bmi-calculator': ['bmi calculator', 'body mass index calculator', 'ideal weight calculator metric imperial', 'calculate bmi adult free', 'healthy weight range bmi chart'],
  'calorie-bmr-calculator': ['calorie calculator', 'bmr calculator', 'daily calorie maintenance calculator', 'tdee calculator free', 'basal metabolic rate weight loss calculator'],
  'sip-calculator': ['sip calculator', 'systematic investment plan return calculator', 'mutual fund sip calculator', 'calculate wealth compound interest', 'sip maturity amount formula'],
  'compound-interest-calculator': ['compound interest calculator', 'calculate interest compounding daily monthly annually', 'future value investment calculator', 'apy interest calculation online'],
  'gst-calculator': ['gst calculator', 'calculate goods and services tax', 'add remove gst percentage', 'gst invoice tax calculator', 'reverse gst calculation formula'],
  'salary-calculator': ['salary calculator', 'take home pay calculator', 'in hand salary calculator after tax deductions', 'gross to net salary calculation', 'annual ctc breakdown monthly pay'],
  'fd-calculator': ['fd calculator', 'fixed deposit maturity calculator', 'recurring deposit rd return calculator', 'bank fd interest rate payout calculator', 'compounding fd formula'],
  'create-invoice': ['invoice generator', 'free invoice maker', 'create receipt online', 'download invoice pdf free no watermark', 'billing invoice template', 'freelancer client invoice pdf'],
  'flatten-pdf': ['flatten pdf', 'flatten pdf form fields', 'lock pdf annotations', 'make fillable pdf read only free online', 'flatten layers in pdf document'],
  'nup-pdf': ['pages per sheet pdf', 'n-up pdf', 'multiple pages per sheet print', 'print 2 pages per sheet pdf online', 'booklet print 4 up pdf'],
  'rearrange-pdf-pages': ['rearrange pdf pages', 'reorder pdf pages', 'drag and drop pdf page order online free', 'sort pages in pdf document', 'change pdf sequence'],
  'extract-pdf-images': ['extract images from pdf', 'rip pictures from pdf', 'save all images in pdf document free online', 'pdf image grabber', 'export photos from pdf'],
  'edit-pdf': ['edit pdf', 'online pdf editor', 'add text to pdf free', 'modify pdf documents in browser without upload', 'free pdf annotations highlighter text', 'write on pdf online'],
  'pdf-converter': ['universal pdf converter', 'convert any file to pdf', 'convert pdf to anything', 'all in one pdf tool online', 'office image text to pdf', 'batch pdf converter'],
  'protect-pdf': ['protect pdf', 'password protect pdf', 'encrypt pdf file', 'add password to pdf online free', 'aes 128 256 encryption pdf', 'lock confidential pdf'],
  'unlock-pdf': ['unlock pdf', 'remove pdf password', 'decrypt pdf file', 'unlock protected pdf online free', 'remove owner permissions from pdf', 'strip password from pdf'],
  'extract-pdf-pages': ['extract pdf pages', 'save specific pages as new pdf', 'pull pages out of pdf free online', 'select and save pages from pdf', 'pdf page extractor'],
  'webpage-to-pdf': ['webpage to pdf', 'convert html to pdf', 'save website as pdf', 'url to pdf converter online free', 'article webpage to pdf downloader', 'snapshot full webpage pdf'],
  'pdf-ocr': ['pdf ocr', 'recognize text in scanned pdf', 'ocr online free', 'searchable pdf converter', 'extract scanned text', 'image to searchable pdf tesseract'],
  'overlay-pdf': ['overlay pdf', 'add letterhead to pdf', 'superimpose pdf pages', 'pdf background overlay online', 'watermark stamp overlay onto pdf'],
  'compare-pdf': ['compare pdf', 'compare two pdf files side by side', 'pdf diff visual checker online free', 'find differences in pdf documents', 'spot revisions in contract pdf'],
  'optimize-pdf-web': ['web optimize pdf', 'linearize pdf for fast web view', 'fast streaming pdf optimizer online', 'fast web view pdf compressor', 'optimize pdf for browser preview'],
  'create-pdf': ['create pdf from scratch', 'make blank pdf document', 'generate new pdf online free', 'blank a4 canvas to pdf', 'design pdf document online'],
  'repair-pdf': ['repair pdf', 'fix corrupted pdf', 'restore damaged pdf document online free', 'repair unreadable broken pdf', 'rebuild pdf xref table'],
  'rasterize-pdf': ['rasterize pdf', 'flatten pdf into images', 'convert vector pdf to bitmap', 'rasterize pdf pages online', 'convert pdf text to flat pictures'],
  'pdf-to-pdfa': ['pdf to pdf/a', 'convert pdf to archival pdf/a format', 'pdfa compliance converter online free', 'long term archiving pdf a1 a2 converter', 'iso compliant pdfa'],
  'halve-pdf-pages': ['halve pdf pages', 'split 2-up book scans into single pages', 'divide pdf pages in half online', 'split double page spread pdf', 'slice scanned book pages vertically'],
  'change-pdf-page-size': ['change pdf page size', 'resize pdf to a4 letter legal', 'scale pdf page dimensions online', 'convert us letter to a4 pdf', 'fit pdf page to print paper size'],
  'fill-pdf-form': ['fill pdf form', 'fill out pdf form online', 'interactive pdf form filler free', 'type in pdf form fields', 'sign and submit fillable pdf form'],
  'create-fillable-pdf': ['create fillable pdf', 'add form fields to pdf', 'make interactive text boxes checkboxes in pdf', 'build fillable application form pdf', 'pdf form creator free'],
  'bookmark-pdf': ['bookmark pdf', 'add bookmarks to pdf', 'create pdf table of contents outline free', 'interactive pdf outline maker', 'add chapter bookmarks to pdf'],
  'pdf-reader': ['pdf reader online', 'view pdf in browser', 'free online pdf viewer with zoom and search', 'open pdf without acrobat', 'read ebook pdf online'],
  'set-pdf-viewer-preferences': ['set pdf viewer preferences', 'pdf initial view settings', 'open pdf in two page spread default', 'hide pdf viewer toolbar menu', 'customize acrobat display mode'],
  'pdf-to-markdown': ['pdf to markdown', 'convert pdf to md', 'extract pdf text to markdown syntax online free', 'turn pdf document into github markdown', 'pdf tables to markdown'],
  'markdown-to-pdf': ['markdown to pdf', 'convert md to pdf', 'render github markdown as pdf document free', 'markdown resume to pdf', 'stylish markdown pdf generator'],
  'pdf-to-html': ['pdf to html', 'convert pdf to webpage', 'extract pdf to responsive html online free', 'turn pdf catalog into web page', 'pdf document to clean html'],
  'pdf-to-png': ['pdf to png', 'convert pdf to high resolution png', 'extract png images from pdf online free', 'save pdf page transparent png', 'pdf to lossless png'],
  'pdf-to-svg': ['pdf to svg', 'convert pdf vector to svg', 'extract scalable vector graphics from pdf', 'vectorize pdf to svg', 'pdf artwork to svg online free'],
  'electronic-invoice': ['electronic invoice generator', 'factur-x generator', 'zugferd pdf generator', 'einvoice compliance free', 'xml embedded pdf invoice', 'b2b electronic invoice creator'],
  'pdf-to-word': ['pdf to word', 'convert pdf to docx', 'editable word document from pdf', 'pdf to doc online free no email', 'ilovepdf pdf to word', 'smallpdf convert pdf to word', 'accurate pdf to docx converter'],
  'word-to-pdf': ['word to pdf', 'convert docx to pdf', 'doc to pdf converter', 'ms word to pdf online free', 'ilovepdf word to pdf', 'save word file as pdf', 'office docx to pdf converter free'],
  'pdf-to-excel': ['pdf to excel', 'convert pdf table to xlsx', 'pdf to spreadsheet', 'extract tables from pdf to excel online free', 'bank statement pdf to xlsx', 'ilovepdf pdf to excel'],
  'excel-to-pdf': ['excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf converter online free', 'save excel workbook as pdf', 'fit excel sheet to a4 pdf page'],
  'heic-to-jpg': ['heic to jpg', 'convert iphone heic to jpeg', 'heic to png converter online free', 'apple photo to jpg', 'batch heic converter', 'open heic image on windows pc'],
  'pdf-to-powerpoint': ['pdf to powerpoint', 'convert pdf to pptx', 'pdf slides to powerpoint presentation online free', 'turn pdf into editable ppt slides', 'ilovepdf pdf to ppt'],
  'universal-office-converter': ['office converter', 'convert word excel powerpoint', 'all in one document converter online free', 'convert docx xlsx pptx to pdf', 'cloudconvert free alternative private'],
  'word-to-html': ['word to html', 'convert docx to html code', 'clean word formatting to web page free', 'ms word document to clean html tags', 'word to clean web format'],
  'word-to-txt': ['word to txt', 'convert docx to plain text', 'extract text from word document free', 'strip formatting from docx file', 'batch word to text converter'],
  'word-to-markdown': ['word to markdown', 'convert docx to md', 'word document to github markdown converter free', 'turn word headings tables to markdown', 'pandoc docx to md online'],
  'word-editor': ['online word editor', 'edit docx in browser', 'free word processor without microsoft office', 'google docs alternative online', 'rich text document editor'],
  'excel-to-csv': ['excel to csv', 'convert xlsx to csv', 'spreadsheet to comma separated values online free', 'export excel workbook to csv utf8', 'batch xlsx to csv converter'],
  'excel-to-json': ['excel to json', 'convert xlsx to json array', 'spreadsheet data to json online free', 'export excel table to json objects', 'excel to json format converter'],
  'excel-to-html': ['excel to html table', 'convert xlsx to html table code', 'embed excel sheet in website free', 'responsive html table from spreadsheet', 'excel table export to html'],
  'powerpoint-to-pdf': ['powerpoint to pdf', 'convert pptx to pdf', 'presentation slides to pdf online free', 'save powerpoint presentation as pdf document', 'export ppt slides to high quality pdf'],
  'powerpoint-to-images': ['powerpoint to images', 'convert pptx to jpg png', 'export presentation slides as photos free', 'save powerpoint slides as pictures', 'batch pptx to png extractor'],
  'powerpoint-viewer': ['powerpoint viewer online', 'view pptx without powerpoint', 'presentation slideshow player in browser', 'free online pptx slide viewer', 'play powerpoint slides online'],
  'powerpoint-to-html': ['powerpoint to html', 'convert pptx to web slides deck', 'interactive html slideshow maker free', 'reveal js html presentation from pptx', 'export powerpoint to web deck'],
};

const filePath = path.resolve('src/lib/tools.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure Tool interface has keywords?: string[];
if (!content.includes('keywords?: string[];')) {
  content = content.replace(
    /export interface Tool \{([\s\S]*?)color: string;\n\}/,
    'export interface Tool {$1color: string;\n  keywords?: string[];\n}'
  );
}

// 2. Insert keywords array into each tool object
let updatedCount = 0;
for (const [slug, kws] of Object.entries(keywordsMap)) {
  const slugRegex = new RegExp(`(slug:\\s*'${slug}',[\\s\\S]*?color:\\s*'[^']+',)(\\n\\s*keywords:\\s*\\[[^\\]]*\\],)?`, 'g');
  
  if (slugRegex.test(content)) {
    const kwString = JSON.stringify(kws);
    // Replace existing or append after color:
    content = content.replace(slugRegex, `$1\n    keywords: ${kwString},`);
    updatedCount++;
  } else {
    console.warn(`Could not find tool with slug: ${slug}`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully added browser search keywords to ${updatedCount} tools in src/lib/tools.ts!`);
