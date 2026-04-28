import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * ExportButton
 * Props:
 *   data        — array of objects to export as CSV
 *   filename    — base filename (no extension)
 *   pdfTargetId — id of the DOM element to capture as PDF
 */
export default function ExportButton({ data = [], filename = "export", pdfTargetId }) {

  // ── CSV Export ────────────────────────────────────────────────────────────
  function exportCSV() {
    if (!data.length) return alert("No data to export");

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        // Wrap in quotes if contains comma or newline
        return String(val).includes(",") ? `"${val}"` : val;
      }).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── PDF Export ────────────────────────────────────────────────────────────
  async function exportPDF() {
    const target = pdfTargetId
      ? document.getElementById(pdfTargetId)
      : document.body;

    if (!target) return alert("No content to export");

    try {
      const canvas = await html2canvas(target, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      alert("PDF export failed: " + err.message);
    }
  }

  return (
    <div className="export-bar">
      <span>Export:</span>
      <button className="btn btn-outline btn-sm" onClick={exportCSV}>
        ⬇ CSV
      </button>
      <button className="btn btn-outline btn-sm" onClick={exportPDF}>
        ⬇ PDF
      </button>
    </div>
  );
}
