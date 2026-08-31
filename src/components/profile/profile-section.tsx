"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, MapPin, Tag } from "lucide-react";
import type { Profile, Settings } from "@/api";

export function ProfileSection({
  profile,
  avatarUrl,
  initials,
  fileInputRef,
  onFileChange,
  uploading,
  profileAction,
  profilePending,
  profileError,
  profileSuccess,
  settings,
  onDeleteAccountClick,
}: {
  profile: Profile;
  avatarUrl: string;
  initials: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  profileAction: (formData: FormData) => void;
  profilePending: boolean;
  profileError?: string;
  profileSuccess?: boolean;
  settings: Settings | null;
  onDeleteAccountClick: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Close the editor once a successful submission lands. Done as a render-time
  // state adjustment (React's "storing info from previous renders" pattern)
  // rather than setState-in-effect.
  const [prevSuccess, setPrevSuccess] = useState(profileSuccess ?? false);
  if ((profileSuccess ?? false) !== prevSuccess) {
    setPrevSuccess(profileSuccess ?? false);
    if (profileSuccess) setIsEditing(false);
  }

  const interests = profile.interests ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Profile</h1>

      {/* Profile card */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-full bg-secondary">
              <AvatarImage src={avatarUrl || undefined} alt={profile.fullName || "Avatar"} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              id="avatarFile"
              name="avatarFile"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-foreground text-background p-1.5 disabled:opacity-50"
              aria-label="Change avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="font-medium text-sm">{profile.fullName || profile.username}</p>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        {isEditing ? (
          <form action={profileAction} className="space-y-5">
            <input type="hidden" name="avatarUrl" value={avatarUrl} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="fullName">Display name</label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.fullName ?? ""}
                  placeholder="Your name"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="username">Username</label>
                <Input
                  id="username"
                  value={profile.username ?? ""}
                  disabled
                  className="text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="bio">One line about what you&apos;re working on</label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="e.g. Building a consistent study habit for my exams"
                rows={2}
                defaultValue={profile.bio ?? ""}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="location">Location</label>
              <Input
                id="location"
                name="location"
                placeholder="City, Country"
                defaultValue={profile.location ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="interests">Interests</label>
              <Input
                id="interests"
                name="interests"
                placeholder="e.g. fitness, reading, coding"
                defaultValue={interests.join(", ")}
              />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
            </div>

            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={profilePending}
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={profilePending}>
                {profilePending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Bio */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">About</p>
              <p className="text-sm">
                {profile.bio || <span className="text-muted-foreground">Not set</span>}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm">
                {profile.location || <span className="text-muted-foreground">Not set</span>}
              </p>
            </div>

            {/* Interests */}
            <div className="flex items-start gap-2.5">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not set</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit profile
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          className="hover:text-foreground transition-colors"
          type="button"
          onClick={() => {
            const event = new CustomEvent("profile:navigate", { detail: "data" });
            window.dispatchEvent(event);
          }}
        >
          Export everything
        </button>
        <span>·</span>
        <button
          className="hover:text-foreground transition-colors text-destructive"
          type="button"
          onClick={onDeleteAccountClick}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
