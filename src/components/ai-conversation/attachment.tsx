'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { FileText, XIcon } from 'lucide-react';

import type { ChatAttachment } from '@/components/ai-coach/attachment-adapter';
import { useChatComposer } from '@/components/ai-conversation/chat-context';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function getAttachmentSource(attachment: ChatAttachment): string | undefined {
    return attachment.previewUrl;
}

const AttachmentImage: FC<{ source: string; className?: string; alt: string }> = ({
    source,
    className,
    alt,
}) => {
    return (
        <Image
            src={source}
            alt={alt}
            width={160}
            height={160}
            unoptimized
            className={cn('size-full object-cover', className)}
        />
    );
};

interface AttachmentTileProps {
    attachment: ChatAttachment;
    removable?: boolean;
    onRemove?: () => void;
}

const AttachmentTile: FC<AttachmentTileProps> = ({ attachment, removable, onRemove }) => {
    const source = getAttachmentSource(attachment);
    const isImage = attachment.type === 'image' && !!source;
    const tileClassName = cn(
        'size-14 overflow-hidden rounded-[14px] border border-border bg-muted transition-opacity',
        isImage && 'cursor-pointer hover:opacity-75',
        removable && 'size-16',
    );

    const tile = isImage ? (
        <button
            type="button"
            className={tileClassName}
            aria-label={`Preview ${attachment.name}`}
            title={attachment.name}
        >
            <AttachmentImage source={source} alt={`Preview of ${attachment.name}`} />
        </button>
    ) : (
        <div
            className={cn(
                tileClassName,
                'flex items-center justify-center p-2',
            )}
            title={attachment.name}
            aria-label={attachment.name}
        >
            <FileText className="size-7 text-muted-foreground" />
        </div>
    );

    return (
        <div className="relative shrink-0">
            {isImage ? (
                <Dialog>
                    <DialogTrigger asChild>{tile}</DialogTrigger>
                    <DialogContent
                        aria-describedby={undefined}
                        className="p-2 sm:max-w-3xl"
                    >
                        <DialogTitle className="sr-only">{attachment.name}</DialogTitle>
                        <div className="relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background">
                            <AttachmentImage
                                source={source}
                                alt={`Preview of ${attachment.name}`}
                                className="max-h-[78dvh] object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                tile
            )}
            {removable && onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-white text-black shadow-sm hover:text-destructive dark:bg-foreground dark:text-background"
                    aria-label={`Remove ${attachment.name}`}
                    title="Remove file"
                >
                    <XIcon className="size-3" />
                </button>
            )}
        </div>
    );
};

export const UserMessageAttachments: FC<{ attachments?: ChatAttachment[] }> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
            {attachments.map(attachment => (
                <AttachmentTile key={attachment.id} attachment={attachment} />
            ))}
        </div>
    );
};

export const ComposerAttachments: FC = () => {
    const { attachments, removeAttachment } = useChatComposer();
    if (attachments.length === 0) return null;

    return (
        <div className="aui-composer-attachments mb-2 flex w-full flex-row items-center gap-2 overflow-x-auto px-1.5 pt-0.5 pb-1">
            {attachments.map(attachment => (
                <AttachmentTile
                    key={attachment.id}
                    attachment={attachment}
                    removable
                    onRemove={() => removeAttachment(attachment.id)}
                />
            ))}
        </div>
    );
};
