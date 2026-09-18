import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="mt-8 max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 text-sm">
        <p>
          <strong>Email:</strong> {session!.user.email}
        </p>
        <p>
          <strong>Role:</strong> {session!.user.role}
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
