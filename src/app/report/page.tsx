"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { submitReport } from "@/api";
import type { ReportType } from "@/api";

const categoryMap: Record<string, ReportType> = {
  Bug: "bug",
  "Abuse / Spam": "abuse",
  "Content issue": "abuse",
  Feedback: "feedback",
  Other: "feedback",
};

const categories = ["Bug", "Abuse / Spam", "Content issue", "Feedback", "Other"] as const;
type Category = typeof categories[number];

export default function ReportPage() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("Bug");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = subject.trim().length > 2 && details.trim().length > 10;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await submitReport({
        type: categoryMap[category],
        title: subject.trim(),
        description: details.trim(),
        email: email.trim() || undefined,
      });
      setSubmitted(true);
      setSubject("");
      setDetails("");
      setEmail("");
      toast.success("Report submitted successfully");
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Report</h1>
            <p className="text-sm text-muted-foreground">Report a problem or share feedback.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Tell us what happened</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Category</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {category}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {categories.map((c) => (
                      <DropdownMenuItem key={c} onClick={() => setCategory(c)}>
                        {c}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Brief summary" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Details</label>
                <Textarea
                  placeholder="Describe the issue in detail (steps to reproduce, expected vs actual, etc.)"
                  rows={6}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Email (optional)</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <p className="text-xs text-muted-foreground">We may contact you for more info.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-xs text-muted-foreground">
                {submitted ? "Thanks for your report!" : "We appreciate your help improving the app."}
              </div>
              <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
