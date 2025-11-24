import { pdf } from '@react-pdf/renderer';
import { ReportPdfDocument } from './ReportPdfDocument';
import type { ReportModel } from './reportModel';
import { renderMermaidToPng } from '../utils/mermaidToImage';
import React from 'react';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

export async function renderReportPdf(report: ReportModel): Promise<Blob> {
  try {
    // Clone report to avoid mutating the original state
    const pdfReport = { ...report };
    
    // Pre-render diagrams to images
    if (pdfReport.diagrams) {
      // Create a shallow copy of diagrams to modify
      const diagrams = { ...pdfReport.diagrams };
      const diagramKeys = Object.keys(diagrams) as (keyof typeof diagrams)[];
      
      for (const key of diagramKeys) {
        const diagram = diagrams[key];
        if (diagram && diagram.code) {
          try {
            console.log(`Rendering diagram: ${key}`);
            const { imageUrl, width, height } = await renderMermaidToPng(diagram.code);
            // Update the diagram with the image URL and dimensions
            diagrams[key] = { ...diagram, imageUrl, width, height };
          } catch (err) {
            console.warn(`Failed to render diagram ${key} for PDF:`, err);
            // Continue without image, will fallback to code block
          }
        }
      }
      // Assign back to report
      pdfReport.diagrams = diagrams;
    }

    // Generate PDF using @react-pdf/renderer
    // We use the pdf() function to create a blob directly
    // @ts-ignore - React PDF types can be tricky with createElement
    const blob = await pdf(React.createElement(ReportPdfDocument, { report: pdfReport })).toBlob();
    return blob;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}
