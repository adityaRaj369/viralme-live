import { auth } from "@/lib/auth";
import { getProfileForUser } from "@/modules/profiles/service";
import { ProfileEditForm } from "@/features/dashboard/profile-edit-form";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await auth();
  const profile = await safeDb(() => getProfileForUser(session!.user.id), null);

  if (!profile) {
    const username = session!.user.email?.split("@")[0] ?? "demo";
    return (
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft p-5 text-sm">
          <p className="font-semibold text-accent">Demo profile</p>
          <p className="mt-1 text-muted">
            Signed in as {session!.user.email}. Connect Postgres and seed to persist a real profile.
          </p>
          <dl className="mt-4 grid gap-2 text-foreground">
            <div>
              <dt className="text-muted">Display name</dt>
              <dd className="font-medium">{session!.user.name ?? "Demo Creator"}</dd>
            </div>
            <div>
              <dt className="text-muted">Username</dt>
              <dd className="font-medium">@{username}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">My Profile</h1>
      <p className="mt-2 text-sm text-muted">Public URL: /profile/{profile.username}</p>
      <div className="mt-8 max-w-xl">
        <ProfileEditForm
          initial={{
            displayName: profile.displayName,
            bio: profile.bio ?? "",
            category: profile.category ?? "",
            website: profile.website ?? "",
            avatarUrl: profile.avatarUrl ?? "",
            coverUrl: profile.coverUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
