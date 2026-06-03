"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import type { Profile } from "@/api";
import { updateProfileAction } from "@/app/actions/settings";

interface ProfileClientProps {
  profile: Profile;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [state, action, isPending] = useActionState(updateProfileAction, {
    success: false,
  });

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">
              Add details about yourself to personalize your experience.
            </p>
          </header>

          <form action={action}>
            <Card>
              <CardHeader>
                <CardTitle>Profile details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={profile.avatarUrl || undefined}
                        alt={profile.fullName || "Avatar"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid gap-1">
                      <label htmlFor="avatarUrl" className="text-sm font-medium">Avatar URL</label>
                      <Input
                        id="avatarUrl"
                        name="avatarUrl"
                        placeholder="https://..."
                        defaultValue={profile.avatarUrl ?? ""}
                      />
                      <p className="text-xs text-muted-foreground">Paste an image URL for your avatar.</p>
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="fullName" className="text-sm font-medium">Full name</label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Your name"
                      defaultValue={profile.fullName ?? ""}
                      required
                      minLength={2}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="username" className="text-sm font-medium">Username</label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="username"
                      defaultValue={profile.username ?? ""}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself (max 280 characters)"
                      rows={4}
                      defaultValue={profile.bio ?? ""}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1">
                      <label htmlFor="location" className="text-sm font-medium">Location</label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, Country"
                        defaultValue={profile.location ?? ""}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="website" className="text-sm font-medium">Website</label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="https://..."
                        defaultValue={profile.website ?? ""}
                      />
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="interests" className="text-sm font-medium">Interests</label>
                    <Input
                      id="interests"
                      name="interests"
                      placeholder="e.g. fitness, reading, coding"
                      defaultValue={(profile.interests ?? []).join(", ")}
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated list of interests.</p>
                  </div>

                  {state.error && (
                    <p className="text-sm text-destructive">{state.error}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Profile"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
