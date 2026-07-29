"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";
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
  settings,
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
  settings: Settings | null;
}) {
  const timezones = Intl.supportedValuesOf("timeZone");

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
              <label className="text-sm font-medium">Time zone</label>
              <Select name="timezone" defaultValue={settings?.timezone || undefined}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {profileError && (
            <p className="text-sm text-destructive">{profileError}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer links */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button className="hover:text-foreground transition-colors" type="button">
          Export everything
        </button>
        <span>·</span>
        <button className="hover:text-foreground transition-colors" type="button">
          Delete account
        </button>
      </div>
    </div>
  );
}
