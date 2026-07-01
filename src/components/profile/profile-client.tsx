"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { Camera, Pencil, MapPin, Tag } from "lucide-react";
import type { Profile } from "@/api";
import { updateProfileAction } from "@/lib/actions/settings";

interface ProfileClientProps {
  profile: Profile;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [state, action, isPending] = useActionState(updateProfileAction, {
    success: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close the editor once a successful submission lands. Done as a render-time
  // state adjustment (React's "storing info from previous renders" pattern)
  // rather than setState-in-effect.
  const [prevSuccess, setPrevSuccess] = useState(state.success);
  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setIsEditing(false);
  }

  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated successfully");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const initials = profile.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "U";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message || "Upload failed");
      }

      const data = (await res.json()) as { url: string };
      setAvatarUrl(data.url);
      toast.success("Photo selected. Save your profile to apply the change.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-xl px-4 py-8 md:py-12">
          <form action={action} className="space-y-8">
            {/* Hero */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt={profile.fullName || "Avatar"}
                  />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  id="avatarFile"
                  name="avatarFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
              ) : null}
              <input type="hidden" name="avatarUrl" value={avatarUrl} />

              {isEditing ? (
                <div className="w-full max-w-xs space-y-2">
                  <Input
                    name="fullName"
                    placeholder="Your name"
                    defaultValue={profile.fullName ?? ""}
                    required
                    minLength={2}
                    className="text-center font-semibold"
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-bold tracking-tight">
                    {profile.fullName || profile.username}
                  </h2>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
              )}

              {isEditing ? (
                <Textarea
                  name="bio"
                  placeholder="Tell us about yourself"
                  rows={3}
                  defaultValue={profile.bio ?? ""}
                  className="w-full max-w-md resize-none"
                />
              ) : profile.bio ? (
                <p className="text-sm text-foreground text-center max-w-md leading-relaxed">
                  {profile.bio}
                </p>
              ) : null}
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden divide-y divide-border/50">
              {/* Username */}
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="w-24 shrink-0 text-sm font-medium text-muted-foreground">
                  Username
                </span>
                {isEditing ? (
                  <Input
                    name="username"
                    defaultValue={profile.username ?? ""}
                    readOnly
                    className="bg-muted"
                  />
                ) : (
                  <span className="text-sm text-foreground">@{profile.username}</span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-2 w-24 shrink-0 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                {isEditing ? (
                  <Input
                    name="location"
                    placeholder="City, Country"
                    defaultValue={profile.location ?? ""}
                  />
                ) : (
                  <span className="text-sm text-foreground">
                    {profile.location || (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </span>
                )}
              </div>

              {/* Interests */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-2 w-24 shrink-0 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Interests
                </div>
                {isEditing ? (
                  <Input
                    name="interests"
                    placeholder="e.g. fitness, reading, coding"
                    defaultValue={(profile.interests ?? []).join(", ")}
                  />
                ) : (
                  <span className="text-sm text-foreground">
                    {(profile.interests ?? []).length > 0 ? (
                      <span className="inline-flex flex-wrap gap-1.5">
                        {(profile.interests ?? []).map((i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                          >
                            {i}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-destructive text-center">{state.error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarUrl(profile.avatarUrl ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
