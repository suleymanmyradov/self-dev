'use client';

import { create } from 'zustand';

interface BillingUIState {
  upgradePromptOpen: boolean;
  upgradeSurface: string;
  upgradeTrigger: string;
  showUpgradePrompt: (surface: string, trigger: string) => void;
  dismissUpgradePrompt: () => void;
  // Fake door / pricing dialog
  fakeDoorOpen: boolean;
  fakeDoorBillingInterval: 'monthly' | 'annual';
  openFakeDoor: (billingInterval?: 'monthly' | 'annual') => void;
  closeFakeDoor: () => void;
}

export const useBillingUIStore = create<BillingUIState>((set) => ({
  upgradePromptOpen: false,
  upgradeSurface: '',
  upgradeTrigger: '',
  fakeDoorOpen: false,
  fakeDoorBillingInterval: 'annual',
  showUpgradePrompt: (surface, trigger) =>
    set({ upgradePromptOpen: true, upgradeSurface: surface, upgradeTrigger: trigger }),
  dismissUpgradePrompt: () =>
    set({ upgradePromptOpen: false, upgradeSurface: '', upgradeTrigger: '' }),
  openFakeDoor: (billingInterval = 'annual') =>
    set({ fakeDoorOpen: true, fakeDoorBillingInterval: billingInterval }),
  closeFakeDoor: () => set({ fakeDoorOpen: false }),
}));
