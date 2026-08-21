"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, Lock, Plus, Calendar, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { DiaryEntry } from "@/types";
import { hasUnlockedJournalKey } from "@/lib/journalCrypto";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";

export default function DiaryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DiaryEntry[]>([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);
  const [journalError, setJournalError] = useState("");
  const [needsFreshLogin, setNeedsFreshLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadJournal = async () => {
      setIsLoadingJournal(true);
      setJournalError("");
      setNeedsFreshLogin(false);
      try {
        const isUnlocked = hasUnlockedJournalKey(user.uid);
        const entries = await personalService.getDiary(user.uid);
        setItems(entries);
        if (isUnlocked) {
          await personalService.encryptPlainDiaryEntries(user.uid);
        } else {
          setNeedsFreshLogin(true);
        }
      } catch (error) {
        console.error("Failed to load encrypted journal:", error);
        setNeedsFreshLogin(true);
        setJournalError("Your encrypted journal key is locked for this session. Please sign in again to unlock it.");
      } finally {
        setIsLoadingJournal(false);
      }
    };

    void loadJournal();
  }, [user]);

  const signInAgain = async () => {
    await authService.logout();
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setTitle("");
    setContent("");
  };

  const handleSelectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
  };

  const saveEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || needsFreshLogin || !content.trim()) return;
    setIsSaving(true);
    
    try {
      if (selectedEntry) {
        const updated = await personalService.updateDiaryEntry(
          selectedEntry.id,
          user.uid,
          title.trim() || "Untitled entry",
          content.trim()
        );
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedEntry(updated);
      } else {
        const item = await personalService.addDiaryEntry(
          user.uid,
          title.trim() || "Untitled entry",
          content.trim()
        );
        setItems((v) => [item, ...v]);
        setSelectedEntry(item);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeEntry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await personalService.remove("diary", id);
    setItems((v) => v.filter((item) => item.id !== id));
    if (selectedEntry?.id === id) {
      handleNewEntry();
    }
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (journalError || needsFreshLogin) {
    return (
      <div className="max-w-md mt-10 rounded-lg border border-dash-border bg-dash-card p-6">
        <Lock className="h-6 w-6 text-dash-text-muted mb-4" />
        <h3 className="text-[16px] font-semibold text-dash-text mb-2">Journal Locked</h3>
        <p className="text-[13px] text-dash-text-muted mb-6">
          {journalError || "Sign in again to unlock journal saving and sync encryption for every device."}
        </p>
        <Button onClick={signInAgain} variant="dash-primary">Sign in again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-6xl">
      <div className="flex items-end justify-between mb-6 shrink-0">
        <h2 className="text-[28px] font-semibold tracking-tight text-dash-text">Journal</h2>
      </div>

      <div className="flex-1 min-h-0 flex gap-8">
        
        {/* Left Col: Entries List */}
        <div className="w-64 shrink-0 flex flex-col border-r border-dash-border pr-6">
          <Button onClick={handleNewEntry} variant="dash-secondary" className="w-full mb-6 shrink-0 justify-start">
            <Plus className="h-4 w-4 mr-2" /> New Entry
          </Button>

          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dash-surface border border-dash-border rounded-md pl-9 pr-3 py-1.5 text-[13px] text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:border-dash-accent transition-dash"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {isLoadingJournal ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-[13px] text-dash-text-muted py-4">No entries found.</div>
            ) : (
              filteredItems.map(item => {
                const isSelected = selectedEntry?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectEntry(item)}
                    className={cn(
                      "group p-3 rounded-lg cursor-pointer transition-dash border",
                      isSelected 
                        ? "bg-dash-surface border-dash-border" 
                        : "border-transparent hover:bg-dash-hover"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[14px] font-medium text-dash-text truncate pr-2">
                        {item.title}
                      </div>
                      <button 
                        onClick={(e) => removeEntry(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-dash-text-muted hover:text-dash-text transition-opacity p-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-dash-text-muted">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <form onSubmit={saveEntry} className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-dash-border pb-4 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-dash-text-muted font-medium">
                  {selectedEntry ? formatDate(selectedEntry.createdAt) : formatDate(new Date().toISOString())}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-dash-accent font-semibold px-2 py-0.5 bg-dash-accent/10 rounded">
                  {selectedEntry ? "Editing" : "Draft"}
                </span>
              </div>
              <Button type="submit" variant="dash-primary" size="dash-sm" isLoading={isSaving} disabled={!content.trim()}>
                Save entry
              </Button>
            </div>

            <input
              type="text"
              placeholder="Entry Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-[28px] font-semibold text-dash-text placeholder:text-dash-text-muted focus:outline-none mb-6 shrink-0 leading-tight"
            />

            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full bg-transparent border-none text-[15px] leading-relaxed text-dash-text placeholder:text-dash-text-muted focus:outline-none resize-none"
              style={{ minHeight: '300px' }}
            />
          </form>
        </div>

      </div>
    </div>
  );
}
