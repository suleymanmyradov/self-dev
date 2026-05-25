import { useState, useEffect, useRef } from 'react';
import { getCoachingProfile, updateCoachingProfilePreferences } from '../api';
import type {
  CoachingProfile,
  UpdateCoachingProfilePreferencesRequest,
} from '../api';

export function useCoachingProfile() {
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadProfile = async () => {
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
        setError(err instanceof Error ? err.message : 'Failed to load coaching profile');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePreferences = async (data: UpdateCoachingProfilePreferencesRequest) => {
    try {
      setLoading(true);
      setError(null);
      const profile = await updateCoachingProfilePreferences(data);
      setProfile(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coaching profile');
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