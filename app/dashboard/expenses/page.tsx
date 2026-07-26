import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wallet } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Expenses</h2>
        <p className="text-xs text-muted mt-1">Keep a simple record of where your money goes.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Your expenses</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted">Expense tracking is ready to be added here.</p></CardContent>
      </Card>
    </div>
  );
}
