/**
 * MarkdownRenderer.tsx
 *
 * Premium Markdown rendering for chat messages — ChatGPT/Claude quality.
 * Supports:
 * - GFM (GitHub Flavored Markdown) tables
 * - Code blocks with syntax highlighting
 * - Headings with accent borders & proper hierarchy
 * - Bold keywords with subtle highlight badges
 * - Proper paragraph spacing with section dividers
 * - Blockquotes with gradient accent bars
 * - Emoji stripping for Super Admin (professional output)
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
 * - Add section dividers (---) between major content blocks
 */
function normalizeContent(text: string): string {
  let result = text;

  // Convert literal \n (escaped newlines from JSON) to actual newlines
  result = result.replace(/\\n/g, '\n');

  // Convert literal \r\n to newlines
  result = result.replace(/\\r\\n/g, '\n');
  result = result.replace(/\\r/g, '\n');

  // FIX: Convert "* " at start of lines to "- " for reliable markdown lists
  result = result.replace(/^(\s*)\* /gm, '$1- ');

  // FIX: Convert "• " bullet characters to "- " for standard markdown lists
  result = result.replace(/^(\s*)• /gm, '$1- ');

  // FIX: Ensure double newline before headings (### needs blank line above)
  result = result.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');

  // FIX: Ensure double newline before list blocks
  result = result.replace(/([^\n-])\n(\s*- )/g, '$1\n\n$2');

  // Ensure headings have newlines before them
  result = result.replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2');

  // Ensure bullet points at start work
  result = result.replace(/([^\n])(\s*\*\s+[A-Z])/g, '$1\n$2');

  // Ensure numbered lists have newlines
  result = result.replace(/([^\n])(\s*\d+\.\s+)/g, '$1\n$2');

  // Ensure --- separators are on their own lines with proper spacing
  result = result.replace(/([^\n])(---)/g, '$1\n\n$2');
  result = result.replace(/(---)([^\n])/g, '$1\n\n$2');

  // Add a --- divider before ## and ### headings (section separators) if not already present
  // This gives the "premium" feel of clear section breaks
  result = result.replace(/\n\n(#{2,3}\s)/g, '\n\n---\n\n$1');

  // FIX: Ensure tables have blank lines around them
  result = result.replace(/([^\n])(\n\|)/g, '$1\n\n|');
  result = result.replace(/(\|\n)([^\n|])/g, '$1\n$2');

  // Clean up excessive newlines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  // Don't start with a divider
  result = result.replace(/^---\n\n/, '');

  return result.trim();
}

/**
 * Remove emojis from text for professional output
 */
function stripEmojisFromText(text: string): string {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{E0000}-\u{E007F}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{200D}]|[\u{20E3}]|[\u{FE0F}]/gu;

  return text.replace(emojiRegex, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Clean up excessive separators (multiple --- or ===) into single hr
 */
function cleanupSeparators(text: string): string {
  return text
    .replace(/(\n---\n){2,}/g, '\n---\n')
    .replace(/(\n[-=]{3,}\n){2,}/g, '\n---\n')
    .replace(/^[-=]{3,}\n/gm, '---\n')
    .replace(/\n[-=]{3,}$/gm, '\n---');
}

/**
 * Strip code blocks, Mermaid diagrams, and ASCII art from LLM responses.
 */
function stripCodeBlocksAndDiagrams(text: string): string {
  let result = text;

  result = result.replace(/```mermaid[\s\S]*?```/gi, '[Chart visualization available]');
  result = result.replace(/```graph[\s\S]*?```/gi, '');
  result = result.replace(/graph\s+(LR|TD|TB|RL|BT)\s+[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '');
  result = result.replace(/subgraph[\s\S]*?end/gi, '');
  result = result.replace(/.*--+>.*\n?/g, '');
  result = result.replace(/\[[^\]]*\]\s*--+[>\-]/g, '');
  result = result.replace(/[A-Za-z]+\([^)]*\)\s*--+>\s*[A-Za-z_]+/g, '');
  result = result.replace(/```[\s\S]{200,}?```/g, '');
  result = result.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return result.trim();
}

export default function MarkdownRenderer({
  content,
  stripEmojis: forceStripEmojis,
  className = ''
}: MarkdownRendererProps) {
  const isSuperAdmin = getChatRoleFromPath() === 'super_admin';
  const shouldStripEmojis = forceStripEmojis ?? isSuperAdmin;

  // Process the content - order matters!
  let processedContent = unescapeHtmlEntities(content);
  processedContent = stripCodeBlocksAndDiagrams(processedContent);
  processedContent = normalizeContent(processedContent);
  processedContent = cleanupSeparators(processedContent);
  if (shouldStripEmojis) {
    processedContent = stripEmojisFromText(processedContent);
  }

  return (
    <div className={`md-chat-premium ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* ── Headings with accent bar ── */
          h1: ({ children }) => (
            <h1 className="md-h1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="md-h2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="md-h3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="md-h4">{children}</h4>
          ),

          /* ── Paragraphs with proper spacing ── */
          p: ({ children }) => (
            <p className="md-p">{children}</p>
          ),

          /* ── Bold = highlighted keyword badge ── */
          strong: ({ children }) => (
            <strong className="md-strong">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="md-em">{children}</em>
          ),

          /* ── Lists with custom bullets ── */
          ul: ({ children }) => (
            <ul className="md-ul">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="md-ol">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="md-li">{children}</li>
          ),

          /* ── Code ── */
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="md-code-inline" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="md-code-block" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="md-pre">{children}</pre>
          ),

          /* ── Tables — ChatGPT / Claude style ── */
          table: ({ children }) => (
            <div className="md-table-wrap">
              <table className="md-table">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="md-thead">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="md-tbody">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="md-tr">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="md-th">{children}</th>
          ),
          td: ({ children }) => (
            <td className="md-td">{children}</td>
          ),

          /* ── Blockquotes with gradient accent ── */
          blockquote: ({ children }) => (
            <blockquote className="md-blockquote">{children}</blockquote>
          ),

          /* ── Horizontal rule = premium section divider ── */
          hr: () => (
            <div className="md-hr" />
          ),

          /* ── Links ── */
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="md-link"
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
