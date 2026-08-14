'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Children, isValidElement, memo, useState, type FC, type ReactNode } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { cn } from '@/lib/utils';

interface MarkdownTextProps {
    text: string;
}

const MarkdownTextImpl: FC<MarkdownTextProps> = ({ text }) => {
    return (
        <div className="aui-md">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={defaultComponents}
                skipHtml
            >
                {text}
            </ReactMarkdown>
        </div>
    );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<{ language?: string; code: string }> = ({ language, code }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    return (
        <div className="aui-code-header-root mt-4 flex items-center justify-between gap-4 rounded-t-lg bg-muted-foreground/15 px-4 py-2 text-sm font-semibold text-foreground dark:bg-muted-foreground/20">
            <span className="aui-code-header-language lowercase [&>span]:text-xs">
                {language || 'code'}
            </span>
            <TooltipIconButton
                tooltip={isCopied ? 'Copied' : 'Copy'}
                onClick={() => copyToClipboard(code)}
            >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
            </TooltipIconButton>
        </div>
    );
};

function useCopyToClipboard({ copiedDuration = 3000 }: { copiedDuration?: number } = {}) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = (value: string) => {
        if (!value || !navigator.clipboard) return;
        void navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), copiedDuration);
        });
    };

    return { isCopied, copyToClipboard };
}

function getText(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getText).join('');
    if (isValidElement(node)) {
        const props = node.props as { children?: ReactNode };
        return getText(props.children);
    }
    return '';
}

function getCodeDetails(children: ReactNode): { language?: string; code: string } {
    const codeElement = Children.toArray(children).find(isValidElement);
    if (!codeElement) return { code: getText(children) };

    const props = codeElement.props as { className?: string; children?: ReactNode };
    const language = props.className?.match(/language-([^\s]+)/)?.[1];
    return { language, code: getText(props.children).replace(/\n$/, '') };
}

const defaultComponents: Components = {
    h1: ({ className, ...props }) => (
        <h1
            className={cn(
                'aui-md-h1 mb-6 scroll-m-20 text-3xl font-extrabold tracking-tight last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }) => (
        <h2
            className={cn(
                'aui-md-h2 mt-6 mb-3 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }) => (
        <h3
            className={cn(
                'aui-md-h3 mt-5 mb-3 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h4: ({ className, ...props }) => (
        <h4
            className={cn(
                'aui-md-h4 mt-5 mb-3 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h5: ({ className, ...props }) => (
        <h5
            className={cn('aui-md-h5 my-3 text-base font-semibold first:mt-0 last:mb-0', className)}
            {...props}
        />
    ),
    h6: ({ className, ...props }) => (
        <h6
            className={cn('aui-md-h6 my-3 text-sm font-semibold first:mt-0 last:mb-0', className)}
            {...props}
        />
    ),
    p: ({ className, ...props }) => (
        <p className={cn('aui-md-p mt-4 mb-4 leading-6 first:mt-0 last:mb-0', className)} {...props} />
    ),
    a: ({ href, className, ...props }) => {
        const isSafe =
            typeof href === 'string' &&
            (href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('/') ||
                href.startsWith('#'));
        return (
            <a
                href={isSafe ? href : '#'}
                rel="noopener noreferrer"
                target="_blank"
                className={cn('aui-md-a font-medium text-primary underline underline-offset-4', className)}
                {...props}
            />
        );
    },
    blockquote: ({ className, ...props }) => (
        <blockquote className={cn('aui-md-blockquote border-l-2 pl-6 italic', className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
        <ul className={cn('aui-md-ul my-4 ml-6 list-disc [&>li]:mt-1.5', className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
        <ol className={cn('aui-md-ol my-4 ml-6 list-decimal [&>li]:mt-1.5', className)} {...props} />
    ),
    hr: ({ className, ...props }) => (
        <hr className={cn('aui-md-hr my-4 border-b', className)} {...props} />
    ),
    table: ({ className, ...props }) => (
        <table
            className={cn(
                'aui-md-table my-4 w-full border-separate border-spacing-0 overflow-y-auto',
                className,
            )}
            {...props}
        />
    ),
    th: ({ className, ...props }) => (
        <th
            className={cn(
                'aui-md-th bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
                className,
            )}
            {...props}
        />
    ),
    td: ({ className, ...props }) => (
        <td
            className={cn(
                'aui-md-td border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
                className,
            )}
            {...props}
        />
    ),
    tr: ({ className, ...props }) => (
        <tr
            className={cn(
                'aui-md-tr m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
                className,
            )}
            {...props}
        />
    ),
    sup: ({ className, ...props }) => (
        <sup className={cn('aui-md-sup [&>a]:text-xs [&>a]:no-underline', className)} {...props} />
    ),
    pre: ({ className, children, ...props }) => {
        const { language, code } = getCodeDetails(children);
        return (
            <div className="aui-md-code-block">
                <CodeHeader language={language} code={code} />
                <pre
                    className={cn(
                        'aui-md-pre overflow-x-auto !rounded-t-none rounded-b-lg bg-black p-4 text-white',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </pre>
            </div>
        );
    },
    code: ({ className, children, ...props }) => {
        const isBlock = Boolean(className) || getText(children).includes('\n');
        return (
            <code
                className={cn(
                    !isBlock && 'aui-md-inline-code rounded border bg-muted font-semibold',
                    className,
                )}
                {...props}
            >
                {children}
            </code>
        );
    },
};
