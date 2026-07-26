import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen } from "lucide-react";

export default function DiaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Diary</h2>
        <p className="text-xs text-muted mt-1">A private place for your thoughts and daily reflections.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Your diary</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted">Diary entries are ready to be added here.</p></CardContent>
      </Card>
    </div>
  );
}
