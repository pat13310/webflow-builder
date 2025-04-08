import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface OutputDisplayProps {
  content?: string;
  format?: 'html' | 'markdown' | 'text';
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content = '', format = 'text' }) => {
  const [parsedContent, setParsedContent] = React.useState<string>(content);
  const sanitizedContent = DOMPurify.sanitize(content);

  React.useEffect(() => {
    const parseContent = async () => {
      if (format === 'markdown') {
        const markdownContent = await marked(content);
        setParsedContent(DOMPurify.sanitize(markdownContent));
      } else {
        setParsedContent(content);
      }
    };
    parseContent();
  }, [content, format]);

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
            dangerouslySetInnerHTML={{ __html: parsedContent }}
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