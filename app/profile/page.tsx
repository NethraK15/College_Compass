"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Award, Camera, GraduationCap, MapPin, PenLine, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import DetailTile from "@/components/DetailTile";
import { useToastStore } from "@/store/toastStore";

function getSafeImageSrc(src?: string | null) {
  const value = src?.trim();
  if (!value) return "/profile.svg";
  if (value.startsWith("/") || /^https?:\/\//i.test(value)) {
    return value;
  }
  return "/profile.svg";
}

export default function ProfilePage() {
  const { user, hydrate, token, setAuth } = useAuthStore((s: any) => s);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    university: "",
    academicYear: "",
    major: "",
    location: "",
    profileImage: "",
    awardsText: ""
  });

  const push = useToastStore((s) => s.push);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        bio: (user as any).bio || "",
        university: (user as any).university || "",
        academicYear: (user as any).academicYear || "",
        major: (user as any).major || "",
        location: (user as any).location || "",
        profileImage: (user as any).profileImage || "",
        awardsText: Array.isArray((user as any).awards) ? (user as any).awards.map((a: any) => a.title + ": " + a.desc).join("\n") : ""
      }));
    }
  }, [user]);

  if (!user) {
    return (
      <main className="container-shell py-12">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold">You're not logged in</h2>
          <p className="mt-2 text-sm text-slate-600">Please login to see your profile details.</p>
        </div>
      </main>
    );
  }

  async function saveProfile(e?: any) {
    e?.preventDefault();
    if (!token) return;
    const awards = form.awardsText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split(":").map((p) => p.trim());
        return { id: i + 1, title: parts[0], desc: parts.slice(1).join(": ") };
      });

    const body = {
      name: form.name,
      bio: form.bio,
      university: form.university,
      academicYear: form.academicYear,
      major: form.major,
      location: form.location,
      profileImage: getSafeImageSrc(form.profileImage),
      awards
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setAuth(token, {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        bio: updated.bio,
        university: updated.university,
        academicYear: updated.academicYear,
        major: updated.major,
        location: updated.location,
        profileImage: updated.profileImage,
        awards: updated.awards
      });
      push({ message: "Profile saved", type: "success" });
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      push({ message: err?.message || "Failed to save profile", type: "error" });
    }
  }

  return (
    <main className="container-shell py-10 md:py-14">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-cyan-50 to-blue-50 p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800 dark:shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)] dark:opacity-20" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm text-cyan-800 backdrop-blur dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              Your student profile
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">A profile that feels personal, not plain.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Keep your identity, interests, and awards in one place while you browse colleges and build your shortlist.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-700 dark:text-blue-400">Saved</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{Array.isArray((user as any).awards) ? (user as any).awards.length : 0}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-700 dark:text-blue-400">Focus</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{(user as any).major || "Student"}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-700 dark:text-blue-400">Track</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Profile</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="card overflow-hidden p-0">
          <div className="bg-gradient-to-br from-slate-950 via-cyan-900 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
                <GraduationCap className="h-3.5 w-3.5" />
                Profile card
              </div>
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                onClick={() => setEditing((s) => !s)}
                aria-label={editing ? "Cancel editing" : "Edit profile"}
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <div className="relative">
                <Image src={getSafeImageSrc(form.profileImage)} alt="Profile" width={132} height={132} className="rounded-full border-4 border-white/20 object-cover shadow-xl" />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-cyan-400/30">
                  Active
                </span>
              </div>
              <h1 className="mt-5 text-2xl font-semibold">{user.name}</h1>
              <p className="mt-1 text-sm text-cyan-100/90">{user.email}</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">{(user as any).bio || "Add a short bio so your profile feels more like you."}</p>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <DetailTile title="University" value={(user as any).university || "—"} />
              <DetailTile title="Year" value={(user as any).academicYear || "—"} />
              <DetailTile title="Major" value={(user as any).major || "—"} />
              <DetailTile title="Location" value={(user as any).location || "—"} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Award className="h-4 w-4 text-amber-500" />
                Quick notes
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Add awards, a bio, and a profile image to make this page feel more like a personal dashboard.
              </p>
            </div>
          </div>
        </aside>

        <section className="card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Profile details</p>
              <h2 className="text-xl font-semibold text-slate-900">About you</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 sm:flex">
              <Camera className="h-4 w-4" />
              Editable profile
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={saveProfile} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Full name
                    <input className="input mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    University
                    <input className="input mt-2" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Year
                    <input className="input mt-2" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Major
                    <input className="input mt-2" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
                  </label>
                </div>

                <label className="text-sm font-medium text-slate-700">
                  Bio
                  <textarea className="input mt-2 h-28" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </label>

                <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <label className="text-sm font-medium text-slate-700">
                    Location
                    <input className="input mt-2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Profile image URL
                    <input className="input mt-2" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
                  </label>
                </div>

                <label className="text-sm font-medium text-slate-700">
                  Awards (one per line: Title: Description)
                  <textarea className="input mt-2 h-32" value={form.awardsText} onChange={(e) => setForm({ ...form, awardsText: e.target.value })} />
                </label>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button className="btn-primary" type="submit">Save Profile</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:bg-slate-900 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Bio</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{(user as any).bio || "No bio yet."}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:bg-slate-900 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Contact</p>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{user.email}</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">LinkedIn: <a className="text-cyan-700 hover:text-cyan-800 dark:text-blue-400" href="#">profile.link</a></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold text-slate-900 dark:text-white">Profile details</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <DetailTile title="University" value={(user as any).university || "—"} />
                      <DetailTile title="Year" value={(user as any).academicYear || "—"} />
                      <DetailTile title="Major" value={(user as any).major || "—"} />
                      <DetailTile title="Location" value={<span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-600 dark:text-blue-400" />{(user as any).location || "—"}</span>} />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-semibold text-slate-900 dark:text-white">Awards</h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Array.isArray((user as any).awards) && (user as any).awards.length > 0 ? (
                      (user as any).awards.map((a: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 font-bold shadow-inner dark:from-amber-900/40 dark:to-orange-900/40">🏅</div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{a.title || a}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{a.desc || ""}</div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-600 dark:text-slate-400">No awards yet.</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
