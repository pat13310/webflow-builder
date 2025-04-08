import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface OutputDisplayProps {
  content?: string;
  format?: 'html' | 'markdown' | 'text';
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content = '', format = 'text' }) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  const renderContent = () => {
    switch (format) {
      case 'html':
        return (
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        );
      case 'markdown':
        return (
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(content)) }}
          />
        );
      case 'text':
      default:
        return (
          <pre className="text-3xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
            {content}
          </pre>
        );
    }
  };

  return (
    <div className="text-3xs">
      {content ? renderContent() : (
        <div className="text-gray-400 dark:text-gray-600 italic">No content</div>
      )}
    </div>
  );
};

export default OutputDisplay;