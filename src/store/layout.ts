import { create } from 'zustand';

type Store = {
    mini: boolean;
    expand: () => void;
};

export const useIsExpnaded = create<Store>()(set => ({
    mini: false,
    expand: () => set(state => ({ mini: !state.mini })),
}));
