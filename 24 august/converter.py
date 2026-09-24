"""
Core PDF to Handwritten Notes Converter Engine.
Extracts structured content from uploaded PDFs/text and renders beautiful handwritten-style lecture notes.
Optimized for 100% Full-Page Height Utilization with Intelligent Tight Packing (Zero wasted bottom space).
"""

import os
import re
import html
import math
import asyncio
from typing import Optional, List, Dict, Any
import fitz  # PyMuPDF
import pdfplumber
from jinja2 import Template
from playwright.async_api import async_playwright

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{ subject }} - {{ lecture }}</title>
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Coming+Soon&family=Caveat:wght@500;700&family=Patrick+Hand&family=Kalam:wght@400;700&family=Architects+Daughter&family=Indie+Flower&family=Gochi+Hand&family=Comic+Neue:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<!-- Mermaid JS for Computer Science Diagrams (Trees, Graphs, Flowcharts) -->
<script src="/static/mermaid.min.js"></script>
<script>
if (!window.mermaid) {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  document.head.appendChild(s);
}
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

  body {
    margin: 0;
    padding: 0;
    font-family: '{{ font_family }}', 'Coming Soon', cursive, sans-serif;
    color: {{ body_color | default('#111827') }};
    background-color: #f3f4f6;
    font-size: {{ font_size | default(11.5) }}pt;
    letter-spacing: {{ letter_spacing | default(0.0) }}px;
    word-spacing: {{ word_spacing | default(1.0) }}px;
    line-height: {{ line_height | default(1.55) }};
  }

  .pages-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .page-container {
    width: 210mm;
    height: 297mm;
    min-height: 297mm;
    max-height: 297mm;
    margin: 0 auto 25px auto;
    padding-top: {% if margin_top > 0 %}{{ margin_top }}mm{% else %}0mm{% endif %};
    padding-right: {% if margin_right > 0 %}{{ margin_right }}mm{% else %}0mm{% endif %};
    padding-bottom: {% if margin_bottom > 0 %}{{ margin_bottom }}mm{% else %}0mm{% endif %};
    padding-left: {% if margin_left > 0 %}{{ margin_left }}mm{% else %}0mm{% endif %};
    position: relative;
    background-color: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
    break-inside: avoid;
    page-break-inside: avoid;
    scroll-margin-top: 20px;
    {% if paper_style == 'ruled' %}
    background-image: repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff calc(100% / 22 - 1px), #e2e8f0 calc(100% / 22 - 1px), #e2e8f0 calc(100% / 22));
    background-size: 100% calc(100% / 22);
    {% elif paper_style == 'grid' %}
    background-image: linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
    background-size: 20px 20px;
    {% elif paper_style == 'cream' %}
    background-color: #fdfbf7;
    {% endif %}
  }

  {% if draft_mode %}
  /* Draft Mode: Bold, Deep Dark, Rich Ink Contrast */
  body {
    color: #000000 !important;
    font-weight: 700 !important;
    -webkit-text-stroke: 0.35px #000000;
    text-stroke: 0.35px #000000;
  }

  p, li, td, th, span, pre, code {
    font-weight: 700 !important;
    -webkit-text-stroke: 0.35px currentColor;
    text-stroke: 0.35px currentColor;
  }

  p, li {
    color: #000000 !important;
  }

  strong, b {
    font-weight: 900 !important;
    -webkit-text-stroke: 0.55px currentColor;
    color: #000000 !important;
    text-decoration: none;
  }

  .section-heading, .section-heading-text {
    font-weight: 900 !important;
    -webkit-text-stroke: 0.55px currentColor;
    filter: brightness(0.85) contrast(1.2);
  }

  .subheading, .subheading-text {
    font-weight: 800 !important;
    -webkit-text-stroke: 0.45px currentColor;
    filter: brightness(0.85) contrast(1.2);
  }

  .sub-feature-title, .sub-feature-text {
    font-weight: 800 !important;
    -webkit-text-stroke: 0.4px currentColor;
  }

  .notes-sidebar-header {
    font-weight: 800 !important;
    -webkit-text-stroke: 0.4px currentColor;
  }

  .notes-table th {
    font-weight: 800 !important;
    -webkit-text-stroke: 0.4px #ffffff;
  }

  .notes-table td {
    font-weight: 700 !important;
    color: #000000 !important;
  }

  .mermaid .node .label {
    font-weight: 900 !important;
    -webkit-text-stroke: 0.45px #000000 !important;
  }

  .mermaid .edgePath path {
    stroke-width: 2.5px !important;
  }
  {% endif %}

  @media screen {
    html, body {
      background-color: #1e2430;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0;
    }
    .pages-wrapper {
      padding: 16px 0;
      transform-origin: top center;
      transition: transform 0.15s ease-out;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .page-container {
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.45);
      border-radius: 4px;
    }
  }

  @media print {
    *, *:before, *:after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      height: 100% !important;
    }
    .pages-wrapper {
      padding: 0 !important;
      margin: 0 !important;
      transform: none !important;
      -webkit-transform: none !important;
      width: 210mm !important;
      display: block !important;
    }
    .page-container {
      width: 210mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
      padding-top: {% if margin_top > 0 %}{{ margin_top }}mm{% else %}0mm{% endif %} !important;
      padding-right: {% if margin_right > 0 %}{{ margin_right }}mm{% else %}0mm{% endif %} !important;
      padding-bottom: {% if margin_bottom > 0 %}{{ margin_bottom }}mm{% else %}0mm{% endif %} !important;
      padding-left: {% if margin_left > 0 %}{{ margin_left }}mm{% else %}0mm{% endif %} !important;
      page-break-before: auto !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .page-container:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  }

  /* Header Section */
  .doc-header {
    text-align: center;
    margin-top: {% if margin_top < 0 %}{{ margin_top }}mm{% else %}0mm{% endif %};
    margin-bottom: 4px;
    padding-bottom: 1px;
    flex-shrink: 0;
  }

  .brand-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    font-weight: 900;
    font-size: 22px;
    letter-spacing: -0.5px;
    color: #111827;
    margin-bottom: 2px;
  }

  .logo-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid #111827;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 12px;
    font-weight: 900;
    margin-right: 6px;
    line-height: 1;
    position: relative;
  }

  .logo-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: #ea580c;
    border-radius: 50%;
    top: -3px;
    right: 4px;
  }

  .subject-title {
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    font-size: 20pt;
    color: {{ subject_color }};
    text-decoration: underline;
    text-underline-offset: 4px;
    margin-bottom: 2px;
    line-height: 1.25;
  }

  .lecture-title {
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    font-size: 18pt;
    color: {{ lecture_color }};
    text-decoration: underline;
    text-underline-offset: 4px;
    margin-bottom: 4px;
    line-height: 1.25;
  }

  /* Main Body Layout */
  .content-layout {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
    overflow: visible;
    margin-top: {% if margin_top < 0 and not show_header %}{{ margin_top }}mm{% else %}0mm{% endif %};
    margin-right: {% if margin_right < 0 %}{{ margin_right }}mm{% else %}0mm{% endif %};
    margin-bottom: {% if margin_bottom < 0 %}{{ margin_bottom }}mm{% else %}0mm{% endif %};
    margin-left: {% if margin_left < 0 %}{{ margin_left }}mm{% else %}0mm{% endif %};
    padding-bottom: {% if show_footer %}34px{% else %}0px{% endif %};
  }

  .main-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding-left: 5px;
    padding-right: 4px;
    overflow: visible;
  }

  .main-column > :first-child {
    margin-top: 0 !important;
  }

  /* Sidebar Notes Box */
  .notes-sidebar {
    width: {{ sidebar_width }}px;
    align-self: stretch;
    height: 100%;
    border: 1.5px solid {{ sidebar_color }};
    border-radius: 3px;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .notes-sidebar-header {
    color: {{ sidebar_color }};
    font-size: 14pt;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }

  /* Typography & Content Elements (Exact Match with Reference PDF) */
  .section-heading {
    color: {{ section_color }};
    font-size: 18pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 8px;
    margin-bottom: 4px;
    line-height: 1.45;
    page-break-after: avoid;
    break-after: avoid;
  }

  .section-heading-text {
    border-bottom: 1.5px solid {{ section_color }};
    padding-bottom: 2px;
    display: inline;
  }

  .subheading {
    color: {{ subheading_color }};
    font-size: 16pt;
    font-weight: bold;
    margin-top: 7px;
    margin-bottom: 3.5px;
    line-height: 1.42;
    page-break-after: avoid;
    break-after: avoid;
  }

  .subheading-text {
    text-decoration: underline;
    text-underline-offset: 3px;
    display: inline;
  }

  .sub-feature-title {
    color: #111827;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 6px;
    margin-bottom: 3px;
    line-height: 1.4;
    page-break-after: avoid;
    break-after: avoid;
  }

  .sub-feature-text {
    text-decoration: underline;
    text-underline-offset: 3px;
    display: inline;
  }

  p {
    font-size: {{ font_size | default(11.5) }}pt;
    line-height: {{ line_height | default(1.55) }};
    letter-spacing: {{ letter_spacing | default(0.0) }}px;
    word-spacing: {{ word_spacing | default(1.0) }}px;
    margin: 2px 0 4px 0;
  }

  strong, b {
    font-weight: bold;
    color: #000000;
    text-decoration: none;
  }

  ul {
    margin: 2px 0 4px 0;
    padding-left: 20px;
    list-style-type: disc;
  }

  li {
    font-size: {{ font_size | default(11.5) }}pt;
    line-height: {{ line_height | default(1.55) }};
    letter-spacing: {{ letter_spacing | default(0.0) }}px;
    word-spacing: {{ word_spacing | default(1.0) }}px;
    margin-bottom: 2.5px;
  }

  /* Handwriting Realism & Natural Jitter Effects */
  {% if realism == 'subtle' %}
  p, li, .section-heading, .subheading { transform-origin: 0% 50%; }
  p:nth-child(odd) { transform: rotate(-0.12deg); }
  p:nth-child(even) { transform: rotate(0.12deg); }
  li:nth-child(3n+1) { transform: rotate(0.15deg); }
  li:nth-child(3n+2) { transform: rotate(-0.12deg); }
  li:nth-child(3n) { transform: rotate(0.08deg); }
  strong { transform: scale(1.02); display: inline-block; }
  .section-heading { transform: rotate(-0.15deg); }
  .subheading { transform: rotate(0.12deg); }
  {% elif realism == 'natural' %}
  p, li, .section-heading, .subheading { transform-origin: 0% 50%; }
  p:nth-child(odd) { transform: rotate(-0.18deg); }
  p:nth-child(even) { transform: rotate(0.18deg); }
  li:nth-child(4n+1) { transform: rotate(0.2deg) translateY(0.2px); }
  li:nth-child(4n+2) { transform: rotate(-0.15deg) translateY(-0.15px); }
  li:nth-child(4n+3) { transform: rotate(0.15deg) translateY(0.1px); }
  li:nth-child(4n) { transform: rotate(-0.1deg) translateY(-0.1px); }
  strong { transform: rotate(0.12deg) scale(1.02); display: inline-block; }
  .section-heading { transform: rotate(-0.2deg); }
  .subheading { transform: rotate(0.18deg); }
  {% elif realism == 'high' %}
  p, li, .section-heading, .subheading { transform-origin: 0% 50%; }
  p:nth-child(odd) { transform: rotate(-0.3deg) translateY(0.3px); }
  p:nth-child(even) { transform: rotate(0.28deg) translateY(-0.25px); }
  li:nth-child(3n+1) { transform: rotate(0.35deg) translateY(0.35px) translateX(0.2px); }
  li:nth-child(3n+2) { transform: rotate(-0.3deg) translateY(-0.3px) translateX(0.1px); }
  li:nth-child(3n) { transform: rotate(0.25deg) translateY(0.2px); }
  strong { transform: rotate(-0.2deg) scale(1.03); display: inline-block; }
  .section-heading { transform: rotate(-0.35deg); }
  .subheading { transform: rotate(0.3deg); }
  {% endif %}

  /* Computer Science Diagrams (Mermaid Trees, Flowcharts, Graphs) */
  .mermaid {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 6px auto 8px auto;
    page-break-inside: avoid;
    break-inside: avoid;
    background: transparent;
    border: none;
    padding: 2px 4px;
    overflow: visible !important;
    width: 100%;
    box-sizing: border-box;
  }

  .mermaid svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    min-width: 180px;
    height: auto;
    overflow: visible !important;
  }

  .mermaid .node foreignObject {
    overflow: visible !important;
  }

  .mermaid .node rect,
  .mermaid .node polygon {
    stroke: #0284c7 !important;
    stroke-width: 1.8px !important;
    fill: #f0f9ff !important;
    rx: 6px !important;
    ry: 6px !important;
  }

  .mermaid .node circle {
    stroke: #0284c7 !important;
    stroke-width: 1.8px !important;
    fill: #e0f2fe !important;
  }

  .mermaid .node .label {
    font-family: '{{ font_family }}', 'Coming Soon', cursive, sans-serif !important;
    font-size: 14px !important;
    font-weight: bold !important;
    color: #0f172a !important;
    line-height: 1.2 !important;
    overflow: visible !important;
  }

  .mermaid .edgePath path {
    stroke: #0284c7 !important;
    stroke-width: 1.8px !important;
  }

  .mermaid .arrowMarkerPath,
  .mermaid marker path {
    fill: #0284c7 !important;
    stroke: #0284c7 !important;
    stroke-width: 1px !important;
  }

  /* Images and Screenshots (Resizable & Movable according to page) */
  .note-image-wrapper {
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 8px 0 10px 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    user-select: none;
    transition: box-shadow 0.15s ease;
  }

  .note-image-wrapper:hover {
    box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4);
    border-radius: 6px;
  }

  .note-image-wrapper img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1.5px solid #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: grab;
  }

  .note-image-wrapper img:active {
    cursor: grabbing;
  }

  .img-interactive-toolbar {
    display: none;
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    border: 1px solid #0284c7;
    border-radius: 6px;
    padding: 2px 6px;
    gap: 4px;
    align-items: center;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .note-image-wrapper:hover .img-interactive-toolbar {
    display: flex;
  }

  .img-interactive-toolbar .drag-handle {
    font-size: 10.5px;
    color: #38bdf8;
    font-weight: 700;
    cursor: grab;
    padding: 2px 4px;
    border-radius: 3px;
    user-select: none;
  }

  .img-interactive-toolbar button {
    background: #334155;
    border: none;
    color: #f8fafc;
    border-radius: 3px;
    font-size: 10px;
    padding: 2px 5px;
    cursor: pointer;
    transition: background 0.12s ease;
  }

  .img-interactive-toolbar button:hover {
    background: #0284c7;
  }

  .image-caption {
    font-size: 11px;
    color: #64748b;
    margin-top: 3px;
    font-style: italic;
    text-align: center;
  }

  /* Computer Science Code Blocks */
  .code-box {
    background-color: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-left: 4px solid #4f46e5;
    border-radius: 4px;
    padding: 5px 8px;
    margin: 6px 0;
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 11.5px;
    line-height: 1.38;
    color: #1e293b;
    page-break-inside: avoid;
    break-inside: avoid;
    overflow-x: auto;
  }

  .code-box-header {
    font-size: 10px;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    margin-bottom: 3px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 2px;
    letter-spacing: 0.5px;
  }

  .code-box pre {
    margin: 0;
    font-family: inherit;
    white-space: pre-wrap;
  }

  /* Tables */
  .notes-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    font-size: 10pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .notes-table th {
    background-color: {{ table_header_bg }};
    color: #ffffff;
    font-weight: bold;
    text-align: left;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
    font-size: 10pt;
    line-height: 1.45;
  }

  .notes-table td {
    padding: 4px 7px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
    font-size: 10pt;
    line-height: 1.45;
  }

  .notes-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* Footer Section */
  .doc-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 9mm;
    background-color: {{ footer_bg }};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12mm;
    font-size: 12pt;
    color: #374151;
    font-family: '{{ font_family }}', 'Coming Soon', cursive;
  }
