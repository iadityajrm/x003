import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { 
  QrCode, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  FileText, 
  Sparkles, 
  SlidersHorizontal,
  Wifi,
  KeyRound,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PropertyData } from '../../types';

interface GuestQrAndPdfSectionProps {
  property: PropertyData;
  currentSlug: string;
  onShowToast: (msg: string) => void;
}

export const GuestQrAndPdfSection: React.FC<GuestQrAndPdfSectionProps> = ({
  property,
  currentSlug,
  onShowToast,
}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dwellio.com';
  const guestUrl = `${origin}/client/${currentSlug}`;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);

  // Predetermined blanks / customizable fields for print standee
  const [customTitle, setCustomTitle] = useState(property.name);
  const [customTagline, setCustomTagline] = useState(property.tagline || 'Digital Guest Guide & AI Concierge');
  const [customAddress, setCustomAddress] = useState(property.coordinates?.address || property.location);
  const [customWifiNet, setCustomWifiNet] = useState(property.wifi.network);
  const [customWifiPass, setCustomWifiPass] = useState(property.wifi.password);
  const [customAccessCode, setCustomAccessCode] = useState(property.checkIn.accessCode);
  const [customCheckInTime, setCustomCheckInTime] = useState(property.checkIn.time || '4:00 PM');
  const [customCheckOutTime, setCustomCheckOutTime] = useState('11:00 AM');
  const [customHostPhone, setCustomHostPhone] = useState(property.host.phoneFormatted || '(555) 0192');
  const [customInstructions, setCustomInstructions] = useState(
    'Point your smartphone camera at this QR code to access high-speed Wi-Fi, doorstep keypad instructions, house rules, curated local dining, and 24/7 AI guest assistance.'
  );

  // Sync state whenever property changes
  useEffect(() => {
    setCustomTitle(property.name);
    setCustomTagline(property.tagline || 'Digital Guest Guide & AI Concierge');
    setCustomAddress(property.coordinates?.address || property.location);
    setCustomWifiNet(property.wifi.network);
    setCustomWifiPass(property.wifi.password);
    setCustomAccessCode(property.checkIn.accessCode);
    setCustomCheckInTime(property.checkIn.time || '4:00 PM');
    setCustomHostPhone(property.host.phoneFormatted || '(555) 0192');
  }, [property]);

  // Generate crisp QR code on URL or slug change
  useEffect(() => {
    QRCode.toDataURL(guestUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#2A4436',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code data URL:', err));
  }, [guestUrl]);

  // Copy link handler
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(guestUrl);
      setIsCopied(true);
      onShowToast('Guest assistant link copied!');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Generate & Print / Download PDF
  const handleGeneratePdf = async (autoPrint: boolean = false) => {
    setIsGeneratingPdf(true);
    onShowToast('Generating printable Guest Guide PDF...');

    try {
      // Ensure we have a high-res QR code
      const qrImage = qrDataUrl || await QRCode.toDataURL(guestUrl, {
        width: 600,
        margin: 2,
        color: { dark: '#2A4436', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4', // 210 x 297 mm
      });

      // Background styling
      doc.setFillColor(250, 248, 245); // Warm beige #FAF8F5
      doc.rect(0, 0, 210, 297, 'F');

      // Top Elegant Forest Header Bar
      doc.setFillColor(42, 68, 54); // Deep Sage #2A4436
      doc.rect(0, 0, 210, 34, 'F');

      // Header Brand Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('D W E L L I O', 105, 14, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(230, 238, 232);
      doc.text('OFFICIAL PROPERTY GUEST GUIDE & DIGITAL ASSISTANT', 105, 22, { align: 'center' });

      // Main Card Frame (White Card)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(16, 42, 178, 238, 6, 6, 'F');
      doc.setDrawColor(225, 220, 212);
      doc.setLineWidth(0.4);
      doc.roundedRect(16, 42, 178, 238, 6, 6, 'S');

      // Property Welcome Title
      doc.setTextColor(28, 27, 24); // #1C1B18
      doc.setFont('times', 'bold');
      doc.setFontSize(24);
      doc.text(`Welcome to ${customTitle}`, 105, 58, { align: 'center' });

      // Tagline
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(100, 97, 92);
      doc.text(customTagline, 105, 66, { align: 'center' });

      // Doorstep Address
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 117, 110);
      doc.text(`Doorstep Location: ${customAddress}`, 105, 72, { align: 'center' });

      // Subtle Divider
      doc.setDrawColor(235, 232, 226);
      doc.setLineWidth(0.3);
      doc.line(30, 77, 180, 77);

      // Centered QR Code Image - make it prominent and beautiful
      const qrSize = 70; // 70x70 mm
      const qrX = (210 - qrSize) / 2;
      const qrY = 88;

      // QR Code Background Frame
      doc.setFillColor(246, 244, 240);
      doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4, 4, 'F');
      doc.setDrawColor(42, 68, 54);
      doc.setLineWidth(0.6);
      doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4, 4, 'S');

      // Add QR Image
      doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);

      // Scan Call to Action
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(42, 68, 54);
      doc.text('SCAN WITH YOUR SMARTPHONE CAMERA', 105, 172, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 97, 92);
      doc.text('Instant digital guest guide · No app download required', 105, 179, { align: 'center' });

      // Direct Link Text
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(42, 68, 54);
      doc.text(guestUrl, 105, 187, { align: 'center' });

      // Instructions Box - App Instructions Only
      const instrY = 200;
      doc.setFillColor(235, 242, 236); // Light sage #EBF2EC
      doc.roundedRect(24, instrY, 162, 52, 4, 4, 'F');
      doc.setDrawColor(180, 205, 186);
      doc.setLineWidth(0.4);
      doc.roundedRect(24, instrY, 162, 52, 4, 4, 'S');

      doc.setTextColor(42, 68, 54);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('HOW TO USE YOUR DWELLIO DIGITAL ASSISTANT', 105, instrY + 10, { align: 'center' });

      doc.setTextColor(45, 55, 48);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitInstr = doc.splitTextToSize(customInstructions, 148);
      doc.text(splitInstr, 32, instrY + 20);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 137, 130);
      doc.text('Dwellio Smart Guest Experience · Designed for Vacation Rentals & Boutique Hospitality', 105, 268, { align: 'center' });

      // Save PDF File
      const fileName = `${property.slug || 'property'}-guest-welcome-standee.pdf`;
      doc.save(fileName);

      // If user chose print, also open printable blob in new tab
      if (autoPrint) {
        const blobUrl = doc.output('bloburl');
        const printWindow = window.open(blobUrl);
        if (printWindow) {
          printWindow.focus();
        }
      }

      onShowToast(`Generated ${fileName}! Ready to print.`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      onShowToast('Could not generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-4 animate-fade-in">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#1C1B18] leading-tight">
              Guest QR Code & Assistant Link
            </h3>
            <p className="text-[11px] text-[#78756E] mt-0.5">
              Print a welcome standee for your property with predetermined blanks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomize(!showCustomize)}
          className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            showCustomize
              ? 'bg-[#2A4436] text-white border-[#2A4436]'
              : 'bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#5C5A55] border-black/5'
          }`}
          title="Customize predetermined blanks"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* 2. QR Code Visual Preview & Link Card */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/5 flex flex-col sm:flex-row items-center gap-4">
        {/* QR Canvas Box */}
        <div className="relative p-2.5 rounded-2xl bg-white border border-black/10 shadow-soft-sm shrink-0 flex flex-col items-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for ${property.name}`}
              className="w-32 h-32 object-contain rounded-xl"
            />
          ) : (
            <div className="w-32 h-32 bg-[#F6F4F0] animate-pulse rounded-xl flex items-center justify-center text-xs text-[#78756E]">
              Generating QR...
            </div>
          )}
          <span className="text-[9px] font-bold text-[#2A4436] uppercase tracking-wider mt-1.5 block">
            Camera Scannable
          </span>
        </div>

        {/* Link Info & Actions */}
        <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left w-full">
          <div>
            <span className="text-[10px] font-bold text-[#78756E] uppercase tracking-wider block">
              Property Assistant URL
            </span>
            <div className="font-mono text-xs font-bold text-[#1C1B18] bg-white px-3 py-2 rounded-xl border border-black/10 truncate mt-1 select-all">
              {guestUrl}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#1C1B18] shadow-soft-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#2A4436]" /> : <Copy className="w-3.5 h-3.5 text-[#78756E]" />}
              <span>{isCopied ? 'Link Copied' : 'Copy Link'}</span>
            </button>

            <a
              href={guestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#2A4436] text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Open Guest View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-[11px] text-[#78756E] leading-relaxed">
            Guests who scan this code land directly on <strong>{property.name}</strong>'s guest assistant with turn-by-turn navigation back to your door.
          </p>
        </div>
      </div>

      {/* 3. Customizable Predetermined Blanks (Expandable) */}
      {showCustomize && (
        <div className="p-4 rounded-2xl bg-[#F6F4F0] border border-black/5 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-black/10 pb-2">
            <span className="font-bold text-[#1C1B18]">
              Predetermined Blanks on Printable Standee
            </span>
            <span className="text-[10px] text-[#78756E]">
              Pre-filled from property dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#1C1B18] mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1C1B18] mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#1C1B18] mb-1">
                Printed Instructions for App
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Action Buttons: Print QR & Download PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handleGeneratePdf(true)}
          disabled={isGeneratingPdf}
          className="py-3 px-4 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs sm:text-sm font-bold shadow-soft-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Printer className="w-4 h-4" />
          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Print QR Standee (PDF)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleGeneratePdf(false)}
          disabled={isGeneratingPdf}
          className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-black/10 text-xs sm:text-sm font-bold text-[#1C1B18] shadow-soft-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4 text-[#2A4436]" />
          <span>Download PDF Standee</span>
        </button>
      </div>
    </div>
  );
};
