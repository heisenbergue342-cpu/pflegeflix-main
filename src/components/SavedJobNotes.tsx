import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface SavedJobNotesProps {
  jobId: string;
  initialNotes?: string | null;
  userId: string;
  onSaved?: (newNotes: string) => void;
}

export default function SavedJobNotes({ jobId, initialNotes, userId, onSaved }: SavedJobNotesProps) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("saved_jobs")
      .update({ notes } as any)
      .eq("user_id", userId)
      .eq("job_id", jobId);
    setSaving(false);
    if (error) {
      toast.error(t("error.save_failed"));
      return;
    }
    toast.success(t("favorites.note_saved"));
    onSaved?.(notes);
  };

  return (
    <div className="mt-3">
      <label className="block text-sm text-white mb-1">{t("favorites.private_notes")}</label>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("favorites.private_notes")}
        className="bg-netflix-card border-[#2A2A2B] text-white"
        rows={3}
        aria-label={t("favorites.private_notes")}
      />
      <div className="mt-2">
        <Button onClick={saveNotes} disabled={saving} aria-label={t("favorites.save_note")}>
          {saving ? t("dashboard.saving") : t("favorites.save_note")}
        </Button>
      </div>
    </div>
  );
}