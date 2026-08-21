// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mutations = vi.hoisted(() => ({
  createGoal: { mutate: vi.fn() },
  updateGoal: { mutate: vi.fn() },
  deleteGoal: { mutate: vi.fn() },
  createHabit: { mutate: vi.fn() },
  updateHabit: { mutate: vi.fn() },
  deleteHabit: { mutate: vi.fn() },
}));

vi.mock('@/hooks', () => ({
  useCreateGoal: () => mutations.createGoal,
  useUpdateGoal: () => mutations.updateGoal,
  useDeleteGoal: () => mutations.deleteGoal,
  useCreateHabit: () => mutations.createHabit,
  useUpdateHabit: () => mutations.updateHabit,
  useDeleteHabit: () => mutations.deleteHabit,
}));

const { ProposalCard } = await import('./proposal-card');

afterEach(() => vi.clearAllMocks());

describe('ProposalCard', () => {
  it('renders a summary and confirms a valid goal exactly once', async () => {
    mutations.createGoal.mutate.mockImplementation((_data, options) => options.onSuccess({ id: 'goal-1' }));
    render(
      <ProposalCard
        proposal={{
          id: 'proposal-1',
          action: 'create_goal',
          payload: { title: 'Read ten books', description: 'A steady practice', category: 'learning' },
        }}
      />,
    );

    expect(screen.getByText('Title: Read ten books')).toBeVisible();
    expect(screen.getByText('Category: learning')).toBeVisible();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /confirm/i })));
    await waitFor(() => expect(screen.getByText('Create Goal applied')).toBeVisible());
    expect(mutations.createGoal.mutate).toHaveBeenCalledTimes(1);
    expect(mutations.createGoal.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Read ten books', category: 'learning' }),
      expect.any(Object),
    );
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('blocks an invalid create proposal before mutation', async () => {
    render(
      <ProposalCard
        proposal={{ id: 'proposal-2', action: 'create_habit', payload: { name: '', description: '', category: '' } }}
      />,
    );

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /confirm/i })));
    expect(mutations.createHabit.mutate).not.toHaveBeenCalled();
    expect(screen.getByText(/required/i)).toBeVisible();
  });

  it('dismisses a cancelled proposal', async () => {
    render(
      <ProposalCard
        proposal={{
          id: 'proposal-cancel',
          action: 'create_goal',
          payload: { title: 'Read', description: '', category: 'learning' },
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByText('Title: Read')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('recovers from mutation failure and allows retry', async () => {
    let attempts = 0;
    mutations.deleteGoal.mutate.mockImplementation((_id, options) => {
      attempts += 1;
      if (attempts === 1) options.onError(new Error('Could not delete'));
      else options.onSuccess({});
    });
    render(
      <ProposalCard proposal={{ id: 'proposal-3', action: 'delete_goal', payload: { goalId: 'goal-9' } }} />,
    );

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /confirm/i })));
    await waitFor(() => expect(screen.getByText('Could not delete')).toBeVisible());
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /confirm/i })));
    await waitFor(() => expect(screen.getByText('Delete Goal applied')).toBeVisible());
    expect(mutations.deleteGoal.mutate).toHaveBeenCalledWith('goal-9', expect.any(Object));
  });
});
