"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/api";
import type { Profile, UpdateProfileRequest } from "@/api";
import { useProfile } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";

const ProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_\.\-]+$/i, "Letters, numbers, dot, hyphen, underscore only"),
  bio: z.string().max(280, "Max 280 characters").optional().default(""),
  location: z.string().max(60).optional().default(""),
  website: z
    .string()
    .url("Must be a valid URL")
    .or(z.string().length(0))
    .optional()
    .default(""),
  interests: z
    .string()
    .optional()
    .default("")
    .transform((s) => s?.split(",").map((v) => v.trim()).filter(Boolean) ?? []),
  avatarUrl: z
    .string()
    .url("Must be a valid image URL")
    .or(z.string().length(0))
    .optional()
    .default(""),
});

type FormState = {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  interests: string;
  avatarUrl: string;
};

interface ProfileClientProps {
  initialProfile?: Profile;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error: profileError } = useProfile(initialProfile);
  const [form, setForm] = useState<FormState>({
    fullName: initialProfile?.fullName ?? "",
    username: initialProfile?.username ?? "",
    bio: initialProfile?.bio ?? "",
    location: initialProfile?.location ?? "",
    website: initialProfile?.website ?? "",
    interests: (initialProfile?.interests ?? []).join(", "),
    avatarUrl: initialProfile?.avatarUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Only sync form from fetched profile when it differs from initial to avoid loops
  useEffect(() => {
    if (profile && profile.id !== initialProfile?.id) {
      setForm({
        fullName: profile.fullName ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
        interests: (profile.interests ?? []).join(", "),
        avatarUrl: profile.avatarUrl ?? "",
      });
    }
  }, [profile, initialProfile?.id]);

  useEffect(() => {
    if (profileError) {
      toast.error("Failed to load profile");
    }
  }, [profileError]);

  const initials = useMemo(() => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
  }, [form.fullName]);

  const handleChange = useCallback((field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  }, [error]);

  const handleSubmit = async () => {
    setError(null);
    const parsed = ProfileSchema.safeParse({
      ...form,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    const data = parsed.data;
    const payload: UpdateProfileRequest = {
      fullName: data.fullName.trim(),
      bio: (form.bio || "").trim(),
      location: (form.location || "").trim(),
      website: (form.website || "").trim(),
      interests: data.interests as string[],
      avatarUrl: (form.avatarUrl || "").trim(),
    };

    try {
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Loading profile...
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
                    <AvatarImage src={form.avatarUrl || undefined} alt={form.fullName || "Avatar"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid gap-1">
                    <label className="text-sm font-medium">Avatar URL</label>
                    <Input
                      placeholder="https://..."
                      value={form.avatarUrl}
                      onChange={handleChange("avatarUrl")}
                    />
                    <p className="text-xs text-muted-foreground">Paste an image URL for your avatar.</p>
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    placeholder="Your name"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    placeholder="username"
                    value={form.username}
                    onChange={handleChange("username")}
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself (max 280 characters)"
                    rows={4}
                    value={form.bio}
                    onChange={handleChange("bio")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="City, Country"
                      value={form.location}
                      onChange={handleChange("location")}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      placeholder="https://example.com"
                      value={form.website}
                      onChange={handleChange("website")}
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Interests</label>
                  <Input
                    placeholder="e.g., productivity, health, mindfulness"
                    value={form.interests}
                    onChange={handleChange("interests")}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated list.</p>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {profile ? "Your profile is synced with the server." : "Create your profile to personalize the app."}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
