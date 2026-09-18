import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Check, CirclePlus, Clock3, HeartPulse, Home, Package, Pill, SkipForward, UserRound, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "pending" | "taken" | "skipped" | "snoozed";
type Medicine = { id: number; name: string; dose: string; time: string; period: string; stock: number; status: Status };

const starter: Medicine[] = [
  { id: 1, name: "Metformin", dose: "500 mg · 1 tablet", time: "08:00", period: "Morning", stock: 18, status: "taken" },
  { id: 2, name: "Amlodipine", dose: "5 mg · 1 tablet", time: "13:00", period: "Afternoon", stock: 7, status: "pending" },
  { id: 3, name: "Atorvastatin", dose: "10 mg · 1 tablet", time: "20:00", period: "Night", stock: 4, status: "pending" },
];

const nav = [
  { id: "today", label: "Today", icon: Home },
  { id: "medicines", label: "Medicines", icon: Pill },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "family", label: "Family", icon: Users },
];

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "MedRemind — Medicine Reminder" },
    { name: "description", content: "A simple, large-text medicine reminder and adherence tracker for elderly users." },
    { property: "og:title", content: "MedRemind — Medicine Reminder" },
    { property: "og:description", content: "Simple daily medicine reminders, dose tracking, and family summaries." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: MedRemind,
});

