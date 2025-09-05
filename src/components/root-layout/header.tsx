'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchHeader() {
    return (
        <header className="h-12 border-b px-6 flex items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                <Input
                    type="search"
                    placeholder="Search posts, chats, habits..."
                    className="pl-10"
                />
            </div>
        </header>
    );
}
