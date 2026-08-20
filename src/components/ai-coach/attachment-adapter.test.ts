// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  classifyAttachment,
  createAttachment,
  isPDF,
  prepareAttachmentForApi,
  readAttachmentBase64,
  readAttachmentText,
  revokeAttachmentPreview,
} from './attachment-adapter';

afterEach(() => vi.restoreAllMocks());

describe('attachment adapter classification', () => {
  it.each([
    ['image/png', 'photo.bin', 'image'],
    ['', 'PHOTO.JPEG', 'image'],
    ['application/pdf', 'notes.bin', 'document'],
    ['', 'notes.MD', 'document'],
    ['application/octet-stream', 'archive.zip', null],
    ['', 'recording.mp4', null],
  ] as const)('classifies %s %s as %s', (mime, name, expected) => {
    expect(classifyAttachment(new File(['fixture'], name, { type: mime }))).toBe(expected);
  });

  it('creates and revokes an image preview exactly once', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:image');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const attachment = createAttachment(new File(['png'], 'plan.png', { type: 'image/png' }));

    expect(attachment).toMatchObject({ type: 'image', name: 'plan.png', previewUrl: 'blob:image' });
    revokeAttachmentPreview(attachment!);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image');
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});

describe('attachment adapter payloads', () => {
  it('embeds text documents in prompt text and leaves images empty', async () => {
    const text = new File(['distinctive phrase'], 'context.txt', { type: 'text/plain' });
    const image = new File(['pixels'], 'context.png', { type: 'image/png' });

    await expect(readAttachmentText(text)).resolves.toBe('distinctive phrase');
    await expect(readAttachmentText(image)).resolves.toBe('');
  });

  it('represents PDFs and images as base64 multimodal attachments', async () => {
    const pdf = createAttachment(new File(['pdf-bytes'], 'brief.pdf', { type: 'application/pdf' }))!;
    const image = createAttachment(new File(['image-bytes'], 'brief.png', { type: 'image/png' }))!;
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader, file: Blob) {
      Object.defineProperty(this, 'result', { value: `data:${file.type};base64,Zml4dHVyZQ==` });
      this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
    });

    expect(isPDF(pdf)).toBe(true);
    await expect(prepareAttachmentForApi(pdf)).resolves.toMatchObject({
      attachmentType: 'document',
      name: 'brief.pdf',
      contentType: 'application/pdf',
      data: 'Zml4dHVyZQ==',
    });
    await expect(prepareAttachmentForApi(image)).resolves.toMatchObject({
      attachmentType: 'image',
      name: 'brief.png',
      contentType: 'image/png',
      data: 'Zml4dHVyZQ==',
    });
  });

  it('does not create a separate multimodal payload for ordinary text', async () => {
    const attachment = createAttachment(new File(['hello'], 'hello.txt', { type: 'text/plain' }))!;
    await expect(prepareAttachmentForApi(attachment)).resolves.toBeNull();
  });

  it('propagates FileReader failures', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
    });
    const attachment = createAttachment(new File(['bytes'], 'brief.pdf', { type: 'application/pdf' }))!;
    await expect(readAttachmentBase64(attachment.file)).rejects.toThrow('Failed to read attachment');
  });
});