function MedRemind() {
  const [active, setActive] = useState("today");
  const [medicines, setMedicines] = useState<Medicine[]>(starter);
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("medremind-medicines");
    if (saved) {
      try { setMedicines(JSON.parse(saved) as Medicine[]); } catch { setMedicines(starter); }
    }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem("medremind-medicines", JSON.stringify(medicines)); }, [medicines, loaded]);

  const taken = medicines.filter((medicine) => medicine.status === "taken").length;
  const adherence = medicines.length ? Math.round((taken / medicines.length) * 100) : 0;
  const next = medicines.find((medicine) => medicine.status === "pending" || medicine.status === "snoozed");
  const updateStatus = (id: number, status: Status) => setMedicines((items) => items.map((item) => item.id === id ? { ...item, status, stock: status === "taken" && item.status !== "taken" ? Math.max(0, item.stock - 1) : item.stock } : item));

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="bg-sidebar text-sidebar-foreground lg:fixed lg:inset-y-0 lg:w-64">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:py-8">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><HeartPulse size={25} /></span><div><p className="text-xl font-black">MedRemind</p><p className="text-xs text-sidebar-foreground/65">Care made simple</p></div></div>
          <button className="rounded-md p-2 lg:hidden" aria-label="Open profile"><UserRound /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-2 lg:px-4" aria-label="Main navigation">
          {nav.map((item) => <Button key={item.id} variant="nav" onClick={() => setActive(item.id)} className={`min-w-max justify-start lg:w-full ${active === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}><item.icon size={20} />{item.label}</Button>)}
        </nav>
        <div className="absolute bottom-7 left-4 right-4 hidden rounded-md border border-sidebar-border p-4 lg:block"><p className="text-sm font-bold">Need help?</p><p className="mt-1 text-xs text-sidebar-foreground/65">Ask a family member to review your schedule.</p></div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="border-b border-border bg-card px-5 py-4 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="text-sm font-bold text-accent">SATURDAY · 19 SEPTEMBER</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Good morning, Naman</h1></div><button aria-label="Notifications" className="relative rounded-full bg-secondary p-3 text-secondary-foreground"><Bell size={22}/><span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-destructive" /></button></div></header>
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {active === "today" && <TodayView medicines={medicines} next={next} adherence={adherence} updateStatus={updateStatus} onAdd={() => setShowAdd(true)} />}
          {active === "medicines" && <MedicinesView medicines={medicines} onAdd={() => setShowAdd(true)} />}
          {active === "calendar" && <CalendarView adherence={adherence} />}
          {active === "family" && <FamilyView medicines={medicines} adherence={adherence} />}
        </div>
      </main>
      {showAdd && <AddMedicine onClose={() => setShowAdd(false)} onAdd={(medicine) => { setMedicines((items) => [...items, medicine]); setShowAdd(false); }} />}
    </div>
  );
}

function TodayView({ medicines, next, adherence, updateStatus, onAdd }: { medicines: Medicine[]; next: Medicine | undefined; adherence: number; updateStatus: (id: number, status: Status) => void; onAdd: () => void }) {
  return <>
    <section className="relative overflow-hidden rounded-lg bg-hero px-6 py-7 text-sidebar-foreground sm:px-9 sm:py-9">
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-sidebar-accent" />
      <div className="relative max-w-2xl"><p className="text-sm font-black uppercase text-primary">Next medicine</p>{next ? <><h2 className="mt-2 text-3xl font-black sm:text-4xl">{next.name}</h2><p className="mt-2 text-lg text-sidebar-foreground/75">{next.dose} · {next.period}</p><div className="mt-6 flex flex-wrap items-center gap-4"><span className="flex items-center gap-2 text-2xl font-black"><Clock3 className="text-primary" /> {next.time}</span><Button size="lg" onClick={() => updateStatus(next.id, "taken")}><Check /> Mark as taken</Button></div></> : <><h2 className="mt-2 text-3xl font-black">All done for today!</h2><p className="mt-2 text-sidebar-foreground/75">You have completed your medicine schedule.</p></>}</div>
    </section>
    <div className="mt-7 flex items-end justify-between"><div><p className="text-sm font-black uppercase text-accent">Today’s schedule</p><h2 className="mt-1 text-2xl font-black">Your medicines</h2></div><Button variant="outline" onClick={onAdd}><CirclePlus /> Add medicine</Button></div>
    <div className="mt-4 space-y-3">{medicines.map((medicine) => <DoseRow key={medicine.id} medicine={medicine} updateStatus={updateStatus} />)}</div>
    <section className="mt-7 grid gap-4 sm:grid-cols-3"><Stat icon={<Check />} value={`${adherence}%`} label="Today’s adherence" tone="success"/><Stat icon={<Pill />} value={`${medicines.length}`} label="Doses scheduled" tone="accent"/><Stat icon={<Package />} value={`${medicines.filter((m) => m.stock <= 5).length}`} label="Refills needed" tone="warning"/></section>
  </>;
}

function DoseRow({ medicine, updateStatus }: { medicine: Medicine; updateStatus: (id: number, status: Status) => void }) {
  const done = medicine.status === "taken";
  return <article className={`grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[80px_1fr_auto] sm:items-center ${done ? "border-success/40" : "border-border"}`}>
    <div className="text-center"><p className="text-xl font-black">{medicine.time}</p><p className="text-xs font-bold text-muted-foreground">{medicine.period}</p></div>
    <div className="flex items-center gap-4"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${done ? "bg-success/15 text-success" : "bg-secondary text-accent"}`}><Pill /></span><div><h3 className="text-lg font-black">{medicine.name}</h3><p className="text-sm text-muted-foreground">{medicine.dose} · {medicine.stock} left</p></div></div>
    {done ? <span className="flex items-center gap-2 font-black text-success"><Check /> Taken</span> : <div className="flex flex-wrap gap-2"><Button onClick={() => updateStatus(medicine.id, "taken")}><Check/>Taken</Button><Button variant="secondary" onClick={() => updateStatus(medicine.id, "snoozed")}><Clock3/>Snooze</Button><Button variant="ghost" onClick={() => updateStatus(medicine.id, "skipped")}><SkipForward/>Skip</Button></div>}
  </article>;
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "success" | "accent" | "warning" }) {
  const tones = { success: "bg-success/15 text-success", accent: "bg-accent/15 text-accent", warning: "bg-warning/20 text-foreground" };
  return <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"><span className={`grid h-12 w-12 place-items-center rounded-full ${tones[tone]}`}>{icon}</span><div><p className="text-2xl font-black">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></div>;
}

function MedicinesView({ medicines, onAdd }: { medicines: Medicine[]; onAdd: () => void }) {
  return <><div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase text-accent">Medicine cabinet</p><h2 className="text-3xl font-black">All medicines</h2></div><Button size="lg" onClick={onAdd}><CirclePlus/>Add medicine</Button></div><div className="mt-6 grid gap-4 md:grid-cols-2">{medicines.map((m) => <article key={m.id} className="rounded-lg border border-border bg-card p-6"><div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-accent"><Pill/></span>{m.stock <= 5 && <span className="rounded-full bg-warning/25 px-3 py-1 text-sm font-black">Refill soon</span>}</div><h3 className="mt-5 text-2xl font-black">{m.name}</h3><p className="mt-1 text-muted-foreground">{m.dose}</p><div className="mt-5 flex justify-between border-t border-border pt-4"><span className="font-bold">{m.period} · {m.time}</span><span className="font-bold text-muted-foreground">{m.stock} tablets left</span></div></article>)}</div></>;
}

