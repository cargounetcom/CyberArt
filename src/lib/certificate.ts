import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateCertificate(item: { 
  id: string, 
  title: string, 
  author: string, 
  imageUrl?: string, 
  date: string,
  price?: number
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background - Brutalist Aesthetic
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Outer Border
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(10, 10, 190, 277);
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.text('CERTIFICATE_OF', 105, 40, { align: 'center' });
  doc.text('PROVENANCE', 105, 55, { align: 'center' });
  
  // Separator
  doc.setLineWidth(2);
  doc.line(20, 65, 190, 65);
  
  // Asset Image Placeholder (or actual if we want to wait for canvas)
  // For simplicity and speed, we mention it as digital identifier
  doc.setFontSize(10);
  doc.text(`ASSET_DIGITAL_IDENTIFIER: ${item.id}`, 20, 75);

  // Asset Details
  doc.setFontSize(12);
  doc.text('TITLE_OF_NEURAL_ARTIFACT:', 20, 95);
  doc.setFontSize(24);
  doc.text(item.title.toUpperCase(), 20, 105);
  
  doc.setFontSize(12);
  doc.text('CREATOR_ID_LEDGER:', 20, 125);
  doc.setFontSize(18);
  doc.text(`@${item.author.toUpperCase()}`, 20, 135);

  doc.setFontSize(12);
  doc.text('MINTED_ON_DATE:', 20, 155);
  doc.setFontSize(18);
  doc.text(item.date.toUpperCase(), 20, 165);

  // QR Code / Sync ID Placeholder
  doc.setLineWidth(1);
  doc.rect(150, 180, 40, 40);
  doc.setFontSize(8);
  doc.text('LEDGER_QR_SYNC', 170, 225, { align: 'center' });

  // Verification text
  doc.setFontSize(9);
  const verifyText = "This document authenticates the transfer and ownership of the specified neural artifact within the ArtRemix Network. Every transaction is cryptographically linked to the Global Museum Sync Initiative, ensuring heritage preservation through every digital exchange.";
  doc.text(verifyText, 20, 240, { maxWidth: 170 });

  // Signature Area
  doc.line(20, 275, 80, 275);
  doc.text('ARCHIVAL_OFFICER_SIGNATURE', 20, 282);
  
  doc.line(130, 275, 190, 275);
  doc.text('NETWORK_VALIDATOR_STAMP', 130, 282);

  // Save the PDF
  doc.save(`ArtRemix_Provenance_${item.id}.pdf`);
}