</style>
</head>
<body>
  <div class="pages-wrapper" id="pages-wrapper">
    {% for page_content in pages %}
    <div class="page-container" id="page-{{ loop.index }}" data-page-number="{{ loop.index }}">
      {% if show_header and (header_mode == 'every_page' or loop.first) %}
      <div class="doc-header">
        {% if logo_type == 'pw' %}
        <div class="brand-logo">
          <span class="logo-circle">PW<span class="logo-dot"></span></span> ONLYIAS
        </div>
        {% elif custom_brand %}
        <div class="brand-logo">{{ custom_brand }}</div>
        {% endif %}
        
        {% if loop.first %}
        {% if subject %}
        <div class="subject-title">{{ subject }}</div>
        {% endif %}
        
        {% if lecture %}
        <div class="lecture-title">{{ lecture }}</div>
        {% endif %}
        {% endif %}
      </div>
      {% endif %}

      <div class="content-layout">
        <div class="main-column">
          {{ page_content | safe }}
        </div>
        
        {% if show_sidebar %}
        <div class="notes-sidebar">
          <div class="notes-sidebar-header">{{ sidebar_text }}</div>
        </div>
        {% endif %}
      </div>

      {% if show_footer %}
      <div class="doc-footer">
        <span>{{ footer_left }}</span>
        <span>{{ footer_right }} (Page {{ loop.index }})</span>
      </div>
      {% endif %}
    </div>
    {% endfor %}
  </div>

  <script>
    (function() {
      if (window.mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          fontFamily: "'{{ font_family }}', 'Coming Soon', cursive, sans-serif",
          themeVariables: {
            primaryColor: '#e0f2fe',
            primaryBorderColor: '#0284c7',
            primaryTextColor: '#0f172a',
            lineColor: '#1e293b',
            secondaryColor: '#f0fdf4',
            secondaryBorderColor: '#16a34a',
            tertiaryColor: '#f8fafc',
            tertiaryBorderColor: '#0284c7',
            fontSize: '14px'
          },
          flowchart: {
            curve: 'basis',
            padding: 16,
            nodeSpacing: 50,
            rankSpacing: 40,
            htmlLabels: true,
            useMaxWidth: true
          }
        });
      }

      function runMermaid() {
        if (window.mermaid && typeof mermaid.run === 'function') {
          mermaid.run({ querySelector: '.mermaid' }).catch(function(e) {
            console.warn('Mermaid render issue:', e);
          });
        }
      }

      window.addEventListener('DOMContentLoaded', runMermaid);
      window.addEventListener('load', runMermaid);
      setTimeout(runMermaid, 50);
      setTimeout(runMermaid, 250);

      let currentZoom = 'auto';

      function applyScale() {
        const wrapper = document.getElementById('pages-wrapper');
        const page = document.querySelector('.page-container');
        if (!wrapper || !page) return;

        const availableWidth = window.innerWidth - 20;
        const naturalWidth = page.offsetWidth || 794;

        let scale = 1;
        if (currentZoom === 'auto' || currentZoom === 'fit-width') {
          scale = Math.min(2.5, Math.max(0.3, availableWidth / naturalWidth));
        } else if (currentZoom === 'fit-page') {
          const availableHeight = window.innerHeight - 30;
          const naturalHeight = page.offsetHeight || 1123;
          scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
        } else {
          scale = parseFloat(currentZoom) || 1;
        }

        wrapper.style.transform = 'scale(' + scale + ')';
        const totalNaturalHeight = wrapper.scrollHeight;
        const diff = (scale - 1) * totalNaturalHeight;
        wrapper.style.marginBottom = Math.max(20, diff + 30) + 'px';
      }

      window.addEventListener('resize', applyScale);
      window.addEventListener('load', applyScale);
      window.addEventListener('DOMContentLoaded', applyScale);
      applyScale();
      setTimeout(applyScale, 20);
      setTimeout(applyScale, 80);
      setTimeout(applyScale, 200);
      setTimeout(applyScale, 500);

      window.addEventListener('beforeprint', function() {
        const wrapper = document.getElementById('pages-wrapper');
        if (wrapper) {
          wrapper.style.transform = 'none';
          wrapper.style.marginBottom = '0px';
        }
      });

      window.addEventListener('afterprint', function() {
        applyScale();
      });

      // Draggable & Movable Image Handlers
      function setupDraggableImages() {
        document.querySelectorAll('.note-image-wrapper').forEach(function(wrapper) {
          if (wrapper.dataset.draggableReady) return;
          wrapper.dataset.draggableReady = 'true';
          const img = wrapper.querySelector('img');
          if (!img) return;

          let toolbar = wrapper.querySelector('.img-interactive-toolbar');
          if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'img-interactive-toolbar';
            toolbar.innerHTML = '<span class="drag-handle" title="Drag with mouse to reposition image anywhere on page">✥ Move</span>' +
              '<button type="button" class="btn-crop-direct" title="Crop & Rotate this exact image" style="background:#7c3aed;color:#ffffff;font-weight:700;padding:2px 6px;border-radius:3px;">✂️ Crop</button>' +
              '<button type="button" class="btn-align-left" title="Align Left">⬅️</button>' +
              '<button type="button" class="btn-align-center" title="Center">⏹️</button>' +
              '<button type="button" class="btn-align-right" title="Align Right">➡️</button>' +
              '<button type="button" class="btn-size-toggle" title="Toggle Size">🔍</button>';
            wrapper.appendChild(toolbar);

            toolbar.querySelector('.btn-crop-direct').addEventListener('click', function(e) {
              e.stopPropagation();
              window.parent.postMessage({
                type: 'OPEN_CROP_IMAGE',
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || '',
                imgIndex: parseInt(img.getAttribute('data-img-index') || '0', 10)
              }, '*');
            });
            img.addEventListener('dblclick', function(e) {
              e.stopPropagation();
              window.parent.postMessage({
                type: 'OPEN_CROP_IMAGE',
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || '',
                imgIndex: parseInt(img.getAttribute('data-img-index') || '0', 10)
              }, '*');
            });

            toolbar.querySelector('.btn-align-left').addEventListener('click', function(e) {
              e.stopPropagation();
              wrapper.style.alignItems = 'flex-start';
            });
            toolbar.querySelector('.btn-align-center').addEventListener('click', function(e) {
              e.stopPropagation();
              wrapper.style.alignItems = 'center';
            });
            toolbar.querySelector('.btn-align-right').addEventListener('click', function(e) {
              e.stopPropagation();
              wrapper.style.alignItems = 'flex-end';
            });
            toolbar.querySelector('.btn-size-toggle').addEventListener('click', function(e) {
              e.stopPropagation();
              const curW = img.style.width || '75%';
              img.style.width = curW === '100%' ? '50%' : (curW === '50%' ? '75%' : '100%');
            });
          }

          let isDragging = false;
          let startX = 0, startY = 0;
          let curX = 0, curY = 0;

          function onMouseDown(e) {
            if (e.target.closest('button')) return;
            isDragging = true;
            startX = e.clientX - curX;
            startY = e.clientY - curY;
            img.style.cursor = 'grabbing';
            e.preventDefault();
          }

          function onMouseMove(e) {
            if (!isDragging) return;
            curX = e.clientX - startX;
            curY = e.clientY - startY;
            wrapper.style.transform = 'translate(' + curX + 'px, ' + curY + 'px)';
          }

          function onMouseUp() {
            if (isDragging) {
              isDragging = false;
              img.style.cursor = 'grab';
            }
          }

          wrapper.addEventListener('mousedown', onMouseDown);
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      }

      window.addEventListener('DOMContentLoaded', setupDraggableImages);
      window.addEventListener('load', setupDraggableImages);
      setTimeout(setupDraggableImages, 200);

      window.addEventListener('message', function(e) {
        if (!e.data) return;
        if (e.data.type === 'SET_ZOOM') {
          currentZoom = e.data.zoom;
          applyScale();
        }
      });
    })();
  </script>
