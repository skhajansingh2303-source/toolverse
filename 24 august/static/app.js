// Handwritten Notes Studio Frontend Controller — Seamless Continuous Notes with Full Multi-Document Library

window.openDiagramModal = function(preferredTab = "interactive-tree") {
  const modal = document.getElementById("diagram-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
  const builderTabs = document.querySelectorAll(".builder-tab");
  builderTabs.forEach(t => {
    if (t.getAttribute("data-tab") === preferredTab) {
      t.classList.add("active");
    } else {
      t.classList.remove("active");
    }
  });
  document.querySelectorAll(".tab-pane").forEach(p => {
    if (p.id === `tab-${preferredTab}`) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }
  });
  if (preferredTab === "interactive-tree" && typeof window.renderInteractiveTreeSVG === "function") {
    window.renderInteractiveTreeSVG();
  } else if (preferredTab === "interactive-flow" && typeof window.renderInteractiveFlowSVG === "function") {
    window.renderInteractiveFlowSVG();
  }
  if (window.lucide) lucide.createIcons();
};

window.insertMarkdownSnippet = function(type) {
  const notesTextarea = document.getElementById("notes-content");
  if (!notesTextarea) return;
  let text = "";
  if (type === 'h1') text = "\n# SECTION TITLE\n";
  else if (type === 'h2') text = "\n## Subheading Topic\n";
  else if (type === 'bullet') text = "\n- **Key Concept:** Explanation goes here.\n";
  else if (type === 'table') text = "\n| Operation | Time Complexity | Space Complexity |\n| Search | O(log N) | O(1) |\n| Insert | O(log N) | O(1) |\n";
  else if (type === 'hierarchy') text = `\n## Hierarchical Organization Tree\n\n\`\`\`tree\nName\n  Roll No.\n  Class\n    eg\n    class\n    Roll\n  Khajan\n\`\`\`\n`;
  else if (type === 'avl') text = `\n## Balanced AVL Tree\n\n\`\`\`tree\ngraph TD\n    Root((40)) --> L1((20))\n    Root --> R1((60))\n    L1 --> L2((10))\n    L1 --> L3((30))\n    R1 --> R2((50))\n    R1 --> R3((70))\n\`\`\`\n`;
  else if (type === 'linked-list') text = `\n## Singly Linked List\n\n\`\`\`tree\ngraph LR\n    Head[Head] --> N1[10 | •] --> N2[20 | •] --> N3[30 | •] --> Null[NULL]\n\`\`\`\n`;
  else if (type === 'code') text = `\n\`\`\`cpp\nstruct Node {\n    int data;\n    Node* left;\n    Node* right;\n    Node(int val) : data(val), left(nullptr), right(nullptr) {}\n};\n\`\`\`\n`;

  const start = notesTextarea.selectionStart || 0;
  const end = notesTextarea.selectionEnd || 0;
  const before = notesTextarea.value.substring(0, start);
  const after = notesTextarea.value.substring(end, notesTextarea.value.length);
  notesTextarea.value = before + text + after;
  notesTextarea.selectionStart = notesTextarea.selectionEnd = start + text.length;
  notesTextarea.focus();
  if (window.schedulePreview) window.schedulePreview();
  if (window.autoSaveState) window.autoSaveState();
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const LIBRARY_KEY = "handwritten_notes_library_v1";
  const ACTIVE_DOC_KEY = "handwritten_notes_active_id";

  // DOM Elements
  const appLayout = document.getElementById("app-layout");
  const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");

  const modeSettingsPreview = document.getElementById("mode-settings-preview");
  const modeSplit = document.getElementById("mode-split");
  const modeSide = document.getElementById("mode-side");
  const modeEditor = document.getElementById("mode-editor");
  const modePreview = document.getElementById("mode-preview");
  const btnQuickFullView = document.getElementById("btn-quick-full-view");

  const zoomSelect = document.getElementById("zoom-select");
  const zoomIn = document.getElementById("zoom-in");
  const zoomOut = document.getElementById("zoom-out");

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileStatus = document.getElementById("file-status");
  const fileNameDisplay = document.getElementById("file-name-display");
  
  const notesTextarea = document.getElementById("notes-content");
  const previewFrame = document.getElementById("preview-frame");
  const previewStatus = document.getElementById("preview-status");
  const autosaveStatus = document.getElementById("autosave-status");
  const saveStatusText = document.getElementById("save-status-text");
  
  const fontSelect = document.getElementById("font-select");
  const paperSelect = document.getElementById("paper-select");
  const headerModeSelect = document.getElementById("header-mode-select");
  const logoSelect = document.getElementById("logo-select");
  const customBrandGroup = document.getElementById("custom-brand-group");
  const customBrandText = document.getElementById("custom-brand-text");
  const subjectInput = document.getElementById("subject-input");
  const lectureInput = document.getElementById("lecture-input");

  // Color Palette Elements
  const colorSubjectInput = document.getElementById("color-subject");
  const colorLectureInput = document.getElementById("color-lecture");
  const colorBodyInput = document.getElementById("color-body");
  const colorSectionInput = document.getElementById("color-section");
  const colorSubheadingInput = document.getElementById("color-subheading");
  const colorSidebarInput = document.getElementById("color-sidebar");

  // Sidebar & Footer Elements
  const toggleSidebar = document.getElementById("toggle-sidebar");
  const sidebarTextGroup = document.getElementById("sidebar-text-group");
  const sidebarTextInput = document.getElementById("sidebar-text-input");
  const toggleFooter = document.getElementById("toggle-footer");
  const footerInputsGroup = document.getElementById("footer-inputs-group");
  const footerLeftInput = document.getElementById("footer-left");
  const footerRightInput = document.getElementById("footer-right");

  // Margin Elements & Presets
  const marginTopInput = document.getElementById("margin-top");
  const marginBottomInput = document.getElementById("margin-bottom");
  const marginLeftInput = document.getElementById("margin-left");
  const marginRightInput = document.getElementById("margin-right");
  const marginTopSlider = document.getElementById("slider-margin-top");
  const marginBottomSlider = document.getElementById("slider-margin-bottom");
  const marginLeftSlider = document.getElementById("slider-margin-left");
  const marginRightSlider = document.getElementById("slider-margin-right");

  const valDispTop = document.getElementById("val-disp-top");
  const valDispBottom = document.getElementById("val-disp-bottom");
  const valDispLeft = document.getElementById("val-disp-left");
  const valDispRight = document.getElementById("val-disp-right");
  const marginTotalBadge = document.getElementById("margin-total-badge");

  const btnResetMargins = document.getElementById("btn-reset-margins");
  const btnPresetTight = document.getElementById("btn-preset-tight");
  const btnPresetStandard = document.getElementById("btn-preset-standard");
  const btnPresetNotebook = document.getElementById("btn-preset-notebook");
  const btnFitA4 = document.getElementById("btn-fit-a4");

  function updateMarginDisplays() {
    const top = marginTopInput ? (marginTopInput.value || 8) : 8;
    const bot = marginBottomInput ? (marginBottomInput.value || 8) : 8;
    const lft = marginLeftInput ? (marginLeftInput.value || 8) : 8;
    const rgt = marginRightInput ? (marginRightInput.value || 8) : 8;
    if (valDispTop) valDispTop.textContent = `${top}mm`;
    if (valDispBottom) valDispBottom.textContent = `${bot}mm`;
    if (valDispLeft) valDispLeft.textContent = `${lft}mm`;
    if (valDispRight) valDispRight.textContent = `${rgt}mm`;
    if (marginTotalBadge) {
      marginTotalBadge.textContent = `A4 Fit: ${top}, ${bot}, ${lft}, ${rgt} mm`;
    }
  }

  // Typography & Realism Elements
  const sliderFontSize = document.getElementById("slider-font-size");
  const valDispFontSize = document.getElementById("val-disp-font-size");
  const sliderLetterSpacing = document.getElementById("slider-letter-spacing");
  const valDispLetterSpacing = document.getElementById("val-disp-letter-spacing");
  const sliderWordSpacing = document.getElementById("slider-word-spacing");
  const valDispWordSpacing = document.getElementById("val-disp-word-spacing");
  const sliderLineHeight = document.getElementById("slider-line-height");
  const valDispLineHeight = document.getElementById("val-disp-line-height");
  const realismSelect = document.getElementById("realism-select");

  function updateTypographyDisplays() {
    if (sliderFontSize && valDispFontSize) valDispFontSize.textContent = `${parseFloat(sliderFontSize.value).toFixed(1)} pt`;
    if (sliderLetterSpacing && valDispLetterSpacing) valDispLetterSpacing.textContent = `${parseFloat(sliderLetterSpacing.value).toFixed(1)} px`;
    if (sliderWordSpacing && valDispWordSpacing) valDispWordSpacing.textContent = `${parseFloat(sliderWordSpacing.value).toFixed(1)} px`;
    if (sliderLineHeight && valDispLineHeight) valDispLineHeight.textContent = `${parseFloat(sliderLineHeight.value).toFixed(2)}`;
  }

  function setMargins(top, bottom, left, right) {
    if (marginTopInput) marginTopInput.value = top;
    if (marginTopSlider) marginTopSlider.value = top;
    if (marginBottomInput) marginBottomInput.value = bottom;
    if (marginBottomSlider) marginBottomSlider.value = bottom;
    if (marginLeftInput) marginLeftInput.value = left;
    if (marginLeftSlider) marginLeftSlider.value = left;
    if (marginRightInput) marginRightInput.value = right;
    if (marginRightSlider) marginRightSlider.value = right;
    updateMarginDisplays();
  }

  // Document Templates & Presets
  const templateSelect = document.getElementById("template-select");
  const btnApplyTemplate = document.getElementById("btn-apply-template");
  const btnLoadTemplateSample = document.getElementById("btn-load-template-sample");

  const TEMPLATES = {
    pw_historical: {
      name: "PW OnlyIAS Official (Historical Background)",
      fontFamily: "Coming Soon",
      fontSize: 11.0,
      letterSpacing: 0.0,
      wordSpacing: 0.0,
      lineHeight: 1.40,
      realism: "subtle",
      paperStyle: "plain",
      headerMode: "every_page",
      logoType: "pw",
      customBrand: "",
      subject: "Indian Polity",
      lecture: "Lecture 01: Historical Background",
      subjectColor: "#1b4332",
      lectureColor: "#1b4332",
      bodyColor: "#000000",
      sectionColor: "#c00000",
      subheadingColor: "#1f3864",
      sidebarColor: "#0284c7",
      showSidebar: true,
      sidebarText: "Space for Notes",
      showFooter: true,
      footerLeft: "PW OnlyIAS",
      footerRight: "Daily Class Notes",
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 12,
      marginRight: 8
    },
    royal_academic: {
      name: "Royal Academic / University Notes",
      fontFamily: "Patrick Hand",
      fontSize: 11.5,
      letterSpacing: 0.0,
      wordSpacing: 1.0,
      lineHeight: 1.50,
      realism: "natural",
      paperStyle: "ruled",
      headerMode: "first_page",
      logoType: "none",
      customBrand: "",
      subject: "ACADEMIC STUDIES",
      lecture: "LECTURE & RESEARCH NOTES",
      subjectColor: "#1e3a8a",
      lectureColor: "#2563eb",
      bodyColor: "#0f172a",
      sectionColor: "#991b1b",
      subheadingColor: "#1e40af",
      sidebarColor: "#1e3a8a",
      showSidebar: false,
      sidebarText: "Notes & Cues",
      showFooter: true,
      footerLeft: "Academic Notes",
      footerRight: "Semester 1",
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 12,
      marginRight: 10
    },
    emerald_topper: {
      name: "Forest Emerald (UPSC Topper Notes)",
      fontFamily: "Caveat",
      fontSize: 12.5,
      letterSpacing: 0.2,
      wordSpacing: 1.0,
      lineHeight: 1.55,
      realism: "natural",
      paperStyle: "plain",
      headerMode: "every_page",
      logoType: "pw",
      customBrand: "",
      subject: "GENERAL STUDIES",
      lecture: "CIVIL SERVICES TOPPER NOTES",
      subjectColor: "#065f46",
      lectureColor: "#047857",
      bodyColor: "#111827",
      sectionColor: "#065f46",
      subheadingColor: "#0284c7",
      sidebarColor: "#059669",
      showSidebar: true,
      sidebarText: "Space for Notes",
      showFooter: true,
      footerLeft: "UPSC Civil Services",
      footerRight: "Daily Class Notes",
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 10,
      marginRight: 8
    },
    cs_tech: {
      name: "Computer Science & Tech Spec",
      fontFamily: "Comic Neue",
      fontSize: 11.0,
      letterSpacing: 0.0,
      wordSpacing: 0.5,
      lineHeight: 1.45,
      realism: "subtle",
      paperStyle: "plain",
      headerMode: "first_page",
      logoType: "custom",
      customBrand: "TECH CORE",
      subject: "COMPUTER SCIENCE & ENGINEERING",
      lecture: "DATA STRUCTURES & ALGORITHMS",
      subjectColor: "#4f46e5",
      lectureColor: "#2563eb",
      bodyColor: "#0f172a",
      sectionColor: "#4f46e5",
      subheadingColor: "#0284c7",
      sidebarColor: "#6366f1",
      showSidebar: false,
      sidebarText: "Algorithm Notes",
      showFooter: true,
      footerLeft: "CS Engineering",
      footerRight: "Algorithms & Systems",
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 10,
      marginRight: 8
    },
    vintage_cornell: {
      name: "Vintage Sepia Cornell Notes",
      fontFamily: "Architects Daughter",
      fontSize: 11.5,
      letterSpacing: 0.2,
      wordSpacing: 1.0,
      lineHeight: 1.55,
      realism: "natural",
      paperStyle: "cream",
      headerMode: "first_page",
      logoType: "none",
      customBrand: "",
      subject: "CORNELL METHOD",
      lecture: "SUMMARY & SYSTEM STUDY",
      subjectColor: "#78350f",
      lectureColor: "#92400e",
      bodyColor: "#292524",
      sectionColor: "#9a3412",
      subheadingColor: "#b45309",
      sidebarColor: "#78350f",
      showSidebar: true,
      sidebarText: "Cornell Cues",
      showFooter: true,
      footerLeft: "Cornell System",
      footerRight: "Summary Notes",
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 12,
      marginRight: 10
    },
    minimalist: {
      name: "Minimalist Clean Notebook",
      fontFamily: "Kalam",
      fontSize: 12.0,
      letterSpacing: 0.0,
      wordSpacing: 0.8,
      lineHeight: 1.50,
      realism: "subtle",
      paperStyle: "plain",
      headerMode: "none",
      logoType: "none",
      customBrand: "",
      subject: "",
      lecture: "",
      subjectColor: "#111827",
      lectureColor: "#374151",
      bodyColor: "#111827",
      sectionColor: "#111827",
      subheadingColor: "#374151",
      sidebarColor: "#94a3b8",
      showSidebar: false,
      sidebarText: "Notes",
      showFooter: false,
      footerLeft: "",
      footerRight: "",
      marginTop: 12,
      marginBottom: 12,
      marginLeft: 12,
      marginRight: 12
    }
  };

  function applyTemplate(templateKey, autoLoadSample = false) {
    const t = TEMPLATES[templateKey] || TEMPLATES.pw_historical;
    
    if (fontSelect) fontSelect.value = t.fontFamily;
    if (sliderFontSize) sliderFontSize.value = t.fontSize;
    if (sliderLetterSpacing) sliderLetterSpacing.value = t.letterSpacing;
    if (sliderWordSpacing) sliderWordSpacing.value = t.wordSpacing;
    if (sliderLineHeight) sliderLineHeight.value = t.lineHeight;
    if (realismSelect) realismSelect.value = t.realism;
    if (paperSelect) paperSelect.value = t.paperStyle;
    
    if (headerModeSelect) headerModeSelect.value = t.headerMode;
    if (logoSelect) logoSelect.value = t.logoType;
    if (customBrandText) customBrandText.value = t.customBrand || "";
    if (t.subject && subjectInput) subjectInput.value = t.subject;
    if (t.lecture && lectureInput) lectureInput.value = t.lecture;
    
    if (colorSubjectInput) colorSubjectInput.value = t.subjectColor;
    if (colorLectureInput) colorLectureInput.value = t.lectureColor;
    if (colorBodyInput) colorBodyInput.value = t.bodyColor;
    if (colorSectionInput) colorSectionInput.value = t.sectionColor;
    if (colorSubheadingInput) colorSubheadingInput.value = t.subheadingColor;
    if (colorSidebarInput) colorSidebarInput.value = t.sidebarColor;
    
    if (toggleSidebar) toggleSidebar.checked = t.showSidebar;
    if (sidebarTextInput) sidebarTextInput.value = t.sidebarText;
    if (toggleFooter) toggleFooter.checked = t.showFooter;
    if (footerLeftInput) footerLeftInput.value = t.footerLeft;
    if (footerRightInput) footerRightInput.value = t.footerRight;
    
    setMargins(t.marginTop, t.marginBottom, t.marginLeft, t.marginRight);
    
    updateTypographyDisplays();
    updateLogoBrandVisibility();
    updateSidebarVisibility();
    updateFooterVisibility();
    
    if (autoLoadSample) {
      loadInitialSample();
    } else {
      schedulePreview();
      autoSaveState();
    }
  }

  // Library & Management Elements
  const btnOpenLibrary = document.getElementById("btn-open-library");
  const savedNotesCount = document.getElementById("saved-notes-count");
  const libraryModal = document.getElementById("library-modal");
  const btnCloseLibrary = document.getElementById("btn-close-library");
  const btnCloseLibraryFooter = document.getElementById("btn-close-library-footer");
  const savedNotesList = document.getElementById("saved-notes-list");
  const librarySearchInput = document.getElementById("library-search-input");
  const btnLibraryNewNote = document.getElementById("btn-library-new-note");

  const btnNewNotes = document.getElementById("btn-new-notes");
  const btnLoadSample = document.getElementById("btn-load-sample");
  const btnLoadCsSample = document.getElementById("btn-load-cs-sample");
  const btnFormatChatgpt = document.getElementById("btn-format-chatgpt");
  const btnExportPdf = document.getElementById("btn-export-pdf");
  const btnUpdatePreview = document.getElementById("btn-update-preview");
  const btnPrint = document.getElementById("btn-print");
  
  const loadingOverlay = document.getElementById("loading-overlay");
  const loadingTitle = document.getElementById("loading-title");
  const loadingDesc = document.getElementById("loading-desc");

  // Toolbar elements
  const tbH1 = document.getElementById("tb-h1");
  const tbH2 = document.getElementById("tb-h2");
  const tbBold = document.getElementById("tb-bold");
  const tbUnderline = document.getElementById("tb-underline");
  const tbColorRed = document.getElementById("tb-color-red");
  const tbColorBlack = document.getElementById("tb-color-black");
  const tbBullet = document.getElementById("tb-bullet");
  const tbTable = document.getElementById("tb-table");

  // CS Diagram Toolbar Elements
  const tbFlow = document.getElementById("tb-flow");
  const tbTree = document.getElementById("tb-tree");
  const tbHierarchy = document.getElementById("tb-hierarchy");
  const tbAvl = document.getElementById("tb-avl");
  const tbLinkedList = document.getElementById("tb-linked-list");
  const tbCode = document.getElementById("tb-code");

  // Undo / Redo & Crop Toolbar Elements
  const btnUndo = document.getElementById("tb-undo");
  const btnRedo = document.getElementById("tb-redo");
  const tbCrop = document.getElementById("tb-crop");

  const undoStack = [];
  const redoStack = [];
  const MAX_UNDO_HISTORY = 80;
  let isUndoRedoAction = false;
  let lastRecordedText = "";

  function setEditorContent(content) {
    if (content === undefined || content === null) content = "";
    if (notesTextarea) notesTextarea.value = content;
  }

  function saveUndoSnapshot() {
    if (!notesTextarea || isUndoRedoAction) return;
    const cur = notesTextarea.value;
    if (undoStack.length > 0 && undoStack[undoStack.length - 1].text === cur) {
      lastRecordedText = cur;
      return;
    }

    undoStack.push({
      text: cur,
      start: notesTextarea.selectionStart || 0,
      end: notesTextarea.selectionEnd || 0
    });
    if (undoStack.length > MAX_UNDO_HISTORY) undoStack.shift();
    redoStack.length = 0; // New change clears redo stack
    lastRecordedText = cur;
    updateUndoRedoButtonsState();
  }

  function performUndoAction() {
    if (!notesTextarea) return;
    // Immediately commit current unsaved text if user clicks undo while typing
    if (notesTextarea.value !== lastRecordedText) {
      saveUndoSnapshot();
    }
    if (undoStack.length <= 1) return;
    isUndoRedoAction = true;
    const currentState = undoStack.pop();
    redoStack.push(currentState);

    const prevState = undoStack[undoStack.length - 1];
    notesTextarea.value = prevState.text;
    notesTextarea.setSelectionRange(prevState.start, prevState.end);
    lastRecordedText = prevState.text;
    notesTextarea.focus();
    isUndoRedoAction = false;

    updateUndoRedoButtonsState();
    schedulePreview();
    autoSaveState();
  }

  function performRedoAction() {
    if (!notesTextarea || redoStack.length === 0) return;
    isUndoRedoAction = true;
    const nextState = redoStack.pop();
    undoStack.push(nextState);

    notesTextarea.value = nextState.text;
    notesTextarea.setSelectionRange(nextState.start, nextState.end);
    lastRecordedText = nextState.text;
    notesTextarea.focus();
    isUndoRedoAction = false;

    updateUndoRedoButtonsState();
    schedulePreview();
    autoSaveState();
  }

  function updateUndoRedoButtonsState() {
    if (btnUndo) {
      btnUndo.disabled = (undoStack.length <= 1);
      btnUndo.style.opacity = (undoStack.length <= 1) ? "0.45" : "1";
      btnUndo.style.cursor = (undoStack.length <= 1) ? "not-allowed" : "pointer";
    }
    if (btnRedo) {
      btnRedo.disabled = (redoStack.length === 0);
      btnRedo.style.opacity = (redoStack.length === 0) ? "0.45" : "1";
      btnRedo.style.cursor = (redoStack.length === 0) ? "not-allowed" : "pointer";
    }
  }

  window.performUndoAction = performUndoAction;
  window.performRedoAction = performRedoAction;

  const btnToggleDraft = document.getElementById("btn-toggle-draft");
  const draftStatusLabel = document.getElementById("draft-status-label");

  let renderTimeout = null;
  let saveTimeout = null;
  let currentMode = "split";
  let activeDocId = null;
  let isDraftMode = false;
  let openDiagramModal = window.openDiagramModal || function(preferredTab = "interactive-tree") {};

  function updateDraftButtonState() {
    if (!btnToggleDraft) return;
    btnToggleDraft.classList.toggle("active", isDraftMode);
    if (draftStatusLabel) {
      draftStatusLabel.innerHTML = isDraftMode
        ? 'Draft: <b class="draft-pill" style="background:#f59e0b;color:#1e1b4b;">ON</b>'
        : 'Draft: <b class="draft-pill">OFF</b>';
    }
  }

  function updateLogoBrandVisibility() {
    if (!logoSelect || !customBrandGroup) return;
    const isCustom = logoSelect.value === "custom";
    customBrandGroup.classList.toggle("hidden", !isCustom);
    customBrandGroup.style.display = isCustom ? "block" : "none";
    if (isCustom && customBrandText) {
      setTimeout(() => customBrandText.focus(), 50);
    }
  }

  function updateSidebarVisibility() {
    if (!toggleSidebar || !sidebarTextGroup) return;
    sidebarTextGroup.classList.toggle("hidden", !toggleSidebar.checked);
    sidebarTextGroup.style.display = toggleSidebar.checked ? "block" : "none";
  }

  function updateFooterVisibility() {
    if (!toggleFooter || !footerInputsGroup) return;
    footerInputsGroup.classList.toggle("hidden", !toggleFooter.checked);
    footerInputsGroup.style.display = toggleFooter.checked ? "block" : "none";
  }

  window.insertMarkdownSnippet = function(type) {
    if (type === 'h1') insertTextAtCursor("\n# SECTION TITLE\n");
    else if (type === 'h2') insertTextAtCursor("\n## Subheading Topic\n");
    else if (type === 'bullet') insertTextAtCursor("\n- **Key Concept:** Explanation goes here.\n");
    else if (type === 'table') insertTextAtCursor("\n| Operation | Time Complexity | Space Complexity |\n| Search | O(log N) | O(1) |\n| Insert | O(log N) | O(1) |\n");
    else if (type === 'hierarchy') insertTextAtCursor(`\n## Hierarchical Organization Tree\n\n\`\`\`tree\nName\n  Roll No.\n  Class\n    eg\n    class\n    Roll\n  Khajan\n\`\`\`\n`);
    else if (type === 'avl') insertTextAtCursor(`\n## Balanced AVL Tree\n\n\`\`\`tree\ngraph TD\n    Root((40)) --> L1((20))\n    Root --> R1((60))\n    L1 --> L2((10))\n    L1 --> L3((30))\n    R1 --> R2((50))\n    R1 --> R3((70))\n\`\`\`\n`);
    else if (type === 'linked-list') insertTextAtCursor(`\n## Singly Linked List\n\n\`\`\`tree\ngraph LR\n    Head[Head] --> N1[10 | •] --> N2[20 | •] --> N3[30 | •] --> Null[NULL]\n\`\`\`\n`);
    else if (type === 'code') insertTextAtCursor(`\n\`\`\`cpp\nstruct Node {\n    int data;\n    Node* left;\n    Node* right;\n    Node(int val) : data(val), left(nullptr), right(nullptr) {}\n};\n\`\`\`\n`);
  };

  window.applyTextFormat = function(wrapperStart, wrapperEnd, defaultText = "text") {
    const textarea = document.getElementById("notes-content");
    if (!textarea) return;

    saveUndoSnapshot();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const selected = val.substring(start, end);

    if (selected.length > 0) {
      const leadingMatch = selected.match(/^\s*/)[0];
      const trailingMatch = selected.match(/\s*$/)[0];
      const core = selected.substring(leadingMatch.length, selected.length - trailingMatch.length);

      if (core.length > 0) {
        if (core.startsWith(wrapperStart) && core.endsWith(wrapperEnd) && core.length >= (wrapperStart.length + wrapperEnd.length)) {
          const unwrapped = core.substring(wrapperStart.length, core.length - wrapperEnd.length);
          const fullRes = leadingMatch + unwrapped + trailingMatch;
          textarea.value = val.substring(0, start) + fullRes + val.substring(end);
          textarea.selectionStart = start + leadingMatch.length;
          textarea.selectionEnd = start + leadingMatch.length + unwrapped.length;
        } else {
          const wrapped = leadingMatch + wrapperStart + core + wrapperEnd + trailingMatch;
          textarea.value = val.substring(0, start) + wrapped + val.substring(end);
          textarea.selectionStart = start + leadingMatch.length;
          textarea.selectionEnd = start + leadingMatch.length + wrapperStart.length + core.length + wrapperEnd.length;
        }
      } else {
        const wrapped = wrapperStart + selected + wrapperEnd;
        textarea.value = val.substring(0, start) + wrapped + val.substring(end);
        textarea.selectionStart = start;
        textarea.selectionEnd = start + wrapped.length;
      }
    } else {
      const inserted = wrapperStart + defaultText + wrapperEnd;
      textarea.value = val.substring(0, start) + inserted + val.substring(end);
      textarea.selectionStart = start + wrapperStart.length;
      textarea.selectionEnd = start + wrapperStart.length + defaultText.length;
    }

    textarea.focus();
    saveUndoSnapshot();
    if (typeof updateEditorImageCards === 'function') updateEditorImageCards();
    if (typeof schedulePreview === 'function') schedulePreview();
    if (typeof autoSaveState === 'function') autoSaveState();
  };

  init();

  function init() {
    try { setupEventListeners(); } catch(e) { console.error("setupEventListeners err:", e); }
    try { setupDiagramStudioModal(); } catch(e) { console.error("setupDiagramStudioModal err:", e); }
    try { setupLayoutAndZoom(); } catch(e) { console.error("setupLayoutAndZoom err:", e); }
    try { setupSmartPasteHandler(); } catch(e) { console.error("setupSmartPasteHandler err:", e); }
    try { setupLibraryModal(); } catch(e) { console.error("setupLibraryModal err:", e); }
    try { setupImageModal(); } catch(e) { console.error("setupImageModal err:", e); }
    try { loadActiveDocOrFirst(); } catch(e) { console.error("loadActiveDocOrFirst err:", e); }
  }

  // --- Multi-Document Library Storage ---
  function getLibrary() {
    try {
      const raw = localStorage.getItem(LIBRARY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLibrary(lib) {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
      updateLibraryCount();
    } catch (e) {
      console.error("Failed to save library", e);
    }
  }

  function updateLibraryCount() {
    const lib = getLibrary();
    const count = Object.keys(lib).length;
    if (savedNotesCount) savedNotesCount.textContent = count;
  }

  function generateDocId() {
    return "doc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  }

  function loadActiveDocOrFirst() {
    const lib = getLibrary();
    const storedActiveId = localStorage.getItem(ACTIVE_DOC_KEY);

    if (storedActiveId && lib[storedActiveId]) {
      loadDocById(storedActiveId);
    } else {
      const keys = Object.keys(lib);
      if (keys.length > 0) {
        loadDocById(keys[0]);
      } else {
        if (notesTextarea && notesTextarea.value && notesTextarea.value.trim().length > 0) {
          updatePreview();
          autoSaveState(true);
        } else {
          loadInitialSample();
        }
      }
    }
    updateLibraryCount();
  }

  function loadDocById(docId) {
    const lib = getLibrary();
    const doc = lib[docId];
    if (!doc) return;

    activeDocId = docId;
    localStorage.setItem(ACTIVE_DOC_KEY, docId);

    if (doc.content !== undefined) setEditorContent(doc.content);
    if (doc.subject !== undefined && subjectInput) subjectInput.value = doc.subject;
    if (doc.lecture !== undefined && lectureInput) lectureInput.value = doc.lecture;
    if (doc.font_family && fontSelect) fontSelect.value = doc.font_family;
    if (doc.paper_style && paperSelect) paperSelect.value = doc.paper_style;
    if (doc.header_mode && headerModeSelect) headerModeSelect.value = doc.header_mode;
    if (doc.logo_type && logoSelect) logoSelect.value = doc.logo_type;
    if (doc.custom_brand && customBrandText) customBrandText.value = doc.custom_brand;

    if (doc.subject_color && colorSubjectInput) colorSubjectInput.value = doc.subject_color;
    if (doc.lecture_color && colorLectureInput) colorLectureInput.value = doc.lecture_color;
    if (doc.body_color && colorBodyInput) colorBodyInput.value = doc.body_color;
    if (doc.section_color && colorSectionInput) colorSectionInput.value = doc.section_color;
    if (doc.subheading_color && colorSubheadingInput) colorSubheadingInput.value = doc.subheading_color;
    if (doc.sidebar_color && colorSidebarInput) colorSidebarInput.value = doc.sidebar_color;

    if (doc.show_sidebar !== undefined && toggleSidebar) toggleSidebar.checked = doc.show_sidebar;
    if (doc.sidebar_text && sidebarTextInput) sidebarTextInput.value = doc.sidebar_text;
    if (doc.show_footer !== undefined && toggleFooter) toggleFooter.checked = doc.show_footer;
    if (doc.footer_left && footerLeftInput) footerLeftInput.value = doc.footer_left;
    if (doc.footer_right && footerRightInput) footerRightInput.value = doc.footer_right;

    const top = doc.margin_top !== undefined ? doc.margin_top : 8;
    const bot = doc.margin_bottom !== undefined ? doc.margin_bottom : 8;
    const lft = doc.margin_left !== undefined ? doc.margin_left : 8;
    const rgt = doc.margin_right !== undefined ? doc.margin_right : 8;
    setMargins(top, bot, lft, rgt);

    if (doc.font_size !== undefined && sliderFontSize) sliderFontSize.value = doc.font_size;
    if (doc.letter_spacing !== undefined && sliderLetterSpacing) sliderLetterSpacing.value = doc.letter_spacing;
    if (doc.word_spacing !== undefined && sliderWordSpacing) sliderWordSpacing.value = doc.word_spacing;
    if (doc.line_height !== undefined && sliderLineHeight) sliderLineHeight.value = doc.line_height;
    if (doc.realism && realismSelect) realismSelect.value = doc.realism;
    updateTypographyDisplays();

    if (doc.zoom && zoomSelect) zoomSelect.value = doc.zoom;
    if (doc.mode) setViewMode(doc.mode);

    updateLogoBrandVisibility();
    updateSidebarVisibility();
    updateFooterVisibility();

    if (doc.draft_mode !== undefined) {
      isDraftMode = !!doc.draft_mode;
    } else {
      isDraftMode = false;
    }
    updateDraftButtonState();

    if (typeof doc.cursor_pos === "number" && notesTextarea) {
      notesTextarea.selectionStart = notesTextarea.selectionEnd = doc.cursor_pos;
    }

    // Initialize Undo/Redo history stack for the loaded note
    undoStack.length = 0;
    redoStack.length = 0;
    lastRecordedText = notesTextarea ? notesTextarea.value : "";
    undoStack.push({
      text: lastRecordedText,
      start: notesTextarea ? (notesTextarea.selectionStart || 0) : 0,
      end: notesTextarea ? (notesTextarea.selectionEnd || 0) : 0
    });
    updateUndoRedoButtonsState();

    updatePreview();
    if (typeof updateEditorImageCards === 'function') updateEditorImageCards();
    setSaveStatus("Loaded: " + (doc.lecture || "Note"), false);
  }

  function autoSaveState(immediate = false) {
    const doSave = () => {
      try {
        if (!activeDocId) {
          activeDocId = generateDocId();
          localStorage.setItem(ACTIVE_DOC_KEY, activeDocId);
        }

        const lib = getLibrary();
        lib[activeDocId] = {
          id: activeDocId,
          content: notesTextarea ? notesTextarea.value : "",
          cursor_pos: notesTextarea ? (notesTextarea.selectionStart || 0) : 0,
          subject: subjectInput ? (subjectInput.value || "Indian Polity") : "Indian Polity",
          lecture: lectureInput ? (lectureInput.value || "Lecture Notes") : "Lecture Notes",
          font_family: fontSelect ? fontSelect.value : "Coming Soon",
          paper_style: paperSelect ? paperSelect.value : "plain",
          header_mode: headerModeSelect ? headerModeSelect.value : "first_page",
          logo_type: logoSelect ? logoSelect.value : "pw",
          custom_brand: customBrandText ? customBrandText.value : "PW ONLYIAS",
          subject_color: colorSubjectInput ? colorSubjectInput.value : "#dc2626",
          lecture_color: colorLectureInput ? colorLectureInput.value : "#2563eb",
          body_color: colorBodyInput ? colorBodyInput.value : "#111827",
          section_color: colorSectionInput ? colorSectionInput.value : "#dc2626",
          subheading_color: colorSubheadingInput ? colorSubheadingInput.value : "#2563eb",
          sidebar_color: colorSidebarInput ? colorSidebarInput.value : "#059669",
          show_sidebar: toggleSidebar ? toggleSidebar.checked : true,
          sidebar_text: sidebarTextInput ? (sidebarTextInput.value || "Space for Notes") : "Space for Notes",
          show_footer: toggleFooter ? toggleFooter.checked : true,
          footer_left: footerLeftInput ? (footerLeftInput.value || "khajan singh") : "khajan singh",
          footer_right: footerRightInput ? (footerRightInput.value || "unit 1") : "unit 1",
          margin_top: marginTopInput ? (marginTopInput.value || 8) : 8,
          margin_bottom: marginBottomInput ? (marginBottomInput.value || 8) : 8,
          margin_left: marginLeftInput ? (marginLeftInput.value || 8) : 8,
          margin_right: marginRightInput ? (marginRightInput.value || 8) : 8,
          mode: currentMode,
          zoom: zoomSelect ? zoomSelect.value : "auto",
          draft_mode: isDraftMode,
          font_size: sliderFontSize ? parseFloat(sliderFontSize.value) : 11.5,
          letter_spacing: sliderLetterSpacing ? parseFloat(sliderLetterSpacing.value) : 0.0,
          word_spacing: sliderWordSpacing ? parseFloat(sliderWordSpacing.value) : 1.0,
          line_height: sliderLineHeight ? parseFloat(sliderLineHeight.value) : 1.55,
          realism: realismSelect ? realismSelect.value : "natural",
          updated_at: new Date().toISOString()
        };

        saveLibrary(lib);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSaveStatus(`Saved (${timeStr})`, false);
      } catch (e) {
        console.error("Auto-save failed", e);
      }
    };

    if (immediate) {
      if (saveTimeout) clearTimeout(saveTimeout);
      doSave();
    } else {
      setSaveStatus("Saving...", true);
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(doSave, 200);
    }
  }

  function setSaveStatus(text, isSaving) {
    if (!saveStatusText || !autosaveStatus) return;
    saveStatusText.textContent = text;
    if (isSaving) {
      autosaveStatus.classList.add("saving");
    } else {
      autosaveStatus.classList.remove("saving");
    }
  }

  // --- Notes Library Modal Controller ---
  function setupLibraryModal() {
    if (btnOpenLibrary) {
      btnOpenLibrary.addEventListener("click", openLibraryModal);
    }
    if (btnCloseLibrary) {
      btnCloseLibrary.addEventListener("click", closeLibraryModal);
    }
    if (btnCloseLibraryFooter) {
      btnCloseLibraryFooter.addEventListener("click", closeLibraryModal);
    }
    if (librarySearchInput) {
      librarySearchInput.addEventListener("input", renderLibraryList);
    }
    if (btnLibraryNewNote) {
      btnLibraryNewNote.addEventListener("click", () => {
        closeLibraryModal();
        createNewNoteDocument();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && libraryModal && !libraryModal.classList.contains("hidden")) {
        closeLibraryModal();
      }
    });
  }

  function openLibraryModal() {
    autoSaveState();
    renderLibraryList();
    libraryModal.classList.remove("hidden");
    if (librarySearchInput) {
      librarySearchInput.value = "";
      librarySearchInput.focus();
    }
  }

  function closeLibraryModal() {
    libraryModal.classList.add("hidden");
  }

  function renderLibraryList() {
    const lib = getLibrary();
    const query = (librarySearchInput ? librarySearchInput.value.toLowerCase().trim() : "");
    const docIds = Object.keys(lib).reverse();

    savedNotesList.innerHTML = "";

    if (docIds.length === 0) {
      savedNotesList.innerHTML = `<div class="empty-library-msg">No saved notes found. Create a new note to start!</div>`;
      return;
    }

    let matchCount = 0;

    docIds.forEach((id) => {
      const doc = lib[id];
      const title = doc.lecture || "Untitled Lecture";
      const subject = doc.subject || "General";
      const content = doc.content || "";

      if (query && !title.toLowerCase().includes(query) && !subject.toLowerCase().includes(query) && !content.toLowerCase().includes(query)) {
        return;
      }

      matchCount++;
      const isActive = id === activeDocId;
      const dateStr = doc.updated_at ? new Date(doc.updated_at).toLocaleString() : "Just now";

      const itemEl = document.createElement("div");
      itemEl.className = `saved-note-item ${isActive ? "active-doc" : ""}`;
      itemEl.innerHTML = `
        <div class="note-item-left">
          <div class="note-item-header">
            <span class="note-item-title">${escapeHtml(title)}</span>
            <span class="note-item-badge">${escapeHtml(subject)}</span>
            ${isActive ? '<span style="color:#10b981;font-size:10px;font-weight:700;">● Active</span>' : ''}
          </div>
          <div class="note-item-meta">
            <span><i data-lucide="clock" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> ${dateStr}</span>
            <span>•</span>
            <span>${content.length} characters</span>
          </div>
        </div>
        <div class="note-item-actions">
          <button class="btn-open-doc" data-id="${id}"><i data-lucide="folder-open"></i> Open</button>
          <button class="btn-delete-doc" data-id="${id}" title="Delete this note"><i data-lucide="trash-2"></i></button>
        </div>
      `;

      savedNotesList.appendChild(itemEl);
    });

    if (matchCount === 0) {
      savedNotesList.innerHTML = `<div class="empty-library-msg">No notes match "${escapeHtml(query)}"</div>`;
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    savedNotesList.querySelectorAll(".btn-open-doc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadDocById(id);
        closeLibraryModal();
      });
    });

    savedNotesList.querySelectorAll(".btn-delete-doc").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        deleteDocById(id);
      });
    });
  }

  function deleteDocById(id) {
    const lib = getLibrary();
    const docTitle = lib[id] ? lib[id].lecture : "this note";
    if (confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      delete lib[id];
      saveLibrary(lib);

      if (activeDocId === id) {
        const remaining = Object.keys(lib);
        if (remaining.length > 0) {
          loadDocById(remaining[0]);
        } else {
          createNewNoteDocument();
        }
      }
      renderLibraryList();
    }
  }

  function createNewNoteDocument() {
    autoSaveState();
    const newId = generateDocId();
    activeDocId = newId;
    setEditorContent("# NEW LECTURE TOPIC\n\nStart typing your notes here or paste ChatGPT notes...\n");
    subjectInput.value = "Subject Name";
    lectureInput.value = "New Lecture Notes";
    setMargins("8", "8", "8", "8");

    updatePreview();
    autoSaveState();
    updateLibraryCount();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function setupLayoutAndZoom() {
    btnToggleSidebar.addEventListener("click", () => {
      if (currentMode === "settings-preview" || currentMode === "side" || currentMode === "preview") {
        setViewMode("split");
      } else {
        setViewMode("side");
      }
    });

    if (btnQuickFullView) {
      btnQuickFullView.addEventListener("click", () => {
        if (currentMode === "settings-preview") {
          setViewMode("split");
        } else {
          setViewMode("settings-preview");
        }
      });
    }

    modeSettingsPreview.addEventListener("click", () => setViewMode("settings-preview"));
    modeSplit.addEventListener("click", () => setViewMode("split"));
    modeSide.addEventListener("click", () => setViewMode("side"));
    if (modeEditor) modeEditor.addEventListener("click", () => setViewMode("editor"));
    modePreview.addEventListener("click", () => setViewMode("preview"));

    zoomSelect.addEventListener("change", () => {
      sendZoomToIframe(zoomSelect.value);
      autoSaveState();
    });

    const zoomLevels = ["0.5", "0.65", "0.75", "0.85", "1.0", "1.2"];

    zoomIn.addEventListener("click", () => {
      const cur = zoomSelect.value;
      const idx = zoomLevels.indexOf(cur);
      if (idx !== -1 && idx < zoomLevels.length - 1) {
        zoomSelect.value = zoomLevels[idx + 1];
      } else {
        zoomSelect.value = "1.0";
      }
      sendZoomToIframe(zoomSelect.value);
      autoSaveState();
    });

    zoomOut.addEventListener("click", () => {
      const cur = zoomSelect.value;
      const idx = zoomLevels.indexOf(cur);
      if (idx > 0) {
        zoomSelect.value = zoomLevels[idx - 1];
      } else {
        zoomSelect.value = "0.65";
      }
      sendZoomToIframe(zoomSelect.value);
      autoSaveState();
    });

    previewFrame.addEventListener("load", () => {
      sendZoomToIframe(zoomSelect.value);
    });
  }

  function setViewMode(mode) {
    currentMode = mode;
    appLayout.classList.remove("view-side", "view-preview", "view-settings-preview", "view-editor");
    modeSettingsPreview.classList.remove("active");
    modeSplit.classList.remove("active");
    modeSide.classList.remove("active");
    if (modeEditor) modeEditor.classList.remove("active");
    modePreview.classList.remove("active");

    if (mode === "settings-preview") {
      appLayout.classList.add("view-settings-preview");
      modeSettingsPreview.classList.add("active");
      if (btnQuickFullView) btnQuickFullView.innerHTML = '<i data-lucide="columns-3"></i> Show Editor';
    } else if (mode === "side") {
      appLayout.classList.add("view-side");
      modeSide.classList.add("active");
      if (btnQuickFullView) btnQuickFullView.innerHTML = '<i data-lucide="maximize"></i> Full Output View';
    } else if (mode === "editor") {
      appLayout.classList.add("view-editor");
      if (modeEditor) modeEditor.classList.add("active");
      if (btnQuickFullView) btnQuickFullView.innerHTML = '<i data-lucide="columns-3"></i> Show Preview';
    } else if (mode === "preview") {
      appLayout.classList.add("view-preview");
      modePreview.classList.add("active");
      if (btnQuickFullView) btnQuickFullView.innerHTML = '<i data-lucide="columns-3"></i> Show Editor';
    } else {
      modeSplit.classList.add("active");
      if (btnQuickFullView) btnQuickFullView.innerHTML = '<i data-lucide="maximize"></i> Full Output View';
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    setTimeout(() => {
      sendZoomToIframe(zoomSelect.value);
    }, 100);

    autoSaveState();
  }

  function sendZoomToIframe(zoom) {
    if (previewFrame.contentWindow) {
      previewFrame.contentWindow.postMessage({ type: "SET_ZOOM", zoom: zoom }, "*");
      try {
        previewFrame.contentWindow.dispatchEvent(new Event("resize"));
      } catch (e) {}
    }
  }

  function parseBoxDrawingOrConvergence(rawText) {
    const rawLines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (!rawLines.length) return null;

    const hasBoxChars = rawLines.some(l => /[─┌┐└┘├┤┬┴┼│\+\|]/.test(l));
    const hasArrows = rawLines.some(l => /(?:-->|->|→|➔|=>|─+>|─+→|\+─+>|\+─+→|\+\s*>)/.test(l));

    if (!hasBoxChars && !hasArrows) return null;

    // Check for compound diagram: convergence lines at top, downward pipeline below
    const convergenceLines = [];
    const downwardLines = [];
    let inDownwardPhase = false;

    for (const l of rawLines) {
      if (/^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/vV]+$/.test(l) && (/[▼▲↓↑│vV]/.test(l) || l.includes("->"))) {
        inDownwardPhase = true;
        continue;
      }

      if (inDownwardPhase) {
        const cleanNode = l.replace(/^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$/g, "").trim();
        if (cleanNode && !/^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$/.test(cleanNode)) {
          downwardLines.push(cleanNode);
        }
      } else {
        if (/[─┌┐└┘├┤┬┴┼]/.test(l) || /(?:─┼|─\+|─┬|─┐|─┘|──>)/.test(l)) {
          convergenceLines.push(l);
        } else if (/(?:-->|->|→|➔|=>)/.test(l)) {
          convergenceLines.push(l);
        } else if (downwardLines.length > 0 || convergenceLines.length >= 2) {
          inDownwardPhase = true;
          const cleanNode = l.replace(/^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$/g, "").trim();
          if (cleanNode) downwardLines.push(cleanNode);
        } else {
          convergenceLines.push(l);
        }
      }
    }

    const inputs = [];
    const pipelineTargets = [];

    for (const l of convergenceLines) {
      const matchArrow = l.match(/(?:─*┼\s*─*[→>]|─*\+\s*─*[→>]|─*├\s*─*[→>]|[─\-]+[→>])/);
      if (matchArrow) {
        const leftPart = l.substring(0, matchArrow.index).trim();
        const rightPart = l.substring(matchArrow.index + matchArrow[0].length).trim();

        const cleanLeft = leftPart.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
        if (cleanLeft) inputs.push(cleanLeft);

        if (rightPart) {
          const subSteps = rightPart.split(/\s*(?:-->|->|→|➔|=>|─+>|─+→)\s*/);
          for (const s of subSteps) {
            const cleanS = s.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
            if (cleanS) pipelineTargets.push(cleanS);
          }
        }
      } else {
        const cleanL = l.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
        if (cleanL) inputs.push(cleanL);
      }
    }

    if (inputs.length >= 2 && pipelineTargets.length > 0) {
      const targetFirst = pipelineTargets[0];
      const allSubsequent = pipelineTargets.slice(1).concat(downwardLines);

      if (downwardLines.length > 0 || allSubsequent.length >= 2) {
        const mermaid = ["graph TD"];
        for (let idx = 0; idx < inputs.length; idx++) {
          mermaid.push(`    in${idx}["${inputs[idx]}"] --> tgt0["${targetFirst}"]`);
        }
        let lastId = "tgt0";
        for (let sIdx = 0; sIdx < allSubsequent.length; sIdx++) {
          const currId = `step${sIdx}`;
          mermaid.push(`    ${lastId} --> ${currId}["${allSubsequent[sIdx]}"]`);
          lastId = currId;
        }
        return mermaid.join("\n");
      } else {
        const mermaid = ["graph LR"];
        for (let idx = 0; idx < inputs.length; idx++) {
          mermaid.push(`    in${idx}["${inputs[idx]}"] --> tgt0["${targetFirst}"]`);
        }
        for (let pIdx = 0; pIdx < pipelineTargets.length - 1; pIdx++) {
          const t1 = pipelineTargets[pIdx];
          const t2 = pipelineTargets[pIdx + 1];
          mermaid.push(`    tgt${pIdx}["${t1}"] --> tgt${pIdx + 1}["${t2}"]`);
        }
        return mermaid.join("\n");
      }
    }

    let source = null;
    const targets = [];
    for (const l of rawLines) {
      const matchArrow = l.match(/(?:─*┬\s*─*[→>]|─*┼\s*─*[→>]|─*├\s*─*[→>]|─*└\s*─*[→>]|─*┌\s*─*[→>]|[─\-]+[→>])/);
      if (matchArrow) {
        const leftPart = l.substring(0, matchArrow.index).trim();
        const rightPart = l.substring(matchArrow.index + matchArrow[0].length).trim();
        const cleanLeft = leftPart.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
        const cleanRight = rightPart.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
        if (cleanLeft && !source) source = cleanLeft;
        if (cleanRight) targets.push(cleanRight);
      } else {
        const cleanL = l.replace(/^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$/g, "").trim();
        if (cleanL && !source) source = cleanL;
        else if (cleanL) targets.push(cleanL);
      }
    }

    if (source && targets.length >= 2) {
      const mermaid = ["graph LR"];
      for (let tIdx = 0; tIdx < targets.length; tIdx++) {
        mermaid.push(`    src["${source}"] --> tgt${tIdx}["${targets[tIdx]}"]`);
      }
      return mermaid.join("\n");
    }

    return null;
  }

  function parseAsciiSlashTree(rawText) {
    const rawLines = rawText.split("\n").map(l => l.trimEnd()).filter(l => l.trim().length > 0);
    if (!rawLines.length) return null;

    const hasSlashConnector = rawLines.some(l => /^[\s/\\|_\-]+$/.test(l) && /[/\\|]/.test(l));
    const hasNodes = rawLines.some(l => /[A-Za-z0-9]/.test(l));
    if (!hasSlashConnector || !hasNodes) return null;

    const levels = [];
    for (const l of rawLines) {
      if (/^[\s/\\|_\-]+$/.test(l) && /[/\\|]/.test(l)) {
        continue;
      }

      const nodesInLine = [];
      const regex = /\S+/g;
      let m;
      while ((m = regex.exec(l)) !== null) {
        const tok = m[0].trim();
        if (tok && !/^[/\\|_\-]+$/.test(tok)) {
          const centerCol = (m.index + regex.lastIndex) / 2.0;
          nodesInLine.push({
            text: tok,
            start: m.index,
            end: regex.lastIndex,
            center: centerCol
          });
        }
      }
      if (nodesInLine.length > 0) {
        levels.push(nodesInLine);
      }
    }

    if (levels.length < 2) return null;

    const edges = [];
    for (let lvlIdx = 1; lvlIdx < levels.length; lvlIdx++) {
      const parentLevel = levels[lvlIdx - 1];
      const currentLevel = levels[lvlIdx];

      if (parentLevel.length === 1) {
        const p = parentLevel[0];
        for (const c of currentLevel) {
          edges.push([p.text, c.text]);
        }
      } else {
        const midpoints = [];
        for (let idxM = 0; idxM < parentLevel.length - 1; idxM++) {
          midpoints.push((parentLevel[idxM].center + parentLevel[idxM + 1].center) / 2.0);
        }

        for (const c of currentLevel) {
          let assignedPIdx = 0;
          while (assignedPIdx < midpoints.length && c.center > midpoints[assignedPIdx]) {
            assignedPIdx++;
          }
          edges.push([parentLevel[assignedPIdx].text, c.text]);
        }
      }
    }

    if (!edges.length) return null;

    const isShortTreeNode = edges.every(pair => pair[0].length <= 2 && pair[1].length <= 2);
    const nodeIdMap = {};

    function getId(name) {
      if (!nodeIdMap[name]) {
        let cleanId = name.replace(/[^A-Za-z0-9_]/g, "_");
        if (!cleanId || /^\d/.test(cleanId)) cleanId = "node_" + cleanId;
        if (Object.values(nodeIdMap).includes(cleanId)) {
          cleanId = `${cleanId}_${Object.keys(nodeIdMap).length}`;
        }
        nodeIdMap[name] = cleanId;
      }
      return nodeIdMap[name];
    }

    const mermaid = ["graph TD"];
    for (const [pName, cName] of edges) {
      const pid = getId(pName);
      const cid = getId(cName);
      const pLabel = isShortTreeNode ? `(("${pName}"))` : `["${pName}"]`;
      const cLabel = isShortTreeNode ? `(("${cName}"))` : `["${cName}"]`;
      mermaid.push(`    ${pid}${pLabel} --> ${cid}${cLabel}`);
    }

    return mermaid.join("\n");
  }

  function formatPastedPlainText(text) {
    const lines = text.split("\n");
    const formatted = [];
    let i = 0;
    let detectedFlowSteps = null;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if starting an arrow diagram / box drawing diagram / vertical flowchart / slash tree
      let isArrowStart = false;
      if (!trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !trimmed.startsWith("`")) {
        if (/[─┌┐└┘├┤┬┴┼│]/.test(trimmed) || /(?:-->|->|→|➔|=>|─┼|─\+|─┬|─┐|─┘|──>)/.test(trimmed)) {
          isArrowStart = true;
        } else if (i + 1 < lines.length) {
          const nextL = lines[i + 1].trim();
          if (trimmed.length < 45 && !trimmed.endsWith(".") && !trimmed.endsWith(":") && (
            (/^[\s/\\|_\-]+$/.test(nextL) && /[/\\|]/.test(nextL)) ||
            /(?:-->|->|→|➔|=>|─┼|─\+|─┬|─┐|─┘|──>)/.test(nextL) ||
            /[─┌┐└┘├┤┬┴┼│▼▲↓↑]/.test(nextL)
          )) {
            isArrowStart = true;
          }
        }
      }

      if (isArrowStart) {
        const diag = [];
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("`")) {
          diag.push(lines[i]);
          i++;
        }

        const diagRaw = diag.join("\n").trim();
        const convMermaid = parseBoxDrawingOrConvergence(diagRaw);
        if (convMermaid) {
          formatted.push("\n```diagram\n" + convMermaid + "\n```\n");
        } else {
          const slashTree = parseAsciiSlashTree(diagRaw);
          if (slashTree) {
            formatted.push("\n```diagram\n" + slashTree + "\n```\n");
          } else {
            const extractedSteps = [];
            for (const rawL of diag) {
              const cleaned = rawL.trim();
              if (!/^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$/.test(cleaned)) {
                const cleanStep = cleaned.replace(/^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$/g, "").trim();
                if (cleanStep) {
                  extractedSteps.push(cleanStep);
                }
              }
            }

            if (extractedSteps.length >= 2) {
              detectedFlowSteps = extractedSteps;
              const chainText = extractedSteps.map(s => `[${s}]`).join(" -> ");
              formatted.push("\n```flowchart\n" + chainText + "\n```\n");
            } else {
              formatted.push("\n```diagram\n" + diagRaw + "\n```\n");
            }
          }
        }
        continue;
      }

      formatted.push(line);
      i++;
    }

    if (detectedFlowSteps && detectedFlowSteps.length >= 2) {
      if (typeof window.setInteractiveFlowSteps === "function") {
        window.setInteractiveFlowSteps(detectedFlowSteps);
      }
    }

    return formatted.join("\n");
  }

  async function uploadAndInsertImageDirectly(fileOrDataUrl, defaultCaption = "Screenshot | width: 75% | align: center") {
    try {
      if (previewStatus) previewStatus.textContent = "Uploading image...";
      let finalUrl = fileOrDataUrl;
      if (typeof fileOrDataUrl !== "string" || !fileOrDataUrl.startsWith("/static/")) {
        const fd = new FormData();
        if (typeof fileOrDataUrl === "string") {
          fd.append("image_data", fileOrDataUrl);
        } else {
          fd.append("file", fileOrDataUrl);
        }

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: fd
        });

        if (!res.ok) {
          throw new Error("Upload failed with status " + res.status);
        }

        const data = await res.json();
        if (data && data.url) finalUrl = data.url;
      }

      const mdTag = `\n![${defaultCaption}](${finalUrl})\n`;
      insertTextAtCursor(mdTag);
      lastActiveImageInfo = {
        url: finalUrl,
        caption: defaultCaption,
        fullMatch: mdTag.trim()
      };
      if (previewStatus) previewStatus.textContent = "Synced";
      schedulePreview();
      autoSaveState();
    } catch (err) {
      console.warn("Direct upload fallback to data URL:", err);
      if (typeof fileOrDataUrl === "string") {
        const mdTag = `\n![${defaultCaption}](${fileOrDataUrl})\n`;
        insertTextAtCursor(mdTag);
        lastActiveImageInfo = {
          url: fileOrDataUrl,
          caption: defaultCaption,
          fullMatch: mdTag.trim()
        };
        if (previewStatus) previewStatus.textContent = "Synced";
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const mdTag = `\n![${defaultCaption}](${ev.target.result})\n`;
          insertTextAtCursor(mdTag);
          lastActiveImageInfo = {
            url: ev.target.result,
            caption: defaultCaption,
            fullMatch: mdTag.trim()
          };
          if (previewStatus) previewStatus.textContent = "Synced";
        };
        reader.readAsDataURL(fileOrDataUrl);
      }
    }
  }

  function setupSmartPasteHandler() {
    let isPastingImageLock = false;

    async function handlePasteEvent(e) {
      if (!e.clipboardData) return;

      // 1. Direct Image Files (e.g. Snipping tool, PrtScn, file copy)
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          if (file && file.type && file.type.startsWith("image/")) {
            e.preventDefault();
            e.stopPropagation();
            if (isPastingImageLock) return;
            isPastingImageLock = true;
            await uploadAndInsertImageDirectly(file, (file.name ? file.name.replace(/\.[^/.]+$/, "") : "Screenshot") + " | width: 75% | align: center");
            isPastingImageLock = false;
            return;
          }
        }
      }

      // 2. Direct Clipboard Items
      if (e.clipboardData.items && e.clipboardData.items.length > 0) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item && item.type && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              e.stopPropagation();
              if (isPastingImageLock) return;
              isPastingImageLock = true;
              await uploadAndInsertImageDirectly(file, "Screenshot | width: 75% | align: center");
              isPastingImageLock = false;
              return;
            }
          }
        }
      }

      // 3. HTML with embedded image (e.g. copied from browser or chat)
      const htmlData = e.clipboardData.getData("text/html");
      if (htmlData && htmlData.includes("<img")) {
        const m = htmlData.match(/src=["'](data:image\/[^"']+|https?:[^"']+)["']/i);
        if (m && m[1]) {
          e.preventDefault();
          e.stopPropagation();
          if (isPastingImageLock) return;
          isPastingImageLock = true;
          await uploadAndInsertImageDirectly(m[1], "Pasted Image | width: 75% | align: center");
          isPastingImageLock = false;
          return;
        }
      }

      // 4. Formatted HTML / Text processing
      const plainText = e.clipboardData.getData("text/plain");

      if (htmlData && (htmlData.includes("<h") || htmlData.includes("<li") || htmlData.includes("<table") || htmlData.includes("<pre"))) {
        e.preventDefault();
        e.stopPropagation();
        const mdText = convertHtmlToMarkdown(htmlData);
        insertTextAtCursor(mdText);
      } else if (
        plainText &&
        (/[─┌┐└┘├┤┬┴┼│▼▲↓↑]/.test(plainText) ||
          /(?:-->|->|→|➔|=>|─┼|─\+|─┬|─┐|─┘|──>)/.test(plainText) ||
          plainText.includes("├──") ||
          plainText.includes("└──") ||
          plainText.includes("/ \\") ||
          plainText.includes("/  \\") ||
          plainText.includes("/   \\") ||
          /\n\s*\/[\\|\s]+\n/.test(plainText))
      ) {
        e.preventDefault();
        e.stopPropagation();
        const formattedText = formatPastedPlainText(plainText);
        insertTextAtCursor(formattedText);
      } else if (plainText) {
        // Clean multiple blank lines (> 2 newlines) so content fits snugly on A4 page without empty dead space
        const cleaned = plainText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
        e.preventDefault();
        e.stopPropagation();
        insertTextAtCursor(cleaned);
      }
    }

    if (notesTextarea) {
      notesTextarea.addEventListener("paste", handlePasteEvent);
    }

    // Drag and drop image directly into editor
    const editorPanel = document.getElementById("editor-panel");
    [notesTextarea, editorPanel].forEach(el => {
      if (!el) return;
      el.addEventListener("dragover", (e) => {
        if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
        }
      });
      el.addEventListener("drop", (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            e.preventDefault();
            uploadAndInsertImageDirectly(file, (file.name ? file.name.replace(/\.[^/.]+$/, "") : "Screenshot") + " | width: 75% | align: center");
          }
        }
      });
    });
  }

  function convertHtmlToMarkdown(htmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, "text/html");

    function traverse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";

      const tag = node.tagName.toLowerCase();
      let inner = "";
      for (const child of node.childNodes) {
        inner += traverse(child);
      }

      switch (tag) {
        case "h1":
        case "h2":
          return `\n# ${inner.trim()}\n\n`;
        case "h3":
          return `\n## ${inner.trim()}\n\n`;
        case "h4":
        case "h5":
        case "h6":
          return `\n### ${inner.trim()}\n\n`;
        case "p":
          return `\n${inner.trim()}\n\n`;
        case "li":
          return `- ${inner.trim()}\n`;
        case "ul":
        case "ol":
          return `\n${inner}\n`;
        case "strong":
        case "b":
          return `**${inner}**`;
        case "em":
        case "i":
          return `*${inner}*`;
        case "code":
          if (node.parentNode && node.parentNode.tagName.toLowerCase() === "pre") {
            return inner;
          }
          return `\`${inner}\``;
        case "pre": {
          const preText = inner.trim();
          const convMermaid = parseBoxDrawingOrConvergence(preText);
          if (convMermaid) {
            return `\n\`\`\`diagram\n${convMermaid}\n\`\`\`\n\n`;
          }
          if (
            /[─┌┐└┘├┤┬┴┼│▼▲↓↑]/.test(preText) ||
            /(?:-->|->|→|➔|=>|─┼|─\+|─┬|─┐|─┘|──>)/.test(preText) ||
            (preText.includes("|") && (preText.includes("v") || preText.includes("V") || preText.includes("▼")))
          ) {
            const preLines = preText.split("\n");
            const steps = [];
            for (const pl of preLines) {
              const tr = pl.trim();
              if (tr && !/^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$/.test(tr)) {
                const c = tr.replace(/^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$/g, "").trim();
                if (c) steps.push(c);
              }
            }
            if (steps.length >= 2) {
              if (typeof window.setInteractiveFlowSteps === "function") {
                window.setInteractiveFlowSteps(steps);
              }
              return `\n\`\`\`flowchart\n${steps.map(s => `[${s}]`).join(" -> ")}\n\`\`\`\n\n`;
            }
            return `\n\`\`\`diagram\n${preText}\n\`\`\`\n\n`;
          }
          return `\n\`\`\`code\n${preText}\n\`\`\`\n\n`;
        }
        case "table":
          return "\n" + parseHtmlTable(node) + "\n\n";
        default:
          return inner;
      }
    }

    function parseHtmlTable(tableEl) {
      const rows = Array.from(tableEl.querySelectorAll("tr"));
      if (!rows.length) return "";
      const tableLines = [];

      rows.forEach((r, idx) => {
        const cells = Array.from(r.querySelectorAll("th, td")).map(c => c.textContent.trim().replace(/\|/g, "\\|"));
        if (cells.length) {
          tableLines.push(`| ${cells.join(" | ")} |`);
          if (idx === 0) {
            tableLines.push(`| ${cells.map(() => "---").join(" | ")} |`);
          }
        }
      });
      return tableLines.join("\n");
    }

    return traverse(doc.body).replace(/\n{3,}/g, "\n\n").trim();
  }

  async function autoFormatContent() {
    const raw = notesTextarea.value;
    if (!raw.trim()) return;

    showLoading("Auto-Formatting ChatGPT Notes...", "Organizing Headings, Lists and Diagrams");
    try {
      const fd = new FormData();
      fd.append("text", raw);
      const res = await fetch("/api/auto-format-text", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setEditorContent(data.formatted_text);
        if (data.subject && (!subjectInput.value || subjectInput.value === "General Studies" || subjectInput.value === "Indian Polity" || subjectInput.value === "Subject Name")) {
          subjectInput.value = data.subject;
        }
        if (data.lecture && (!lectureInput.value || lectureInput.value.includes("Historical Background") || lectureInput.value === "New Lecture Notes")) {
          lectureInput.value = data.lecture;
        }
        schedulePreview();
        autoSaveState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      hideLoading();
    }
  }

  function setupEventListeners() {
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        handleFileUpload(e.target.files[0]);
      }
    });

    if (btnToggleDraft) {
      btnToggleDraft.addEventListener("click", () => {
        isDraftMode = !isDraftMode;
        updateDraftButtonState();
        schedulePreview();
        autoSaveState();
      });
    }

    if (logoSelect) {
      logoSelect.addEventListener("change", () => {
        updateLogoBrandVisibility();
        schedulePreview();
        autoSaveState();
      });
    }

    if (toggleSidebar) {
      toggleSidebar.addEventListener("change", () => {
        updateSidebarVisibility();
        schedulePreview();
        autoSaveState();
      });
    }

    if (toggleFooter) {
      toggleFooter.addEventListener("change", () => {
        updateFooterVisibility();
        schedulePreview();
        autoSaveState();
      });
    }

    // Undo & Redo Button Listeners
    if (btnUndo) {
      btnUndo.addEventListener("click", (e) => {
        e.preventDefault();
        performUndoAction();
      });
    }

    if (btnRedo) {
      btnRedo.addEventListener("click", (e) => {
        e.preventDefault();
        performRedoAction();
      });
    }

    // Crop Button in Editor Toolbar
    if (tbCrop) {
      tbCrop.addEventListener("click", (e) => {
        e.preventDefault();
        const targetImg = findTargetImageToCrop();
        if (targetImg) {
          openCropRotateModal(targetImg.url, targetImg.caption, targetImg);
        } else {
          alert("Please paste a screenshot (Ctrl+V) into your notes first, then click Crop!");
        }
      });
    }

    // Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y, Ctrl+Shift+Z)
    if (notesTextarea) {
      notesTextarea.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          if (e.shiftKey) {
            e.preventDefault();
            performRedoAction();
          } else {
            e.preventDefault();
            performUndoAction();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
          e.preventDefault();
          performRedoAction();
        }
      });
    }

    const trackCursorActiveImage = () => {
      autoSaveState();
      try {
        const targetImg = findTargetImageToCrop();
        if (targetImg) {
          lastActiveImageInfo = targetImg;
        }
      } catch (e) {}
    };

    notesTextarea.addEventListener("click", trackCursorActiveImage);
    notesTextarea.addEventListener("keyup", trackCursorActiveImage);
    notesTextarea.addEventListener("select", trackCursorActiveImage);

    window.addEventListener("beforeunload", () => {
      autoSaveState();
    });

    const inputs = [
      notesTextarea, fontSelect, paperSelect, headerModeSelect, logoSelect, customBrandText,
      subjectInput, lectureInput,
      colorSubjectInput, colorLectureInput, colorBodyInput, colorSectionInput, colorSubheadingInput, colorSidebarInput,
      toggleSidebar, sidebarTextInput, toggleFooter, footerLeftInput, footerRightInput,
      marginTopInput, marginBottomInput, marginLeftInput, marginRightInput,
      marginTopSlider, marginBottomSlider, marginLeftSlider, marginRightSlider,
      sliderFontSize, sliderLetterSpacing, sliderWordSpacing, sliderLineHeight, realismSelect
    ];

    let undoDebounceTimer = null;
    if (notesTextarea) {
      notesTextarea.addEventListener("input", () => {
        clearTimeout(undoDebounceTimer);
        undoDebounceTimer = setTimeout(() => {
          saveUndoSnapshot();
        }, 350);
      });
    }

    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener("input", () => {
        if (input === sliderFontSize || input === sliderLetterSpacing || input === sliderWordSpacing || input === sliderLineHeight) {
          updateTypographyDisplays();
        }
        schedulePreview();
        autoSaveState();
        if (input === notesTextarea && typeof updateEditorImageCards === 'function') updateEditorImageCards();
      });
      input.addEventListener("change", () => {
        if (input === sliderFontSize || input === sliderLetterSpacing || input === sliderWordSpacing || input === sliderLineHeight) {
          updateTypographyDisplays();
        }
        schedulePreview();
        autoSaveState();
      });
    });

    // Two-way sync for margin sliders and number inputs
    function syncMarginPair(inputEl, sliderEl) {
      if (!inputEl || !sliderEl) return;
      sliderEl.addEventListener("input", () => {
        inputEl.value = sliderEl.value;
        updateMarginDisplays();
        schedulePreview();
        autoSaveState();
      });
      inputEl.addEventListener("input", () => {
        sliderEl.value = inputEl.value;
        updateMarginDisplays();
        schedulePreview();
        autoSaveState();
      });
      inputEl.addEventListener("change", () => {
        sliderEl.value = inputEl.value;
        updateMarginDisplays();
        schedulePreview();
        autoSaveState();
      });
    }

    syncMarginPair(marginTopInput, marginTopSlider);
    syncMarginPair(marginBottomInput, marginBottomSlider);
    syncMarginPair(marginLeftInput, marginLeftSlider);
    syncMarginPair(marginRightInput, marginRightSlider);
    updateMarginDisplays();
    updateLogoBrandVisibility();
    updateSidebarVisibility();
    updateFooterVisibility();

    function setActivePreset(activeBtn) {
      document.querySelectorAll(".btn-preset-margin").forEach(b => b.classList.remove("active"));
      if (activeBtn) activeBtn.classList.add("active");
    }

    if (btnPresetTight) {
      btnPresetTight.addEventListener("click", () => {
        setMargins(5, 5, 6, 6);
        setActivePreset(btnPresetTight);
        schedulePreview();
        autoSaveState();
      });
    }

    if (btnPresetStandard) {
      btnPresetStandard.addEventListener("click", () => {
        setMargins(8, 8, 8, 8);
        setActivePreset(btnPresetStandard);
        schedulePreview();
        autoSaveState();
      });
    }

    if (btnPresetNotebook) {
      btnPresetNotebook.addEventListener("click", () => {
        setMargins(12, 12, 12, 12);
        setActivePreset(btnPresetNotebook);
        schedulePreview();
        autoSaveState();
      });
    }

    function setColorTheme(subject, lecture, body, section, subheading, sidebar) {
      if (colorSubjectInput) colorSubjectInput.value = subject;
      if (colorLectureInput) colorLectureInput.value = lecture;
      if (colorBodyInput) colorBodyInput.value = body;
      if (colorSectionInput) colorSectionInput.value = section;
      if (colorSubheadingInput) colorSubheadingInput.value = subheading;
      if (colorSidebarInput) colorSidebarInput.value = sidebar;
      schedulePreview();
      autoSaveState();
    }

    const themePw = document.getElementById("theme-pw");
    const themeRoyal = document.getElementById("theme-royal");
    const themeEmerald = document.getElementById("theme-emerald");
    const themeClassic = document.getElementById("theme-classic");

    if (themePw) themePw.addEventListener("click", () => setColorTheme("#dc2626", "#2563eb", "#111827", "#dc2626", "#2563eb", "#059669"));
    if (themeRoyal) themeRoyal.addEventListener("click", () => setColorTheme("#1e3a8a", "#0284c7", "#0f172a", "#1e3a8a", "#4338ca", "#0369a1"));
    if (themeEmerald) themeEmerald.addEventListener("click", () => setColorTheme("#065f46", "#047857", "#132a13", "#065f46", "#b45309", "#047857"));
    if (themeClassic) themeClassic.addEventListener("click", () => setColorTheme("#0f172a", "#334155", "#000000", "#1e293b", "#334155", "#475569"));

    if (btnResetMargins) {
      btnResetMargins.addEventListener("click", () => {
        setMargins(8, 8, 8, 8);
        setActivePreset(btnPresetStandard);
        schedulePreview();
        autoSaveState();
      });
    }

    function fitContentToA4() {
      if (!notesTextarea) return;
      let text = notesTextarea.value;
      if (!text.trim()) return;

      // Clean up excessive blank lines & trim
      text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      setEditorContent(text);

      // Set optimal A4 tight margins
      setMargins("6", "6", "7", "7");
      setActivePreset(btnPresetTight);

      schedulePreview();
      autoSaveState();
    }

    if (btnFitA4) {
      btnFitA4.addEventListener("click", fitContentToA4);
    }

    if (btnNewNotes) {
      btnNewNotes.addEventListener("click", createNewNoteDocument);
    }

    if (btnFormatChatgpt) {
      btnFormatChatgpt.addEventListener("click", autoFormatContent);
    }

    const btnLoadUserSample = document.getElementById("btn-load-user-sample");
    if (btnLoadUserSample) {
      btnLoadUserSample.addEventListener("click", loadUserStructuresSample);
    }

    if (templateSelect) {
      templateSelect.addEventListener("change", () => {
        applyTemplate(templateSelect.value, false);
      });
    }

    if (btnApplyTemplate) {
      btnApplyTemplate.addEventListener("click", () => {
        const val = templateSelect ? templateSelect.value : "pw_historical";
        applyTemplate(val, false);
      });
    }

    if (btnLoadTemplateSample) {
      btnLoadTemplateSample.addEventListener("click", () => {
        const val = templateSelect ? templateSelect.value : "pw_historical";
        applyTemplate(val, true);
      });
    }

    btnLoadSample.addEventListener("click", loadInitialSample);
    btnLoadCsSample.addEventListener("click", loadCsSample);
    btnUpdatePreview.addEventListener("click", updatePreview);
    btnExportPdf.addEventListener("click", exportPdf);
    btnPrint.addEventListener("click", () => {
      if (previewFrame.contentWindow) {
        try {
          const fDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
          const wrapper = fDoc ? fDoc.getElementById("pages-wrapper") : null;
          if (wrapper) {
            wrapper.style.transform = "none";
            wrapper.style.marginBottom = "0px";
          }
        } catch (e) {}
        previewFrame.contentWindow.focus();
        previewFrame.contentWindow.print();
      }
    });

    // Toolbar Actions
    if (tbH1) tbH1.addEventListener("click", () => insertTextAtCursor("\n# SECTION TITLE\n"));
    if (tbH2) tbH2.addEventListener("click", () => insertTextAtCursor("\n## Subheading Topic\n"));
    if (tbBold) tbBold.addEventListener("click", () => window.applyTextFormat("**", "**", "bold text"));
    if (tbUnderline) tbUnderline.addEventListener("click", () => window.applyTextFormat("<u>", "</u>", "underline text"));
    if (tbColorRed) tbColorRed.addEventListener("click", () => window.applyTextFormat("[red]", "[/red]", "red text"));
    if (tbColorBlack) tbColorBlack.addEventListener("click", () => window.applyTextFormat("[black]", "[/black]", "black text"));
    if (tbBullet) tbBullet.addEventListener("click", () => insertTextAtCursor("\n- **Key Concept:** Explanation goes here.\n"));
    if (tbTable) tbTable.addEventListener("click", () => insertTextAtCursor("\n| Operation | Time Complexity | Space Complexity |\n| Search | O(log N) | O(1) |\n| Insert | O(log N) | O(1) |\n"));

    // Keyboard Shortcuts for Text Formatting & Selection Toolbar
    if (notesTextarea) {
      notesTextarea.addEventListener("keydown", (e) => {
        // Ctrl+B -> Bold
        if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B") && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          window.applyTextFormat("**", "**", "bold text");
        }
        // Ctrl+U -> Underline
        else if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U") && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          window.applyTextFormat("<u>", "</u>", "underline text");
        }
        // Alt+R -> Red color
        else if (e.altKey && (e.key === "r" || e.key === "R")) {
          e.preventDefault();
          window.applyTextFormat("[red]", "[/red]", "red text");
        }
        // Alt+B -> Black color
        else if (e.altKey && (e.key === "b" || e.key === "B")) {
          e.preventDefault();
          window.applyTextFormat("[black]", "[/black]", "black text");
        }
      });

      // Floating Selection Toolbar Display on Highlighting text
      const floatingToolbar = document.getElementById("floating-selection-toolbar");
      if (floatingToolbar) {
        const updateFloatingBar = () => {
          const s = notesTextarea.selectionStart;
          const e = notesTextarea.selectionEnd;
          if (e > s && (e - s) > 0) {
            floatingToolbar.classList.remove("hidden");
          } else {
            floatingToolbar.classList.add("hidden");
          }
        };

        notesTextarea.addEventListener("select", updateFloatingBar);
        notesTextarea.addEventListener("mouseup", updateFloatingBar);
        notesTextarea.addEventListener("keyup", updateFloatingBar);
        document.addEventListener("mousedown", (ev) => {
          if (!floatingToolbar.contains(ev.target) && ev.target !== notesTextarea) {
            floatingToolbar.classList.add("hidden");
          }
        });
      }

      // Active Cursor-to-Page Sync on Click or Arrow Navigation
      let cursorSyncTimeout = null;
      const syncPreviewToCursor = () => {
        if (cursorSyncTimeout) clearTimeout(cursorSyncTimeout);
        cursorSyncTimeout = setTimeout(() => {
          try {
            const fDoc = previewFrame.contentDocument || (previewFrame.contentWindow ? previewFrame.contentWindow.document : null);
            if (fDoc) {
              const pNum = getActiveCursorPage(fDoc);
              if (pNum > 1) {
                const targetEl = fDoc.getElementById(`page-${pNum}`);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }
          } catch (e) {}
        }, 120);
      };

      notesTextarea.addEventListener("click", syncPreviewToCursor);
      notesTextarea.addEventListener("keyup", (e) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
          syncPreviewToCursor();
        }
      });
    }

    // CS Diagram Fast Actions
    if (tbTree) {
      tbTree.addEventListener("click", () => {
        openDiagramModal("interactive-tree");
      });
    }

    if (tbFlow) {
      tbFlow.addEventListener("click", () => {
        openDiagramModal("interactive-flow");
      });
    }

    if (tbHierarchy) {
      tbHierarchy.addEventListener("click", () => {
        insertTextAtCursor(`\n## Hierarchical Organization Tree\n\n\`\`\`tree\nName\n  Roll No.\n  Class\n    eg\n    class\n    Roll\n  Khajan\n\`\`\`\n`);
      });
    }

    if (tbAvl) {
      tbAvl.addEventListener("click", () => {
        insertTextAtCursor(`\n## Balanced AVL Tree\n\n\`\`\`tree\ngraph TD\n    Root((40)) --> L1((20))\n    Root --> R1((60))\n    L1 --> L2((10))\n    L1 --> L3((30))\n    R1 --> R2((50))\n    R1 --> R3((70))\n\`\`\`\n`);
      });
    }

    if (tbLinkedList) {
      tbLinkedList.addEventListener("click", () => {
        insertTextAtCursor(`\n## Singly Linked List\n\n\`\`\`tree\ngraph LR\n    Head[Head] --> N1[10 | •] --> N2[20 | •] --> N3[30 | •] --> Null[NULL]\n\`\`\`\n`);
      });
    }

    if (tbCode) {
      tbCode.addEventListener("click", () => {
        insertTextAtCursor(`\n\`\`\`cpp\nstruct Node {\n    int data;\n    Node* left;\n    Node* right;\n    Node(int val) : data(val), left(nullptr), right(nullptr) {}\n};\n\`\`\`\n`);
      });
    }
  }

  // --- Visual Diagram Studio Modal Controller ---
  const DIAGRAM_PRESETS = {
    "binary-tree": {
      name: "Tree (Root & 2 Children)",
      text: "Root\n  Left Child\n  Right Child",
      direction: "TD",
      shape: "auto",
      theme: "handwritten"
    },
    "extended-tree": {
      name: "Deep Tree (Structure 2)",
      text: "21\n  31\n    15\n    18\n  24\n    22\n    28\n      29",
      direction: "TD",
      shape: "circle",
      theme: "handwritten"
    },
    "hierarchy-tree": {
      name: "Hierarchy Tree (Structure 3)",
      text: "Name\n  Roll No.\n  Class\n    eg\n    class\n    Roll\n  Khajan",
      direction: "TD",
      shape: "box",
      theme: "handwritten"
    },
    "step-flow": {
      name: "Step Flowchart (Structure 4)",
      text: "Name -> Class -> Roll No.",
      direction: "TD",
      shape: "box",
      theme: "handwritten"
    },
    "decision-flow": {
      name: "Decision Flow",
      text: "Start -> Input Data\nInput Data -> {Is Valid?}\n{Is Valid?} -- Yes --> Process\n{Is Valid?} -- No --> Error Handler\nProcess -> [Success State]",
      direction: "TD",
      shape: "auto",
      theme: "indigo"
    },
    "linked-list": {
      name: "Linked List",
      text: "Head -> [10 | •] -> [20 | •] -> [30 | •] -> [NULL]",
      direction: "LR",
      shape: "box",
      theme: "emerald"
    },
    "avl-tree": {
      name: "Balanced AVL Tree",
      text: "40\n  20\n    10\n    30\n  60\n    50\n    70",
      direction: "TD",
      shape: "circle",
      theme: "handwritten"
    },
    "mindmap": {
      name: "Mindmap",
      text: "Computer Science\n  Data Structures\n    Trees\n    Graphs\n  Algorithms\n    Sorting\n    Searching\n  System Design",
      direction: "LR",
      shape: "rounded",
      theme: "amber"
    }
  };

  let diagramZoom = 1.0;
  let visualNodes = [];

  function setupDiagramStudioModal() {
    const btnOpenDiagramModal = document.getElementById("btn-open-diagram-modal");
    const diagramModal = document.getElementById("diagram-modal");
    const btnCloseDiagram = document.getElementById("btn-close-diagram");
    const btnCloseDiagramFooter = document.getElementById("btn-close-diagram-footer");
    const btnCopyDiagramCode = document.getElementById("btn-copy-diagram-code");
    const btnInsertDiagram = document.getElementById("btn-insert-diagram");
    const presetChips = document.querySelectorAll(".preset-chip");
    const builderTabs = document.querySelectorAll(".builder-tab");
    const tabSmartText = document.getElementById("tab-smart-text");
    const tabVisualTree = document.getElementById("tab-visual-tree");
    const tabRawMermaid = document.getElementById("tab-raw-mermaid");
    const diagSmartText = document.getElementById("diag-smart-text");
    const diagRawMermaid = document.getElementById("diag-raw-mermaid");
    const diagDirectionSelect = document.getElementById("diag-direction-select");
    const diagShapeSelect = document.getElementById("diag-shape-select");
    const diagThemeSelect = document.getElementById("diag-theme-select");
    const diagScaleSelect = document.getElementById("diag-scale-select");
    const diagRenderOutput = document.getElementById("diag-render-output");
    const diagPreviewStatus = document.getElementById("diag-preview-status");
    const diagNodeCountBadge = document.getElementById("diag-node-count-badge");
    const diagZoomIn = document.getElementById("diag-zoom-in");
    const diagZoomOut = document.getElementById("diag-zoom-out");
    const diagZoomReset = document.getElementById("diag-zoom-reset");
    const visualNodeTreeList = document.getElementById("visual-node-tree-list");
    const btnVisualAddRoot = document.getElementById("btn-visual-add-root");
    const btnVisualClear = document.getElementById("btn-visual-clear");

    // Snippets
    const btnSnipChild = document.getElementById("btn-snip-child");
    const btnSnipArrow = document.getElementById("btn-snip-arrow");
    const btnSnipCircle = document.getElementById("btn-snip-circle");
    const btnSnipBox = document.getElementById("btn-snip-box");
    const btnSnipRounded = document.getElementById("btn-snip-rounded");
    const btnSnipDiamond = document.getElementById("btn-snip-diamond");

    const tabInteractiveTree = document.getElementById("tab-interactive-tree");
    const btnTreeResetStd = document.getElementById("btn-tree-reset-std");
    const btnTreeAddRoot = document.getElementById("btn-tree-add-root");
    const btnTreeClear = document.getElementById("btn-tree-clear");
    const nodeActionPopover = document.getElementById("node-action-popover");
    const popoverNodeTitle = document.getElementById("popover-node-title");
    const popoverNodeLabel = document.getElementById("popover-node-label");
    const btnClosePopover = document.getElementById("btn-close-popover");
    const btnAddLeftNode = document.getElementById("btn-add-left-node");
    const btnAddRightNode = document.getElementById("btn-add-right-node");
    const btnAddBothNodes = document.getElementById("btn-add-both-nodes");
    const popoverChildCount = document.getElementById("popover-child-count");
    const btnAddNChildren = document.getElementById("btn-add-n-children");
    const btnDeleteTreeNode = document.getElementById("btn-delete-tree-node");
    const btnSavePopover = document.getElementById("btn-save-popover");

    // Flow Studio Elements
    const tabInteractiveFlow = document.getElementById("tab-interactive-flow");
    const btnFlowResetStd = document.getElementById("btn-flow-reset-std");
    const btnFlowAddStep = document.getElementById("btn-flow-add-step");
    const btnFlowClear = document.getElementById("btn-flow-clear");
    const flowActionPopover = document.getElementById("flow-action-popover");
    const popoverFlowTitle = document.getElementById("popover-flow-title");
    const popoverFlowLabel = document.getElementById("popover-flow-label");
    const btnCloseFlowPopover = document.getElementById("btn-close-flow-popover");
    const btnAddStepBelow = document.getElementById("btn-add-step-below");
    const btnAddStepAbove = document.getElementById("btn-add-step-above");
    const btnDeleteFlowStep = document.getElementById("btn-delete-flow-step");
    const btnSaveFlowPopover = document.getElementById("btn-save-flow-popover");

    // Interactive Tree Data Model
    let interactiveTreeRoot = {
      id: "node_1",
      label: "Root",
      children: [
        { id: "node_2", label: "Left Child", branch: "left", children: [] },
        { id: "node_3", label: "Right Child", branch: "right", children: [] }
      ]
    };
    let selectedTreeNodeId = null;
    let treeNodeIdCounter = 10;

    // Interactive Flow Data Model (Vertical Step Flowchart)
    let interactiveFlowSteps = [
      { id: "flow_1", label: "Step 1: Input Data" },
      { id: "flow_2", label: "Step 2: Processing" },
      { id: "flow_3", label: "Step 3: Final Output" }
    ];
    let selectedFlowStepId = null;
    let flowStepIdCounter = 10;

    function findTreeNode(node, id) {
      if (!node) return null;
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const res = findTreeNode(child, id);
          if (res) return res;
        }
      }
      return null;
    }

    function findParentTreeNode(root, id) {
      if (!root || !root.children) return null;
      for (const child of root.children) {
        if (child.id === id) return root;
        const res = findParentTreeNode(child, id);
        if (res) return res;
      }
      return null;
    }

    function treeToSmartOutline(node, depth = 0) {
      if (!node) return "";
      const lbl = (node.label || "Node").trim();
      const formattedNode = /^\d+$/.test(lbl) ? `((${lbl}))` : `[${lbl}]`;
      let str = "  ".repeat(depth) + `${formattedNode}\n`;
      if (node.children && node.children.length > 0) {
        node.children.forEach(c => {
          str += treeToSmartOutline(c, depth + 1);
        });
      }
      return str;
    }

    function renderInteractiveTreeSVG() {
      const svg = document.getElementById("interactive-tree-svg");
      if (!svg) return;

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      if (!interactiveTreeRoot) {
        const emptyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        emptyText.setAttribute("x", "50%");
        emptyText.setAttribute("y", "50%");
        emptyText.setAttribute("text-anchor", "middle");
        emptyText.setAttribute("fill", "#64748b");
        emptyText.setAttribute("font-size", "13");
        emptyText.textContent = "No tree nodes yet. Click '+ Root' above to start!";
        svg.appendChild(emptyText);
        return;
      }

      // Compute hierarchical positions (Knuth in-order placement)
      let leafCount = 0;
      const allNodes = [];
      const allEdges = [];

      function layoutPass(node, depth = 0) {
        if (!node) return;
        node.depth = depth;
        node.y = 45 + depth * 75;
        allNodes.push(node);

        if (!node.children || node.children.length === 0) {
          node.x = 65 + leafCount * 110;
          leafCount++;
        } else {
          node.children.forEach(child => {
            allEdges.push({ parent: node, child: child });
            layoutPass(child, depth + 1);
          });
          const firstChild = node.children[0];
          const lastChild = node.children[node.children.length - 1];
          node.x = (firstChild.x + lastChild.x) / 2;
        }
      }

      layoutPass(interactiveTreeRoot, 0);

      // Compute bounding box for responsive SVG viewBox
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allNodes.forEach(n => {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      });

      const padX = 70;
      const padY = 45;
      const vbWidth = Math.max(340, (maxX - minX) + padX * 2);
      const vbHeight = Math.max(220, (maxY - minY) + padY * 2);
      const vbMinX = minX - padX;
      const vbMinY = minY - padY;

      svg.setAttribute("viewBox", `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`);

      // Draw Curved Branch Paths
      allEdges.forEach(edge => {
        const p = edge.parent;
        const c = edge.child;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const midY = (p.y + c.y) / 2;
        path.setAttribute("d", `M ${p.x} ${p.y + 22} C ${p.x} ${midY}, ${c.x} ${midY}, ${c.x} ${c.y - 22}`);
        path.setAttribute("class", "canvas-branch-path");
        svg.appendChild(path);
      });

      // Draw Interactive Nodes
      allNodes.forEach(node => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const isSelected = selectedTreeNodeId === node.id;
        g.setAttribute("class", "canvas-tree-node" + (isSelected ? " selected" : ""));
        g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
        g.setAttribute("data-node-id", node.id);

        // Selection ring
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ring.setAttribute("class", "node-ring");
        ring.setAttribute("r", "28");
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#ec4899");
        ring.setAttribute("stroke-width", "3");
        ring.setAttribute("opacity", isSelected ? "1" : "0");
        g.appendChild(ring);

        // Main Node Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "node-circle");
        circle.setAttribute("r", "22");
        circle.setAttribute("fill", node.depth === 0 ? "#e0f2fe" : (node.depth === 1 ? "#ecfdf5" : "#fef3c7"));
        circle.setAttribute("stroke", node.depth === 0 ? "#0284c7" : (node.depth === 1 ? "#059669" : "#d97706"));
        circle.setAttribute("stroke-width", "2.5");
        g.appendChild(circle);

        // Text Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("class", "node-label");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("font-size", "11");
        text.setAttribute("font-family", "'Coming Soon', cursive, sans-serif");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("fill", "#0f172a");
        text.textContent = node.label || "Node";
        g.appendChild(text);

        // Quick +L badge
        const ql = document.createElementNS("http://www.w3.org/2000/svg", "g");
        ql.setAttribute("class", "quick-add-btn");
        ql.setAttribute("transform", "translate(-16, 18)");
        ql.setAttribute("title", "Add Left Child Node");
        const qlCirc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        qlCirc.setAttribute("r", "7");
        qlCirc.setAttribute("fill", "#0284c7");
        const qlTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        qlTxt.setAttribute("font-size", "8");
        qlTxt.setAttribute("fill", "#fff");
        qlTxt.setAttribute("text-anchor", "middle");
        qlTxt.setAttribute("dominant-baseline", "central");
        qlTxt.setAttribute("font-weight", "bold");
        qlTxt.textContent = "+L";
        ql.appendChild(qlCirc);
        ql.appendChild(qlTxt);
        ql.addEventListener("click", (e) => {
          e.stopPropagation();
          addLeftChildNode(node.id);
        });
        g.appendChild(ql);

        // Quick +R badge
        const qr = document.createElementNS("http://www.w3.org/2000/svg", "g");
        qr.setAttribute("class", "quick-add-btn");
        qr.setAttribute("transform", "translate(16, 18)");
        qr.setAttribute("title", "Add Right Child Node");
        const qrCirc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        qrCirc.setAttribute("r", "7");
        qrCirc.setAttribute("fill", "#10b981");
        const qrTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        qrTxt.setAttribute("font-size", "8");
        qrTxt.setAttribute("fill", "#fff");
        qrTxt.setAttribute("text-anchor", "middle");
        qrTxt.setAttribute("dominant-baseline", "central");
        qrTxt.setAttribute("font-weight", "bold");
        qrTxt.textContent = "+R";
        qr.appendChild(qrCirc);
        qr.appendChild(qrTxt);
        qr.addEventListener("click", (e) => {
          e.stopPropagation();
          addRightChildNode(node.id);
        });
        g.appendChild(qr);

        // Click on group opens the popover
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          openNodePopover(node);
        });

        svg.appendChild(g);
      });

      // Update diagSmartText in background
      const smartText = treeToSmartOutline(interactiveTreeRoot);
      if (diagSmartText) {
        diagSmartText.value = smartText.trim();
      }
    }

    function openNodePopover(node) {
      selectedTreeNodeId = node.id;
      if (!nodeActionPopover || !popoverNodeLabel) return;

      popoverNodeTitle.textContent = node.depth === 0 ? "🌳 Root Node" : (node.depth === 1 ? `🍃 Child: ${node.label}` : `🌿 Sub-Child: ${node.label}`);
      popoverNodeLabel.value = node.label || "";
      nodeActionPopover.classList.remove("hidden");
      popoverNodeLabel.focus();
      popoverNodeLabel.select();

      renderInteractiveTreeSVG();
    }

    function closeNodePopover() {
      selectedTreeNodeId = null;
      if (nodeActionPopover) nodeActionPopover.classList.add("hidden");
      renderInteractiveTreeSVG();
    }

    function addLeftChildNode(targetId) {
      const target = findTreeNode(interactiveTreeRoot, targetId);
      if (!target) return;
      if (!target.children) target.children = [];

      const newChild = {
        id: "node_" + (++treeNodeIdCounter),
        label: "Left Node",
        branch: "left",
        children: []
      };
      target.children.unshift(newChild);
      openNodePopover(newChild);
      scheduleDiagramRender();
    }

    function addRightChildNode(targetId) {
      const target = findTreeNode(interactiveTreeRoot, targetId);
      if (!target) return;
      if (!target.children) target.children = [];

      const newChild = {
        id: "node_" + (++treeNodeIdCounter),
        label: "Right Node",
        branch: "right",
        children: []
      };
      target.children.push(newChild);
      openNodePopover(newChild);
      scheduleDiagramRender();
    }

    function addBothChildNodes(targetId) {
      const target = findTreeNode(interactiveTreeRoot, targetId);
      if (!target) return;
      if (!target.children) target.children = [];

      const leftChild = {
        id: "node_" + (++treeNodeIdCounter),
        label: "Left Node",
        branch: "left",
        children: []
      };
      const rightChild = {
        id: "node_" + (++treeNodeIdCounter),
        label: "Right Node",
        branch: "right",
        children: []
      };
      target.children.push(leftChild, rightChild);
      closeNodePopover();
      scheduleDiagramRender();
    }

    function addNChildNodes(targetId, count) {
      const target = findTreeNode(interactiveTreeRoot, targetId);
      if (!target) return;
      if (!target.children) target.children = [];

      for (let i = 1; i <= count; i++) {
        target.children.push({
          id: "node_" + (++treeNodeIdCounter),
          label: `Child ${target.children.length + 1}`,
          children: []
        });
      }
      closeNodePopover();
      scheduleDiagramRender();
    }

    function deleteTreeNode(targetId) {
      if (interactiveTreeRoot && interactiveTreeRoot.id === targetId) {
        interactiveTreeRoot = null;
        closeNodePopover();
        scheduleDiagramRender();
        return;
      }
      const parent = findParentTreeNode(interactiveTreeRoot, targetId);
      if (parent && parent.children) {
        parent.children = parent.children.filter(c => c.id !== targetId);
      }
      closeNodePopover();
      scheduleDiagramRender();
    }

    // Popover Event Handlers
    if (btnClosePopover) btnClosePopover.addEventListener("click", closeNodePopover);
    if (btnSavePopover) btnSavePopover.addEventListener("click", closeNodePopover);

    if (popoverNodeLabel) {
      popoverNodeLabel.addEventListener("input", (e) => {
        if (selectedTreeNodeId) {
          const node = findTreeNode(interactiveTreeRoot, selectedTreeNodeId);
          if (node) {
            node.label = e.target.value || "Node";
            renderInteractiveTreeSVG();
            scheduleDiagramRender();
          }
        }
      });
      popoverNodeLabel.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          closeNodePopover();
        } else if (e.key === "Escape") {
          closeNodePopover();
        }
      });
    }

    if (btnAddLeftNode) {
      btnAddLeftNode.addEventListener("click", () => {
        if (selectedTreeNodeId) addLeftChildNode(selectedTreeNodeId);
      });
    }

    if (btnAddRightNode) {
      btnAddRightNode.addEventListener("click", () => {
        if (selectedTreeNodeId) addRightChildNode(selectedTreeNodeId);
      });
    }

    if (btnAddBothNodes) {
      btnAddBothNodes.addEventListener("click", () => {
        if (selectedTreeNodeId) addBothChildNodes(selectedTreeNodeId);
      });
    }

    if (btnAddNChildren) {
      btnAddNChildren.addEventListener("click", () => {
        if (selectedTreeNodeId) {
          const count = parseInt(popoverChildCount.value) || 2;
          addNChildNodes(selectedTreeNodeId, count);
        }
      });
    }

    if (btnDeleteTreeNode) {
      btnDeleteTreeNode.addEventListener("click", () => {
        if (selectedTreeNodeId) deleteTreeNode(selectedTreeNodeId);
      });
    }

    // Tree Toolbar Buttons
    if (btnTreeResetStd) {
      btnTreeResetStd.addEventListener("click", () => {
        interactiveTreeRoot = {
          id: "node_1",
          label: "Root",
          children: [
            { id: "node_2", label: "Left Child", branch: "left", children: [] },
            { id: "node_3", label: "Right Child", branch: "right", children: [] }
          ]
        };
        closeNodePopover();
        renderInteractiveTreeSVG();
        scheduleDiagramRender();
      });
    }

    if (btnTreeAddRoot) {
      btnTreeAddRoot.addEventListener("click", () => {
        interactiveTreeRoot = {
          id: "node_" + (++treeNodeIdCounter),
          label: "Root",
          children: []
        };
        openNodePopover(interactiveTreeRoot);
        scheduleDiagramRender();
      });
    }

    if (btnTreeClear) {
      btnTreeClear.addEventListener("click", () => {
        interactiveTreeRoot = null;
        closeNodePopover();
        scheduleDiagramRender();
      });
    }

    // --- Interactive Flowchart Functions ---
    function flowStepsToText(steps) {
      if (!steps || !steps.length) return "[Step 1] -> [Step 2]";
      return steps.map(s => `[${s.label || "Step"}]`).join(" -> ");
    }

    function renderInteractiveFlowSVG() {
      const svg = document.getElementById("interactive-flow-svg");
      if (!svg) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      if (!interactiveFlowSteps.length) {
        const emptyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        emptyText.setAttribute("x", "50%");
        emptyText.setAttribute("y", "50%");
        emptyText.setAttribute("text-anchor", "middle");
        emptyText.setAttribute("fill", "#64748b");
        emptyText.setAttribute("font-size", "13");
        emptyText.textContent = "No flow steps. Click '+ Add Step' above!";
        svg.appendChild(emptyText);
        return;
      }

      const boxWidth = 240;
      const boxHeight = 44;
      const boxGap = 40;
      const startY = 30;
      const centerX = 160;

      const totalH = startY + interactiveFlowSteps.length * (boxHeight + boxGap) + 20;
      svg.setAttribute("viewBox", `0 0 320 ${Math.max(260, totalH)}`);

      // SVG Arrow Marker
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
      marker.setAttribute("id", "flow-arrow-head");
      marker.setAttribute("viewBox", "0 0 10 10");
      marker.setAttribute("refX", "6");
      marker.setAttribute("refY", "5");
      marker.setAttribute("markerWidth", "6");
      marker.setAttribute("markerHeight", "6");
      marker.setAttribute("orient", "auto-start-reverse");
      const markerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      markerPath.setAttribute("d", "M 0 1.5 L 8 5 L 0 8.5 z");
      markerPath.setAttribute("fill", "#0284c7");
      marker.appendChild(markerPath);
      defs.appendChild(marker);
      svg.appendChild(defs);

      interactiveFlowSteps.forEach((step, idx) => {
        const x = centerX - boxWidth / 2;
        const y = startY + idx * (boxHeight + boxGap);
        const isSelected = selectedFlowStepId === step.id;

        // Downward Arrow to next step
        if (idx < interactiveFlowSteps.length - 1) {
          const arrowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
          arrowLine.setAttribute("x1", centerX);
          arrowLine.setAttribute("y1", y + boxHeight);
          arrowLine.setAttribute("x2", centerX);
          arrowLine.setAttribute("y2", y + boxHeight + boxGap - 3);
          arrowLine.setAttribute("stroke", "#0284c7");
          arrowLine.setAttribute("stroke-width", "2.5");
          arrowLine.setAttribute("marker-end", "url(#flow-arrow-head)");
          svg.appendChild(arrowLine);
        }

        // Flow Step Box Group
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "canvas-flow-box" + (isSelected ? " selected" : ""));
        g.setAttribute("data-step-id", step.id);

        // Rect Box
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "canvas-flow-rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", boxWidth);
        rect.setAttribute("height", boxHeight);
        rect.setAttribute("rx", "6");
        rect.setAttribute("ry", "6");
        rect.setAttribute("fill", idx === 0 ? "#e0f2fe" : (idx === interactiveFlowSteps.length - 1 ? "#ecfdf5" : "#f8fafc"));
        rect.setAttribute("stroke", isSelected ? "#ec4899" : "#0284c7");
        rect.setAttribute("stroke-width", isSelected ? "3" : "2");
        g.appendChild(rect);

        // Text Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", centerX);
        text.setAttribute("y", y + boxHeight / 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-family", "'Coming Soon', cursive, sans-serif");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("fill", "#0f172a");
        text.textContent = step.label || `Step ${idx + 1}`;
        g.appendChild(text);

        // Quick + Button between boxes
        const qAdd = document.createElementNS("http://www.w3.org/2000/svg", "g");
        qAdd.setAttribute("class", "quick-add-btn");
        qAdd.setAttribute("transform", `translate(${centerX + boxWidth / 2 - 14}, ${y + boxHeight / 2})`);
        qAdd.setAttribute("title", "Insert Step Below");
        const qAddCirc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        qAddCirc.setAttribute("r", "8");
        qAddCirc.setAttribute("fill", "#10b981");
        const qAddTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        qAddTxt.setAttribute("font-size", "10");
        qAddTxt.setAttribute("fill", "#fff");
        qAddTxt.setAttribute("text-anchor", "middle");
        qAddTxt.setAttribute("dominant-baseline", "central");
        qAddTxt.setAttribute("font-weight", "bold");
        qAddTxt.textContent = "+";
        qAdd.appendChild(qAddCirc);
        qAdd.appendChild(qAddTxt);
        qAdd.addEventListener("click", (e) => {
          e.stopPropagation();
          addFlowStepBelow(step.id);
        });
        g.appendChild(qAdd);

        // Click box -> open popover
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          openFlowPopover(step);
        });

        svg.appendChild(g);
      });

      // Update diagSmartText in background
      const flowText = flowStepsToText(interactiveFlowSteps);
      if (diagSmartText) {
        diagSmartText.value = flowText;
      }
    }

    window.renderInteractiveTreeSVG = renderInteractiveTreeSVG;
    window.renderInteractiveFlowSVG = renderInteractiveFlowSVG;

    function setInteractiveFlowSteps(stepLabels) {
      if (!Array.isArray(stepLabels) || !stepLabels.length) return;
      interactiveFlowSteps = stepLabels.map((lbl, idx) => ({
        id: "flow_" + (++flowStepIdCounter),
        label: lbl
      }));
      renderInteractiveFlowSVG();
      scheduleDiagramRender();
    }
    window.setInteractiveFlowSteps = setInteractiveFlowSteps;

    function openFlowPopover(step) {
      selectedFlowStepId = step.id;
      if (!flowActionPopover || !popoverFlowLabel) return;

      popoverFlowTitle.textContent = `⬇️ Step: ${step.label}`;
      popoverFlowLabel.value = step.label || "";
      flowActionPopover.classList.remove("hidden");
      popoverFlowLabel.focus();
      popoverFlowLabel.select();

      renderInteractiveFlowSVG();
    }

    function closeFlowPopover() {
      selectedFlowStepId = null;
      if (flowActionPopover) flowActionPopover.classList.add("hidden");
      renderInteractiveFlowSVG();
    }

    function addFlowStepBelow(targetId) {
      const idx = interactiveFlowSteps.findIndex(s => s.id === targetId);
      const newStep = {
        id: "flow_" + (++flowStepIdCounter),
        label: `Step ${interactiveFlowSteps.length + 1}`
      };
      if (idx !== -1) {
        interactiveFlowSteps.splice(idx + 1, 0, newStep);
      } else {
        interactiveFlowSteps.push(newStep);
      }
      openFlowPopover(newStep);
      scheduleDiagramRender();
    }

    function addFlowStepAbove(targetId) {
      const idx = interactiveFlowSteps.findIndex(s => s.id === targetId);
      const newStep = {
        id: "flow_" + (++flowStepIdCounter),
        label: `Step ${idx + 1}`
      };
      if (idx !== -1) {
        interactiveFlowSteps.splice(idx, 0, newStep);
      } else {
        interactiveFlowSteps.unshift(newStep);
      }
      openFlowPopover(newStep);
      scheduleDiagramRender();
    }

    function deleteFlowStep(targetId) {
      interactiveFlowSteps = interactiveFlowSteps.filter(s => s.id !== targetId);
      closeFlowPopover();
      scheduleDiagramRender();
    }

    // Flow Popover Events
    if (btnCloseFlowPopover) btnCloseFlowPopover.addEventListener("click", closeFlowPopover);
    if (btnSaveFlowPopover) btnSaveFlowPopover.addEventListener("click", closeFlowPopover);

    if (popoverFlowLabel) {
      popoverFlowLabel.addEventListener("input", (e) => {
        if (selectedFlowStepId) {
          const step = interactiveFlowSteps.find(s => s.id === selectedFlowStepId);
          if (step) {
            step.label = e.target.value || "Step";
            renderInteractiveFlowSVG();
            scheduleDiagramRender();
          }
        }
      });
      popoverFlowLabel.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          closeFlowPopover();
        }
      });
    }

    if (btnAddStepBelow) {
      btnAddStepBelow.addEventListener("click", () => {
        if (selectedFlowStepId) addFlowStepBelow(selectedFlowStepId);
      });
    }

    if (btnAddStepAbove) {
      btnAddStepAbove.addEventListener("click", () => {
        if (selectedFlowStepId) addFlowStepAbove(selectedFlowStepId);
      });
    }

    if (btnDeleteFlowStep) {
      btnDeleteFlowStep.addEventListener("click", () => {
        if (selectedFlowStepId) deleteFlowStep(selectedFlowStepId);
      });
    }

    // Flow Toolbar Buttons
    if (btnFlowResetStd) {
      btnFlowResetStd.addEventListener("click", () => {
        interactiveFlowSteps = [
          { id: "flow_1", label: "Step 1: Input Data" },
          { id: "flow_2", label: "Step 2: Processing" },
          { id: "flow_3", label: "Step 3: Final Output" }
        ];
        closeFlowPopover();
        renderInteractiveFlowSVG();
        scheduleDiagramRender();
      });
    }

    if (btnFlowAddStep) {
      btnFlowAddStep.addEventListener("click", () => {
        const newStep = {
          id: "flow_" + (++flowStepIdCounter),
          label: `Step ${interactiveFlowSteps.length + 1}`
        };
        interactiveFlowSteps.push(newStep);
        openFlowPopover(newStep);
        scheduleDiagramRender();
      });
    }

    if (btnFlowClear) {
      btnFlowClear.addEventListener("click", () => {
        interactiveFlowSteps = [];
        closeFlowPopover();
        renderInteractiveFlowSVG();
        scheduleDiagramRender();
      });
    }

    let activeTab = "interactive-tree";
    let renderTimer = null;

    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#e0f2fe",
          primaryBorderColor: "#0284c7",
          primaryTextColor: "#0f172a",
          lineColor: "#1e293b",
          secondaryColor: "#f0fdf4",
          secondaryBorderColor: "#16a34a",
          tertiaryColor: "#f8fafc",
          tertiaryBorderColor: "#0284c7",
          fontSize: "14px"
        },
        flowchart: {
          curve: "basis",
          padding: 16,
          nodeSpacing: 50,
          rankSpacing: 40,
          htmlLabels: true,
          useMaxWidth: true
        }
      });
    }

    if (btnOpenDiagramModal) {
      btnOpenDiagramModal.addEventListener("click", () => openDiagramModal("interactive-tree"));
    }

    if (btnCloseDiagram) {
      btnCloseDiagram.addEventListener("click", () => diagramModal.classList.add("hidden"));
    }
    if (btnCloseDiagramFooter) {
      btnCloseDiagramFooter.addEventListener("click", () => diagramModal.classList.add("hidden"));
    }

    // Presets
    presetChips.forEach(chip => {
      chip.addEventListener("click", () => {
        presetChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const presetKey = chip.getAttribute("data-preset");
        loadDiagramPreset(presetKey);
      });
    });

    // Tab Switching
    builderTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        builderTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeTab = tab.getAttribute("data-tab");

        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        if (activeTab === "interactive-tree") {
          if (tabInteractiveTree) tabInteractiveTree.classList.add("active");
          renderInteractiveTreeSVG();
        } else if (activeTab === "interactive-flow") {
          if (tabInteractiveFlow) tabInteractiveFlow.classList.add("active");
          renderInteractiveFlowSVG();
        } else if (activeTab === "smart-text") {
          tabSmartText.classList.add("active");
        } else if (activeTab === "visual-tree") {
          tabVisualTree.classList.add("active");
          syncSmartTextToVisualTree();
        } else if (activeTab === "raw-mermaid") {
          tabRawMermaid.classList.add("active");
          diagRawMermaid.value = generateMermaidCode();
        }
        scheduleDiagramRender();
      });
    });

    // Inputs triggering render
    [diagSmartText, diagDirectionSelect, diagShapeSelect, diagThemeSelect].forEach(el => {
      if (el) {
        el.addEventListener("input", () => scheduleDiagramRender());
        el.addEventListener("change", () => scheduleDiagramRender());
      }
    });

    if (diagRawMermaid) {
      diagRawMermaid.addEventListener("input", () => {
        if (activeTab === "raw-mermaid") {
          scheduleDiagramRender();
        }
      });
    }

    // Snippets
    if (btnSnipChild) {
      btnSnipChild.addEventListener("click", () => insertSmartTextSnippet("\n  New Child Node"));
    }
    if (btnSnipArrow) {
      btnSnipArrow.addEventListener("click", () => insertSmartTextSnippet(" -> Next Step"));
    }
    if (btnSnipCircle) {
      btnSnipCircle.addEventListener("click", () => wrapSmartTextSelection("((", "))", "Circle Node"));
    }
    if (btnSnipBox) {
      btnSnipBox.addEventListener("click", () => wrapSmartTextSelection("[", "]", "Box Node"));
    }
    if (btnSnipRounded) {
      btnSnipRounded.addEventListener("click", () => wrapSmartTextSelection("(", ")", "Rounded Node"));
    }
    if (btnSnipDiamond) {
      btnSnipDiamond.addEventListener("click", () => wrapSmartTextSelection("{", "}", "Condition?"));
    }

    const btnVisualPresetTree = document.getElementById("btn-visual-preset-tree");

    // Visual Tree Toolbar
    if (btnVisualPresetTree) {
      btnVisualPresetTree.addEventListener("click", () => {
        visualNodes = [
          { id: "node_" + Date.now(), text: "Root", shape: "circle", level: 0 },
          { id: "node_" + (Date.now() + 1), text: "Left Child", shape: "circle", level: 1 },
          { id: "node_" + (Date.now() + 2), text: "Right Child", shape: "circle", level: 1 }
        ];
        renderVisualTreeUI();
        syncVisualTreeToSmartText();
        scheduleDiagramRender();
      });
    }

    if (btnVisualAddRoot) {
      btnVisualAddRoot.addEventListener("click", () => {
        visualNodes.push({ id: "node_" + Date.now(), text: "Root", shape: "circle", level: 0 });
        renderVisualTreeUI();
        syncVisualTreeToSmartText();
        scheduleDiagramRender();
      });
    }
    if (btnVisualClear) {
      btnVisualClear.addEventListener("click", () => {
        visualNodes = [];
        renderVisualTreeUI();
        syncVisualTreeToSmartText();
        scheduleDiagramRender();
      });
    }

    // Zoom Controls
    if (diagZoomIn) {
      diagZoomIn.addEventListener("click", () => {
        diagramZoom = Math.min(2.5, diagramZoom + 0.15);
        applyDiagramZoom();
      });
    }
    if (diagZoomOut) {
      diagZoomOut.addEventListener("click", () => {
        diagramZoom = Math.max(0.4, diagramZoom - 0.15);
        applyDiagramZoom();
      });
    }
    if (diagZoomReset) {
      diagZoomReset.addEventListener("click", () => {
        diagramZoom = 1.0;
        applyDiagramZoom();
      });
    }

    // Copy Code
    if (btnCopyDiagramCode) {
      btnCopyDiagramCode.addEventListener("click", () => {
        const code = generateMermaidCode();
        const md = "```diagram\n" + code + "\n```";
        navigator.clipboard.writeText(md).then(() => {
          btnCopyDiagramCode.innerHTML = '<i data-lucide="check"></i> Copied!';
          if (window.lucide) lucide.createIcons();
          setTimeout(() => {
            btnCopyDiagramCode.innerHTML = '<i data-lucide="copy"></i> Copy Markdown';
            if (window.lucide) lucide.createIcons();
          }, 1800);
        });
      });
    }

    // Insert Diagram into Notes
    if (btnInsertDiagram) {
      btnInsertDiagram.addEventListener("click", () => {
        let block = "";
        const scaleVal = diagScaleSelect ? diagScaleSelect.value : "100%";
        const scaleAttr = (scaleVal && scaleVal !== "100%") ? ` {scale=${scaleVal}}` : "";

        if (activeTab === "interactive-tree") {
          block = `\n\`\`\`tree${scaleAttr}\n` + treeToSmartOutline(interactiveTreeRoot).trim() + "\n```\n";
        } else if (activeTab === "interactive-flow") {
          block = `\n\`\`\`flowchart${scaleAttr}\n` + flowStepsToText(interactiveFlowSteps) + "\n```\n";
        } else {
          const code = generateMermaidCode();
          block = `\n\`\`\`diagram${scaleAttr}\n` + code + "\n```\n";
        }
        insertTextAtCursor(block);
        diagramModal.classList.add("hidden");
        schedulePreview();
        autoSaveState();
      });
    }

    if (diagScaleSelect) {
      diagScaleSelect.addEventListener("change", () => {
        scheduleDiagramRender();
      });
    }

    openDiagramModal = function(preferredTab = "interactive-tree") {
      console.log("Opening Diagram Modal with tab:", preferredTab);
      if (diagramModal) diagramModal.classList.remove("hidden");
      activeTab = preferredTab;

      builderTabs.forEach(t => {
        if (t.getAttribute("data-tab") === preferredTab) {
          t.classList.add("active");
        } else {
          t.classList.remove("active");
        }
      });
      document.querySelectorAll(".tab-pane").forEach(p => {
        if (p.id === `tab-${preferredTab}`) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });

      if (preferredTab === "interactive-tree") {
        renderInteractiveTreeSVG();
      } else if (preferredTab === "interactive-flow") {
        renderInteractiveFlowSVG();
      } else if (!diagSmartText.value.trim()) {
        loadDiagramPreset("binary-tree");
      }
      scheduleDiagramRender();
      if (window.lucide) lucide.createIcons();
    };
    window.openDiagramModal = openDiagramModal;

    function loadDiagramPreset(key) {
      const preset = DIAGRAM_PRESETS[key];
      if (!preset) return;
      diagSmartText.value = preset.text;
      diagDirectionSelect.value = preset.direction || "TD";
      diagShapeSelect.value = preset.shape || "auto";
      diagThemeSelect.value = preset.theme || "handwritten";
      scheduleDiagramRender();
    }

    function insertSmartTextSnippet(snippet) {
      const start = diagSmartText.selectionStart;
      const end = diagSmartText.selectionEnd;
      const before = diagSmartText.value.substring(0, start);
      const after = diagSmartText.value.substring(end, diagSmartText.value.length);
      diagSmartText.value = before + snippet + after;
      diagSmartText.selectionStart = diagSmartText.selectionEnd = start + snippet.length;
      diagSmartText.focus();
      scheduleDiagramRender();
    }

    function wrapSmartTextSelection(prefix, suffix, defaultText) {
      const start = diagSmartText.selectionStart;
      const end = diagSmartText.selectionEnd;
      const selected = diagSmartText.value.substring(start, end) || defaultText;
      const before = diagSmartText.value.substring(0, start);
      const after = diagSmartText.value.substring(end, diagSmartText.value.length);
      const replacement = prefix + selected + suffix;
      diagSmartText.value = before + replacement + after;
      diagSmartText.selectionStart = start;
      diagSmartText.selectionEnd = start + replacement.length;
      diagSmartText.focus();
      scheduleDiagramRender();
    }

    function applyDiagramZoom() {
      diagRenderOutput.style.transform = `scale(${diagramZoom})`;
    }

    function scheduleDiagramRender() {
      if (renderTimer) clearTimeout(renderTimer);
      renderTimer = setTimeout(renderDiagramLive, 100);
    }

    function generateMermaidCode() {
      if (activeTab === "raw-mermaid" && diagRawMermaid.value.trim()) {
        return diagRawMermaid.value.trim();
      }
      return convertSmartTextToMermaid(
        diagSmartText.value,
        diagDirectionSelect.value,
        diagShapeSelect.value
      );
    }

    function convertSmartTextToMermaid(rawText, direction = "TD", defaultShape = "auto") {
      const text = rawText.trim();
      if (!text) {
        return `graph ${direction}\n    A[Empty Diagram]`;
      }

      if (text.startsWith("graph ") || text.startsWith("flowchart ") || text.startsWith("mindmap") || text.startsWith("sequenceDiagram")) {
        return text;
      }

      const convMermaid = parseBoxDrawingOrConvergence(text);
      if (convMermaid) {
        return convMermaid;
      }

      const slashTree = parseAsciiSlashTree(text);
      if (slashTree) {
        return slashTree;
      }

      const rawLines = text.split("\n").filter(l => l.trim());
      if (!rawLines.length) {
        return `graph ${direction}\n    A[Empty Diagram]`;
      }

      function formatNode(id, label) {
        const lbl = label.trim();
        if (lbl.startsWith("((") && lbl.endsWith("))") && lbl.length >= 4) {
          const inner = lbl.slice(2, -2).trim();
          if (/^\d+$/.test(inner) || (inner.length <= 4 && !/[\s\/]/.test(inner))) {
            return `${id}(("${inner.replace(/"/g, "'")}"))`;
          } else {
            return `${id}["${inner.replace(/"/g, "'")}"]`;
          }
        }
        if ((lbl.startsWith("([") && lbl.endsWith("])")) ||
            (lbl.startsWith("{{") && lbl.endsWith("}}")) ||
            (lbl.startsWith("[(") && lbl.endsWith(")]")) ||
            (lbl.startsWith("[") && lbl.endsWith("]")) ||
            (lbl.startsWith("(") && lbl.endsWith(")")) ||
            (lbl.startsWith("{") && lbl.endsWith("}"))) {
          return `${id}${lbl}`;
        }
        const clean = lbl.replace(/"/g, "'");
        if ((defaultShape === "circle" || defaultShape === "auto") && /^\d+$/.test(clean)) {
          return `${id}(("${clean}"))`;
        } else if (defaultShape === "circle" && clean.length <= 4 && !/[\s\/]/.test(clean)) {
          return `${id}(("${clean}"))`;
        } else if (defaultShape === "rounded") {
          return `${id}("${clean}")`;
        } else if (defaultShape === "stadium") {
          return `${id}(["${clean}"])`;
        } else if (defaultShape === "diamond") {
          return `${id}{"${clean}"}`;
        } else if (defaultShape === "cylinder") {
          return `${id}[("${clean}")]`;
        }
        return `${id}["${clean}"]`;
      }

      const arrowPattern = /\s*(?:-->|->|→|➔|=>)\s*/;
      const hasArrows = rawLines.some(l => arrowPattern.test(l));

      if (hasArrows && !rawLines.some(l => /[┌┐┴┬┼├──└──│]/.test(l))) {
        const mermaidLines = [`graph ${direction}`];
        const nodeMap = {};
        let counter = 0;

        rawLines.forEach(line => {
          const tokens = line.trim().split(arrowPattern).filter(t => t.trim());
          for (let i = 0; i < tokens.length - 1; i++) {
            const t1 = tokens[i];
            const t2 = tokens[i + 1];
            if (!nodeMap[t1]) {
              nodeMap[t1] = `N${counter++}`;
            }
            if (!nodeMap[t2]) {
              nodeMap[t2] = `N${counter++}`;
            }
            mermaidLines.push(`    ${formatNode(nodeMap[t1], t1)} --> ${formatNode(nodeMap[t2], t2)}`);
          }
        });

        if (mermaidLines.length > 1) {
          return mermaidLines.join("\n");
        }
      }

      // Indented Outline Tree
      const mermaidLines = [`graph ${direction}`];
      const stack = [];

      rawLines.forEach((l, idx) => {
        const cleanContent = l.replace(/^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+/, "").trim();
        if (!cleanContent) return;
        const expandedLine = l.replace(/\t/g, "    ");
        const indent = expandedLine.length - expandedLine.trimStart().length;
        const nodeId = `N${idx}`;
        const nodeDef = formatNode(nodeId, cleanContent);

        while (stack.length && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        if (stack.length) {
          const parentId = stack[stack.length - 1].id;
          mermaidLines.push(`    ${parentId} --> ${nodeDef}`);
        } else {
          mermaidLines.push(`    ${nodeDef}`);
        }

        stack.push({ indent, id: nodeId });
      });

      if (mermaidLines.length > 1) {
        return mermaidLines.join("\n");
      }

      return `graph ${direction}\n    ` + text;
    }

    async function renderDiagramLive() {
      const code = generateMermaidCode();
      const nodeCountMatches = (code.match(/-->/g) || []).length + 1;
      diagNodeCountBadge.textContent = `${Math.max(1, nodeCountMatches)} Nodes / Links`;

      const theme = diagThemeSelect.value;
      let themeVars = {
        primaryColor: "#e0f2fe",
        primaryBorderColor: "#0284c7",
        primaryTextColor: "#0f172a",
        lineColor: "#1e293b",
        secondaryColor: "#fef3c7",
        tertiaryColor: "#f1f5f9",
        fontSize: "12.5px"
      };

      if (theme === "indigo") {
        themeVars.primaryColor = "#e0e7ff";
        themeVars.primaryBorderColor = "#4f46e5";
        themeVars.primaryTextColor = "#1e1b4b";
        themeVars.lineColor = "#4338ca";
      } else if (theme === "emerald") {
        themeVars.primaryColor = "#d1fae5";
        themeVars.primaryBorderColor = "#059669";
        themeVars.primaryTextColor = "#064e3b";
        themeVars.lineColor = "#047857";
      } else if (theme === "amber") {
        themeVars.primaryColor = "#fef3c7";
        themeVars.primaryBorderColor = "#d97706";
        themeVars.primaryTextColor = "#78350f";
        themeVars.lineColor = "#b45309";
      } else if (theme === "minimal") {
        themeVars.primaryColor = "#ffffff";
        themeVars.primaryBorderColor = "#111827";
        themeVars.primaryTextColor = "#111827";
        themeVars.lineColor = "#111827";
      }

      if (!window.mermaid) {
        renderFallbackDiagramSVG(code);
        return;
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: "'Coming Soon', cursive, sans-serif",
          themeVariables: themeVars,
          flowchart: {
            curve: "basis",
            padding: 16,
            nodeSpacing: 50,
            rankSpacing: 40,
            htmlLabels: true,
            useMaxWidth: true
          }
        });

        const uniqueId = "diag_svg_" + Math.random().toString(36).substring(2, 9);
        const oldTemp = document.getElementById("d" + uniqueId);
        if (oldTemp) oldTemp.remove();

        const { svg } = await mermaid.render(uniqueId, code);
        diagRenderOutput.innerHTML = svg;
        diagPreviewStatus.textContent = "✓ Valid Diagram";
        diagPreviewStatus.className = "preview-status-pill";
      } catch (err) {
        console.warn("Mermaid render fallback:", err);
        renderFallbackDiagramSVG(code);
      }
    }

    function renderFallbackDiagramSVG(code) {
      const lines = code.split("\n").filter(l => l.includes("-->") || (l.trim() && !l.startsWith("graph")));
      let htmlOut = '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;">';
      lines.forEach(l => {
        const cleaned = l.replace(/-->/g, " ➔ ").replace(/[N\d]+\[|\]|[N\d]+\(\(|\)\)/g, "").trim();
        if (cleaned) {
          htmlOut += `<div style="background:#e0f2fe;border:1.5px solid #0284c7;color:#0f172a;padding:6px 14px;border-radius:6px;font-weight:bold;font-size:13px;">${cleaned}</div>`;
        }
      });
      htmlOut += "</div>";
      diagRenderOutput.innerHTML = htmlOut;
      diagPreviewStatus.textContent = "✓ Structure Ready";
      diagPreviewStatus.className = "preview-status-pill";
    }

    // Sync Smart Text <-> Visual Tree
    function syncSmartTextToVisualTree() {
      const rawText = diagSmartText.value;
      const lines = rawText.split("\n").filter(l => l.trim());
      visualNodes = [];

      lines.forEach((l, idx) => {
        const indentSpaces = l.length - l.trimStart().length;
        const level = Math.floor(indentSpaces / 2);
        const text = l.trim();
        visualNodes.push({
          id: "node_" + idx + "_" + Date.now(),
          text: text,
          shape: "auto",
          level: level
        });
      });

      if (!visualNodes.length) {
        visualNodes.push({ id: "node_0", text: "Root Node", shape: "auto", level: 0 });
      }

      renderVisualTreeUI();
    }

    function renderVisualTreeUI() {
      visualNodeTreeList.innerHTML = "";
      visualNodes.forEach((node, idx) => {
        const item = document.createElement("div");
        item.className = "visual-node-item" + (node.level === 0 ? " is-root" : "");
        item.style.marginLeft = `${node.level * 22}px`;

        const indentGuide = document.createElement("span");
        indentGuide.className = "visual-node-indent-guide";
        indentGuide.textContent = node.level === 0 ? "●" : "↳";

        const badge = document.createElement("span");
        if (node.level === 0) {
          badge.className = "node-level-badge badge-root";
          badge.textContent = "🌳 Root";
        } else if (node.level === 1) {
          badge.className = "node-level-badge badge-child";
          badge.textContent = "🍃 Child";
        } else {
          badge.className = "node-level-badge badge-subchild";
          badge.textContent = `🌿 Sub-Child (L${node.level})`;
        }

        const input = document.createElement("input");
        input.type = "text";
        input.className = "visual-node-input";
        input.value = node.text;
        input.placeholder = node.level === 0 ? "Root Node (e.g. Root / 23)..." : (node.level === 1 ? "Child Node..." : "Sub-child Node...");
        input.addEventListener("input", (e) => {
          node.text = e.target.value;
          syncVisualTreeToSmartText();
          scheduleDiagramRender();
        });

        const btnAddChild = document.createElement("button");
        btnAddChild.className = "visual-node-action-btn btn-add-child-primary";
        btnAddChild.textContent = node.level === 0 ? "+ Add Child Branch" : "+ Sub-Child";
        btnAddChild.title = "Add a child branch under this node";
        btnAddChild.addEventListener("click", () => {
          visualNodes.splice(idx + 1, 0, {
            id: "node_" + Date.now(),
            text: node.level === 0 ? "Child Node" : "Sub-child Node",
            shape: "circle",
            level: node.level + 1
          });
          renderVisualTreeUI();
          syncVisualTreeToSmartText();
          scheduleDiagramRender();
        });

        const btnAddSibling = document.createElement("button");
        btnAddSibling.className = "visual-node-action-btn";
        btnAddSibling.textContent = node.level === 0 ? "+ Sibling Root" : "+ Sibling";
        btnAddSibling.title = "Add a parallel node at the same level";
        btnAddSibling.addEventListener("click", () => {
          visualNodes.splice(idx + 1, 0, {
            id: "node_" + Date.now(),
            text: node.level === 0 ? "Root Node 2" : "Sibling Node",
            shape: "circle",
            level: node.level
          });
          renderVisualTreeUI();
          syncVisualTreeToSmartText();
          scheduleDiagramRender();
        });

        const btnDelete = document.createElement("button");
        btnDelete.className = "visual-node-action-btn btn-delete";
        btnDelete.textContent = "✕";
        btnDelete.title = "Delete this node";
        btnDelete.addEventListener("click", () => {
          visualNodes.splice(idx, 1);
          renderVisualTreeUI();
          syncVisualTreeToSmartText();
          scheduleDiagramRender();
        });

        item.appendChild(indentGuide);
        item.appendChild(badge);
        item.appendChild(input);
        item.appendChild(btnAddChild);
        item.appendChild(btnAddSibling);
        item.appendChild(btnDelete);
        visualNodeTreeList.appendChild(item);
      });
    }

    function syncVisualTreeToSmartText() {
      const lines = visualNodes.map(n => "  ".repeat(n.level) + n.text);
      diagSmartText.value = lines.join("\n");
    }
  }

  // --- Screenshot, Image Resizer & Interactive Cropper Controller ---
  let currentPastedImageData = "";
  let originalImageDataUrl = "";
  let currentImageWidth = "75%";
  let currentImageAlign = "center";
  let cropperInstance = null;

  function updateImageDimensionsBadge(dataUrl) {
    const dimensionsBadge = document.getElementById("img-dimensions-badge");
    if (!dimensionsBadge || !dataUrl) return;
    const tempImg = new Image();
    tempImg.onload = () => {
      const kb = Math.round((dataUrl.length * 0.75) / 1024);
      dimensionsBadge.textContent = `${tempImg.naturalWidth} × ${tempImg.naturalHeight} px (${kb} KB)`;
    };
    tempImg.src = dataUrl;
  }

  function rotateImageDataUrl90(srcDataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      callback(canvas.toDataURL("image/png"));
    };
    img.src = srcDataUrl;
  }

  function destroyCropper() {
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
  }

  function initCropperOnPreview() {
    const previewImg = document.getElementById("image-preview-img");
    if (!previewImg || !window.Cropper) return;

    destroyCropper();
    
    const startCropper = () => {
      if (cropperInstance) return;
      setTimeout(() => {
        if (!cropperInstance && previewImg) {
          cropperInstance = new Cropper(previewImg, {
            viewMode: 1,
            autoCropArea: 0.9,
            responsive: true,
            restore: false,
            guides: true,
            center: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false
          });
        }
      }, 50);
    };

    if (previewImg.complete && previewImg.naturalWidth > 0) {
      startCropper();
    } else {
      previewImg.addEventListener("load", startCropper, { once: true });
      setTimeout(startCropper, 200);
    }
  }

  let currentFlipH = 1;
  let currentFlipV = 1;
  let activeEditingImageItem = null;

  let lastActiveImageInfo = null;

  function getAllImagesInDocument() {
    if (!notesTextarea) return [];
    const content = notesTextarea.value || "";
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;
    let idx = 1;
    while ((match = imgRegex.exec(content)) !== null) {
      const captionParts = match[1].split("|");
      const captionText = captionParts[0].trim() || `Image ${idx}`;
      images.push({
        index: idx,
        label: `Image ${idx}: ${captionText.substring(0, 16)}`,
        fullMatch: match[0],
        caption: match[1],
        url: match[2],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
      idx++;
    }
    return images;
  }

  function findTargetImageToCrop() {
    const images = getAllImagesInDocument();
    if (images.length === 0) return null;
    if (images.length === 1) return images[0];

    const cursorPos = notesTextarea ? (notesTextarea.selectionStart || 0) : 0;

    // 1. Is cursor inside any image tag?
    for (const img of images) {
      if (cursorPos >= img.startIndex && cursorPos <= img.endIndex) {
        return img;
      }
    }

    // 2. Is lastActiveImageInfo matching an image in current document?
    if (lastActiveImageInfo && lastActiveImageInfo.url) {
      const found = images.find(img => img.url === lastActiveImageInfo.url);
      if (found) return found;
    }

    // 3. Find image closest to cursor position
    let closestImg = images[0];
    let minDistance = Math.abs(cursorPos - images[0].startIndex);
    for (let i = 1; i < images.length; i++) {
      const dist = Math.abs(cursorPos - images[i].startIndex);
      if (dist < minDistance) {
        minDistance = dist;
        closestImg = images[i];
      }
    }
    return closestImg;
  }

  function updateZoomBadge() {
    const badge = document.getElementById("crop-zoom-badge");
    if (!badge || !cropperInstance) return;
    try {
      const imgData = cropperInstance.getImageData();
      if (imgData && imgData.naturalWidth) {
        const zoomPct = Math.round((imgData.width / imgData.naturalWidth) * 100);
        badge.textContent = zoomPct + "%";
      }
    } catch (e) {}
  }

  function openCropRotateModal(imageUrl, caption = "Screenshot | width: 75% | align: center", targetImgItem = null) {
    const allImages = getAllImagesInDocument();
    
    if (!targetImgItem) {
      targetImgItem = findTargetImageToCrop();
    }
    
    if (targetImgItem) {
      activeEditingImageItem = targetImgItem;
      imageUrl = targetImgItem.url;
      caption = targetImgItem.caption;
      lastActiveImageInfo = targetImgItem;
    }

    currentPastedImageData = imageUrl;
    originalImageDataUrl = imageUrl;
    destroyCropper();
    currentFlipH = 1;
    currentFlipV = 1;

    const imageModal = document.getElementById("image-modal");
    const targetImg = document.getElementById("cropper-target-img");
    const scaleSlider = document.getElementById("crop-scale-slider");
    const scaleVal = document.getElementById("crop-scale-val");
    const ratioSelect = document.getElementById("crop-ratio-select");
    const gridSelect = document.getElementById("crop-grid-select");
    const multiImgGroup = document.getElementById("crop-multi-image-selector-group");
    const targetImgSelect = document.getElementById("crop-target-image-select");

    // Populate multi-image dropdown
    if (multiImgGroup && targetImgSelect) {
      if (allImages.length > 1) {
        multiImgGroup.style.display = "flex";
        const selectedIndex = targetImgItem ? (targetImgItem.index - 1) : allImages.findIndex(img => img.url === imageUrl);
        targetImgSelect.innerHTML = allImages.map((img, i) => 
          `<option value="${i}" ${i === selectedIndex ? "selected" : ""}>📷 ${img.label}</option>`
        ).join("");
        
        targetImgSelect.onchange = (e) => {
          const selectedIdx = parseInt(e.target.value, 10);
          const chosenImg = allImages[selectedIdx];
          if (chosenImg) {
            openCropRotateModal(chosenImg.url, chosenImg.caption, chosenImg);
          }
        };
      } else {
        multiImgGroup.style.display = "none";
      }
    }

    if (scaleSlider) scaleSlider.value = 100;
    if (scaleVal) scaleVal.textContent = "100%";
    if (ratioSelect) ratioSelect.value = "free";
    if (gridSelect) gridSelect.value = "none";

    if (targetImg) {
      targetImg.src = imageUrl;
    }

    if (imageModal) {
      imageModal.classList.remove("hidden");
      if (window.lucide) lucide.createIcons();
    }

    const startCropper = () => {
      destroyCropper();
      if (!targetImg || !window.Cropper) return;
      cropperInstance = new Cropper(targetImg, {
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 0.85,
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        zoom() {
          updateZoomBadge();
        },
        ready() {
          updateZoomBadge();
        }
      });
    };

    if (targetImg) {
      targetImg.src = imageUrl;
      const tryInit = () => {
        if (targetImg.naturalWidth > 0) {
          startCropper();
        } else {
          targetImg.onload = () => startCropper();
          setTimeout(startCropper, 150);
        }
      };
      tryInit();
    }
  }

  function setupImageModal() {
    const imageModal = document.getElementById("image-modal");
    const btnCloseModal = document.getElementById("btn-close-image-modal");
    const btnCancelModal = document.getElementById("btn-cancel-crop-modal");
    const btnApplyCrop = document.getElementById("btn-apply-crop");
    const btnZoomIn = document.getElementById("btn-crop-zoom-in");
    const btnZoomOut = document.getElementById("btn-crop-zoom-out");
    const btnZoomFit = document.getElementById("btn-crop-zoom-fit");
    const btnRotLeft = document.getElementById("btn-crop-rotate-left");
    const btnRotRight = document.getElementById("btn-crop-rotate-right");
    const btnFlipH = document.getElementById("btn-crop-flip-h");
    const btnFlipV = document.getElementById("btn-crop-flip-v");
    const ratioSelect = document.getElementById("crop-ratio-select");
    const gridSelect = document.getElementById("crop-grid-select");
    const btnReset = document.getElementById("btn-crop-reset");
    const scaleSlider = document.getElementById("crop-scale-slider");
    const scaleVal = document.getElementById("crop-scale-val");
    const tbImage = document.getElementById("tb-image");

    const closeModal = () => {
      destroyCropper();
      if (imageModal) imageModal.classList.add("hidden");
    };

    if (tbImage) {
      tbImage.addEventListener("click", () => {
        const content = notesTextarea ? notesTextarea.value : "";
        const imgMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          activeEditingImageItem = {
            fullMatch: imgMatch[0],
            caption: imgMatch[1],
            url: imgMatch[2]
          };
          openCropRotateModal(imgMatch[2], imgMatch[1]);
        } else {
          alert("Paste a screenshot into the editor (Ctrl+V) first, then click Crop to adjust it!");
        }
      });
    }

    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        if (cropperInstance) {
          cropperInstance.zoom(0.1);
          updateZoomBadge();
        }
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        if (cropperInstance) {
          cropperInstance.zoom(-0.1);
          updateZoomBadge();
        }
      });
    }

    if (btnZoomFit) {
      btnZoomFit.addEventListener("click", () => {
        if (cropperInstance) {
          cropperInstance.reset();
          updateZoomBadge();
        }
      });
    }

    if (btnRotLeft) {
      btnRotLeft.addEventListener("click", () => {
        if (cropperInstance) cropperInstance.rotate(-90);
      });
    }

    if (btnRotRight) {
      btnRotRight.addEventListener("click", () => {
        if (cropperInstance) cropperInstance.rotate(90);
      });
    }

    if (btnFlipH) {
      btnFlipH.addEventListener("click", () => {
        if (cropperInstance) {
          currentFlipH = -currentFlipH;
          cropperInstance.scaleX(currentFlipH);
        }
      });
    }

    if (btnFlipV) {
      btnFlipV.addEventListener("click", () => {
        if (cropperInstance) {
          currentFlipV = -currentFlipV;
          cropperInstance.scaleY(currentFlipV);
        }
      });
    }

    if (ratioSelect) {
      ratioSelect.addEventListener("change", (e) => {
        if (!cropperInstance) return;
        const val = e.target.value;
        if (val === "free") {
          cropperInstance.setAspectRatio(NaN);
        } else {
          cropperInstance.setAspectRatio(parseFloat(val));
        }
      });
    }

    if (gridSelect) {
      gridSelect.addEventListener("change", (e) => {
        if (!cropperInstance) return;
        const val = e.target.value;
        const cropBox = document.querySelector(".cropper-crop-box");
        if (cropBox) {
          if (val === "none") {
            cropBox.classList.add("no-guides");
          } else {
            cropBox.classList.remove("no-guides");
          }
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (!cropperInstance) return;
        cropperInstance.reset();
        currentFlipH = 1;
        currentFlipV = 1;
        if (scaleSlider) scaleSlider.value = 100;
        if (scaleVal) scaleVal.textContent = "100%";
        if (ratioSelect) ratioSelect.value = "free";
        cropperInstance.setAspectRatio(NaN);
        updateZoomBadge();
      });
    }

    if (scaleSlider) {
      scaleSlider.addEventListener("input", (e) => {
        if (!cropperInstance) return;
        const val = parseInt(e.target.value, 10);
        if (scaleVal) scaleVal.textContent = val + "%";
        cropperInstance.zoomTo(val / 100);
        updateZoomBadge();
      });
    }

    // Apply Crop Action (Top and Bottom Buttons)
    const applyButtons = document.querySelectorAll(".btn-apply-crop-action, #btn-apply-crop, #btn-apply-crop-top");
    applyButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!cropperInstance) return;
        const canvas = cropperInstance.getCroppedCanvas({
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high"
        });
        if (!canvas) return;

        const croppedDataUrl = canvas.toDataURL("image/png");
        applyButtons.forEach(b => {
          b.disabled = true;
          b.textContent = "Applying...";
        });

        try {
          const fd = new FormData();
          fd.append("image_data", croppedDataUrl);
          const res = await fetch("/api/upload-image", { method: "POST", body: fd });
          let newUrl = croppedDataUrl;
          if (res.ok) {
            const data = await res.json();
            if (data.url) newUrl = data.url;
          }

          saveUndoSnapshot();

          if (activeEditingImageItem && notesTextarea) {
            const newMd = `![${activeEditingImageItem.caption}](${newUrl})`;
            notesTextarea.value = notesTextarea.value.replace(activeEditingImageItem.fullMatch, newMd);
          } else if (notesTextarea) {
            const mdMatch = notesTextarea.value.match(/!\[([^\]]*)\]\(([^)]+)\)/);
            if (mdMatch) {
              const newMd = `![${mdMatch[1]}](${newUrl})`;
              notesTextarea.value = notesTextarea.value.replace(mdMatch[0], newMd);
            }
          }

          saveUndoSnapshot();
          closeModal();
          schedulePreview();
          autoSaveState();
        } catch (err) {
          console.error("Apply crop error:", err);
        } finally {
          applyButtons.forEach(b => {
            b.disabled = false;
            b.textContent = "✓ Apply Changes";
          });
        }
      });
    });
  }

  function openCropModalForExistingImage(imgItem) {
    activeEditingImageItem = imgItem;
    openCropRotateModal(imgItem.url, imgItem.caption, imgItem);
  }

  function updateEditorImageCards() {
    const tray = document.getElementById("editor-image-cards");
    if (!tray || !notesTextarea) return;

    const content = notesTextarea.value || "";
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        caption: match[1],
        url: match[2],
        index: match.index
      });
    }

    if (matches.length === 0) {
      tray.innerHTML = "";
      tray.classList.add("hidden");
      return;
    }

    tray.classList.remove("hidden");
    tray.innerHTML = "";

    matches.forEach((imgItem, idx) => {
      const card = document.createElement("div");
      card.className = "editor-image-card";
      
      const captionText = imgItem.caption.split("|")[0].trim() || `Image ${idx + 1}`;
      
      card.innerHTML = `
        <img src="${imgItem.url}" class="editor-image-thumb" title="Click to Crop / Edit this Image" alt="Thumb" />
        <div class="editor-image-info">
          <span class="editor-image-title" title="${captionText}">${captionText}</span>
          <div class="editor-image-actions">
            <button type="button" class="btn-crop-card" title="Open Crop & Rotate Modal for this Image">
              <i data-lucide="crop"></i> ✂️ Crop
            </button>
            <button type="button" class="btn-delete-card" title="Remove this image from notes">
              <i data-lucide="trash-2"></i> 🗑️
            </button>
          </div>
        </div>
      `;

      const thumb = card.querySelector(".editor-image-thumb");
      const btnCrop = card.querySelector(".btn-crop-card");
      const btnDelete = card.querySelector(".btn-delete-card");

      const openCropHandler = () => {
        openCropModalForExistingImage(imgItem);
      };

      if (thumb) thumb.addEventListener("click", openCropHandler);
      if (btnCrop) btnCrop.addEventListener("click", openCropHandler);

      if (btnDelete) {
        btnDelete.addEventListener("click", () => {
          saveUndoSnapshot();
          notesTextarea.value = notesTextarea.value.replace(imgItem.fullMatch, "");
          saveUndoSnapshot();
          schedulePreview();
          autoSaveState();
          updateEditorImageCards();
        });
      }

      tray.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  function insertTextAtCursor(text) {
    if (!notesTextarea) return;
    saveUndoSnapshot();
    const start = notesTextarea.selectionStart || 0;
    const end = notesTextarea.selectionEnd || 0;
    if (typeof notesTextarea.setRangeText === "function") {
      notesTextarea.setRangeText(text, start, end, "end");
    } else {
      const before = notesTextarea.value.substring(0, start);
      const after = notesTextarea.value.substring(end);
      notesTextarea.value = before + text + after;
      notesTextarea.selectionStart = notesTextarea.selectionEnd = start + text.length;
    }
    notesTextarea.focus();
    saveUndoSnapshot();
    schedulePreview();
    autoSaveState();
  }

  async function handleFileUpload(file) {
    showLoading("Extracting Text...", `Parsing ${file.name}`);
    try {
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const text = await file.text();
        setEditorContent(text);
        fileNameDisplay.textContent = file.name;
        fileStatus.classList.remove("hidden");
        schedulePreview();
        autoSaveState();
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setEditorContent(data.text);
          if (data.subject) subjectInput.value = data.subject;
          if (data.lecture) lectureInput.value = data.lecture;
          fileNameDisplay.textContent = file.name;
          fileStatus.classList.remove("hidden");
          schedulePreview();
          autoSaveState();
        } else {
          alert("Could not extract text: " + (data.detail || "Unknown error"));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error processing file: " + err.message);
    } finally {
      hideLoading();
    }
  }

  async function loadUserStructuresSample() {
    showLoading("Loading 4-Structures Sample...", "Loading all 4 diagram structures from notebook");
    try {
      const res = await fetch("/api/user-structures-sample");
      const data = await res.json();
      setEditorContent(data.content);
      subjectInput.value = data.subject;
      lectureInput.value = data.lecture;
      updatePreview();
      autoSaveState();
    } catch (err) {
      console.error(err);
    } finally {
      hideLoading();
    }
  }

  async function loadInitialSample() {
    showLoading("Loading Sample...", "Fetching historical background notes");
    try {
      const res = await fetch("/api/sample-notes");
      const data = await res.json();
      setEditorContent(data.content);
      subjectInput.value = data.subject;
      lectureInput.value = data.lecture;
      updatePreview();
      autoSaveState();
    } catch (err) {
      console.error(err);
    } finally {
      hideLoading();
    }
  }

  async function loadCsSample() {
    showLoading("Loading CS Tree Sample...", "Fetching Data Structures BST & AVL Tree notes");
    try {
      const res = await fetch("/api/cs-sample-notes");
      const data = await res.json();
      setEditorContent(data.content);
      subjectInput.value = data.subject;
      lectureInput.value = data.lecture;
      updatePreview();
      autoSaveState();
    } catch (err) {
      console.error(err);
    } finally {
      hideLoading();
    }
  }

  function getActiveCursorPage(fDoc) {
    if (!notesTextarea) return 1;
    const cursorPos = notesTextarea.selectionStart || 0;
    const text = notesTextarea.value || "";
    const textBefore = text.substring(0, cursorPos);

    // 1. Try finding headings before cursor and matching them with pages in the preview
    const headingMatches = [...textBefore.matchAll(/^#+\s+(.+)$/gm)];
    if (headingMatches.length > 0 && fDoc) {
      for (let hIdx = headingMatches.length - 1; hIdx >= 0; hIdx--) {
        const rawH = headingMatches[hIdx][1].trim();
        const cleanH = rawH.replace(/[*_`\[\]]/g, '').trim().toLowerCase();
        if (cleanH.length >= 3) {
          const pages = fDoc.querySelectorAll('.page-container');
          for (let idx = pages.length - 1; idx >= 0; idx--) {
            const pText = pages[idx].textContent.toLowerCase();
            if (pText.includes(cleanH.substring(0, 18))) {
              return idx + 1;
            }
          }
        }
      }
    }

    // 2. Try counting non-empty lines before cursor vs total non-empty lines
    const linesBefore = textBefore.split("\n").filter(l => l.trim()).length;
    const totalLines = Math.max(1, text.split("\n").filter(l => l.trim()).length);
    const pages = fDoc ? fDoc.querySelectorAll('.page-container') : null;
    const totalPages = pages && pages.length > 0 ? pages.length : 1;
    const ratio = linesBefore / totalLines;
    const estimatedPage = Math.min(totalPages, Math.max(1, Math.ceil(ratio * totalPages)));
    return estimatedPage;
  }

  function restorePreviewScroll(targetPage, savedScrollY) {
    try {
      const fWin = previewFrame.contentWindow;
      const fDoc = previewFrame.contentDocument || (fWin ? fWin.document : null);
      if (!fWin || !fDoc) return;

      // If user is editing on Page 2, 3, etc., scroll directly to that page element
      if (targetPage > 1) {
        const targetEl = fDoc.getElementById(`page-${targetPage}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
          return;
        }
      }

      // If we have a saved scroll position, restore it
      if (savedScrollY > 0) {
        fWin.scrollTo({ top: savedScrollY, behavior: 'instant' });
      }
    } catch (e) {
      console.warn("restorePreviewScroll error:", e);
    }
  }

  function schedulePreview() {
    previewStatus.textContent = "Updating...";
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(updatePreview, 350);
  }

  async function updatePreview() {
    const formData = getFormData();
    let savedScrollY = 0;
    let targetPage = 1;

    try {
      const fWin = previewFrame.contentWindow;
      const fDoc = previewFrame.contentDocument || (fWin ? fWin.document : null);
      if (fWin && fDoc) {
        savedScrollY = fWin.scrollY || fDoc.documentElement.scrollTop || fDoc.body.scrollTop || 0;
        targetPage = getActiveCursorPage(fDoc);
      }
    } catch (e) {}

    try {
      const res = await fetch("/api/preview-html", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${await res.text()}`);
      }
      const html = await res.text();

      // Listen for the iframe load to seamlessly restore the scroll position without jumping to page 1
      const onFrameLoad = () => {
        previewFrame.removeEventListener("load", onFrameLoad);
        requestAnimationFrame(() => {
          restorePreviewScroll(targetPage, savedScrollY);
          setTimeout(() => {
            restorePreviewScroll(targetPage, savedScrollY);
          }, 60);
        });
      };
      previewFrame.addEventListener("load", onFrameLoad);

      // Use srcdoc for instant, zero-latency reliable preview in all modern browsers
      previewFrame.srcdoc = html;

      previewStatus.textContent = "Synced";
    } catch (err) {
      console.error("Preview render failed", err);
      previewStatus.textContent = "Error";
    }
  }

  // Handle direct crop messages from Live Preview Image clicks
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "OPEN_CROP_IMAGE") {
      const src = e.data.src || "";
      const alt = e.data.alt || "";
      const imgIndex = e.data.imgIndex || 0;
      const allImgs = getAllImagesInDocument();
      let matchedImg = null;

      // 1. Exact 1-based index from the rendered output page!
      if (imgIndex > 0 && imgIndex <= allImgs.length) {
        matchedImg = allImgs[imgIndex - 1];
      }

      // 2. Alt / Caption text matching fallback
      if (!matchedImg && alt) {
        matchedImg = allImgs.find(im => im.caption && (im.caption.includes(alt) || alt.includes(im.caption.split("|")[0].trim())));
      }

      // 3. Image URL matching fallback
      if (!matchedImg && src) {
        matchedImg = allImgs.find(im => im.url === src || (src && src.endsWith(im.url)) || (im.url && im.url.endsWith(src)));
      }

      if (matchedImg) {
        openCropRotateModal(matchedImg.url, matchedImg.caption, matchedImg);
      } else if (src) {
        openCropRotateModal(src, alt || "Screenshot | width: 75% | align: center");
      }
    }
  });

  window.schedulePreview = schedulePreview;
  window.updatePreview = updatePreview;
  window.autoSaveState = autoSaveState;

  async function exportPdf() {
    showLoading("Generating High-Resolution Vector PDF...", "Compiling handwritten typography & CS diagrams...");
    const formData = getFormData();
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${lectureInput.value.replace(/[^a-zA-Z0-9_-]/g, "_")}_Notes.pdf` || "Handwritten_Notes.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("PDF Generation Failed: " + err.message);
    } finally {
      hideLoading();
    }
  }

  function getFormData() {
    const fd = new FormData();
    const headerMode = headerModeSelect ? headerModeSelect.value : "first_page";
    const showHeader = headerMode !== "none";

    fd.append("content", notesTextarea ? notesTextarea.value : "");
    fd.append("font_family", fontSelect ? fontSelect.value : "Coming Soon");
    fd.append("paper_style", paperSelect ? paperSelect.value : "plain");
    fd.append("show_header", showHeader);
    fd.append("header_mode", headerMode);
    fd.append("logo_type", logoSelect ? logoSelect.value : "pw");
    fd.append("custom_brand", customBrandText ? (customBrandText.value || "PW ONLYIAS") : "PW ONLYIAS");
    fd.append("subject", subjectInput ? (subjectInput.value || "Indian Polity") : "Indian Polity");
    fd.append("lecture", lectureInput ? (lectureInput.value || "Lecture Notes") : "Lecture Notes");

    // Colors
    fd.append("subject_color", colorSubjectInput ? colorSubjectInput.value : "#dc2626");
    fd.append("lecture_color", colorLectureInput ? colorLectureInput.value : "#2563eb");
    fd.append("body_color", colorBodyInput ? colorBodyInput.value : "#111827");
    fd.append("section_color", colorSectionInput ? colorSectionInput.value : "#dc2626");
    fd.append("subheading_color", colorSubheadingInput ? colorSubheadingInput.value : "#2563eb");
    fd.append("sidebar_color", colorSidebarInput ? colorSidebarInput.value : "#059669");

    // Sidebar & Footer
    const isSidebar = toggleSidebar ? toggleSidebar.checked : true;
    fd.append("show_sidebar", isSidebar);
    fd.append("sidebar_text", sidebarTextInput ? (sidebarTextInput.value || "Space for Notes") : "Space for Notes");

    const isFooter = toggleFooter ? toggleFooter.checked : true;
    fd.append("show_footer", isFooter);
    fd.append("footer_left", footerLeftInput ? (footerLeftInput.value || "khajan singh") : "khajan singh");
    fd.append("footer_right", footerRightInput ? (footerRightInput.value || "unit 1") : "unit 1");

    // Margins (mm)
    fd.append("margin_top", marginTopInput ? (marginTopInput.value || "8") : "8");
    fd.append("margin_bottom", marginBottomInput ? (marginBottomInput.value || "8") : "8");
    fd.append("margin_left", marginLeftInput ? (marginLeftInput.value || "8") : "8");
    fd.append("margin_right", marginRightInput ? (marginRightInput.value || "8") : "8");

    // Draft Mode State
    fd.append("draft_mode", isDraftMode);

    // Typography & Realism (pt, px, level)
    fd.append("font_size", sliderFontSize ? sliderFontSize.value : "11.5");
    fd.append("letter_spacing", sliderLetterSpacing ? sliderLetterSpacing.value : "0.0");
    fd.append("word_spacing", sliderWordSpacing ? sliderWordSpacing.value : "1.0");
    fd.append("line_height", sliderLineHeight ? sliderLineHeight.value : "1.55");
    fd.append("realism", realismSelect ? realismSelect.value : "natural");

    return fd;
  }

  function showLoading(title, desc) {
    loadingTitle.textContent = title;
    loadingDesc.textContent = desc;
    loadingOverlay.classList.remove("hidden");
  }

  function hideLoading() {
    loadingOverlay.classList.add("hidden");
  }
});
