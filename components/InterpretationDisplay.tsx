'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Share2, Moon, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface InterpretationDisplayProps {
  interpretacao: string;
  imageUrl?: string | null;
  sonhoId: string | null;
  nome: string;
  signo: string;
  onNovoSonho: () => void;
}

const signoLabels: Record<string, string> = {
  aries: 'Áries', touro: 'Touro', gemeos: 'Gêmeos', cancer: 'Câncer',
  leao: 'Leão', virgem: 'Virgem', libra: 'Libra', escorpiao: 'Escorpião',
  sagitario: 'Sagitário', capricornio: 'Capricórnio', aquario: 'Aquário', peixes: 'Peixes',
};

const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function InterpretationDisplay({
  interpretacao,
  imageUrl,
  sonhoId,
  nome,
  signo,
  onNovoSonho,
}: InterpretationDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(interpretacao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^[-*]\s/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    const drawBackground = () => {
      doc.setFillColor(10, 5, 20);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    const drawHeader = (y: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(22);
      doc.setTextColor(168, 117, 255);
      doc.text('Sonnus AI', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(160, 160, 192);
      doc.text('Oráculo Místico Ancestral dos Sonhos', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setDrawColor(139, 61, 255);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      return y;
    };

    const drawMeta = (y: number) => {
      const boxWidth = (contentWidth - 10) / 3;
      const items = [
        { label: 'Nome', value: nome },
        { label: 'Signo', value: signoLabels[signo] || signo },
        { label: 'Data', value: new Date().toLocaleDateString('pt-BR') },
      ];

      items.forEach((item, i) => {
        const x = margin + i * (boxWidth + 5);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(255, 255, 255);
        doc.roundedRect(x, y, boxWidth, 16, 3, 3, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 192);
        doc.text(item.label, x + 4, y + 6);
        doc.setFontSize(11);
        doc.setTextColor(224, 224, 240);
        doc.text(item.value, x + 4, y + 12);
      });

      return y + 24;
    };

    const drawSectionTitle = (y: number, title: string, color: number[]) => {
      doc.setDrawColor(139, 61, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 8, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, margin + 12, y);
      return y + 8;
    };

    const addWrappedText = (text: string, y: number, fontSize: number, color: number[], font: string, lineHeight: number): number => {
      doc.setFont('helvetica', font as 'normal' | 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, contentWidth);
      let currentY = y;

      for (const line of lines) {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          drawBackground();
          currentY = margin + 10;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      }

      return currentY;
    };

    drawBackground();

    let y = 25;
    y = drawHeader(y);
    y += 5;
    y = drawMeta(y);

    if (imageUrl) {
      try {
        const base64Img = await urlToBase64(imageUrl);
        const imgSize = 90; // 90x90 mm
        const imgX = (pageWidth - imgSize) / 2;
        // Desenha a imagem centralizada
        doc.addImage(base64Img, 'JPEG', imgX, y, imgSize, imgSize);
        y += imgSize + 15; // Move o texto para baixo da imagem
      } catch (err) {
        console.error('Erro ao converter imagem para PDF', err);
        y += 10;
      }
    } else {
      y += 10;
    }

    const cleanText = cleanMarkdown(interpretacao);
    const sections = cleanText.split(/\n\s*\n/);
    let isFirst = true;

    for (const section of sections) {
      const lines = section.split('\n');
      let title: string | null = null;
      let body: string[] = [];

      for (const line of lines) {
        if (line.includes('O que o Universo diz') || line.includes('O que o universo diz')) {
          title = 'O que o Universo diz';
        } else if (line.includes('Influência Astral') || line.includes('Influencia Astral')) {
          title = 'Influência Astral';
        } else if (line.includes('Caminho de Luz')) {
          title = 'Caminho de Luz';
        } else if (line.startsWith('• ') || line.length > 5) {
          body.push(line.replace(/^• /, ''));
        }
      }

      if (!title) {
        title = 'Interpretação';
        body = lines.filter(l => l.length > 5);
      }

      if (y > pageHeight - 50) {
        doc.addPage();
        drawBackground();
        y = margin + 10;
      }

      if (!isFirst) y += 4;
      y = drawSectionTitle(y, title, isFirst ? [255, 233, 26] : [168, 117, 255]);
      isFirst = false;

      if (body.length > 0) {
        const bodyText = body.join('\n\n');
        y = addWrappedText(bodyText, y, 10, [224, 224, 240], 'normal', 5.5);
      }

      y += 2;
    }

    if (y > pageHeight - 30) {
      doc.addPage();
      drawBackground();
      y = margin + 10;
    }

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 192);
    doc.text(`Gerado por Sonnus AI • ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, y, { align: 'center' });

    doc.save(`interpretacao-${nome.split(' ')[0].toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Minha Interpretação - Sonnus AI',
        text: interpretacao,
      });
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Interpretação - Sonnus AI</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #0a0a1a; color: #f0f0ff; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid rgba(139,61,255,0.3); margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 700; color: #a875ff; }
            .meta { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
            .meta-item { background: rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 12px; }
            .meta-label { font-size: 12px; color: #a0a0c0; }
            .meta-value { font-size: 16px; font-weight: 600; }
            .content { color: #d0d0e0; line-height: 1.8; white-space: pre-wrap; }
            h3 { color: #a875ff; margin: 24px 0 12px 0; }
            @media print { body { background: white; color: #1a1a2e; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Sonnus AI</div>
            <div class="subtitle" style="color: #a0a0c0; font-size: 14px; margin-top: 8px;">Oráculo Místico Ancestral dos Sonhos</div>
          </div>
          <div class="meta">
            <div class="meta-item"><div class="meta-label">Nome</div><div class="meta-value">${nome}</div></div>
            <div class="meta-item"><div class="meta-label">Signo</div><div class="meta-value">${signoLabels[signo] || signo}</div></div>
            <div class="meta-item"><div class="meta-label">Data</div><div class="meta-value">${new Date().toLocaleDateString('pt-BR')}</div></div>
          </div>
          ${imageUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 16px; max-height: 400px;" /></div>` : ''}
          <div class="content">${interpretacao.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden"
    >
      <div className="bg-purple-900/30 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Interpretação para {nome.split(' ')[0]}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            title="Copiar"
          >
            {copied ? (
              <span className="text-green-400 text-xs">Copiado!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            title="Baixar PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-6 gap-6 max-h-[500px] overflow-y-auto">
        {imageUrl && (
          <div className="w-full md:w-1/2 flex-shrink-0">
            <img src={imageUrl} alt="Ilustração do Sonho" className="w-full h-auto rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] object-cover" />
          </div>
        )}
        <div className={`markdown-content ${imageUrl ? 'w-full md:w-1/2' : 'w-full'}`}>
          <ReactMarkdown>{interpretacao}</ReactMarkdown>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-purple-500/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNovoSonho}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <Moon className="w-4 h-4" />
          Interpretar Outro Sonho
        </motion.button>
      </div>
    </motion.div>
  );
}