function CalendarView({ adherence }: { adherence: number }) {
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  return <><p className="text-sm font-black uppercase text-accent">Adherence calendar</p><h2 className="text-3xl font-black">September 2026</h2><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]"><section className="rounded-lg border border-border bg-card p-5 sm:p-7"><div className="grid grid-cols-7 gap-2 text-center text-sm font-black text-muted-foreground">{"SMTWTFS".split("").map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}{days.map((day) => <div key={day} className={`grid aspect-square place-items-center rounded-md text-base font-black ${day < 19 ? "bg-success/15 text-success" : day === 19 ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>{day}</div>)}</div></section><aside className="rounded-lg bg-hero p-6 text-sidebar-foreground"><p className="text-sm font-black uppercase text-primary">This month</p><p className="mt-4 text-6xl font-black">{adherence}%</p><p className="mt-2 text-sidebar-foreground/70">of today’s doses completed</p><div className="mt-8 space-y-4"><p className="flex justify-between"><span>Taken</span><strong>42 doses</strong></p><p className="flex justify-between"><span>Missed</span><strong>3 doses</strong></p><p className="flex justify-between"><span>Best streak</span><strong>8 days</strong></p></div></aside></div></>;
}

function FamilyView({ medicines, adherence }: { medicines: Medicine[]; adherence: number }) {
  const missed = medicines.filter((m) => m.status === "skipped");
  return <><p className="text-sm font-black uppercase text-accent">Caregiver summary</p><h2 className="text-3xl font-black">Family view</h2><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-lg bg-hero p-7 text-sidebar-foreground"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><UserRound/></span><div><h3 className="text-xl font-black">Naman’s daily progress</h3><p className="text-sidebar-foreground/70">Updated on this device</p></div></div><p className="mt-8 text-6xl font-black">{adherence}%</p><p className="mt-2 text-sidebar-foreground/70">adherence today</p></section><section className="rounded-lg border border-border bg-card p-7"><h3 className="text-xl font-black">Missed dose alerts</h3>{missed.length ? <div className="mt-5 space-y-3">{missed.map((m) => <p key={m.id} className="rounded-md bg-destructive/10 p-4 font-bold text-destructive">{m.name} was skipped at {m.time}</p>)}</div> : <div className="mt-8 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><Check size={32}/></span><p className="mt-4 font-black">No missed doses today</p><p className="text-sm text-muted-foreground">Everything is on track.</p></div>}</section></div></>;
}

function AddMedicine({ onClose, onAdd }: { onClose: () => void; onAdd: (medicine: Medicine) => void }) {
  const [name, setName] = useState(""); const [dose, setDose] = useState(""); const [time, setTime] = useState("08:00"); const [period, setPeriod] = useState("Morning"); const [stock, setStock] = useState(30);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4" role="dialog" aria-modal="true" aria-labelledby="add-title"><form onSubmit={(e) => { e.preventDefault(); if (!name.trim() || !dose.trim()) return; onAdd({ id: Date.now(), name: name.trim(), dose: dose.trim(), time, period, stock, status: "pending" }); }} className="w-full max-w-lg rounded-lg bg-card p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase text-accent">New schedule</p><h2 id="add-title" className="text-2xl font-black">Add medicine</h2></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-full bg-muted p-2"><X/></button></div><div className="mt-6 space-y-4"><Field label="Medicine name"><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Metformin" className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-4 focus:ring-ring/20"/></Field><Field label="Dosage"><input value={dose} onChange={(e) => setDose(e.target.value)} required placeholder="e.g. 500 mg · 1 tablet" className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-4 focus:ring-ring/20"/></Field><div className="grid grid-cols-2 gap-4"><Field label="Time"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-md border border-input bg-background px-4 py-3"/></Field><Field label="Time of day"><select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full rounded-md border border-input bg-background px-4 py-3"><option>Morning</option><option>Afternoon</option><option>Night</option></select></Field></div><Field label="Tablets in stock"><input type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-4 py-3"/></Field></div><div className="mt-7 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" size="lg"><CirclePlus/>Save medicine</Button></div></form></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block font-black">{label}</span>{children}</label>; }
