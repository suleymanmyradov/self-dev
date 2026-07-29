"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo, useState, useEffect } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// Copy hook
// =============================================================================

function useCopyToClipboard({ copiedDuration = 3000 } = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const copyToClipboard = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };
  return { isCopied, copyToClipboard };
}

// =============================================================================
// Code block with copy button
// =============================================================================

function CodeBlock({
  className,
  language,
  children,
}: {
  className?: string;
  language?: string;
  children: React.ReactNode;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const code = typeof children === "string" ? children : extractText(children);

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
        <span className="lowercase text-xs font-mono">{language ?? "code"}</span>
        <button
          type="button"
          onClick={() => copyToClipboard(code)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy code"
        >
          {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto bg-foreground/5 dark:bg-foreground/10 p-4 text-sm leading-relaxed text-foreground">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as React.ReactElement<{ children?: React.ReactNode }>).props;
    return extractText(props?.children);
  }
  return "";
}

// =============================================================================
// Component overrides
// =============================================================================

const components: Components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "font-display text-4xl leading-[1.14] tracking-tight mt-10 mb-6 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "font-display text-3xl leading-[1.25] mt-10 mb-4 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "font-display text-2xl leading-[1.3] mt-9 mb-3 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "font-display text-xl leading-[1.35] mt-7 mb-3 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn("font-display text-lg leading-snug my-4 first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6 className={cn("font-display text-base font-medium my-4 first:mt-0 last:mb-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("text-[17px] leading-[1.72] mt-5 mb-5 text-foreground first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  a: ({ href, className, ...props }) => {
    const isSafe =
      typeof href === "string" &&
      (href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("/") ||
        href.startsWith("#"));
    return (
      <a
        href={isSafe ? href : "#"}
        rel="noopener noreferrer"
        target="_blank"
        className={cn(
          "text-success underline underline-offset-[3px] font-medium",
          className,
        )}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-l-2 border-success pl-6 my-7 first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("pl-6 text-[17px] leading-[1.72] space-y-2 my-5 list-disc first:mt-0 last:mb-0", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("pl-6 text-[17px] leading-[1.72] space-y-2 my-5 list-decimal first:mt-0 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("text-[17px] leading-[1.72]", className)} {...props} />,
  hr: ({ className, ...props }) => (
    <hr className={cn("border-border my-9 first:mt-0 last:mb-0", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="my-5 w-full overflow-x-auto">
      <table
        className={cn("w-full border-separate border-spacing-0 text-sm", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-secondary px-4 py-2 text-left font-bold border-border first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l border-border px-4 py-2 text-left font-mono last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "m-0 border-b border-border p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  ),
  img: ({ alt, src, className, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      src={typeof src === "string" ? src : undefined}
      className={cn("my-6 h-auto w-full rounded-xl border border-border", className)}
      loading="lazy"
      {...props}
    />
  ),
  pre: ({ children }) => {
    // react-markdown wraps block code as <pre><code class="language-xxx">...</code></pre>.
    // Extract the inner code element to render our custom CodeBlock.
    const codeEl = Array.isArray(children) ? children[0] : children;
    const codeProps =
      codeEl && typeof codeEl === "object" && "props" in codeEl
        ? ((codeEl as React.ReactElement<{ className?: string; children?: React.ReactNode }>).props)
        : null;
    const codeClassName: string = codeProps?.className ?? "";
    const match = /language-(\w+)/.exec(codeClassName);
    const language = match?.[1];
    const rawCode = extractText(codeProps?.children);

    return (
      <CodeBlock className={codeClassName} language={language}>
        {rawCode}
      </CodeBlock>
    );
  },
  code: function Code({ className, children, ...props }) {
    // Inline code only — block code is handled by `pre` above.
    return (
      <code
        className={cn(
          "font-mono text-[0.85em] bg-muted px-1.5 py-0.5 rounded border border-border",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
};

// =============================================================================
// Main component
// =============================================================================

function ArticleMarkdownImpl({ content }: { content: string }) {
  return (
    <div className="text-[17px] leading-[1.72] text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const ArticleMarkdown = memo(ArticleMarkdownImpl);

// =============================================================================
// Reading progress bar — 2px sage bar tracking scroll position
// =============================================================================

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Use requestAnimationFrame to defer the initial measurement so setState
    // is not called synchronously within the effect body.
    const raf = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-border">
      <div
        className="h-full bg-success transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
