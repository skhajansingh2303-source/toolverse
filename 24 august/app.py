"""
FastAPI Server for PDF to Handwritten Notes Converter Web Application.
Provides endpoints for file upload, text extraction, ChatGPT text auto-formatting, HTML preview, and PDF generation.
"""

import os
import uuid
import shutil
import tempfile
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from converter import PDFToNotesConverter

app = FastAPI(title="PDF to Handwritten Notes Converter", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

converter = PDFToNotesConverter()

TEMP_DIR = os.path.join(tempfile.gettempdir(), "pdf_notes_output")
os.makedirs(TEMP_DIR, exist_ok=True)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


import base64
import time

UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


@app.post("/api/upload-image")
async def upload_image_endpoint(
    image_data: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Save an image (base64 data URL or uploaded file) to /static/uploads and return its clean URL."""
    try:
        ext = "png"
        img_bytes = None

        if file:
            filename = file.filename or "image.png"
            if "." in filename:
                ext = filename.rsplit(".", 1)[-1].lower()
            img_bytes = await file.read()
        elif image_data:
            if image_data.startswith("data:image/"):
                header, base64_str = image_data.split(",", 1)
                if "image/jpeg" in header or "image/jpg" in header:
                    ext = "jpg"
                elif "image/webp" in header:
                    ext = "webp"
                elif "image/gif" in header:
                    ext = "gif"
                img_bytes = base64.b64decode(base64_str)
            else:
                img_bytes = base64.b64decode(image_data)

        if not img_bytes:
            raise HTTPException(status_code=400, detail="No valid image data received.")

        out_filename = f"img_{int(time.time())}_{uuid.uuid4().hex[:8]}.{ext}"
        out_filepath = os.path.join(UPLOADS_DIR, out_filename)

        with open(out_filepath, "wb") as f:
            f.write(img_bytes)

        return JSONResponse({"url": f"/static/uploads/{out_filename}", "success": True})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/favicon.ico")
async def favicon():
    return HTMLResponse(content="", status_code=204)


@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>PDF to Handwritten Notes Server Running</h1>"


@app.post("/api/auto-format-text")
async def auto_format_text_endpoint(text: str = Form(...)):
    """Auto format raw ChatGPT text into structured Markdown notes with headers and lists."""
    try:
        formatted = converter.auto_format_chatgpt_text(text)
        structure = converter.parse_text_to_structure(formatted)
        return {
            "success": True,
            "formatted_text": formatted,
            "subject": structure.get("subject", ""),
            "lecture": structure.get("lecture", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract-pdf")
async def extract_pdf_endpoint(file: UploadFile = File(...)):
    """Extract text from uploaded PDF."""
    try:
        temp_input = os.path.join(TEMP_DIR, f"input_{uuid.uuid4().hex}_{file.filename}")
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = converter.extract_text_from_pdf(temp_input)
        structure = converter.parse_text_to_structure(extracted_text)

        try:
            os.remove(temp_input)
        except Exception:
            pass

        return {
            "success": True,
            "filename": file.filename,
            "subject": structure.get("subject", ""),
            "lecture": structure.get("lecture", ""),
            "text": extracted_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preview-html")
async def preview_html_endpoint(
    content: str = Form(""),
    font_family: str = Form("Coming Soon"),
    paper_style: str = Form("plain"),
    show_header: bool = Form(True),
    header_mode: str = Form("first_page"),
    subject: str = Form("Indian Polity"),
    lecture: str = Form("Lecture 01: Historical Background"),
    logo_type: str = Form("pw"),
    custom_brand: str = Form("PW ONLYIAS"),
    subject_color: str = Form("#dc2626"),
    lecture_color: str = Form("#2563eb"),
    body_color: str = Form("#111827"),
    section_color: str = Form("#dc2626"),
    subheading_color: str = Form("#2563eb"),
    show_sidebar: bool = Form(True),
    sidebar_width: int = Form(145),
    sidebar_color: str = Form("#059669"),
    sidebar_text: str = Form("Space for Notes"),
    table_header_bg: str = Form("#28416c"),
    show_footer: bool = Form(True),
    footer_bg: str = Form("#dbe8f6"),
    footer_left: str = Form("khajan singh"),
    footer_right: str = Form("unit 1"),
    margin_top: float = Form(8.0),
    margin_bottom: float = Form(8.0),
    margin_left: float = Form(8.0),
    margin_right: float = Form(8.0),
    draft_mode: bool = Form(False),
    font_size: float = Form(11.5),
    letter_spacing: float = Form(0.0),
    word_spacing: float = Form(1.0),
    line_height: float = Form(1.55),
    realism: str = Form("natural")
):
    """Generate HTML preview string for the notes."""
    try:
        options = {
            "font_family": font_family,
            "paper_style": paper_style,
            "show_header": show_header,
            "header_mode": header_mode,
            "subject": subject,
            "lecture": lecture,
            "logo_type": logo_type,
            "custom_brand": custom_brand,
            "subject_color": subject_color,
            "lecture_color": lecture_color,
            "body_color": body_color,
            "section_color": section_color,
            "subheading_color": subheading_color,
            "show_sidebar": show_sidebar,
            "sidebar_width": sidebar_width,
            "sidebar_color": sidebar_color,
            "sidebar_text": sidebar_text,
            "table_header_bg": table_header_bg,
            "show_footer": show_footer,
            "footer_bg": footer_bg,
            "footer_left": footer_left,
            "footer_right": footer_right,
            "margin_top": margin_top,
            "margin_bottom": margin_bottom,
            "margin_left": margin_left,
            "margin_right": margin_right,
            "draft_mode": draft_mode,
            "font_size": font_size,
            "letter_spacing": letter_spacing,
            "word_spacing": word_spacing,
            "line_height": line_height,
            "realism": realism
        }
        html_out = converter.generate_html(content, options)
        return HTMLResponse(content=html_out)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-pdf")
async def generate_pdf_endpoint(
    content: str = Form(""),
    font_family: str = Form("Coming Soon"),
    paper_style: str = Form("plain"),
    show_header: bool = Form(True),
    header_mode: str = Form("first_page"),
    subject: str = Form("Indian Polity"),
    lecture: str = Form("Lecture 01: Historical Background"),
    logo_type: str = Form("pw"),
    custom_brand: str = Form("PW ONLYIAS"),
    subject_color: str = Form("#dc2626"),
    lecture_color: str = Form("#2563eb"),
    body_color: str = Form("#111827"),
    section_color: str = Form("#dc2626"),
    subheading_color: str = Form("#2563eb"),
    show_sidebar: bool = Form(True),
    sidebar_width: int = Form(145),
    sidebar_color: str = Form("#059669"),
    sidebar_text: str = Form("Space for Notes"),
    table_header_bg: str = Form("#28416c"),
    show_footer: bool = Form(True),
    footer_bg: str = Form("#dbe8f6"),
    footer_left: str = Form("khajan singh"),
    footer_right: str = Form("unit 1"),
    page_size: str = Form("A4"),
    margin_top: float = Form(8.0),
    margin_bottom: float = Form(8.0),
    margin_left: float = Form(8.0),
    margin_right: float = Form(8.0),
    draft_mode: bool = Form(False),
    font_size: float = Form(11.5),
    letter_spacing: float = Form(0.0),
    word_spacing: float = Form(1.0),
    line_height: float = Form(1.55),
    realism: str = Form("natural")
):
    """Generate high-quality vector PDF file using Chromium."""
    try:
        options = {
            "font_family": font_family,
            "paper_style": paper_style,
            "show_header": show_header,
            "header_mode": header_mode,
            "subject": subject,
            "lecture": lecture,
            "logo_type": logo_type,
            "custom_brand": custom_brand,
            "subject_color": subject_color,
            "lecture_color": lecture_color,
            "body_color": body_color,
            "section_color": section_color,
            "subheading_color": subheading_color,
            "show_sidebar": show_sidebar,
            "sidebar_width": sidebar_width,
            "sidebar_color": sidebar_color,
            "sidebar_text": sidebar_text,
            "table_header_bg": table_header_bg,
            "show_footer": show_footer,
            "footer_bg": footer_bg,
            "footer_left": footer_left,
            "footer_right": footer_right,
            "page_size": page_size,
            "margin_top": margin_top,
            "margin_bottom": margin_bottom,
            "margin_left": margin_left,
            "margin_right": margin_right,
            "draft_mode": draft_mode,
            "font_size": font_size,
            "letter_spacing": letter_spacing,
            "word_spacing": word_spacing,
            "line_height": line_height,
            "realism": realism
        }
        
        html_out = converter.generate_html(content, options)
        pdf_filename = f"handwritten_notes_{uuid.uuid4().hex[:8]}.pdf"
        output_path = os.path.join(TEMP_DIR, pdf_filename)

        await converter.render_pdf_async(html_out, output_path, page_size)

        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"{lecture.replace(' ', '_')}_Notes.pdf" if lecture else "Handwritten_Notes.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cs-sample-notes")
async def get_cs_sample_notes():
    """Return Computer Science Data Structures & Algorithms notes with Tree Diagrams & Code."""
    cs_text = """# BINARY SEARCH TREE (BST) & TREE TRAVERSALS

A **Binary Search Tree** is a node-based binary tree data structure where each node has at most two children, and the key in each node must be greater than or equal to any key stored in the left sub-tree, and less than or equal to any key stored in the right sub-tree.

## Visual Binary Search Tree (BST)

```tree
graph TD
    50((50)) --> 30((30))
    50 --> 70((70))
    30 --> 20((20))
    30 --> 40((40))
    70 --> 60((60))
    70 --> 80((80))
```

## Key Properties of BST

- **Left Subtree:** Values are strictly smaller than root (`Left < Root`).
- **Right Subtree:** Values are strictly greater than root (`Right > Root`).
- **Inorder Traversal:** An Inorder Traversal (`Left -> Root -> Right`) always produces elements in **sorted ascending order**.

## Time & Space Complexity Analysis

| Operation | Average Case | Worst Case (Skewed) |
| Search | O(log N) | O(N) |
| Insertion | O(log N) | O(N) |
| Deletion | O(log N) | O(N) |
| Inorder Traversal | O(N) | O(N) |

<!-- PAGE_BREAK -->

# C++ IMPLEMENTATION OF BST INSERTION

## C++ Node Definition & Recursive Insert

```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

// Insert a new key into BST
Node* insertBST(Node* root, int val) {
    if (root == nullptr) {
        return new Node(val);
    }
    if (val < root->data) {
        root->left = insertBST(root->left, val);
    } else {
        root->right = insertBST(root->right, val);
    }
    return root;
}
```

## Balanced AVL Tree Structure (Self-Balancing)

In an **AVL Tree**, the difference between heights of left and right subtrees (Balance Factor) cannot be more than 1 for all nodes.

```tree
graph TD
    Root((40)) --> L1((20))
    Root --> R1((60))
    L1 --> L2((10))
    L1 --> L3((30))
    R1 --> R2((50))
    R1 --> R3((70))
```

### Tree Traversal Orders
- **Inorder (L, Root, R):** `10 -> 20 -> 30 -> 40 -> 50 -> 60 -> 70` (Sorted)
- **Preorder (Root, L, R):** `40 -> 20 -> 10 -> 30 -> 60 -> 50 -> 70`
- **Postorder (L, R, Root):** `10 -> 30 -> 20 -> 50 -> 70 -> 60 -> 40`
"""
    return {
        "subject": "Data Structures & Algorithms",
        "lecture": "Binary Search Trees (BST) & Traversals",
        "content": cs_text
    }


@app.get("/api/user-structures-sample")
async def get_user_structures_sample():
    """Return structured sample notes showcasing all 4 diagram structures from the notebook image."""
    user_text = """# FOUR CORE DIAGRAM STRUCTURES IN COMPUTER SCIENCE & NOTES

Visual diagrams provide high retention and quick revision for complex relationships, hierarchies, and step-by-step algorithms.

## 1. Binary Tree with Circular Nodes (Structure 1)

A binary tree is a hierarchical data structure where each node has at most two children, referred to as the left child and right child.

```tree
23
  21
  31
```

- **Root Value:** `23`
- **Left Child Node:** `21` (Smaller value in BST property)
- **Right Child Node:** `31` (Greater value in BST property)

## 2. Multi-Level Deep Binary Tree (Structure 2)

An expanded tree showing left and right subtrees with deeper branches and leaf nodes:

```tree
21
  31
    15
    18
  24
    22
    28
      29
```

- **Root Node:** `21`
- **Left Subtree Root:** `31` with leaf nodes `15` and `18`.
- **Right Subtree Root:** `24` branching into `22` and `28`, with `28` connecting to descendant `29`.

<!-- PAGE_BREAK -->

# HIERARCHICAL & FLOW STRUCTURES

## 3. Hierarchical Organization Tree with Rectangular Boxes (Structure 3)

A multi-branch organization / entity hierarchy linking multiple attributes and sub-categories:

```tree
Name
  Roll No.
  Class
    eg
    class
    Roll
  Khajan
```

- **Root Category:** `Name`
- **First Level Branches:** `Roll No.`, `Class`, and `Khajan`.
- **Sub-branches under Class:** `eg`, `class`, and `Roll`.

## 4. Step-by-Step Vertical Flowchart (Structure 4)

A sequential pipeline diagram illustrating execution order or data flow from start to finish:

```tree
Name -> Class -> Roll No.
```

- **Step 1:** `Name` (Initial input / Identifier)
- **Step 2:** `Class` (Categorization / Processing)
- **Step 3:** `Roll No.` (Final assigned index / Result)
"""
    return {
        "subject": "Data Structures & Organization",
        "lecture": "Core Diagram Structures — Trees, Hierarchies & Flowcharts",
        "content": user_text
    }


@app.get("/api/sample-notes")
async def get_sample_notes():
    """Return structured sample notes corresponding to the Historical Background example."""
    sample_text = """# HISTORICAL BACKGROUND OF THE INDIAN CONSTITUTION

Several constitutional features of India have their roots in British rule. Events during British administration shaped the legal and administrative framework of modern India. The British created laws, courts, and administrative structures that later influenced the design of the Indian Constitution.

## Historical Timeline at a Glance

| Year / Event | Significance |
| 1600 | East India Company (EIC) granted charter by Queen Elizabeth I — exclusive trading rights in India |
| 1765 | Diwani rights (revenue & civil justice) of Bengal, Bihar & Orissa granted to EIC by Mughal Emperor Shah Alam after Battle of Buxar — beginning of territorial power |
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
"""
    return {
        "subject": "Indian Polity",
        "lecture": "Lecture 01: Historical Background",
        "content": sample_text
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
