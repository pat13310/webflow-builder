import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface OutputDisplayProps {
  content?: string;
  format?: 'html' | 'markdown' | 'text' | 'json';
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content = '', format = 'text' }) => {
  // Formater le contenu selon le format
  const formattedContent = React.useMemo(() => {
    if (!content) return 'Pas de contenu';
    
    switch (format) {
      case 'json':
        try {
          const obj = JSON.parse(content);
          return JSON.stringify(obj, null, 1);
        } catch {
          return content;
        }
      case 'markdown':
      case 'html':
        if (format === 'markdown') {
          const parsed = marked.parse(content);
          return typeof parsed === 'string' ? DOMPurify.sanitize(parsed) : content;
        }
        return DOMPurify.sanitize(content);
      default:
        return content;
    }
  }, [content, format]);

  if (format === 'html' || format === 'markdown') {
    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none font-mono text-[6px]"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  }

  return (
    <div className="font-mono text-[6px] whitespace-pre-wrap">
      {formattedContent}
    </div>
  );
};

export default OutputDisplay;