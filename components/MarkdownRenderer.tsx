import React from 'react';

// A lightweight renderer to handle newlines and bold text from LLM output
// without importing heavy markdown libraries.
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by newlines
  const paragraphs = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {paragraphs.map((p, idx) => {
        if (!p.trim()) return <div key={idx} className="h-2" />;

        // Handle simple Headers (lines starting with #)
        // Removed fixed text colors (text-gray-900) to allow inheritance
        if (p.startsWith('### ')) {
            return <h4 key={idx} className="font-bold mt-2">{p.replace('### ', '')}</h4>
        }
        if (p.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-lg mt-3">{p.replace('## ', '')}</h3>
        }
        if (p.startsWith('# ')) {
            return <h2 key={idx} className="font-bold text-xl mt-4 border-b pb-1 border-current/20">{p.replace('# ', '')}</h2>
        }

        // Handle Bullet points
        if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
            return (
                <div key={idx} className="flex gap-2 ml-2">
                    <span className="opacity-70">•</span>
                    <span>{parseBold(p.replace(/^[-*]\s/, ''))}</span>
                </div>
            )
        }

        return <p key={idx}>{parseBold(p)}</p>;
      })}
    </div>
  );
};

// Simple helper to bold text between ** **
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default MarkdownRenderer;
