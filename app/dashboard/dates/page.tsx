import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CalendarDays } from "lucide-react";

export default function DatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Important dates</h2>
        <p className="text-xs text-muted mt-1">Remember the moments and appointments that matter.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Your calendar</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted">Important date tracking is ready to be added here.</p></CardContent>
      </Card>
    </div>
  );
}
