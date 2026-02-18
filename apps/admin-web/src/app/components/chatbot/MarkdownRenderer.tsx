/**
 * MarkdownRenderer.tsx
 *
 * Professional Markdown rendering for chat messages.
 * Supports:
 * - GFM (GitHub Flavored Markdown) tables
 * - Code blocks with syntax highlighting
 * - Headings, bold, italic, lists
 * - HTML entity unescaping
 * - Emoji stripping for Super Admin (professional output)
 * - Sanitization for XSS prevention
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { getChatRoleFromPath } from '@/app/services/chatService';

interface MarkdownRendererProps {
  content: string;
  /** Force emoji stripping regardless of role */
  stripEmojis?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Unescape HTML entities that may come from agent responses
 * e.g., &ast; → *, &lt; → <, &gt; → >, etc.
 */
function unescapeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&ast;': '*',
    '&num;': '#',
    '&lpar;': '(',
    '&rpar;': ')',
    '&lbrack;': '[',
    '&rbrack;': ']',
    '&lbrace;': '{',
    '&rbrace;': '}',
    '&vert;': '|',
    '&pipe;': '|',
    '&ndash;': '–',
    '&mdash;': '—',
    '&nbsp;': ' ',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }

  // Handle numeric entities like &#42; → *
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return result;
}

/**
 * Normalize newlines and fix common formatting issues from LLM outputs
 * - Convert literal \n strings to actual newlines
 * - Ensure proper spacing for markdown elements
 */
function normalizeContent(text: string): string {
  let result = text;

  // Convert literal \n (escaped newlines from JSON) to actual newlines
  result = result.replace(/\\n/g, '\n');

  // Convert literal \r\n to newlines
  result = result.replace(/\\r\\n/g, '\n');
  result = result.replace(/\\r/g, '\n');

  // FIX: Convert "* " at start of lines to "- " for reliable markdown lists
  // (Markdown * can be confused with bold/emphasis)
  result = result.replace(/^(\s*)\* /gm, '$1- ');

  // FIX: Convert "• " bullet characters to "- " for standard markdown lists
  result = result.replace(/^(\s*)• /gm, '$1- ');

  // FIX: Ensure double newline before headings (### needs blank line above)
  result = result.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');

  // FIX: Ensure double newline before list blocks (- item needs blank line above non-list)
  result = result.replace(/([^\n-])\n(\s*- )/g, '$1\n\n$2');

  // Ensure headings have newlines before them (### needs to be at start of line)
  result = result.replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2');

  // Ensure bullet points (* ) at start work - add newline before if needed
  result = result.replace(/([^\n])(\s*\*\s+[A-Z])/g, '$1\n$2');

  // Ensure numbered lists have newlines
  result = result.replace(/([^\n])(\s*\d+\.\s+)/g, '$1\n$2');

  // Ensure --- separators are on their own lines
  result = result.replace(/([^\n])(---)/g, '$1\n\n$2');
  result = result.replace(/(---)([^\n])/g, '$1\n\n$2');

  // FIX: Ensure tables have blank lines around them
  result = result.replace(/([^\n])(\n\|)/g, '$1\n\n|');
  result = result.replace(/(\|\n)([^\n|])/g, '$1\n$2');

  // Clean up excessive newlines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Remove emojis from text for professional output
 * Covers most Unicode emoji ranges
 */
function stripEmojisFromText(text: string): string {
  // Comprehensive emoji regex covering:
  // - Emoji presentation sequences
  // - Emoji modifiers
  // - Regional indicators (flags)
  // - Miscellaneous symbols
  // - Dingbats
  // - Various emoji blocks
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{E0000}-\u{E007F}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{200D}]|[\u{20E3}]|[\u{FE0F}]/gu;

  return text.replace(emojiRegex, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Clean up excessive separators (multiple --- or ===) into single hr
 */
function cleanupSeparators(text: string): string {
  // Replace multiple consecutive separator lines with a single one
  return text
    .replace(/(\n[-=]{3,}\n){2,}/g, '\n---\n')
    .replace(/^[-=]{3,}\n/gm, '---\n')
    .replace(/\n[-=]{3,}$/gm, '\n---');
}

/**
 * CRITICAL: Strip code blocks, Mermaid diagrams, and ASCII art from LLM responses.
 * LLMs often output diagrams as text which looks terrible in chat.
 * These should be handled by actual chart rendering, not displayed as text.
 */
function stripCodeBlocksAndDiagrams(text: string): string {
  let result = text;

  // Remove Mermaid diagrams (```mermaid ... ```)
  result = result.replace(/```mermaid[\s\S]*?```/gi, '[Chart visualization available]');

  // Remove graph/flowchart text definitions
  result = result.replace(/```graph[\s\S]*?```/gi, '');
  result = result.replace(/graph\s+(LR|TD|TB|RL|BT)\s+[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '');

  // Remove subgraph blocks
  result = result.replace(/subgraph[\s\S]*?end/gi, '');

  // Remove ASCII art charts/diagrams (lines with arrows, boxes)
  result = result.replace(/.*--+>.*\n?/g, '');
  result = result.replace(/\[[^\]]*\]\s*--+[>\-]/g, '');
  result = result.replace(/[A-Za-z]+\([^)]*\)\s*--+>\s*[A-Za-z_]+/g, '');

  // Remove large code blocks (more than 5 lines of code usually means diagram/chart)
  result = result.replace(/```[\s\S]{200,}?```/g, '');

  // Clean up multiple newlines
  result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return result.trim();
}

export default function MarkdownRenderer({
  content,
  stripEmojis: forceStripEmojis,
  className = ''
}: MarkdownRendererProps) {
  // Determine if we should strip emojis (Super Admin = professional, no emojis)
  const isSuperAdmin = getChatRoleFromPath() === 'super_admin';
  const shouldStripEmojis = forceStripEmojis ?? isSuperAdmin;

  // Process the content - order matters!
  // 1. First unescape HTML entities
  let processedContent = unescapeHtmlEntities(content);
  // 2. CRITICAL: Strip code blocks, Mermaid, diagrams BEFORE markdown processing
  processedContent = stripCodeBlocksAndDiagrams(processedContent);
  // 3. Normalize newlines and fix formatting
  processedContent = normalizeContent(processedContent);
  // 4. Clean up separators
  processedContent = cleanupSeparators(processedContent);
  // 5. Optionally strip emojis
  if (shouldStripEmojis) {
    processedContent = stripEmojisFromText(processedContent);
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Headings with proper sizing
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900 dark:text-gray-100 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-1 text-gray-900 dark:text-gray-100 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-2 mb-1 text-gray-800 dark:text-gray-200 first:mt-0">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),

          // Bold and italic
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800 dark:text-gray-200">{children}</li>
          ),

          // Code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto my-2" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-x-auto my-2">
              {children}
            </pre>
          ),

          // Tables - styled like ChatGPT/Claude
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-2 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
