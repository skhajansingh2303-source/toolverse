export interface StudioOptions {
  fontFamily: string;
  paperStyle: 'plain' | 'ruled' | 'grid' | 'cream';
  draftMode: boolean;
  showHeader: boolean;
  headerMode: 'first_page' | 'every_page';
  logoType: 'pw' | 'custom' | 'none';
  customBrand: string;
  subject: string;
  lecture: string;
  subjectColor: string;
  lectureColor: string;
  bodyColor: string;
  sectionColor: string;
  subheadingColor: string;
  showSidebar: boolean;
  sidebarWidth: number;
  sidebarColor: string;
  sidebarText: string;
  tableHeaderBg: string;
  showFooter: boolean;
  footerBg: string;
  footerLeft: string;
  footerRight: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  realism: 'none' | 'subtle' | 'natural' | 'high';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export const DEFAULT_OPTIONS: StudioOptions = {
  fontFamily: 'Coming Soon',
  paperStyle: 'plain',
  draftMode: false,
  showHeader: true,
  headerMode: 'first_page',
  logoType: 'pw',
  customBrand: 'PW ONLYIAS',
  subject: 'Indian Polity',
  lecture: 'Lecture 01: Historical Background',
  subjectColor: '#dc2626',
  lectureColor: '#2563eb',
  bodyColor: '#111827',
  sectionColor: '#dc2626',
  subheadingColor: '#2563eb',
  showSidebar: true,
  sidebarWidth: 140,
  sidebarColor: '#1d6fa5',
  sidebarText: 'Space for Notes',
  tableHeaderBg: '#28416c',
  showFooter: true,
  footerBg: '#dbe8f6',
  footerLeft: 'ToolsVerse Studio',
  footerRight: 'Unit 1',
  fontSize: 11.5,
  lineHeight: 1.55,
  letterSpacing: 0.0,
  wordSpacing: 1.0,
  realism: 'natural',
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 8,
  marginRight: 8,
};

export const TEMPLATES: Record<string, Partial<StudioOptions>> = {
  pw_historical: {
    fontFamily: 'Coming Soon',
    paperStyle: 'plain',
    logoType: 'pw',
    customBrand: 'PW ONLYIAS',
    subjectColor: '#dc2626',
    lectureColor: '#2563eb',
    sectionColor: '#dc2626',
    subheadingColor: '#2563eb',
    sidebarColor: '#1d6fa5',
    sidebarText: 'Space for Notes',
    tableHeaderBg: '#28416c',
    footerBg: '#dbe8f6',
  },
  royal_academic: {
    fontFamily: 'Caveat',
    paperStyle: 'ruled',
    logoType: 'custom',
    customBrand: 'UNIVERSITY HONORS',
    subjectColor: '#4338ca',
    lectureColor: '#6366f1',
    sectionColor: '#312e81',
    subheadingColor: '#4f46e5',
    sidebarColor: '#4338ca',
    sidebarText: 'Prof. Key Remarks',
    tableHeaderBg: '#312e81',
    footerBg: '#e0e7ff',
  },
  emerald_topper: {
    fontFamily: 'Kalam',
    paperStyle: 'ruled',
    logoType: 'custom',
    customBrand: 'TOPPER NOTES',
    subjectColor: '#047857',
    lectureColor: '#059669',
    sectionColor: '#065f46',
    subheadingColor: '#059669',
    sidebarColor: '#047857',
    sidebarText: 'UPSC Mains Facts',
    tableHeaderBg: '#064e3b',
    footerBg: '#d1fae5',
  },
  cs_tech: {
    fontFamily: 'Patrick Hand',
    paperStyle: 'grid',
    logoType: 'custom',
    customBrand: 'TECH SPEC ARCHITECTURE',
    subjectColor: '#0284c7',
    lectureColor: '#0369a1',
    sectionColor: '#0369a1',
    subheadingColor: '#0284c7',
    sidebarColor: '#0284c7',
    sidebarText: 'Time & Space Specs',
    tableHeaderBg: '#0f172a',
    footerBg: '#e0f2fe',
  },
  vintage_cornell: {
    fontFamily: 'Architects Daughter',
    paperStyle: 'cream',
    logoType: 'none',
    customBrand: 'CORNELL SYSTEM',
    subjectColor: '#9a3412',
    lectureColor: '#c2410c',
    sectionColor: '#9a3412',
    subheadingColor: '#c2410c',
    sidebarColor: '#9a3412',
    sidebarText: 'Cue Column / Questions',
    tableHeaderBg: '#7c2d12',
    footerBg: '#ffedd5',
  },
  minimalist: {
    fontFamily: 'Comic Neue',
    paperStyle: 'plain',
    logoType: 'none',
    showSidebar: false,
    subjectColor: '#111827',
    lectureColor: '#374151',
    sectionColor: '#111827',
    subheadingColor: '#374151',
    sidebarColor: '#9ca3af',
    tableHeaderBg: '#1f2937',
    footerBg: '#f3f4f6',
  },
};

export const SAMPLES = {
  historical: {
    subject: 'Indian Polity',
    lecture: 'Lecture 01: Historical Background',
    content: `# HISTORICAL BACKGROUND OF THE INDIAN CONSTITUTION

Several constitutional features of India have their roots in British rule. Events during British administration shaped the legal and administrative framework of modern India. The British created laws, courts, and administrative structures that later influenced the design of the Indian Constitution.

## Historical Timeline at a Glance

| Year / Event | Significance |
| 1600 | East India Company (EIC) granted charter by Queen Elizabeth I — exclusive trading rights in India |
| 1765 | Diwani rights (revenue & civil justice) of Bengal, Bihar & Orissa granted to EIC by Mughal Emperor Shah Alam after Battle of Buxar |
| 1773 | Regulating Act — First British law to regulate EIC; first step towards central administration |
| 1858 | Government of India Act — British Crown assumed direct control after Revolt of 1857 |
| 1947 (Aug 15) | India's Independence |
| 1950 (Jan 26) | Constitution of India came into effect |

## Two Phases of British Rule

- **Company Rule (1773-1858):** India governed by the East India Company under Parliamentary regulation.
<!-- PAGE_BREAK -->
- **Crown Rule (1858-1947):** India governed directly by the British Crown through the Viceroy and the Secretary of State for India.

# COMPANY RULE (1773-1858)

## Regulating Act of 1773

- First step towards **central administration** in India.
- First British law to formally **regulate** the East India Company's activities.
- Recognised the **political and administrative role** of the Company.
- Laid the **foundation of central administration** in India.

### Key Features
- **Governor-General of Bengal Created:** Governor of Bengal elevated to Governor-General of Bengal, assisted by an Executive Council of 4 members. First Governor-General: **Lord Warren Hastings**.
- **Subordination of Presidencies:** Governors of Bombay and Madras made subordinate to Bengal. Earlier, all three Presidencies were independent.
- **Supreme Court at Calcutta (1774):** Established with 1 Chief Justice + 3 other judges. First Supreme Court in India.
- **Ban on Company Officials:** Prohibited from private trade and from accepting gifts, bribes, or presents from Indians.
- **Strengthening Crown Control:** Court of Directors (Company's governing body) required to report revenue, civil, and military affairs to British Government.

## Amending Act of 1781 (Act of Settlement)

Purpose: To remove defects in the Regulating Act of 1773, especially regarding powers and jurisdiction of the Supreme Court in Calcutta.

### Key Features
- **Exempted Governor-General and Council** from jurisdiction of the Supreme Court for acts done in official capacity.
- **Exempted Company Servants** for actions in official capacity.
- **Excluded Revenue Matters** and revenue collection from Supreme Court jurisdiction.
`,
  },
  cs: {
    subject: 'Data Structures & Algorithms',
    lecture: 'Binary Search Trees (BST) & Traversals',
    content: `# BINARY SEARCH TREE (BST) & TREE TRAVERSALS

A **Binary Search Tree** is a node-based binary tree data structure where each node has at most two children, and the key in each node must be greater than or equal to any key stored in the left sub-tree, and less than or equal to any key stored in the right sub-tree.

## Visual Binary Search Tree (BST)

\`\`\`tree
graph TD
    50((50)) --> 30((30))
    50 --> 70((70))
    30 --> 20((20))
    30 --> 40((40))
    70 --> 60((60))
    70 --> 80((80))
\`\`\`

## Key Properties of BST

- **Left Subtree:** Values are strictly smaller than root (\`Left < Root\`).
- **Right Subtree:** Values are strictly greater than root (\`Right > Root\`).
- **Inorder Traversal:** An Inorder Traversal (\`Left -> Root -> Right\`) always produces elements in **sorted ascending order**.

## Time & Space Complexity Analysis

| Operation | Average Case | Worst Case (Skewed) |
| Search | O(log N) | O(N) |
| Insertion | O(log N) | O(N) |
| Deletion | O(log N) | O(N) |
| Inorder Traversal | O(N) | O(N) |

<!-- PAGE_BREAK -->

# BALANCED AVL TREE & TRAVERSALS

In an **AVL Tree**, the difference between heights of left and right subtrees (Balance Factor) cannot be more than 1 for all nodes.

\`\`\`tree
graph TD
    Root((40)) --> L1((20))
    Root --> R1((60))
    L1 --> L2((10))
    L1 --> L3((30))
    R1 --> R2((50))
    R1 --> R3((70))
\`\`\`

### Tree Traversal Orders
- **Inorder (L, Root, R):** \`10 -> 20 -> 30 -> 40 -> 50 -> 60 -> 70\` (Sorted)
- **Preorder (Root, L, R):** \`40 -> 20 -> 10 -> 30 -> 60 -> 50 -> 70\`
- **Postorder (L, R, Root):** \`10 -> 30 -> 20 -> 50 -> 70 -> 60 -> 40\`
`,
  },
  structures: {
    subject: 'Data Structures & Organization',
    lecture: 'Core Diagram Structures — Trees, Hierarchies & Flowcharts',
    content: `# FOUR CORE DIAGRAM STRUCTURES IN COMPUTER SCIENCE & NOTES

Visual diagrams provide high retention and quick revision for complex relationships, hierarchies, and step-by-step algorithms.

## 1. Binary Tree with Circular Nodes (Structure 1)

A binary tree is a hierarchical data structure where each node has at most two children:

\`\`\`tree
23
  21
  31
\`\`\`

- **Root Value:** \`23\`
- **Left Child Node:** \`21\` (Smaller value in BST property)
- **Right Child Node:** \`31\` (Greater value in BST property)

## 2. Multi-Level Deep Binary Tree (Structure 2)

An expanded tree showing left and right subtrees with deeper branches:

\`\`\`tree
21
  31
    15
    18
  24
    22
    28
      29
\`\`\`

<!-- PAGE_BREAK -->

# HIERARCHICAL & FLOW STRUCTURES

## 3. Hierarchical Organization Tree (Structure 3)

A multi-branch organization / entity hierarchy linking multiple attributes:

\`\`\`tree
Name
  Roll No.
  Class
    Section A
    Section B
  Student ID
\`\`\`

## 4. Step-by-Step Vertical Flowchart (Structure 4)

A sequential pipeline diagram illustrating execution order:

\`\`\`tree
Name -> Class -> Roll No. -> Final Result
\`\`\`
`,
  },
};

function formatInline(text: string): string {
  let s = text;
  // bold **text**
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // inline code `code`
  s = s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return s;
}

function convertTreeToMermaid(rawText: string, defaultShape: 'circle' | 'box' = 'circle'): string {
  const lines = rawText.trim().split('\n');
  if (rawText.includes('graph TD') || rawText.includes('graph LR') || rawText.includes('flowchart')) {
    return rawText;
  }

  // Arrow chain syntax: A -> B -> C
  if (rawText.includes('->') || rawText.includes('-->')) {
    const parts = rawText.split(/\s*->\s*|\s*-->\s*/);
    const mLines: string[] = ['graph TD'];
    for (let j = 0; j < parts.length - 1; j++) {
      const from = parts[j].trim();
      const to = parts[j + 1].trim();
      const fromShape = defaultShape === 'circle' && /^\d+$/.test(from) ? `((${from}))` : `["${from}"]`;
      const toShape = defaultShape === 'circle' && /^\d+$/.test(to) ? `((${to}))` : `["${to}"]`;
      mLines.push(`    n_${j}${fromShape} --> n_${j + 1}${toShape}`);
    }
    return mLines.join('\n');
  }

  // Indented tree syntax
  const mLines: string[] = ['graph TD'];
  interface NodeItem {
    id: string;
    level: number;
  }
  const stack: NodeItem[] = [];
  let nodeCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = line.search(/\S/);
    const text = line.trim();
    const id = `node_${++nodeCount}`;
    const shape = defaultShape === 'circle' && /^\d+$/.test(text) ? `((${text}))` : `["${text}"]`;

    while (stack.length > 0 && stack[stack.length - 1].level >= indent) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      mLines.push(`    ${parent.id} --> ${id}${shape}`);
    } else {
      mLines.push(`    ${id}${shape}`);
    }

    stack.push({ id, level: indent });
  }

  return mLines.join('\n');
}

