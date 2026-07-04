"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingInvitations,
  respondToInvitation,
  type PendingInvitation,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    getPendingInvitations()
      .then(setInvitations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleRespond(id: string, action: "accept" | "decline") {
    setResponding(id);
    try {
      await respondToInvitation(id, action);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success(
        action === "accept" ? "Invitation accepted" : "Invitation declined"
      );
      if (action === "accept") {
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setResponding(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Invitations</h1>
        <p className="text-muted-foreground">No pending invitations.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Invitations</h1>
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardHeader>
              <CardTitle>{invitation.project_name}</CardTitle>
              <CardDescription>
                You&apos;ve been invited to join this project
              </CardDescription>
            </CardHeader>
            <CardFooter className="gap-2">
              <Button
                onClick={() => handleRespond(invitation.id, "accept")}
                disabled={responding === invitation.id}
              >
                {responding === invitation.id ? "Accepting..." : "Accept"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRespond(invitation.id, "decline")}
                disabled={responding === invitation.id}
              >
                Decline
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
