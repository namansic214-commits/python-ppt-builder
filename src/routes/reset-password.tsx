import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset Password — MedRemind" },
    { name: "description", content: "Choose a new password for your MedRemind account." },
    { property: "og:title", content: "Reset Password — MedRemind" },
    { property: "og:description", content: "Securely reset your MedRemind account password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [validRecovery, setValidRecovery] = useState(false);
  useEffect(() => { setValidRecovery(window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery")); }, []);
  return <main className="grid min-h-screen place-items-center bg-hero p-5"><section className="w-full max-w-md rounded-lg bg-card p-8"><span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><HeartPulse/></span><h1 className="mt-5 text-3xl font-black">Choose a new password</h1>{!validRecovery ? <p className="mt-4 text-muted-foreground">Open the password reset link from your email to continue.</p> : <form className="mt-6 space-y-4" onSubmit={async (event) => { event.preventDefault(); const parsed = z.string().min(8).max(128).safeParse(password); if (!parsed.success || password !== confirm) { setMessage("Passwords must match and contain at least 8 characters."); return; } const { error } = await supabase.auth.updateUser({ password }); if (error) setMessage(error.message); else { setMessage("Password updated. Returning to MedRemind…"); window.setTimeout(() => void navigate({ to: "/" }), 1000); } }}><label className="block font-bold">New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} required className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"/></label><label className="block font-bold">Confirm password<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} maxLength={128} required className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"/></label>{message && <p className="rounded-md bg-secondary p-3 text-sm font-bold">{message}</p>}<Button type="submit" size="lg" className="w-full">Save new password</Button></form>}</section></main>;
}