export function parseMarkdownToPages(markdownText: string, options: StudioOptions): string[] {
  const cleanInput = markdownText.replace(/\r\n/g, '\n');
  const lines = cleanInput.split('\n');
  const pages: string[] = [];

  // Usable height threshold for A4 page packing (approx 1050px)
  const MAX_PAGE_HEIGHT = 1000;
  let currentBlocks: string[] = [];
  let currentHeight = 0;
  let inList = false;

  const flush = () => {
    if (inList) {
      currentBlocks.push('</ul>');
      inList = false;
    }
    if (currentBlocks.length > 0) {
      pages.push(currentBlocks.join('\n'));
      currentBlocks = [];
      currentHeight = 0;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Explicit page break
    if (
      line.startsWith('<!-- PAGE_BREAK') ||
      line.startsWith('<!-- PAGE-BREAK') ||
      line === '---' ||
      line === '\\pagebreak' ||
      line === '\\newpage'
    ) {
      flush();
      i++;
      continue;
    }

    if (!line) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      i++;
      continue;
    }

    // Diagram code block
    if (line.startsWith('```tree') || line.startsWith('```mermaid') || line.startsWith('```diagram')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const isTree = line.includes('tree');
      const mermaidCode = convertTreeToMermaid(codeLines.join('\n'), isTree ? 'circle' : 'box');
      const blockHtml = `<div class="mermaid">${mermaidCode}</div>`;
      const estHeight = 180;
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      continue;
    }

    // Generic code block
    if (line.startsWith('```')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const lang = line.slice(3).trim() || 'Code';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const blockHtml = `
        <div class="code-box">
          <div class="code-box-header">${lang.toUpperCase()}</div>
          <pre><code>${codeLines.map((l) => l.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('\n')}</code></pre>
        </div>`;
      const estHeight = Math.max(70, codeLines.length * 20 + 35);
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      continue;
    }

    // Markdown Table
    if (line.startsWith('|')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCols = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        // skip separator line if present (| --- | --- |)
        const startRow = tableLines[1].includes('---') ? 2 : 1;
        const rows = tableLines.slice(startRow).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => formatInline(c.trim()))
        );

        const tableHtml = `
          <table class="notes-table">
            <thead>
              <tr>${headerCols.map((h) => `<th>${formatInline(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>`;

        const estHeight = 35 + rows.length * 28;
        if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
          flush();
        }
        currentBlocks.push(tableHtml);
        currentHeight += estHeight;
      }
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const title = line.slice(2).trim();
      const blockHtml = `<div class="section-heading"><span class="section-heading-text">${formatInline(title)}</span></div>`;
      const estHeight = 45;
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      i++;
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const title = line.slice(3).trim();
      const blockHtml = `<div class="subheading"><span class="subheading-text">${formatInline(title)}</span></div>`;
      const estHeight = 38;
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      i++;
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      if (inList) {
        currentBlocks.push('</ul>');
        inList = false;
      }
      const title = line.slice(4).trim();
      const blockHtml = `<div class="sub-feature-title"><span class="sub-feature-text">${formatInline(title)}</span></div>`;
      const estHeight = 32;
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      i++;
      continue;
    }

    // List item
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      if (!inList) {
        currentBlocks.push('<ul class="notes-list">');
        inList = true;
      }
      const itemText = line.replace(/^(?:[-*]|\d+\.)\s+/, '');
      const blockHtml = `<li class="notes-list-item">${formatInline(itemText)}</li>`;
      const estHeight = 26;
      if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
        flush();
        currentBlocks.push('<ul class="notes-list">');
        inList = true;
      }
      currentBlocks.push(blockHtml);
      currentHeight += estHeight;
      i++;
      continue;
    }

    // Regular Paragraph
    if (inList) {
      currentBlocks.push('</ul>');
      inList = false;
    }
    const blockHtml = `<p>${formatInline(line)}</p>`;
    const estHeight = Math.max(26, Math.ceil(line.length / 75) * 22);
    if (currentHeight + estHeight > MAX_PAGE_HEIGHT && currentBlocks.length > 0) {
      flush();
    }
    currentBlocks.push(blockHtml);
    currentHeight += estHeight;
    i++;
  }

  flush();
  return pages.length > 0 ? pages : ['<p>Start typing notes in the editor...</p>'];
}

export function renderFullDocumentHTML(markdownText: string, options: StudioOptions): string {
  const pages = parseMarkdownToPages(markdownText, options);

  // Background pattern CSS
  let paperBgCSS = 'background-color: #ffffff;';
  if (options.paperStyle === 'ruled') {
    paperBgCSS = `
      background-image: repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff calc(100% / 22 - 1px), #e2e8f0 calc(100% / 22 - 1px), #e2e8f0 calc(100% / 22));
      background-size: 100% calc(100% / 22);
      background-color: #ffffff;
    `;
  } else if (options.paperStyle === 'grid') {
    paperBgCSS = `
      background-image: linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
      background-size: 20px 20px;
      background-color: #ffffff;
    `;
  } else if (options.paperStyle === 'cream') {
    paperBgCSS = 'background-color: #fdfbf7;';
  }

  // Realism Jitter CSS
  let realismCSS = '';
  if (options.realism === 'subtle') {
    realismCSS = `
      p, li, .section-heading, .subheading { transform-origin: 0% 50%; }
      p:nth-child(odd) { transform: rotate(-0.12deg); }
      p:nth-child(even) { transform: rotate(0.12deg); }
      li:nth-child(3n+1) { transform: rotate(0.15deg); }
      li:nth-child(3n+2) { transform: rotate(-0.12deg); }
      strong { transform: scale(1.02); display: inline-block; }
    `;
  } else if (options.realism === 'natural' || options.realism === 'high') {
    const deg = options.realism === 'high' ? 0.3 : 0.18;
    realismCSS = `
      p, li, .section-heading, .subheading { transform-origin: 0% 50%; }
      p:nth-child(odd) { transform: rotate(-${deg}deg); }
      p:nth-child(even) { transform: rotate(${deg}deg); }
      li:nth-child(4n+1) { transform: rotate(${deg * 1.1}deg) translateY(0.2px); }
      li:nth-child(4n+2) { transform: rotate(-${deg}deg) translateY(-0.15px); }
      strong { transform: rotate(${deg * 0.8}deg) scale(1.02); display: inline-block; }
      .section-heading { transform: rotate(-${deg}deg); }
      .subheading { transform: rotate(${deg}deg); }
    `;
  }

  const pagesHTML = pages
    .map((pageContent, idx) => {
      const pageNum = idx + 1;
      const isFirst = pageNum === 1;
      const showHdr = options.showHeader && (options.headerMode === 'every_page' || isFirst);

      return `
      <div class="page-container" id="page-${pageNum}" data-page="${pageNum}">
        ${
          showHdr
            ? `
          <div class="doc-header">
            ${
              options.logoType === 'pw'
                ? `<div class="brand-logo"><span class="logo-circle">PW<span class="logo-dot"></span></span> ONLYIAS</div>`
                : options.customBrand
                ? `<div class="brand-logo">${options.customBrand}</div>`
                : ''
            }
            ${isFirst && options.subject ? `<div class="subject-title">${options.subject}</div>` : ''}
            ${isFirst && options.lecture ? `<div class="lecture-title">${options.lecture}</div>` : ''}
          </div>`
            : ''
        }

        <div class="content-layout">
          <div class="main-column">
            ${pageContent}
          </div>

          ${
            options.showSidebar
              ? `
            <div class="notes-sidebar">
              <div class="notes-sidebar-header">${options.sidebarText}</div>
            </div>`
              : ''
          }
        </div>

        ${
          options.showFooter
            ? `
          <div class="doc-footer">
            <span>${options.footerLeft}</span>
            <span>${options.footerRight} (Page ${pageNum} of ${pages.length})</span>
          </div>`
            : ''
        }
      </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${options.subject || 'Handwritten Notes'} - ${options.lecture || 'ToolsVerse'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Coming+Soon&family=Caveat:wght@500;700&family=Patrick+Hand&family=Kalam:wght@400;700&family=Architects+Daughter&family=Indie+Flower&family=Gochi+Hand&family=Comic+Neue:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script src="/vendor/mermaid.min.js"></script>
<script>
  if (!window.mermaid) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    document.head.appendChild(s);
  }
  window.addEventListener('load', function() {
    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
      mermaid.init(undefined, document.querySelectorAll('.mermaid'));
    }
  });
</script>
<style>
  @page {
    size: 210mm 297mm;
    margin: 0mm !important;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    margin: 0;
    padding: 0;
    background-color: #1e2430;
    font-family: '${options.fontFamily}', 'Coming Soon', cursive, sans-serif;
    color: ${options.bodyColor};
    font-size: ${options.fontSize}pt;
    line-height: ${options.lineHeight};
    letter-spacing: ${options.letterSpacing}px;
    word-spacing: ${options.wordSpacing}px;
  }

  ${
    options.draftMode
      ? `
    body, p, li, td, th, span, code {
      font-weight: 700 !important;
      -webkit-text-stroke: 0.35px currentColor;
    }
    strong, b {
      font-weight: 900 !important;
      -webkit-text-stroke: 0.5px currentColor;
    }
  `
      : ''
  }

  ${realismCSS}

  .pages-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px 0;
  }

  .page-container {
    width: 210mm;
    height: 297mm;
    min-height: 297mm;
    max-height: 297mm;
    margin: 0 auto 24px auto;
    padding: ${options.marginTop}mm ${options.marginRight}mm ${options.marginBottom}mm ${options.marginLeft}mm;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
    box-sizing: border-box;
    ${paperBgCSS}
  }

  .doc-header {
    text-align: center;
    margin-bottom: 6px;
    flex-shrink: 0;
  }

  .brand-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 900;
    font-size: 20px;
    letter-spacing: -0.5px;
    color: #111827;
    margin-bottom: 2px;
  }

  .logo-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2.2px solid #111827;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    font-size: 11px;
    font-weight: 900;
    margin-right: 6px;
    position: relative;
  }

  .logo-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    background-color: #ea580c;
    border-radius: 50%;
    top: -2px;
    right: 3px;
  }

  .subject-title {
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    font-size: 19pt;
    color: ${options.subjectColor};
    text-decoration: underline;
    text-underline-offset: 4px;
    margin-bottom: 2px;
    line-height: 1.25;
  }

  .lecture-title {
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    font-size: 16pt;
    color: ${options.lectureColor};
    text-decoration: underline;
    text-underline-offset: 4px;
    margin-bottom: 4px;
    line-height: 1.25;
  }

  .content-layout {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
    overflow: hidden;
    padding-bottom: ${options.showFooter ? '30px' : '0px'};
  }

  .main-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .notes-sidebar {
    width: ${options.sidebarWidth}px;
    align-self: stretch;
    height: 100%;
    border: 1.5px solid ${options.sidebarColor};
    border-radius: 4px;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .notes-sidebar-header {
    color: ${options.sidebarColor};
    font-size: 13pt;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }

  .section-heading {
    color: ${options.sectionColor};
    font-size: 17pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 8px;
    margin-bottom: 3px;
    line-height: 1.4;
  }

  .section-heading-text {
    border-bottom: 1.5px solid ${options.sectionColor};
    padding-bottom: 2px;
    display: inline;
  }

  .subheading {
    color: ${options.subheadingColor};
    font-size: 15pt;
    font-weight: bold;
    margin-top: 7px;
    margin-bottom: 3px;
    line-height: 1.4;
  }

  .subheading-text {
    text-decoration: underline;
    text-underline-offset: 3px;
    display: inline;
  }

  .sub-feature-title {
    color: #111827;
    font-size: 13pt;
    font-weight: bold;
    margin-top: 6px;
    margin-bottom: 2px;
  }

  .sub-feature-text {
    text-decoration: underline;
    text-underline-offset: 3px;
    display: inline;
  }

  p {
    font-size: ${options.fontSize}pt;
    line-height: ${options.lineHeight};
    letter-spacing: ${options.letterSpacing}px;
    word-spacing: ${options.wordSpacing}px;
    margin: 2px 0 4px 0;
  }

  strong, b {
    font-weight: bold;
    color: #000000;
  }

  ul.notes-list {
    margin: 2px 0 4px 0;
    padding-left: 20px;
    list-style-type: disc;
  }

  li.notes-list-item {
    font-size: ${options.fontSize}pt;
    line-height: ${options.lineHeight};
    margin-bottom: 2.5px;
  }

  .inline-code {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 1px 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10pt;
  }

  .code-box {
    background-color: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-left: 4px solid #4f46e5;
    border-radius: 4px;
    padding: 5px 8px;
    margin: 6px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: #1e293b;
    overflow-x: auto;
  }

  .code-box-header {
    font-size: 9.5px;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    margin-bottom: 3px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 2px;
  }

  .code-box pre {
    margin: 0;
    font-family: inherit;
    white-space: pre-wrap;
  }

  .notes-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    font-size: 9.5pt;
  }

  .notes-table th {
    background-color: ${options.tableHeaderBg};
    color: #ffffff;
    font-weight: bold;
    text-align: left;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
  }

  .notes-table td {
    padding: 4px 7px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }

  .notes-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .mermaid {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 6px auto;
    width: 100%;
  }

  .mermaid svg {
    max-width: 100%;
    height: auto;
  }

  .doc-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 8.5mm;
    background-color: ${options.footerBg};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10mm;
    font-size: 11pt;
    color: #374151;
  }

  @media print {
    html, body {
      background: #ffffff !important;
      width: 210mm !important;
      height: auto !important;
    }
    .pages-wrapper {
      padding: 0 !important;
      margin: 0 !important;
    }
    .page-container {
      margin: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      page-break-after: always !important;
      break-after: page !important;
    }
    .page-container:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  }
</style>
</head>
<body>
  <div class="pages-wrapper">
    ${pagesHTML}
  </div>
</body>
</html>`;
}
