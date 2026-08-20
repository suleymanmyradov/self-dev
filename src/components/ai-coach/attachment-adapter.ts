import type { StreamAttachment } from '@/api/types';

/**
 * Attachment helpers for the AI coach composer. Restricts uploadable file
 * types to formats the coaching LLM can actually process — images (vision),
 * PDFs, and common text-based documents. This prevents users from attaching
 * binary files (e.g. .zip, .exe, .mp4) that the model cannot read.
 */

export interface ChatAttachment {
    id: string;
    file: File;
    type: 'image' | 'document';
    name: string;
    contentType: string;
    previewUrl?: string;
}

export const IMAGE_ACCEPT =
    'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml';

export const DOCUMENT_ACCEPT =
    'text/plain,text/html,text/markdown,text/csv,text/xml,text/json,application/json,application/pdf,text/css,text/javascript,text/x-markdown';

export const ATTACHMENT_ACCEPT = `${IMAGE_ACCEPT},${DOCUMENT_ACCEPT}`;

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
const DOCUMENT_EXTENSIONS = new Set([
    'txt',
    'md',
    'markdown',
    'csv',
    'json',
    'html',
    'xml',
    'pdf',
    'css',
    'js',
]);

function extensionOf(name: string): string {
    return name.split('.').pop()?.toLowerCase() ?? '';
}

export function classifyAttachment(file: File): 'image' | 'document' | null {
    if (file.type.startsWith('image/')) return 'image';
    if (IMAGE_ACCEPT.split(',').includes(file.type)) return 'image';
    if (DOCUMENT_ACCEPT.split(',').includes(file.type)) return 'document';

    const ext = extensionOf(file.name);
    if (IMAGE_EXTENSIONS.has(ext)) return 'image';
    if (DOCUMENT_EXTENSIONS.has(ext)) return 'document';
    return null;
}

export function createAttachment(file: File): ChatAttachment | null {
    const type = classifyAttachment(file);
    if (!type) return null;
    return {
        id: crypto.randomUUID(),
        file,
        type,
        name: file.name,
        contentType: file.type,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
    };
}

export async function readAttachmentText(file: File): Promise<string> {
    // PDFs are binary — we can't extract text client-side without a PDF
    // library. Send the filename so the model at least knows what was
    // attached; the backend can extract text server-side if needed.
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        return `[PDF document: ${file.name}]`;
    }
    if (file.type.startsWith('image/') || classifyAttachment(file) === 'image') {
        return '';
    }
    return file.text();
}

export function isPDF(attachment: ChatAttachment): boolean {
    return attachment.contentType === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');
}

export async function readAttachmentBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const idx = result.indexOf(',');
            resolve(idx >= 0 ? result.slice(idx + 1) : result);
        };
        reader.onerror = () => reject(new Error('Failed to read attachment'));
        reader.readAsDataURL(file);
    });
}

export async function prepareAttachmentForApi(attachment: ChatAttachment): Promise<StreamAttachment | null> {
    if (attachment.type === 'image' || isPDF(attachment)) {
        const data = await readAttachmentBase64(attachment.file);
        return {
            attachmentType: isPDF(attachment) ? 'document' : 'image',
            name: attachment.name,
            contentType: attachment.contentType,
            data,
        };
    }
    return null;
}

export function revokeAttachmentPreview(attachment: ChatAttachment) {
    if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
    }
}
