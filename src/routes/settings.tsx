import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · traduz.ai" },
      { name: "description", content: "Tune your traduz.ai workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [notif, setNotif] = useState(true);
  const [autoGloss, setAutoGloss] = useState(true);

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Make traduz.ai feel like yours." />

      <section className="glass rounded-3xl p-6 mb-5">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white text-xl font-semibold">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <button className="px-4 py-2 rounded-2xl bg-white/70 hover:bg-white text-sm font-medium transition">
            Change photo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} />
        </div>
      </section>

      <section className="glass rounded-3xl p-6 mb-5">
        <h2 className="font-semibold mb-4">Preferences</h2>
        <Toggle label="Email notifications" hint="Project updates and chat mentions." value={notif} onChange={setNotif} />
        <Toggle
          label="Auto-suggest glossary terms"
          hint="The assistant will propose new terms while you translate."
          value={autoGloss}
          onChange={setAutoGloss}
        />
      </section>

      <section className="glass rounded-3xl p-6">
        <h2 className="font-semibold mb-4">Plan</h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-medium">Creative · monthly</div>
            <div className="text-xs text-muted-foreground">Unlimited projects, 200 AI hours/mo</div>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
            Manage plan
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1.5 bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white transition"
      />
    </label>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/40 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition ${value ? "bg-gradient-to-r from-pink-400 to-purple-400" : "bg-white/60"}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${value ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}