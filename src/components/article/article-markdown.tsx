"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo, useState } from "react";
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
    <div className="my-5 overflow-hidden rounded-lg border border-border/60">
      <div className="flex items-center justify-between bg-muted-foreground/15 px-4 py-2 text-sm font-semibold text-foreground dark:bg-muted-foreground/20">
        <span className="lowercase text-xs">{language ?? "code"}</span>
        <button
          type="button"
          onClick={() => copyToClipboard(code)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy code"
        >
          {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto bg-black p-4 text-sm leading-relaxed text-white">
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
        "mb-8 mt-10 scroll-m-20 text-3xl font-extrabold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-10 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-8 mb-4 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mt-6 mb-4 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn("my-4 text-base font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6 className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("mt-5 mb-5 leading-7 first:mt-0 last:mb-0", className)}
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
          "font-medium text-primary underline underline-offset-4",
          className,
        )}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-5 border-l-2 border-primary/40 pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-5 ml-6 list-disc space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-5 ml-6 list-decimal space-y-2", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
  hr: ({ className, ...props }) => (
    <hr className={cn("my-8 border-b border-border", className)} {...props} />
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
        "bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l border-border px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
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
      className={cn("my-6 h-auto w-full rounded-lg border border-border/40", className)}
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
          "rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-semibold",
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
    <div className="text-[15px] text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const ArticleMarkdown = memo(ArticleMarkdownImpl);