</body>
</html>
"""


class PDFToNotesConverter:
    """Parser & Renderer to generate Handwritten Notes from PDF, DOCX or Raw Text."""

    def __init__(self):
        pass

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Intelligently extracts formatted Markdown from a PDF using visual & font span inspection.
        Detects headings, subheadings, bullet points, and tables.
        """
        doc = fitz.open(pdf_path)
        all_pages_markdown = []

        for page_idx, page in enumerate(doc):
            page_md = []
            blocks = page.get_text("dict")["blocks"]

            for b in blocks:
                if "lines" not in b:
                    continue

                for line in b["lines"]:
                    line_spans = line["spans"]
                    if not line_spans:
                        continue

                    line_text = "".join([s["text"].replace("\u200b", "").strip() for s in line_spans]).strip()
                    if not line_text:
                        continue

                    if line_text in ("PW OnlyIAS", "Daily Class Notes", "Space for Notes", "Indian Polity", "PW ONLYIAS"):
                        continue
                    if line_text.startswith("Lecture 01:") or line_text.startswith("Lecture "):
                        continue

                    first_span = line_spans[0]
                    font_size = first_span.get("size", 11)
                    color = first_span.get("color", 0)

                    if color in (0xc00000, 0xcc0000, 0x990000) or font_size >= 17:
                        page_md.append(f"\n# {line_text}")
                    elif color in (0x1f3864, 0x1a4480, 0x002060) or (font_size >= 14 and font_size < 17):
                        page_md.append(f"\n## {line_text}")
                    elif color == 0xffffff:
                        page_md.append(f"| {line_text} |")
                    elif line_text.startswith(("●", "•", "-", "*")):
                        clean_item = re.sub(r"^[●•\-\*]\s*", "", line_text)
                        page_md.append(f"- {clean_item}")
                    elif line_text.lower().startswith(("key features", "purpose:", "significance:")):
                        page_md.append(f"\n### {line_text}")
                    else:
                        page_md.append(line_text)

            if page_md:
                all_pages_markdown.append("\n".join(page_md))

        if not all_pages_markdown:
            for page in doc:
                txt = page.get_text("text").strip()
                if txt:
                    all_pages_markdown.append(txt)

        return "\n\n".join(all_pages_markdown)

    def auto_format_chatgpt_text(self, text: str) -> str:
        """
        Transforms raw ChatGPT copied text into structured lecture notes with
        # Section Titles (Red), ## Subheadings (Navy), ### Features, Lists, and Flow/Tree Diagrams.
        """
        lines = text.splitlines()
        formatted_lines = []
        in_code_block = False
        is_first_heading = True
        i = 0

        while i < len(lines):
            line = lines[i]
            trimmed = line.strip()

            # Preserve code blocks and diagrams
            if trimmed.startswith("```"):
                in_code_block = not in_code_block
                formatted_lines.append(line)
                i += 1
                continue

            if in_code_block:
                formatted_lines.append(line)
                i += 1
                continue

            if not trimmed:
                formatted_lines.append("")
                i += 1
                continue

            # 0. First main topic title
            if is_first_heading and (re.match(r"^\*\*([^*]+?)\*\*[:]?$", trimmed) or trimmed.startswith("# ") or (trimmed.isupper() and len(trimmed) < 70)):
                title_content = re.sub(r"^[#\*]+|[\*:]+$", "", trimmed).strip()
                formatted_lines.append(f"# {title_content}")
                is_first_heading = False
                i += 1
                continue

            # 0.5. Intro sentence ending with colon or 'is:'
            if (trimmed.endswith(":") or trimmed.endswith("is:")) and len(trimmed) < 80 and not trimmed.startswith(("-", "*", "|", "#")):
                formatted_lines.append(f"\n{trimmed}")
                i += 1
                continue

            # 0.6. Detect un-fenced ASCII tree / flow / box-drawing diagram copied directly from ChatGPT
            is_diag_start = False
            if not trimmed.startswith(("#", "-", "*", "|", "`")):
                if re.search(r"[─┌┐└┘├┤┬┴┼│]", trimmed) or any(arr in trimmed for arr in ("-->", "->", "→", "➔", "=>", "─┼", "─+", "─┬", "─┐", "─┘", "──>")):
                    is_diag_start = True
                elif i + 1 < len(lines):
                    next_l = lines[i + 1].strip()
                    if len(trimmed) < 45 and not trimmed.endswith((".", ":")) and (
                        (re.match(r"^[\s/\\|_\-]+$", next_l) and re.search(r"[/\\|]", next_l))
                        or any(arr in next_l for arr in ("-->", "->", "→", "➔", "=>", "─┼", "─+", "─┬", "─┐", "─┘", "──>"))
                        or re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", next_l)
                    ):
                        is_diag_start = True

            if is_diag_start:
                diag_block = []
                while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", "```")):
                    diag_block.append(lines[i])
                    i += 1

                diag_raw_text = "\n".join(diag_block).strip()
                conv_mermaid = self._parse_box_drawing_or_convergence(diag_raw_text)
                if conv_mermaid:
                    formatted_lines.append("\n```diagram\n" + conv_mermaid + "\n```\n")
                else:
                    slash_tree = self._parse_ascii_slash_tree(diag_raw_text)
                    if slash_tree:
                        formatted_lines.append("\n```diagram\n" + slash_tree + "\n```\n")
                    else:
                        extracted_steps = []
                        for raw_l in diag_block:
                            cleaned = raw_l.strip()
                            if not re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$", cleaned):
                                clean_step = re.sub(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$", "", cleaned).strip()
                                if clean_step:
                                    extracted_steps.append(clean_step)
                        if len(extracted_steps) >= 2:
                            chain_str = " -> ".join([f"[{s}]" for s in extracted_steps])
                            formatted_lines.append("\n```flowchart\n" + chain_str + "\n```\n")
                        else:
                            formatted_lines.append("\n```diagram\n" + diag_raw_text + "\n```\n")
                continue

            # 1. Detect Markdown H1 / H2 / H3 / H4
            if trimmed.startswith("# "):
                formatted_lines.append(trimmed)
                is_first_heading = False
            elif trimmed.startswith("## "):
                formatted_lines.append(trimmed)
            elif trimmed.startswith("### "):
                formatted_lines.append(f"## {trimmed[4:].strip()}")
            elif trimmed.startswith("#### "):
                formatted_lines.append(f"### {trimmed[5:].strip()}")

            # 2. Detect ChatGPT Bold Topic Headings like **1. Introduction to BST:** or **Key Features**
            elif re.match(r"^\*\*(\d+\.\s*)?([^*:]+)(:?)\*\*$", trimmed):
                heading_content = re.sub(r"^\*\*|\*\*$", "", trimmed).strip()
                formatted_lines.append(f"\n## {heading_content}")

            # 3. Detect ALL CAPS section heading
            elif trimmed.isupper() and len(trimmed) > 3 and len(trimmed) < 70 and not trimmed.startswith(("-", "*", "|")):
                formatted_lines.append(f"\n# {trimmed}")

            # 4. Detect Numbered list with bold title: 1. **Title:** description -> - **Title:** description
            elif re.match(r"^\d+\.\s*\*\*(.+?)\*\*(.*)$", trimmed):
                m = re.match(r"^\d+\.\s*\*\*(.+?)\*\*(.*)$", trimmed)
                bold_part = m.group(1).strip()
                rest_part = m.group(2).strip()
                formatted_lines.append(f"- **{bold_part}** {rest_part}")

            # 5. Detect Bullet points like * or -
            elif trimmed.startswith(("* ", "- ", "• ")):
                bullet_content = re.sub(r"^[\*\-•]\s*", "", trimmed)
                formatted_lines.append(f"- {bullet_content}")

            # 6. Tables & regular paragraphs
            else:
                formatted_lines.append(trimmed)

            i += 1

        return "\n".join(formatted_lines)

    def parse_text_to_structure(self, raw_text: str, custom_title: str = "", custom_subject: str = "") -> Dict[str, Any]:
        """
        Parses text and extracts document metadata.
        """
        lines = [line.strip() for line in raw_text.splitlines()]
        clean_lines = [l for l in lines if l and not l.startswith("<!-- PAGE_BREAK")]

        subject = custom_subject
        lecture = custom_title

        if not subject and clean_lines:
            candidate = clean_lines[0].lstrip("# ").strip("*")
            if len(candidate) < 60:
                subject = candidate
            else:
                subject = "Computer Science & Engineering"

        if not lecture and len(clean_lines) > 1:
            candidate = clean_lines[1].lstrip("# ").strip("*")
            if len(candidate) < 80:
                lecture = candidate
            else:
                lecture = "Class Notes"

        return {
            "subject": subject or "General Studies",
            "lecture": lecture or "Lecture Notes",
            "raw_text": raw_text
        }

    def convert_markdown_or_text_to_html(self, text: str, options: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Converts markdown text into 100% Full-Page Packed A4 Pages.
        Fills the entire usable height of every page accurately without overflowing or clipping content.
        Keeps tables, code boxes, and diagrams intact, and prevents orphan headings.
        """
        clean_input = text.strip("\r\n")
        lines = clean_input.splitlines()
        pages_html = []

        show_header = True if options is None else options.get("show_header", True)
        header_mode = "first_page" if options is None else options.get("header_mode", "first_page")
        show_sidebar = True if options is None else options.get("show_sidebar", True)
        show_footer = True if options is None else options.get("show_footer", True)
        logo_type = "pw" if options is None else options.get("logo_type", "pw")
        custom_brand = "" if options is None else options.get("custom_brand", "")
        subject = "" if options is None else options.get("subject", "")
        lecture = "" if options is None else options.get("lecture", "")

        margin_top = float(options.get("margin_top", 8)) if options else 8.0
        margin_bottom = float(options.get("margin_bottom", 8)) if options else 8.0
        margin_left = float(options.get("margin_left", 8)) if options else 8.0
        margin_right = float(options.get("margin_right", 8)) if options else 8.0

        # Exact conversion: 1mm ≈ 3.7795px at 96dpi
        top_pad = margin_top * 3.7795
        bottom_pad = margin_bottom * 3.7795
        left_pad = margin_left * 3.7795
        right_pad = margin_right * 3.7795

        # Standard A4 Notebook: exactly 22 lines fit per page
        LINES_PER_PAGE = 22.0

        # Header height calculation
        def calculate_header_height():
            h = 16.0  # base margin/padding
            if logo_type == "pw" or (logo_type == "custom" and custom_brand):
                h += 38.0
            if subject:
                s_lines = max(1, math.ceil(len(subject) / 40.0))
                h += s_lines * 32.0 + 4.0
            if lecture:
                l_lines = max(1, math.ceil(len(lecture) / 36.0))
                h += l_lines * 30.0 + 6.0
            return max(45.0, h)

        hdr_height_val = calculate_header_height() if show_header else 0.0

        # Usable capacity without cutting off bottom content:
        # A4 page total height = 1122.5px
        # Bottom clearance: page padding (bottom_pad) + footer clearance (44px if footer shown)
        footer_clearance = (44.0 if show_footer else 0.0) + bottom_pad
        header_clearance_p1 = (hdr_height_val if show_header else 0.0) + top_pad
        header_clearance_p2 = (34.0 if (show_header and header_mode == "every_page") else 0.0) + top_pad

        p1_cap = max(300.0, float(1122.5 - header_clearance_p1 - footer_clearance - 20.0))
        p2_cap = max(300.0, float(1122.5 - header_clearance_p2 - footer_clearance - 20.0))

        # Main column width & text wrap character limits (for font-size 11pt, 14pt, 16pt, 18pt)
        main_col_width = 793.7 - left_pad - right_pad - (145.0 if show_sidebar else 0.0) - (12.0 if show_sidebar else 0.0)
        h1_wrap_chars = max(16, int(main_col_width / 12.0))
        h2_wrap_chars = max(18, int(main_col_width / 10.5))
        h3_wrap_chars = max(20, int(main_col_width / 9.2))
        p_wrap_chars = max(22, int(main_col_width / 8.0))
        li_wrap_chars = max(20, int((main_col_width - 20.0) / 8.0))

        current_page_blocks = []
        in_list = False
        image_counter = 0
        i = 0

        def get_capacity(page_idx):
            has_hdr = show_header and (header_mode == "every_page" or page_idx == 1)
            return p1_cap if has_hdr else p2_cap

        current_capacity = get_capacity(1)
        current_used = 0.0

        def flush_page():
            nonlocal current_page_blocks, current_used, in_list, current_capacity
            if in_list:
                current_page_blocks.append("</ul>")
                in_list = False
            if current_page_blocks:
                pages_html.append("\n".join(current_page_blocks))
                current_page_blocks = []
                current_used = 0.0
                next_p_num = len(pages_html) + 1
                current_capacity = get_capacity(next_p_num)

        def get_heading_bundle_space(start_idx: int) -> float:
            """Calculate space needed for this heading + any chained subheadings + first lines of content."""
            total = 0.0
            idx = start_idx
            # Collect consecutive heading lines
            while idx < len(lines):
                l = lines[idx].strip()
                if not l:
                    idx += 1
                    continue
                if l.startswith("# ") or (l.isupper() and len(l) > 3 and len(l) < 80):
                    h_lines = max(1, math.ceil(len(l) / h1_wrap_chars))
                    total += h_lines * 32.0 + 12.0
                    idx += 1
                elif l.startswith("## "):
                    h_lines = max(1, math.ceil(len(l) / h2_wrap_chars))
                    total += h_lines * 28.0 + 10.0
                    idx += 1
                elif l.startswith("### "):
                    h_lines = max(1, math.ceil(len(l) / h3_wrap_chars))
                    total += h_lines * 24.0 + 8.0
                    idx += 1
                else:
                    break

            # Now find the first actual content block after heading(s)
            while idx < len(lines) and not lines[idx].strip():
                idx += 1

            if idx < len(lines):
                next_l = lines[idx].strip()
                if next_l.startswith("```"):
                    code_block_lines = []
                    d_idx = idx + 1
                    while d_idx < len(lines) and not lines[d_idx].strip().startswith("```"):
                        code_block_lines.append(lines[d_idx])
                        d_idx += 1
                    raw_diag = "\n".join(code_block_lines)
                    toks = re.split(r"-->|->|→|➔|=>|\n", raw_diag)
                    valid_nodes = [t.strip() for t in toks if t.strip() and not re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│vV]+$", t.strip())]
                    n_cnt = max(len(valid_nodes), 1)
                    total += max(60.0, min(500.0, float(n_cnt) * 36.0 + 16.0))
                elif next_l.startswith(("![", "<img")):
                    total += 90.0
                elif next_l.startswith(("- ", "* ", "• ", "1. ", "2. ", "3. ", "4. ", "5. ", "6. ", "7. ", "8. ", "9. ")):
                    total += 38.0  # At least 1-2 list items
                elif next_l.startswith("|"):
                    total += 54.0  # Table header + 1 row
                else:
                    # Paragraph: require at least 1-2 lines
                    p_lines = max(1, min(3, math.ceil(len(next_l) / p_wrap_chars)))
                    total += (p_lines - 1) * 22.0 + 26.0
            else:
                total += 28.0

            return total

        while i < len(lines):
            raw_line = lines[i]
            line = raw_line.strip()

            # Leading spaces calculation to shift text forward when user presses Spacebar
            expanded_raw = raw_line.expandtabs(4)
            leading_spaces = len(expanded_raw) - len(expanded_raw.lstrip(' '))
            indent_html = '&nbsp;' * leading_spaces if leading_spaces > 0 else ''

            # Check for explicit Page Break tokens
            if line.startswith("<!-- PAGE_BREAK") or line.startswith("<!-- PAGE-BREAK") or line == "---" or line in ("\\pagebreak", "\\newpage", "[pagebreak]", "---pagebreak---"):
                flush_page()
                i += 1
                continue

            if not line:
                # Count consecutive empty lines
                empty_count = 1
                while i + 1 < len(lines) and not lines[i + 1].strip():
                    empty_count += 1
                    i += 1

                # If the next line is also a list item and empty_count <= 2, keep list open
                next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                is_next_list = next_line.startswith(("- ", "* ", "• ", "1. ", "2. ", "3. ", "4. ", "5. ", "6. ", "7. ", "8. ", "9. "))
                if in_list and is_next_list and empty_count <= 2:
                    i += 1
                    continue

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                # 1 blank line is standard markdown separator (0 extra spacer)
                # 2+ blank lines mean user pressed Enter multiple times to create vertical gap or push to next page
                if empty_count >= 2:
                    extra_spacers = empty_count - 1
                    for _ in range(extra_spacers):
                        spacer_units = 20.0
                        if current_used + spacer_units > current_capacity and current_used > 50:
                            flush_page()
                            break
                        else:
                            current_page_blocks.append('<div class="spacer-line" style="height: 18px;"></div>')
                            current_used += spacer_units

                i += 1
                continue

            # 1. Mermaid / Tree Diagram Code Block
            if line.startswith(("```tree", "```mermaid", "```graph", "```flow", "```diagram", "```flowchart", "```mindmap")):
                fence_tag = line.strip().lstrip("`").strip()
                diagram_code = []
                i += 1
                while i < len(lines) and not lines[i].strip().startswith("```"):
                    diagram_code.append(lines[i])
                    i += 1
                raw_code_str = "\n".join(diagram_code).strip()
                default_shape = "circle" if fence_tag.lower().startswith("tree") else "box"
                code_str = self._convert_to_mermaid_syntax(raw_code_str, default_shape=default_shape)

                # Check for explicit scale attribute (e.g. ```diagram {scale=85%} or ```flowchart width=80%)
                scale_match = re.search(r'(?:scale|size|width)[:=]\s*([\d\.]+)%?', fence_tag, re.IGNORECASE)
                explicit_scale = None
                if scale_match:
                    val = float(scale_match.group(1))
                    explicit_scale = (val / 100.0) if val > 1.5 else val
                    explicit_scale = max(0.4, min(1.6, explicit_scale))
                elif not explicit_scale:
                    dir_match = re.search(r'(?:%%|\[|\b)(?:scale|size)[:=]\s*([\d\.]+)%?', raw_code_str, re.IGNORECASE)
                    if dir_match:
                        val = float(dir_match.group(1))
                        explicit_scale = (val / 100.0) if val > 1.5 else val
                        explicit_scale = max(0.4, min(1.6, explicit_scale))

                tokens = re.split(r"-->|->|→|➔|=>|\n", raw_code_str)
                valid_nodes = [t.strip() for t in tokens if t.strip() and not re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$", t.strip())]
                node_count = max(len(valid_nodes), 1)
                base_diagram_units = max(60.0, min(500.0, float(node_count) * 34.0 + 14.0))

                chosen_scale = explicit_scale if explicit_scale else 1.0
                diagram_units = base_diagram_units * chosen_scale

                # Smart Auto-Fit: If no explicit scale and doesn't fit, but remaining space >= 180px, auto-scale down
                if not explicit_scale and (current_used + diagram_units > current_capacity) and (current_capacity - current_used >= 180.0):
                    needed_scale = (current_capacity - current_used - 12.0) / base_diagram_units
                    if needed_scale >= 0.72:
                        chosen_scale = round(needed_scale, 2)
                        diagram_units = base_diagram_units * chosen_scale

                if current_used + diagram_units > current_capacity and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                if chosen_scale != 1.0:
                    scale_css = f'transform: scale({chosen_scale:.2f}); transform-origin: top center; margin: 2px auto;'
                    current_page_blocks.append(f'<div class="mermaid-scaler" style="display:flex;justify-content:center;width:100%;page-break-inside:avoid;"><div class="mermaid" style="{scale_css}">{html.escape(code_str)}</div></div>')
                else:
                    current_page_blocks.append(f'<div class="mermaid">{html.escape(code_str)}</div>')
                current_used += diagram_units

            # 1.5. Automatic Detection of Copied Plain Text Flow / Tree / Box-Drawing Diagram (e.g. Object Module 1 ─┐ ... or A / \ B C)
            elif (
                not line.startswith(("#", "```", "-", "*", "|", ">"))
                and (
                    re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", line)
                    or any(arr in line for arr in ("-->", " -> ", " → ", " ➔ ", "=>", "─┼", "─+", "─┬", "─┐", "─┘", "──>"))
                    or (i + 1 < len(lines) and (
                        re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", lines[i + 1])
                        or any(arr in lines[i + 1] for arr in ("-->", " -> ", " → ", " ➔ ", "=>", "─┼", "─+", "─┬", "─┐", "─┘", "──>"))
                        or (re.match(r"^[\s/\\|_\-]+$", lines[i + 1].strip()) and re.search(r"[/\\|]", lines[i + 1]))
                    ))
                )
            ):
                flow_lines = []
                k = i
                while k < len(lines) and lines[k].strip() and not lines[k].strip().startswith(("#", "```")):
                    cleaned_k = lines[k].strip()
                    if (
                        re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", cleaned_k)
                        or any(arr in cleaned_k for arr in ("-->", "->", "→", "➔", "=>"))
                        or (re.match(r"^[\s/\\|_\-]+$", cleaned_k) and re.search(r"[/\\|]", cleaned_k))
                    ):
                        flow_lines.append(lines[k])
                        k += 1
                    elif flow_lines and len(cleaned_k) < 65 and not cleaned_k.endswith((".", "!", "?")):
                        if k + 1 < len(lines) and (
                            re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", lines[k + 1])
                            or any(arr in lines[k + 1] for arr in ("-->", "->", "→", "➔", "=>"))
                            or (re.match(r"^[\s/\\|_\-]+$", lines[k + 1].strip()) and re.search(r"[/\\|]", lines[k + 1]))
                        ):
                            flow_lines.append(lines[k])
                            k += 1
                        else:
                            break
                    else:
                        break

                if len(flow_lines) >= 2 and (
                    any(re.search(r"[─┌┐└┘├┤┬┴┼│▼▲↓↑]", fl) or any(arr in fl for arr in ("-->", "->", "→", "➔", "=>")) for fl in flow_lines)
                    or any(re.match(r"^[\s/\\|_\-]+$", fl.strip()) and re.search(r"[/\\|]", fl) for fl in flow_lines)
                ):
                    raw_code_str = "\n".join(flow_lines).strip()
                    conv_mermaid = self._parse_box_drawing_or_convergence(raw_code_str)
                    if conv_mermaid:
                        code_str = conv_mermaid
                    else:
                        slash_tree = self._parse_ascii_slash_tree(raw_code_str)
                        if slash_tree:
                            code_str = slash_tree
                        else:
                            code_str = self._convert_to_mermaid_syntax(raw_code_str, default_shape="box")

                    if code_str and ("-->" in code_str or "graph " in code_str or "flowchart " in code_str):
                        tokens = re.split(r"-->|->|→|➔|=>|\n", raw_code_str)
                        valid_nodes = [t.strip() for t in tokens if t.strip() and not re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$", t.strip())]
                        node_count = max(len(valid_nodes), 1)
                        diagram_units = max(60.0, min(500.0, float(node_count) * 36.0 + 16.0))

                        if current_used + diagram_units > current_capacity and current_used > 50:
                            flush_page()

                        if in_list:
                            current_page_blocks.append("</ul>")
                            in_list = False

                        current_page_blocks.append(f'<div class="mermaid">{html.escape(code_str)}</div>')
                        current_used += diagram_units
                        i = k
                        continue
                else:
                    # Not a diagram, fallback to normal paragraph
                    p_lines = max(1, math.ceil((len(line) + leading_spaces) / p_wrap_chars))
                    p_units = (p_lines - 1) * 19.0 + 22.0
                    if current_used + p_units > current_capacity and current_used > 50:
                        flush_page()
                    if in_list:
                        current_page_blocks.append("</ul>")
                        in_list = False
                    p_formatted = self._format_inline(line)
                    current_page_blocks.append(f"<p>{indent_html}{p_formatted}</p>")
                    current_used += p_units

            # 1.8. Image & Screenshot Parsing
            elif line.startswith("![") or line.startswith("<img"):
                img_match = re.search(r'!\[(.*?)\]\((.*?)\)(?:\{.*?(?:width=([\d%px]+))?.*?\}|\s*=(?:([\d%px]+))?)?', line)
                html_img_match = re.search(r'<img\s+[^>]*src=[\'"]([^\'"]+)[\'"][^>]*>', line)

                src = ""
                alt = ""
                width = "75%"
                align = "center"

                if img_match:
                    alt_raw = img_match.group(1).strip()
                    src = img_match.group(2).strip()
                    explicit_width = img_match.group(3) or img_match.group(4)

                    if "|" in alt_raw:
                        parts = [p.strip() for p in alt_raw.split("|")]
                        alt = parts[0]
                        for p in parts[1:]:
                            if "width:" in p or "width=" in p:
                                width = re.sub(r"width[:=]\s*", "", p).strip()
                            elif "align:" in p or "align=" in p:
                                align = re.sub(r"align[:=]\s*", "", p).strip()
                            elif re.match(r"^[\d]+%$", p):
                                width = p
                    else:
                        alt = alt_raw

                    if explicit_width:
                        width = explicit_width
                elif html_img_match:
                    src = html_img_match.group(1).strip()
                    w_match = re.search(r'width=[\'"]?([\d%px]+)[\'"]?', line)
                    if w_match:
                        width = w_match.group(1)
                    s_match = re.search(r'width:\s*([\d%px]+)', line)
                    if s_match:
                        width = s_match.group(1)
                    a_match = re.search(r'alt=[\'"]([^\'"]*)[\'"]', line)
                    if a_match:
                        alt = a_match.group(1)

                if src:
                    if in_list:
                        current_page_blocks.append("</ul>")
                        in_list = False

                    width_val = 75.0
                    if "%" in width:
                        try:
                            width_val = float(width.replace("%", ""))
                        except ValueError:
                            width_val = 75.0
                    elif "px" in width:
                        try:
                            width_val = min(100.0, (float(width.replace("px", "")) / main_col_width) * 100.0)
                        except ValueError:
                            width_val = 75.0

                    rendered_w = main_col_width * (width_val / 100.0)
                    aspect_ratio = 0.75

                    local_path = None
                    if src.startswith("/static/"):
                        rel = src.lstrip("/")
                        candidate = os.path.join(os.path.dirname(__file__), rel)
                        if os.path.exists(candidate):
                            local_path = candidate
                    elif os.path.exists(src):
                        local_path = src

                    if local_path:
                        try:
                            from PIL import Image
                            with Image.open(local_path) as img_obj:
                                if img_obj.width > 0:
                                    aspect_ratio = float(img_obj.height) / float(img_obj.width)
                        except Exception:
                            pass

                    img_units = max(60.0, min(500.0, rendered_w * aspect_ratio + 18.0))
                    if alt and alt not in ("image", "Screenshot", "screenshot"):
                        img_units += 14.0

                    if current_used + img_units > current_capacity and current_used > 50:
                        flush_page()

                    caption_html = f'<div class="image-caption">{html.escape(alt)}</div>' if alt and alt not in ("image", "Screenshot", "screenshot") else ''

                    justify_css = "center"
                    if align == "left":
                        justify_css = "flex-start"
                    elif align == "right":
                        justify_css = "flex-end"

                    image_counter += 1
                    img_block = (
                        f'<div class="note-image-wrapper" style="display:flex;flex-direction:column;align-items:{justify_css};margin:8px 0 10px 0;page-break-inside:avoid;break-inside:avoid;">'
                        f'<img src="{src}" alt="{html.escape(alt)}" data-img-index="{image_counter}" style="width:{width};max-width:100%;height:auto;border-radius:4px;border:1.5px solid #cbd5e1;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:block;" />'
                        f'{caption_html}'
                        f'</div>'
                    )
                    current_page_blocks.append(img_block)
                    current_used += img_units
                    i += 1
                    continue

            # 2. General Programming Code Blocks (C++, Python, Java, etc.)
            elif line.startswith("```"):
                lang = line[3:].strip() or "Code"
                code_lines = []
                i += 1
                while i < len(lines) and not lines[i].strip().startswith("```"):
                    code_lines.append(lines[i])
                    i += 1
                code_content = html.escape("\n".join(code_lines))
                code_units = 30.0 + len(code_lines) * 15.5

                if current_used + code_units > current_capacity and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                current_page_blocks.append(
                    f'<div class="code-box"><div class="code-box-header">{html.escape(lang)}</div><pre><code>{code_content}</code></pre></div>'
                )
                current_used += code_units

            # 3. Headings & Subheadings (with Bundle & Orphan Prevention)
            elif line.startswith("# ") or (line.isupper() and len(line) > 3 and len(line) < 80):
                if line.startswith("# "):
                    after_marker = line[2:]
                    extra_sp = len(after_marker) - len(after_marker.lstrip(' '))
                    heading_text = ('&nbsp;' * extra_sp) + html.escape(after_marker.lstrip(' '))
                else:
                    heading_text = html.escape(line)
                h1_lines = max(1, math.ceil(len(heading_text) / h1_wrap_chars))
                h1_units = h1_lines * 32.0 + 12.0

                min_space_needed = get_heading_bundle_space(i)
                if (current_used + min_space_needed > current_capacity) and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                current_page_blocks.append(f'<div class="section-heading">{indent_html}<span class="section-heading-text">{heading_text}</span></div>')
                current_used += h1_units

            elif line.startswith("## "):
                after_marker = line[3:]
                extra_sp = len(after_marker) - len(after_marker.lstrip(' '))
                sub_text = ('&nbsp;' * extra_sp) + self._format_inline(after_marker.lstrip(' '))
                h2_lines = max(1, math.ceil(len(sub_text) / h2_wrap_chars))
                h2_units = h2_lines * 28.0 + 10.0

                min_space_needed = get_heading_bundle_space(i)
                if (current_used + min_space_needed > current_capacity) and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                current_page_blocks.append(f'<div class="subheading">{indent_html}<span class="subheading-text">{sub_text}</span></div>')
                current_used += h2_units

            elif line.startswith("### "):
                after_marker = line[4:]
                extra_sp = len(after_marker) - len(after_marker.lstrip(' '))
                sub_sub = ('&nbsp;' * extra_sp) + html.escape(after_marker.lstrip(' '))
                h3_lines = max(1, math.ceil(len(sub_sub) / h3_wrap_chars))
                h3_units = h3_lines * 24.0 + 8.0

                min_space_needed = get_heading_bundle_space(i)
                if (current_used + min_space_needed > current_capacity) and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                current_page_blocks.append(f'<div class="sub-feature-title">{indent_html}<span class="sub-feature-text">{sub_sub}</span></div>')
                current_used += h3_units

            # 4. Bullet lists
            elif line.startswith(("- ", "* ", "• ", "1. ", "2. ", "3. ", "4. ", "5. ", "6. ", "7. ", "8. ", "9. ")):
                m = re.match(r"^[-*•\d\.]+(\s+)(.*)$", line)
                if m:
                    extra_sp = max(0, len(m.group(1)) - 1)
                    bullet_indent = '&nbsp;' * extra_sp
                    raw_item = m.group(2)
                else:
                    bullet_indent = ''
                    raw_item = re.sub(r"^[-*•\d\.]+\s*", "", line)

                li_lines = max(1, math.ceil((len(raw_item) + leading_spaces + len(bullet_indent)) / li_wrap_chars))
                li_units = (li_lines - 1) * 19.0 + 22.0

                if current_used + li_units > current_capacity and current_used > 50:
                    flush_page()

                if not in_list:
                    current_page_blocks.append("<ul>")
                    in_list = True

                item_html = self._format_inline(raw_item)
                current_page_blocks.append(f"<li>{indent_html}{bullet_indent}{item_html}</li>")
                current_used += li_units

            # 5. Tables with Smart Row-Splitting across Pages
            elif line.startswith("|") and "|" in line[1:]:
                table_lines = []
                while i < len(lines) and lines[i].strip().startswith("|"):
                    table_lines.append(lines[i].strip())
                    i += 1
                i -= 1

                parsed_rows = []
                for tl in table_lines:
                    if re.match(r"^\|?\s*[-:]+[-|\s:]*$", tl):
                        continue
                    cols = [c.strip() for c in tl.strip("|").split("|")]
                    parsed_rows.append(cols)

                if parsed_rows:
                    header_cols = parsed_rows[0]
                    data_rows = parsed_rows[1:]

                    if in_list:
                        current_page_blocks.append("</ul>")
                        in_list = False

                    hdr_units = 32.0
                    row_units = 22.0

                    if not data_rows:
                        t_html = self._render_table_rows(header_cols, [])
                        current_page_blocks.append(t_html)
                        current_used += hdr_units
                    else:
                        avail_space = current_capacity - current_used
                        total_tbl_units = hdr_units + len(data_rows) * row_units + 4.0

                        if total_tbl_units <= avail_space:
                            t_html = self._render_table_rows(header_cols, data_rows)
                            current_page_blocks.append(t_html)
                            current_used += total_tbl_units
                        else:
                            # Calculate how many rows fit on the current page
                            fit_count = int((avail_space - hdr_units - 4.0) // row_units)
                            if fit_count >= 1 and current_used > 50:
                                # Part 1 on Current Page
                                part1_rows = data_rows[:fit_count]
                                rem_rows = data_rows[fit_count:]
                                t1_html = self._render_table_rows(header_cols, part1_rows)
                                current_page_blocks.append(t1_html)
                                current_used += hdr_units + len(part1_rows) * row_units + 4.0

                                flush_page()

                                # Part 2 on Next Page with repeated Table Header
                                t2_html = self._render_table_rows(header_cols, rem_rows)
                                current_page_blocks.append(t2_html)
                                current_used += hdr_units + len(rem_rows) * row_units + 4.0
                            else:
                                # Move whole table to next page
                                if current_used > 50:
                                    flush_page()
                                t_html = self._render_table_rows(header_cols, data_rows)
                                current_page_blocks.append(t_html)
                                current_used += total_tbl_units

            # 6. Feature lines ending in colon (with List-Group Protection)
            elif line.lower().startswith(("key features", "purpose:", "significance:", "important points", "features:", "time complexity:", "space complexity:", "definition:", "advantages:", "disadvantages:")) or (len(line) < 85 and line.endswith(":") and not in_list):
                feat_lines = max(1, math.ceil((len(line) + leading_spaces) / h3_wrap_chars))
                feat_units = feat_lines * 24.0 + 8.0

                min_space_needed = feat_units + 10.0
                if (current_used + min_space_needed > current_capacity) and current_used > 50:
                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                current_page_blocks.append(f'<div class="sub-feature-title">{indent_html}<span class="sub-feature-text">{self._format_inline(line)}</span></div>')
                current_used += feat_units

            # 7. Paragraph (with Smart Line-Splitting Across Page Boundary to maximize vertical fill)
            else:
                p_lines = max(1, math.ceil((len(line) + leading_spaces) / p_wrap_chars))
                p_units = (p_lines - 1) * 22.0 + 26.0

                if current_used + p_units > current_capacity and current_used > 50:
                    avail_space = current_capacity - current_used
                    # If enough space fits at least 1-2 lines (>= 38px) and paragraph has 2+ lines, split across boundary
                    if avail_space >= 38.0 and p_lines >= 2:
                        words = line.split()
                        part1_words = []
                        current_l_words = []
                        line_count = 0

                        for w in words:
                            test_l = " ".join(current_l_words + [w])
                            if len(test_l) <= p_wrap_chars:
                                current_l_words.append(w)
                            else:
                                line_count += 1
                                est_u = (line_count - 1) * 22.0 + 26.0
                                if est_u > avail_space:
                                    break
                                part1_words.extend(current_l_words)
                                current_l_words = [w]

                        if part1_words and len(part1_words) >= 3:
                            part1_text = " ".join(part1_words)
                            part2_text = line[len(part1_text):].strip()
                            part1_lines = max(1, math.ceil((len(part1_text) + leading_spaces) / p_wrap_chars))
                            part1_units = (part1_lines - 1) * 22.0 + 26.0

                            if in_list:
                                current_page_blocks.append("</ul>")
                                in_list = False

                            p1_formatted = self._format_inline(part1_text)
                            current_page_blocks.append(f"<p>{indent_html}{p1_formatted}</p>")
                            current_used += part1_units

                            flush_page()

                            if part2_text:
                                p2_lines = max(1, math.ceil(len(part2_text) / p_wrap_chars))
                                p2_units = (p2_lines - 1) * 22.0 + 26.0
                                p2_formatted = self._format_inline(part2_text)
                                current_page_blocks.append(f"<p>{p2_formatted}</p>")
                                current_used += p2_units
                            i += 1
                            continue

                    flush_page()

                if in_list:
                    current_page_blocks.append("</ul>")
                    in_list = False

                p_formatted = self._format_inline(line)
                current_page_blocks.append(f"<p>{indent_html}{p_formatted}</p>")
                current_used += p_units

            i += 1

        if in_list:
            current_page_blocks.append("</ul>")

        if current_page_blocks:
            pages_html.append("\n".join(current_page_blocks))

        if not pages_html:
            pages_html.append("<p>No content provided.</p>")

        return pages_html

    def _format_inline(self, text: str) -> str:
        """Helper to format bold, underline, custom colors (black, red, etc.), terms, inline code, and preserve spaces."""
        escaped = html.escape(text)

        # 1. Bold: **text** or <b>text</b> or <strong>text</strong>
        escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
        escaped = re.sub(r"&lt;b&gt;(.+?)&lt;/b&gt;", r"<strong>\1</strong>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"&lt;strong&gt;(.+?)&lt;/strong&gt;", r"<strong>\1</strong>", escaped, flags=re.IGNORECASE)

        # 2. Underline: <u>text</u> or __text__ or <ins>text</ins>
        escaped = re.sub(r"__(.+?)__", r"<span style='text-decoration:underline;text-underline-offset:3px;'>\1</span>", escaped)
        escaped = re.sub(r"&lt;u&gt;(.+?)&lt;/u&gt;", r"<span style='text-decoration:underline;text-underline-offset:3px;'>\1</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"&lt;ins&gt;(.+?)&lt;/ins&gt;", r"<span style='text-decoration:underline;text-underline-offset:3px;'>\1</span>", escaped, flags=re.IGNORECASE)

        # 3. Colors:
        # [red]text[/red] or <red>text</red>
        escaped = re.sub(r"\[red\](.+?)\[/red\]", r"<span style='color:#c92121;font-weight:600;'>\1</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"&lt;red&gt;(.+?)&lt;/red&gt;", r"<span style='color:#c92121;font-weight:600;'>\1</span>", escaped, flags=re.IGNORECASE)

        # [black]text[/black] or <black>text</black>
        escaped = re.sub(r"\[black\](.+?)\[/black\]", r"<span style='color:#111827;'>\1</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"&lt;black&gt;(.+?)&lt;/black&gt;", r"<span style='color:#111827;'>\1</span>", escaped, flags=re.IGNORECASE)

        # [blue]text[/blue], [green]text[/green], [purple]text[/purple]
        escaped = re.sub(r"\[blue\](.+?)\[/blue\]", r"<span style='color:#1a4480;font-weight:600;'>\1</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"\[green\](.+?)\[/green\]", r"<span style='color:#15803d;font-weight:600;'>\1</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"\[purple\](.+?)\[/purple\]", r"<span style='color:#7e22ce;font-weight:600;'>\1</span>", escaped, flags=re.IGNORECASE)

        # [color=red]text[/color] or [color=#c92121]text[/color]
        escaped = re.sub(r"\[color=([#a-zA-Z0-9]+)\](.+?)\[/color\]", r"<span style='color:\1;'>\2</span>", escaped, flags=re.IGNORECASE)
        escaped = re.sub(r"&lt;span style=[\x27\x22]([^\x27\x22]+)[\x27\x22]&gt;(.+?)&lt;/span&gt;", r"<span style='\1'>\2</span>", escaped, flags=re.IGNORECASE)

        # 4. Italics: *text*
        escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)

        # 5. Inline code: `code`
        escaped = re.sub(r"`([^`]+)`", r"<code style='background:#f1f5f9;padding:2px 5px;border-radius:3px;font-family:monospace;color:#4338ca;'>\1</code>", escaped)

        # 6. Colon leading term bold
        escaped = re.sub(r"^([A-Za-z0-9\s\(\)\-]+:)", r"<strong>\1</strong>", escaped)

        # 7. Preserve multiple spaces
        escaped = re.sub(r"  ", "&nbsp;&nbsp;", escaped)
        return escaped

    def _render_table_rows(self, header_cols: List[str], data_rows: List[List[str]]) -> str:
        """Convert header and row arrays to styled HTML table."""
        if not header_cols:
            return ""

        html_out = ['<table class="notes-table">']
        html_out.append("<thead><tr>")
        for col in header_cols:
            html_out.append(f"<th>{self._format_inline(col)}</th>")
        html_out.append("</tr></thead>")

        html_out.append("<tbody>")
        for row in data_rows:
            html_out.append("<tr>")
            for col in row:
                html_out.append(f"<td>{self._format_inline(col)}</td>")
            html_out.append("</tr>")
        html_out.append("</tbody></table>")

        return "".join(html_out)

    def _render_table(self, table_lines: List[str]) -> str:
        """Legacy helper for single-pass table rendering."""
        if not table_lines:
            return ""

        rows = []
        for line in table_lines:
            if re.match(r"^\|?\s*[-:]+[-|\s:]*$", line):
                continue
            cols = [c.strip() for c in line.strip("|").split("|")]
            rows.append(cols)

    def _parse_box_drawing_or_convergence(self, raw_text: str) -> Optional[str]:
        raw_lines = [l for l in raw_text.splitlines() if l.strip()]
        if not raw_lines:
            return None

        has_box_chars = any(re.search(r"[─┌┐└┘├┤┬┴┼│\+\|]", l) for l in raw_lines)
        has_arrows = any(re.search(r"(?:-->|->|→|➔|=>|─+>|─+→|\+─+>|\+─+→|\+\s*>)", l) for l in raw_lines)

        if not (has_box_chars or has_arrows):
            return None

        # Check for compound diagram: convergence lines at top, downward pipeline below
        convergence_lines = []
        downward_lines = []
        in_downward_phase = False

        for l in raw_lines:
            cleaned = l.strip()
            if re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/vV]+$", cleaned) and (re.search(r"[▼▲↓↑│vV]", cleaned) or "->" in cleaned):
                in_downward_phase = True
                continue

            if in_downward_phase:
                clean_node = re.sub(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$", "", cleaned).strip()
                if clean_node and not re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│─vV]+$", clean_node):
                    downward_lines.append(clean_node)
            else:
                if re.search(r"[─┌┐└┘├┤┬┴┼]", cleaned) or any(arr in cleaned for arr in ("─┼", "─+", "─┬", "─┐", "─┘", "──>")):
                    convergence_lines.append(l)
                elif any(arr in cleaned for arr in ("-->", "->", "→", "➔", "=>")):
                    convergence_lines.append(l)
                elif downward_lines or len(convergence_lines) >= 2:
                    in_downward_phase = True
                    clean_node = re.sub(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼─]+$", "", cleaned).strip()
                    if clean_node:
                        downward_lines.append(clean_node)
                else:
                    convergence_lines.append(l)

        inputs = []
        pipeline_targets = []

        for l in convergence_lines:
            match_arrow = re.search(r"(?:─*┼\s*─*[→>]|─*\+\s*─*[→>]|─*├\s*─*[→>]|[─\-]+[→>])", l)
            if match_arrow:
                left_part = l[:match_arrow.start()].strip()
                right_part = l[match_arrow.end():].strip()

                clean_left = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", left_part).strip()
                if clean_left:
                    inputs.append(clean_left)

                if right_part:
                    sub_steps = re.split(r"\s*(?:-->|->|→|➔|=>|─+>|─+→)\s*", right_part)
                    for s in sub_steps:
                        clean_s = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", s).strip()
                        if clean_s:
                            pipeline_targets.append(clean_s)
            else:
                clean_l = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", l).strip()
                if clean_l:
                    inputs.append(clean_l)

        if len(inputs) >= 2 and pipeline_targets:
            target_first = pipeline_targets[0]
            all_subsequent = pipeline_targets[1:] + downward_lines

            if downward_lines or len(all_subsequent) >= 2:
                mermaid = ["graph TD"]
                for idx, inp in enumerate(inputs):
                    mermaid.append(f'    in{idx}["{inp}"] --> tgt0["{target_first}"]')

                last_id = "tgt0"
                for s_idx, s in enumerate(all_subsequent):
                    curr_id = f"step{s_idx}"
                    mermaid.append(f'    {last_id} --> {curr_id}["{s}"]')
                    last_id = curr_id

                return "\n".join(mermaid)
            else:
                mermaid = ["graph LR"]
                for idx, inp in enumerate(inputs):
                    mermaid.append(f'    in{idx}["{inp}"] --> tgt0["{target_first}"]')

                for p_idx in range(len(pipeline_targets) - 1):
                    t1 = pipeline_targets[p_idx]
                    t2 = pipeline_targets[p_idx + 1]
                    mermaid.append(f'    tgt{p_idx}["{t1}"] --> tgt{p_idx+1}["{t2}"]')

                return "\n".join(mermaid)

        # 2. Divergence Pattern: Single source splitting into multiple targets
        source = None
        targets = []
        for l in raw_lines:
            match_arrow = re.search(r"(?:─*┬\s*─*[→>]|─*┼\s*─*[→>]|─*├\s*─*[→>]|─*└\s*─*[→>]|─*┌\s*─*[→>]|[─\-]+[→>])", l)
            if match_arrow:
                left_part = l[:match_arrow.start()].strip()
                right_part = l[match_arrow.end():].strip()
                clean_left = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", left_part).strip()
                clean_right = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", right_part).strip()
                if clean_left and not source:
                    source = clean_left
                if clean_right:
                    targets.append(clean_right)
            else:
                clean_l = re.sub(r"^[─\-\+\|┌┐└┘├┤┬┴┼│\s]+|[─\-\+\|┌┐└┘├┤┬┴┼│\s]+$", "", l).strip()
                if clean_l and not source:
                    source = clean_l
                elif clean_l:
                    targets.append(clean_l)

        if source and len(targets) >= 2:
            mermaid = ["graph LR"]
            for t_idx, tgt in enumerate(targets):
                mermaid.append(f'    src["{source}"] --> tgt{t_idx}["{tgt}"]')
            return "\n".join(mermaid)

        return None

    def _parse_ascii_slash_tree(self, raw_text: str) -> Optional[str]:
        """
        Parses ASCII tree representations with slashes/backslashes (e.g. copied from ChatGPT):
               A
              / \
             B   C
            /     \
           D       G
        """
        raw_lines = [l for l in raw_text.splitlines() if l.strip()]
        if not raw_lines:
            return None

        has_slash_connector = any(re.match(r"^[\s/\\|_\-]+$", l) and re.search(r"[/\\|]", l) for l in raw_lines)
        has_nodes = any(re.search(r"[A-Za-z0-9]", l) for l in raw_lines)

        if not (has_slash_connector and has_nodes):
            return None

        levels = []
        for l in raw_lines:
            # If line only consists of slashes, backslashes, pipes, underscores, hyphens, spaces
            if re.match(r"^[\s/\\|_\-]+$", l) and re.search(r"[/\\|]", l):
                continue

            # This is a node line. Find all individual tokens with their column positions
            nodes_in_line = []
            for m in re.finditer(r"\S+", l):
                tok = m.group(0).strip()
                if tok and not re.match(r"^[/\\|_\-]+$", tok):
                    center_col = (m.start() + m.end()) / 2.0
                    nodes_in_line.append({
                        "text": tok,
                        "start": m.start(),
                        "end": m.end(),
                        "center": center_col
                    })
            if nodes_in_line:
                levels.append(nodes_in_line)

        if len(levels) < 2:
            return None

        edges = []
        for lvl_idx in range(1, len(levels)):
            parent_level = levels[lvl_idx - 1]
            current_level = levels[lvl_idx]

            if len(parent_level) == 1:
                p = parent_level[0]
                for c in current_level:
                    edges.append((p["text"], c["text"]))
            else:
                midpoints = []
                for idx_m in range(len(parent_level) - 1):
                    mid = (parent_level[idx_m]["center"] + parent_level[idx_m + 1]["center"]) / 2.0
                    midpoints.append(mid)

                for c in current_level:
                    c_center = c["center"]
                    assigned_p_idx = 0
                    while assigned_p_idx < len(midpoints) and c_center > midpoints[assigned_p_idx]:
                        assigned_p_idx += 1
                    edges.append((parent_level[assigned_p_idx]["text"], c["text"]))

        if not edges:
            return None

        is_short_tree_node = all(len(n) <= 2 for pair in edges for n in pair)
        node_id_map = {}

        def get_id(name):
            if name not in node_id_map:
                clean_id = re.sub(r"[^A-Za-z0-9_]", "_", name)
                if not clean_id or clean_id[0].isdigit():
                    clean_id = f"node_{clean_id}"
                if clean_id in node_id_map.values():
                    clean_id = f"{clean_id}_{len(node_id_map)}"
                node_id_map[name] = clean_id
            return node_id_map[name]

        mermaid = ["graph TD"]
        for p_name, c_name in edges:
            pid = get_id(p_name)
            cid = get_id(c_name)
            p_label = f'(("{p_name}"))' if is_short_tree_node else f'["{p_name}"]'
            c_label = f'(("{c_name}"))' if is_short_tree_node else f'["{c_name}"]'
            mermaid.append(f'    {pid}{p_label} --> {cid}{c_label}')

        return "\n".join(mermaid)

    def _convert_to_mermaid_syntax(self, raw_text: str, default_shape: str = "auto") -> str:
        """
        Converts ASCII art trees, flowcharts (e.g. from ChatGPT), arrow chains,
        or indentation trees into clean, valid Mermaid.js diagrams.
        """
        text = raw_text.strip()
        if not text:
            return "graph TD\n    A[Empty Diagram]"

        # 1. Direct mermaid syntax
        if text.startswith(("graph ", "flowchart ", "mindmap", "sequenceDiagram", "classDiagram", "erDiagram", "stateDiagram", "gitGraph", "pie", "journey", "gantt")):
            return text

        # 1.1. Check for Box-drawing convergence / divergence diagrams (e.g. Object Module 1 ─┐ ...)
        box_drawing_res = self._parse_box_drawing_or_convergence(text)
        if box_drawing_res:
            return box_drawing_res

        # 1.2. Check for ASCII Slash Tree diagrams (e.g. A / \ B C / \ D G)
        slash_tree_res = self._parse_ascii_slash_tree(text)
        if slash_tree_res:
            return slash_tree_res

        raw_lines = [l for l in text.splitlines() if l.strip()]
        if not raw_lines:
            return "graph TD\n    A[Empty Diagram]"

        def format_node_def(node_id: str, label: str) -> str:
            lbl = label.strip()
            shape_open, shape_close = '[', ']'

            if lbl.startswith("((") and lbl.endswith("))") and len(lbl) >= 4:
                inner = lbl[2:-2].strip()
                if re.match(r"^\d+$", inner) or (len(inner) <= 4 and not re.search(r"[\s\/]", inner)):
                    shape_open, shape_close = '((', '))'
                else:
                    shape_open, shape_close = '[', ']'
            elif lbl.startswith("[(") and lbl.endswith(")]") and len(lbl) >= 4:
                inner = lbl[2:-2].strip()
                shape_open, shape_close = '[(', ')]'
            elif lbl.startswith("{{") and lbl.endswith("}}") and len(lbl) >= 4:
                inner = lbl[2:-2].strip()
                shape_open, shape_close = '{{', '}}'
            elif lbl.startswith("([") and lbl.endswith("])") and len(lbl) >= 4:
                inner = lbl[2:-2].strip()
                shape_open, shape_close = '([', '])'
            elif lbl.startswith("[") and lbl.endswith("]") and len(lbl) >= 2:
                inner = lbl[1:-1].strip()
                shape_open, shape_close = '[', ']'
            elif lbl.startswith("(") and lbl.endswith(")") and len(lbl) >= 2:
                inner = lbl[1:-1].strip()
                shape_open, shape_close = '(', ')'
            elif lbl.startswith("{") and lbl.endswith("}") and len(lbl) >= 2:
                inner = lbl[1:-1].strip()
                shape_open, shape_close = '{', '}'
            else:
                inner = lbl
                if (default_shape == "circle" or default_shape == "auto") and re.match(r"^\d+$", inner):
                    shape_open, shape_close = '((', '))'
                elif default_shape == "circle" and len(inner) <= 4 and not re.search(r"[\s\/]", inner):
                    shape_open, shape_close = '((', '))'
                elif default_shape == "rounded":
                    shape_open, shape_close = '(', ')'
                elif default_shape == "diamond":
                    shape_open, shape_close = '{', '}'
                else:
                    shape_open, shape_close = '[', ']'

            clean_inner = inner.strip().strip('"\'').replace('"', "'")
            return f'{node_id}{shape_open}"{clean_inner}"{shape_close}'

        # Check if lines have arrow separators (->, -->, →, ➔, =>)
        arrow_pattern = r"\s*(?:-->|->|→|➔|=>)\s*"
        has_arrows = any(re.search(arrow_pattern, l) for l in raw_lines)

        # 1. Inline arrow chains: A -> B -> C or [A] -> [B] -> [C]
        if has_arrows and not any(re.search(r"[┌┐┴┬┼├──└──│]", l) for l in raw_lines) and not any(re.match(r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/vV]+$", l.strip()) for l in raw_lines):
            mermaid_lines = ["graph TD"]
            node_map = {}
            counter = 0

            for line in raw_lines:
                tokens = re.split(arrow_pattern, line.strip())
                tokens = [t.strip() for t in tokens if t.strip()]
                for i in range(len(tokens) - 1):
                    t1, t2 = tokens[i], tokens[i + 1]
                    t2_list = [sub_t.strip() for sub_t in t2.split(',') if sub_t.strip()] if ',' in t2 and not t2.startswith('[') else [t2]

                    if t1 not in node_map:
                        node_map[t1] = f"N{counter}"
                        counter += 1
                    for sub_t2 in t2_list:
                        if sub_t2 not in node_map:
                            node_map[sub_t2] = f"N{counter}"
                            counter += 1
                        mermaid_lines.append(f"    {format_node_def(node_map[t1], t1)} --> {format_node_def(node_map[sub_t2], sub_t2)}")

            if len(mermaid_lines) > 1:
                return "\n".join(mermaid_lines)

        # 2. Check for vertical flowchart / pipeline (like 1.png) with downward connectors (↓, ▼, |, v, etc.)
        connector_pattern = r"^[\s\|\:\.\-\–\—\>▼▲↓↑\+\\\/┌┐└┘├┤┬┴┼│vV]+$"
        node_lines = []
        has_vertical_connectors = False

        for l in raw_lines:
            cleaned = l.strip()
            if re.match(connector_pattern, cleaned) and (re.search(r"[▼▲↓↑│┌┐└┘├┤┬┴┼vV]", cleaned) or any(a in cleaned for a in ("-->", "->", "→", "➔", "=>"))):
                has_vertical_connectors = True
                continue
            clean_node = re.sub(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+$", "", cleaned).strip()
            clean_node = clean_node.replace('"', "'")
            if clean_node and not re.match(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+$", clean_node):
                node_lines.append(clean_node)

        if len(node_lines) >= 2 and (has_vertical_connectors or any(re.search(r"[▼▲↓↑┌┐┴┬┼├┤│]", l) or "-->" in l or "->" in l for l in raw_lines)):
            mermaid_lines = ["graph TD"]
            for idx in range(len(node_lines) - 1):
                n1 = node_lines[idx]
                n2 = node_lines[idx + 1]
                mermaid_lines.append(f"    {format_node_def(f'node{idx}', n1)} --> {format_node_def(f'node{idx+1}', n2)}")
            return "\n".join(mermaid_lines)

        # 3. Check for branched 1-to-many ASCII tree (e.g. Turing Test: Human Judge -> Human & Machine)
        text_lines = []
        for l in raw_lines:
            if re.search(r"[a-zA-Z0-9]", l):
                text_lines.append(l)

        if len(text_lines) == 2 and any(re.search(r"[┌┐┴┬┼├┤│▼▲↓↑]", l) or "-->" in l or "->" in l for l in raw_lines):
            root = text_lines[0].strip().replace('"', "'")
            bottom_raw = text_lines[1]

            children = [c.strip() for c in re.split(r"\s{2,}|\t+", bottom_raw.strip()) if c.strip()]
            if len(children) < 2:
                words = bottom_raw.strip().split()
                if len(words) == 2:
                    children = words
                elif len(words) == 4 and words[0].istitle() and words[2].istitle():
                    children = [words[0] + " " + words[1], words[2] + " " + words[3]]

            if len(children) >= 2:
                mermaid = ["graph TD", f'    Root{format_node_def("", root)}']
                for c_idx, c in enumerate(children):
                    mermaid.append(f'    Root --> {format_node_def(f"C{c_idx}", c)}')
                return "\n".join(mermaid)

        # 4. Check for hierarchical indentation tree / outline / box drawing tree
        mermaid_lines = ["graph TD"]
        stack = []

        for idx, l in enumerate(raw_lines):
            clean_content = re.sub(r"^[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+|[\|\+\-\*\•\>\`\s├──└──│┌┐└┘├┤┬┴┼]+$", "", l).strip()
            if not clean_content:
                continue
            expanded_l = l.expandtabs(4)
            indent = len(expanded_l) - len(expanded_l.lstrip())
            node_id = f"N{idx}"
            node_def = format_node_def(node_id, clean_content)

            while stack and stack[-1][0] >= indent:
                stack.pop()

            if stack:
                parent_id = stack[-1][1]
                mermaid_lines.append(f"    {parent_id} --> {node_def}")
            else:
                mermaid_lines.append(f"    {node_def}")

            stack.append((indent, node_id))

        if len(mermaid_lines) > 2:
            return "\n".join(mermaid_lines)

        if "-->" in text:
            return "graph TD\n" + text

        return "graph TD\n" + text

    def generate_html(self, content_text: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Generate full standalone HTML document with styling."""
        opts = {
            "font_family": "Coming Soon",
            "page_size": "A4",
            "paper_style": "plain",
            "show_header": True,
            "header_mode": "first_page",
            "logo_type": "pw",
            "custom_brand": "PW ONLYIAS",
            "subject": "Indian Polity",
            "lecture": "Lecture 01: Historical Background",
            "subject_color": "#dc2626",
            "lecture_color": "#2563eb",
            "body_color": "#111827",
            "section_color": "#dc2626",
            "subheading_color": "#2563eb",
            "show_sidebar": True,
            "sidebar_width": 145,
            "sidebar_color": "#1d6fa5",
            "sidebar_text": "Space for Notes",
            "table_header_bg": "#28416c",
            "show_footer": True,
            "footer_bg": "#dbe8f6",
            "footer_left": "khajan singh",
            "footer_right": "unit 1",
            "margin_top": 8,
            "margin_bottom": 8,
            "margin_left": 8,
            "margin_right": 8,
            "draft_mode": False,
            "font_size": 11.5,
            "letter_spacing": 0.0,
            "word_spacing": 1.0,
            "line_height": 1.55,
            "realism": "natural"
        }
        if options:
            opts.update(options)

        pages = self.convert_markdown_or_text_to_html(content_text, opts)
        opts["pages"] = pages

        template = Template(HTML_TEMPLATE)
        return template.render(**opts)

    async def render_pdf_async(self, html_content: str, output_pdf_path: str, page_size: str = "A4") -> str:
        """Render HTML to Vector PDF using Headless Chromium with Playwright."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            )
            page = await browser.new_page()
            await page.set_content(html_content, wait_until='networkidle')
            await page.evaluate('document.fonts.ready')
            # Wait for Mermaid diagrams to finish rendering
            await page.wait_for_timeout(300)

            await page.pdf(
                path=output_pdf_path,
                print_background=True,
                format=page_size,
                prefer_css_page_size=True
            )
            await browser.close()

        return output_pdf_path

    def render_pdf(self, html_content: str, output_pdf_path: str, page_size: str = "A4") -> str:
        """Synchronous wrapper for render_pdf_async."""
        return asyncio.run(self.render_pdf_async(html_content, output_pdf_path, page_size))
