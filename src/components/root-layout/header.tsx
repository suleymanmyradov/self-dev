'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchHeader() {
    return (
        <header className="h-12 bg-white border-b border-gray-200 px-6 flex items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="search"
                    placeholder="Search posts, chats, habits..."
                    className="pl-10 bg-gray-50 border-gray-200"
                />
            </div>
        </header>
    );
}
