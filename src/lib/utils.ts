import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Capitalize the first letter of a string. Used for error messages that arrive
 * from the backend lowercase (gRPC status messages are lowercase by convention).
 * Returns '' for null/undefined; leaves an already-capitalized string unchanged.
 */
export function capitalizeFirst(str: string | null | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
