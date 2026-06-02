"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProfile } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import type { Profile, UpdateProfileRequest } from "@/api";
import { updateProfile } from "@/api";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileClientProps {
  initialProfile?: Profile;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error: profileError } = useProfile(initialProfile);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const interestsRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync refs when profile loads
  useEffect(() => {
    if (profile) {
      if (fullNameRef.current) fullNameRef.current.value = profile.fullName ?? "";
      if (usernameRef.current) usernameRef.current.value = profile.username ?? "";
      if (bioRef.current) bioRef.current.value = profile.bio ?? "";
      if (locationRef.current) locationRef.current.value = profile.location ?? "";
      if (websiteRef.current) websiteRef.current.value = profile.website ?? "";
      if (interestsRef.current) interestsRef.current.value = (profile.interests ?? []).join(", ");
      if (avatarUrlRef.current) avatarUrlRef.current.value = profile.avatarUrl ?? "";
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profileError) {
      toast.error("Failed to load profile");
    }
  }, [profileError]);

  const initials = useMemo(() => {
    const fullName = fullNameRef.current?.value ?? "";
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
  }, [profile?.id]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    const payload: UpdateProfileRequest = {
      fullName: (fullNameRef.current?.value ?? "").trim(),
      bio: (bioRef.current?.value ?? "").trim(),
      location: (locationRef.current?.value ?? "").trim(),
      website: (websiteRef.current?.value ?? "").trim(),
      interests: (interestsRef.current?.value ?? "").split(",").map((v) => v.trim()).filter(Boolean),
      avatarUrl: (avatarUrlRef.current?.value ?? "").trim(),
    };

    if (!payload.fullName || payload.fullName.length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 flex-1" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Failed to load profile.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">{profile ? "Edit Profile" : "Create Profile"}</h1>
            <p className="text-sm text-muted-foreground">
              Add details about yourself to personalize your experience.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={avatarUrlRef.current?.value || undefined}
                      alt={fullNameRef.current?.value || "Avatar"}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid gap-1">
                    <label className="text-sm font-medium">Avatar URL</label>
                    <Input
                      ref={avatarUrlRef}
                      placeholder="https://..."
                      defaultValue={profile?.avatarUrl ?? ""}
                    />
                    <p className="text-xs text-muted-foreground">Paste an image URL for your avatar.</p>
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    ref={fullNameRef}
                    placeholder="Your name"
                    defaultValue={profile?.fullName ?? ""}
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    ref={usernameRef}
                    placeholder="username"
                    defaultValue={profile?.username ?? ""}
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    ref={bioRef}
                    placeholder="Tell us about yourself (max 280 characters)"
                    rows={4}
                    defaultValue={profile?.bio ?? ""}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      ref={locationRef}
                      placeholder="City, Country"
                      defaultValue={profile?.location ?? ""}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      ref={websiteRef}
                      placeholder="https://..."
                      defaultValue={profile?.website ?? ""}
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Interests</label>
                  <Input
                    ref={interestsRef}
                    placeholder="e.g. fitness, reading, coding"
                    defaultValue={(profile?.interests ?? []).join(", ")}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated list of interests.</p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
