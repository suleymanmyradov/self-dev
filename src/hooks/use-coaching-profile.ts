import { useState, useEffect, useRef, useCallback } from 'react';
import { getCoachingProfile, updateCoachingProfilePreferences } from '../api';
import type {
  CoachingProfile,
  UpdateCoachingProfilePreferencesRequest,
} from '../api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

export function useCoachingProfile() {
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadProfile = useCallback(async () => {
    try {
      if (!isMounted.current) return;
      setLoading(true);
      setError(null);
      const profile = await getCoachingProfile();
      if (isMounted.current) {
        setProfile(profile);
      }
    } catch (err) {
      if (isMounted.current) {
        const message = err instanceof ApiError ? err.message : 'Failed to load coaching profile';
        setError(message);
        toast.error(message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadProfile();
    return () => {
      isMounted.current = false;
    };
  }, [loadProfile]);

  const updatePreferences = async (data: UpdateCoachingProfilePreferencesRequest) => {
    try {
      setLoading(true);
      setError(null);
      const profile = await updateCoachingProfilePreferences(data);
      setProfile(profile);
      toast.success('Coaching preferences updated');
      return profile;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update coaching profile';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updatePreferences,
    refresh: loadProfile,
  };
}
