# 📝 PDF to Handwritten Notes Converter Studio

A full-stack project to automatically convert any textbook / lecture PDF, Word document, or plain text into stylized **Handwritten Class Notes** matching the exact design and format of the reference document (PW OnlyIAS style, with handwritten typography, colored section headers, bullet points, tables, and a "Space for Notes" sidebar).

---

## ✨ Features

- **Exact Visual Matching**: Recreates the design with:
  - **Handwritten Typography**: Google Font `Coming Soon` (matching the sample), plus `Caveat`, `Patrick Hand`, `Kalam`, `Architects Daughter`, `Indie Flower`, and more.
  - **Color-Coded Structure**: Red uppercase section headings with red underlines, navy subheadings, bold inline emphasis.
  - **Sidebar**: "Space for Notes" right-hand margin box.
  - **Tables & Lists**: Clean bordered tables with dark navy headers and bulleted key points.
  - **Header & Footer**: PW OnlyIAS emblem / Custom brand logo, Subject, Lecture title, and bottom footer bar.
  - **Paper Textures**: Plain White, Ruled / Lined notebook, Grid / Graph paper, or Sepia / Cream.
- **🎨 Visual Diagram & Structure Studio**:
  - Draw any diagram effortlessly with an interactive visual builder and live real-time preview.
  - **4 Notebook Structures Supported Out-of-the-Box**:
    1. **Binary Tree (Circle Nodes)**: `23 -> 21, 31`
    2. **Deep Binary Tree (Subtrees & Leaves)**: `21 -> 31, 24 with branches`
    3. **Hierarchical Organization Tree (Box Nodes)**: `Name -> Roll No, Class [eg, class, Roll], Khajan`
    4. **Step-by-Step Flowchart**: `Name -> Class -> Roll No.`
  - **Smart Outline Mode**: Type natural indented text or `A -> B -> C` arrow chains; numbers automatically become circular tree nodes.
  - **Visual Tree Node Builder**: Add, edit, branch, reorder and delete nodes interactively with zero typing.
  - **Customizable Shapes & Styles**: Circles `(( ))`, Boxes `[ ]`, Rounded `( )`, Stadiums `([ ])`, Diamonds `{ }`, Cylinders `[( )]`, plus 5 color themes.
- **Interactive Web Studio**:
  - Drag-and-drop PDF upload with automatic text & structure extraction.
  - Live split-screen Markdown/Content editor.
  - Real-time instant preview with print & vector PDF export.
- **Command Line Interface (CLI)**:
  - Batch convert PDFs directly from the terminal.

---

## 🚀 Quick Start

### 1. Run the Web Application
```bash
./run.sh
```
Or start manually:
```bash
python3 app.py
```
Open your browser and navigate to: **`http://localhost:8000`**

---

### 2. Command Line Interface (CLI)

Convert any PDF or text file directly from your terminal:

```bash
# Basic conversion
python3 cli.py "1. Historical background.pdf" -o "My_Handwritten_Notes.pdf"

# With custom options
python3 cli.py input.pdf -o output_notes.pdf \
  --font "Coming Soon" \
  --subject "Indian Polity" \
  --lecture "Lecture 01: Historical Background" \
  --paper "plain"
```

#### CLI Options:
- `--font`: Choose from `Coming Soon`, `Caveat`, `Patrick Hand`, `Kalam`, `Architects Daughter`, `Indie Flower`, `Gochi Hand`, `Comic Neue`
- `--paper`: `plain`, `ruled`, `grid`, `cream`
- `--subject`: Subject title (e.g. `Indian Polity`)
- `--lecture`: Lecture / Chapter title
- `--logo`: `pw`, `custom`, `none`
- `--brand`: Custom brand name
- `--no-sidebar`: Remove the "Space for Notes" sidebar
- `--page-size`: `A4` or `Letter`

---

## 📂 Project Structure

```
.
├── 1. Historical background.pdf   # Reference sample PDF
├── app.py                         # FastAPI Web Server & API endpoints
├── converter.py                   # Core extraction, template rendering & Chromium PDF engine
├── cli.py                         # Command-line conversion utility
├── requirements.txt               # Dependencies
├── run.sh                         # Quick launch bash script
├── static/
│   ├── index.html                 # Modern studio UI
│   ├── style.css                  # Studio styling
│   └── app.js                     # Live preview & client-side controller
└── README.md                      # Documentation
```
