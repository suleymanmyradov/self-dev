/**
 * Attachment adapter for the AI coach composer. Restricts uploadable file
 * types to formats the coaching LLM can actually process — images (vision),
 * PDFs, and common text-based documents. This prevents users from attaching
 * binary files (e.g. .zip, .exe, .mp4) that the model cannot read.
 *
 * Uses assistant-ui's CompositeAttachmentAdapter to delegate to per-type
 * adapters: SimpleImageAttachmentAdapter for images, and a custom
 * DocumentAttachmentAdapter for PDF + text formats.
 */

import {
    CompositeAttachmentAdapter,
    SimpleImageAttachmentAdapter,
    type AttachmentAdapter,
    type CompleteAttachment,
    type PendingAttachment,
} from '@assistant-ui/react';

// Copied from assistant-ui's SimpleTextAttachmentAdapter — extended with PDF.
const DOCUMENT_ACCEPT =
    'text/plain,text/html,text/markdown,text/csv,text/xml,text/json,application/json,application/pdf,text/css,text/javascript,text/x-markdown';

class DocumentAttachmentAdapter implements AttachmentAdapter {
    accept = DOCUMENT_ACCEPT;

    async add(state: { file: File }): Promise<PendingAttachment> {
        return {
            id: crypto.randomUUID(),
            type: 'document',
            name: state.file.name,
            contentType: state.file.type,
            file: state.file,
            status: {
                type: 'requires-action',
                reason: 'composer-send',
            },
        };
    }

    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
        return {
            ...attachment,
            status: { type: 'complete' },
            content: [
                {
                    type: 'text',
                    text: await readFileAsText(attachment.file),
                },
            ],
        };
    }

    async remove(): Promise<void> {}
}

async function readFileAsText(file: File): Promise<string> {
    // PDFs are binary — we can't extract text client-side without a PDF
    // library. Send the filename so the model at least knows what was
    // attached; the backend can extract text server-side if needed.
    if (file.type === 'application/pdf') {
        return `[PDF document: ${file.name}]`;
    }
    return file.text();
}

export const coachAttachmentAdapter = new CompositeAttachmentAdapter([
    new SimpleImageAttachmentAdapter(),
    new DocumentAttachmentAdapter(),
]);
