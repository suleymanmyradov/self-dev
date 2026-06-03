import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, MessageSquare, Send } from "lucide-react";

export const metadata: Metadata = {
  title: 'Community | Growth',
  description: 'Join our community and connect with others on their growth journey.',
};

export default function CommunityPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Community</h1>
            <p className="text-sm text-muted-foreground">Join us and connect with others.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Join our communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg" className="justify-start">
                  <Link href="https://discord.com/invite/your-server" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-5 w-5" /> Join us on Discord
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="justify-start">
                  <Link href="https://x.com/your-handle" target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-5 w-5" /> Follow us on X
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="justify-start sm:col-span-2">
                  <Link href="https://t.me/your-channel" target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-5 w-5" /> Join our Telegram
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
