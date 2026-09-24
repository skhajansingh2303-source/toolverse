#!/usr/bin/env python3
"""
CLI Tool: Convert any text PDF, markdown or txt file into beautiful Handwritten Notes PDF.
Usage:
    python3 cli.py input.pdf -o output_notes.pdf
    python3 cli.py notes.txt -o output.pdf --font "Coming Soon" --subject "Indian Polity" --lecture "Lecture 01"
"""

import os
import sys
import argparse
from converter import PDFToNotesConverter

def main():
    parser = argparse.ArgumentParser(description="Convert Text PDF / Document to Handwritten Notes PDF")
    parser.add_argument("input_file", help="Path to input PDF, TXT, or Markdown file")
    parser.add_argument("-o", "--output", default="handwritten_notes.pdf", help="Output PDF file path")
    parser.add_argument("--font", default="Coming Soon", choices=[
        "Coming Soon", "Caveat", "Patrick Hand", "Kalam", "Architects Daughter", "Indie Flower", "Gochi Hand", "Comic Neue"
    ], help="Handwriting font family")
    parser.add_argument("--paper", default="plain", choices=["plain", "ruled", "grid", "cream"], help="Background paper style")
    parser.add_argument("--subject", default="Indian Polity", help="Subject title (e.g. Indian Polity)")
    parser.add_argument("--lecture", default="Lecture 01: Historical Background", help="Lecture or Chapter title")
    parser.add_argument("--logo", default="pw", choices=["pw", "custom", "none"], help="Header logo style")
    parser.add_argument("--brand", default="PW ONLYIAS", help="Custom brand text if logo is custom")
    parser.add_argument("--sidebar", action="store_true", default=True, help="Include 'Space for Notes' sidebar")
    parser.add_argument("--no-sidebar", dest="sidebar", action="store_false", help="Disable 'Space for Notes' sidebar")
    parser.add_argument("--page-size", default="A4", choices=["A4", "Letter"], help="PDF Page Size")
    parser.add_argument("--footer-left", default="khajan singh", help="Left footer text")
    parser.add_argument("--footer-right", default="unit 1", help="Right footer text")
    
    args = parser.parse_args()

    if not os.path.exists(args.input_file):
        print(f"Error: Input file '{args.input_file}' not found.")
        sys.exit(1)

    print(f"[*] Processing input file: {args.input_file}")
    converter = PDFToNotesConverter()

    if args.input_file.lower().endswith(".pdf"):
        raw_text = converter.extract_text_from_pdf(args.input_file)
    else:
        with open(args.input_file, "r", encoding="utf-8") as f:
            raw_text = f.read()

    print(f"[*] Extracted {len(raw_text)} characters.")

    options = {
        "font_family": args.font,
        "paper_style": args.paper,
        "subject": args.subject,
        "lecture": args.lecture,
        "logo_type": args.logo,
        "custom_brand": args.brand,
        "show_sidebar": args.sidebar,
        "page_size": args.page_size,
        "footer_left": args.footer_left,
        "footer_right": args.footer_right
    }

    print("[*] Rendering HTML and converting to PDF using Chromium...")
    html_content = converter.generate_html(raw_text, options)
    
    output_path = os.path.abspath(args.output)
    converter.render_pdf(html_content, output_path, page_size=args.page_size)

    print(f"[✓] Success! Handwritten Notes PDF saved to: {output_path}")

if __name__ == "__main__":
    main()
