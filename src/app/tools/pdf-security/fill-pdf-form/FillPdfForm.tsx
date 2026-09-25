'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import FeedbackWidget from '@/components/FeedbackWidget';
import RelatedTools from '@/components/RelatedTools';
import DocumentLiveViewer from '@/components/DocumentLiveViewer';
import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
} from 'pdf-lib';

type FieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'other';

interface ParsedField {
  name: string;
  type: FieldType;
  value: any;
  options?: string[];
  multiline?: boolean;
  maxLength?: number;
}

export default function FillPdfForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<ParsedField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [flattenOnSave, setFlattenOnSave] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'checkbox' | 'dropdown'>('all');

  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filledBlob, setFilledBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setFields([]);
    setFieldValues({});
    setDownloadUrl(null);
    setFilledBlob(null);
    setErrorMsg(null);
    setIsLoadingFields(true);

    try {
      const buffer = await uploaded.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      const rawFields = form.getFields();

      const parsed: ParsedField[] = [];
      const initialValues: Record<string, any> = {};

      for (const f of rawFields) {
        const name = f.getName();
        if (f instanceof PDFTextField) {
          const val = f.getText() || '';
          parsed.push({
            name,
            type: 'text',
            value: val,
            multiline: f.isMultiline(),
            maxLength: f.getMaxLength(),
          });
          initialValues[name] = val;
        } else if (f instanceof PDFCheckBox) {
          const checked = f.isChecked();
          parsed.push({
            name,
            type: 'checkbox',
            value: checked,
          });
          initialValues[name] = checked;
        } else if (f instanceof PDFRadioGroup) {
          const selected = f.getSelected();
          const options = f.getOptions();
          parsed.push({
            name,
            type: 'radio',
            value: selected || '',
            options,
          });
          initialValues[name] = selected || '';
        } else if (f instanceof PDFDropdown || f instanceof PDFOptionList) {
          const selected = f.getSelected();
          const options = f.getOptions();
          const selVal = Array.isArray(selected) && selected.length > 0 ? selected[0] : '';
          parsed.push({
            name,
            type: 'dropdown',
            value: selVal,
            options,
          });
          initialValues[name] = selVal;
        } else {
          parsed.push({
            name,
            type: 'other',
            value: '',
          });
          initialValues[name] = '';
        }
      }

      setFields(parsed);
      setFieldValues(initialValues);
    } catch (err: any) {
      console.error('Error loading form fields:', err);
      setErrorMsg(
        err.message || 'Could not parse form fields from this PDF. The document may be corrupted or secured.'
      );
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleValueChange = (name: string, val: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const saveAndDownload = async () => {
    if (!file) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      for (const f of fields) {
        const val = fieldValues[f.name];
        try {
          if (f.type === 'text') {
            const tf = form.getTextField(f.name);
            tf.setText(typeof val === 'string' ? val : '');
          } else if (f.type === 'checkbox') {
            const cb = form.getCheckBox(f.name);
            if (val) {
              cb.check();
            } else {
              cb.uncheck();
            }
          } else if (f.type === 'radio' && val) {
            const rg = form.getRadioGroup(f.name);
            rg.select(val);
          } else if (f.type === 'dropdown' && val) {
            const dd = form.getDropdown(f.name);
            dd.select(val);
          }
        } catch (fieldErr) {
          console.warn(`Could not update field "${f.name}":`, fieldErr);
        }
      }

      if (flattenOnSave) {
        form.flatten();
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      setFilledBlob(blob);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `filled-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.dispatchEvent(
        new CustomEvent('toolsverse-toast', {
          detail: { message: '📝 Form Filled & Downloaded Successfully!' },
        })
      );
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'Failed to save filled PDF form.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFields = fields.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'text') return f.type === 'text';
    if (activeFilter === 'checkbox') return f.type === 'checkbox' || f.type === 'radio';
    if (activeFilter === 'dropdown') return f.type === 'dropdown';
    return true;
  });

  const formatFieldName = (raw: string) => {
    // Make camelCase or snake_case or prefix-laden names human readable
    const cleaned = raw.replace(/^(txt|chk|rdo|drp|cb|btn)_?/i, '');
    const spaced = cleaned.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Fill PDF Form</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-700 flex items-center justify-center text-white text-xl shadow-sm">
            📝
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Fill Interactive PDF Form
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Complete official PDF tax forms, applications, surveys, and declarations online with dynamic interactive form inputs.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Main Container */}
      <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        {!file ? (
          <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-10 transition-colors group bg-gray-50/50 dark:bg-slate-950/40 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
            />
            <div className="pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-3xl mb-3 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Upload Fillable PDF Form
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Drag &amp; drop your interactive PDF form here
              </p>
              <span className="px-6 py-2.5 bg-primary-600 group-hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-block">
                Browse Files
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0 font-bold">
                  📄
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isLoadingFields
                      ? 'Scanning document fields...'
                      : `${fields.length} Interactive Field${fields.length === 1 ? '' : 's'} Detected`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setFields([]);
                  setFieldValues({});
                  setDownloadUrl(null);
                  setFilledBlob(null);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                Choose Different PDF
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* If NO fields detected in PDF */}
            {!isLoadingFields && fields.length === 0 && (
              <div className="p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center space-y-3">
                <div className="text-3xl">⚠️</div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  No Interactive Form Fields Found
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 max-w-lg mx-auto leading-relaxed">
                  This document is a static PDF without AcroForm interactive input elements. Would you like to create fillable text boxes, checkboxes, and signature fields on this document?
                </p>
                <div className="pt-2">
                  <Link
                    href="/tools/pdf-security/create-fillable-pdf"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <span>Open in Create Fillable PDF Designer</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Field Controls Bar if fields exist */}
            {fields.length > 0 && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search fields by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="absolute left-2.5 top-2.5 text-xs text-gray-400 dark:text-slate-400">🔍</span>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                    {[
                      { id: 'all', label: `All (${fields.length})` },
                      {
                        id: 'text',
                        label: `Text (${fields.filter((f) => f.type === 'text').length})`,
                      },
                      {
                        id: 'checkbox',
                        label: `Checks (${
                          fields.filter((f) => f.type === 'checkbox' || f.type === 'radio').length
                        })`,
                      },
                      {
                        id: 'dropdown',
                        label: `Dropdowns (${
                          fields.filter((f) => f.type === 'dropdown').length
                        })`,
                      },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setActiveFilter(btn.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          activeFilter === btn.id
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-1">
                  {filteredFields.map((field) => (
                    <div
                      key={field.name}
                      className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {formatFieldName(field.name)}
                          </label>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 shrink-0">
                            {field.name}
                          </span>
                        </div>

                        {/* Text Field */}
                        {field.type === 'text' && (
                          field.multiline ? (
                            <textarea
                              rows={3}
                              value={fieldValues[field.name] || ''}
                              maxLength={field.maxLength}
                              onChange={(e) => handleValueChange(field.name, e.target.value)}
                              placeholder={`Enter ${formatFieldName(field.name)}...`}
                              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={fieldValues[field.name] || ''}
                              maxLength={field.maxLength}
                              onChange={(e) => handleValueChange(field.name, e.target.value)}
                              placeholder={`Enter ${formatFieldName(field.name)}...`}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                          )
                        )}

                        {/* Checkbox Field */}
                        {field.type === 'checkbox' && (
                          <label className="flex items-center gap-3 cursor-pointer select-none mt-1">
                            <input
                              type="checkbox"
                              checked={!!fieldValues[field.name]}
                              onChange={(e) => handleValueChange(field.name, e.target.checked)}
                              className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700"
                            />
                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                              {fieldValues[field.name] ? 'Checked (Yes)' : 'Unchecked (No)'}
                            </span>
                          </label>
                        )}

                        {/* Dropdown Field */}
                        {field.type === 'dropdown' && (
                          <select
                            value={fieldValues[field.name] || ''}
                            onChange={(e) => handleValueChange(field.name, e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">-- Select Option --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Radio Group */}
                        {field.type === 'radio' && (
                          <div className="space-y-1 mt-1">
                            {field.options?.map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center gap-2 text-xs cursor-pointer text-gray-700 dark:text-slate-300"
                              >
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={opt}
                                  checked={fieldValues[field.name] === opt}
                                  onChange={() => handleValueChange(field.name, opt)}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Options (Flatten on save) */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={flattenOnSave}
                      onChange={(e) => setFlattenOnSave(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Flatten Form Fields on Download (Recommended for Submissions)
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        Locks all filled text and checked boxes permanently so recipients cannot alter your entries.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={saveAndDownload}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-teal-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Form Data...</span>
                      </>
                    ) : (
                      <>
                        <span>Save &amp; Download Filled PDF</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={`filled-${file.name}`}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                    >
                      <span>Download Filled PDF ↓</span>
                    </a>
                  )}
                </div>

                {/* Live Document Preview */}
                {filledBlob && (
                  <div className="pt-4">
                    <DocumentLiveViewer
                      file={filledBlob}
                      fileName={`filled-${file.name}`}
                      title="Filled PDF Document Preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackWidget toolName="Fill PDF Form" />
      <RelatedTools currentSlug="fill-pdf-form" />

      {/* How to Use Section */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          How to Fill Out PDF Forms Online
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-primary-600 text-sm">1. Upload Interactive Form</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">AcroForm Parsing</p>
            <p className="mt-0.5">
              Select government tax forms, lease agreements, or bank declarations containing fillable fields.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">2. Complete Fields Quickly</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Smart Input Controls</p>
            <p className="mt-0.5">
              Enter text, toggle checkboxes, and select dropdown choices with live client-side validation.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary-600 text-sm">3. Save &amp; Lock Entries</span>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">Export Filled PDF</p>
            <p className="mt-0.5">
              Optionally flatten form elements into read-only text and download the filled PDF securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
