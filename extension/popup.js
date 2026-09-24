const TOOLS = [
  // PDF Top
  { name: 'Merge PDF', desc: 'Combine multiple PDF files into one ordered document', icon: '📑', cat: 'pdf', url: 'https://toolsverseapp.com/tools/organize-pdf/merge-pdf/' },
  { name: 'Compress PDF', desc: 'Reduce PDF file size while preserving document clarity', icon: '🗜️', cat: 'pdf', url: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf/' },
  { name: 'Compress PDF to 100KB', desc: 'Target exact size under 100KB for government & visa portals', icon: '🎯', cat: 'pdf', url: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf-to-100kb/' },
  { name: 'Compress PDF to 200KB', desc: 'Shrink PDF files below 200KB for job portal compliance', icon: '📉', cat: 'pdf', url: 'https://toolsverseapp.com/tools/optimize-pdf/compress-pdf-to-200kb/' },
  { name: 'Split PDF', desc: 'Extract pages or split every page into separate files', icon: '✂️', cat: 'pdf', url: 'https://toolsverseapp.com/tools/organize-pdf/split-pdf/' },
  { name: 'PDF to Word', desc: 'Convert PDF documents into editable Word files', icon: '📄', cat: 'pdf', url: 'https://toolsverseapp.com/tools/convert-from-pdf/pdf-to-word/' },
  { name: 'Word to PDF', desc: 'Convert DOCX files into standard PDF documents', icon: '📝', cat: 'pdf', url: 'https://toolsverseapp.com/tools/convert-to-pdf/word-to-pdf/' },
  { name: 'Sign PDF', desc: 'Draw, type, or upload digital signatures securely', icon: '✍️', cat: 'pdf', url: 'https://toolsverseapp.com/tools/pdf-security/sign-pdf/' },
  { name: 'Redact PDF', desc: 'Permanently blackout confidential text and numbers', icon: '⬛', cat: 'pdf', url: 'https://toolsverseapp.com/tools/pdf-security/redact-pdf/' },
  { name: 'Protect PDF', desc: 'Encrypt documents with bank-grade password protection', icon: '🔒', cat: 'pdf', url: 'https://toolsverseapp.com/tools/pdf-security/protect-pdf/' },
  { name: 'Unlock PDF', desc: 'Remove passwords and permissions from your PDFs', icon: '🔓', cat: 'pdf', url: 'https://toolsverseapp.com/tools/pdf-security/unlock-pdf/' },
  { name: 'PDF OCR', desc: 'Extract searchable, editable text from scanned PDFs', icon: '🔍', cat: 'pdf', url: 'https://toolsverseapp.com/tools/optimize-pdf/pdf-ocr/' },

  // Developer Top
  { name: 'Unix Timestamp Converter', desc: 'Convert epoch seconds/ms to human dates and vice-versa', icon: '⏱️', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/timestamp-converter/' },
  { name: 'JSON Formatter & Validator', desc: 'Prettify, minify, and validate JSON payloads instantly', icon: '📜', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/json-formatter/' },
  { name: 'JWT Decoder', desc: 'Inspect header, payload, and signatures client-side', icon: '🔑', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/jwt-decoder/' },
  { name: 'Cron Expression Generator', desc: 'Build and explain cron schedule expressions visually', icon: '⏲️', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/cron-generator/' },
  { name: 'UUID / GUID Generator', desc: 'Generate bulk v4 UUIDs for databases and APIs', icon: '🆔', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/uuid-generator/' },
  { name: 'SQL Formatter', desc: 'Beautify messy SQL queries across standard dialects', icon: '💾', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/sql-formatter/' },
  { name: 'Base64 Encoder/Decoder', desc: 'Encode and decode UTF-8 text and raw binary strings', icon: '🔐', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/base64-encoder-decoder/' },
  { name: 'Text Diff Checker', desc: 'Compare side-by-side text differences and code deltas', icon: '⚖️', cat: 'dev', url: 'https://toolsverseapp.com/tools/developer/text-diff-checker/' },

  // Calculators Top
  { name: 'Loan EMI Calculator', desc: 'Calculate monthly EMIs, total interest, and amortization', icon: '💰', cat: 'calc', url: 'https://toolsverseapp.com/tools/calculators/loan-calculator/' },
  { name: 'BMI & Calorie Calculator', desc: 'Compute body mass index and daily caloric needs', icon: '⚖️', cat: 'calc', url: 'https://toolsverseapp.com/tools/calculators/bmi-calculator/' },
  { name: 'Age Calculator', desc: 'Calculate precise age in years, months, days, and hours', icon: '🎂', cat: 'calc', url: 'https://toolsverseapp.com/tools/calculators/age-calculator/' },
  { name: 'Percentage Calculator', desc: 'Calculate percentage discounts, increases, and deltas', icon: '➗', cat: 'calc', url: 'https://toolsverseapp.com/tools/calculators/percentage-calculator/' },
  { name: 'GPA Calculator', desc: 'Calculate collegiate semester GPAs and grade averages', icon: '🎓', cat: 'calc', url: 'https://toolsverseapp.com/tools/calculators/gpa-calculator/' },

  // Media Top
  { name: 'Image Compressor', desc: 'Compress JPG, PNG, and WebP images up to 80%', icon: '🗜️', cat: 'media', url: 'https://toolsverseapp.com/tools/media/image-compressor/' },
  { name: 'QR Code Generator', desc: 'Create custom QR codes with colors, logos, and links', icon: '📱', cat: 'media', url: 'https://toolsverseapp.com/tools/design/qr-code-generator/' },
  { name: 'HEIC to JPG Converter', desc: 'Convert Apple iPhone HEIC/HEIF photos to standard JPG', icon: '🍏', cat: 'media', url: 'https://toolsverseapp.com/tools/media/heic-to-jpg/' },
  { name: 'Image Resizer', desc: 'Scale image dimensions by pixels or exact percentages', icon: '📐', cat: 'media', url: 'https://toolsverseapp.com/tools/media/image-resizer/' },

  // Office Top
  { name: 'Invoice Generator', desc: 'Generate professional PDF tax invoices in your browser', icon: '🧾', cat: 'office', url: 'https://toolsverseapp.com/tools/office/create-invoice/' },
  { name: 'Excel to PDF', desc: 'Convert XLSX spreadsheets into clean formatted PDF sheets', icon: '📊', cat: 'office', url: 'https://toolsverseapp.com/tools/convert-to-pdf/excel-to-pdf/' },
  { name: 'Resume Builder', desc: 'Design professional ATS-friendly resumes and export PDF', icon: '👔', cat: 'office', url: 'https://toolsverseapp.com/tools/design/resume-builder/' }
];

const toolsList = document.getElementById('toolsList');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const filterPills = document.querySelectorAll('.pill');
const sectionTitle = document.getElementById('sectionTitle');

let currentFilter = 'all';

function renderTools(filterText = '') {
  toolsList.innerHTML = '';
  const query = filterText.toLowerCase().trim();

  const filtered = TOOLS.filter(t => {
    const matchesCategory = currentFilter === 'all' || t.cat === currentFilter;
    const matchesQuery = !query || t.name.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    filtered.forEach(t => {
      const a = document.createElement('a');
      a.className = 'tool-item';
      a.href = t.url;
      a.target = '_blank';
      a.innerHTML = `
        <div class="tool-icon">${t.icon}</div>
        <div class="tool-info">
          <div class="tool-name">${t.name}</div>
          <div class="tool-desc">${t.desc}</div>
        </div>
        <div class="tool-arrow">→</div>
      `;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(t.url, '_blank');
      });
      toolsList.appendChild(a);
    });
  }
}

// Search event
searchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  sectionTitle.textContent = val.trim() ? `Search Results (${val})` : 'Popular Utilities';
  renderTools(val);
});

// Category filter
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.filter;
    renderTools(searchInput.value);
  });
});

// Initial render
renderTools();
