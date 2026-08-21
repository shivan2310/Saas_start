"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, Lock, Plus, Calendar, Search, Unlock, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { DiaryEntry } from "@/types";
import { hasUnlockedJournalKey, unlockAccountJournalKey } from "@/lib/journalCrypto";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";

export default function DiaryPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<DiaryEntry[]>([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);
  const [journalError, setJournalError] = useState("");
  const [needsFreshLogin, setNeedsFreshLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState("");

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
        setJournalError("Your encrypted journal key is locked for this session. Please unlock it to continue.");
      } finally {
        setIsLoadingJournal(false);
      }
    };

    void loadJournal();
  }, [user]);

  const handleUnlock = async () => {
    if (!user || !profile?.journalKey || !unlockPassword.trim()) return;
    setIsUnlocking(true);
    setUnlockError("");
    try {
      await unlockAccountJournalKey(user.uid, user.email || "", unlockPassword, profile.journalKey);
      setShowUnlockModal(false);
      setUnlockPassword("");
      setNeedsFreshLogin(false);
      const entries = await personalService.getDiary(user.uid);
      setItems(entries);
      await personalService.encryptPlainDiaryEntries(user.uid);
    } catch (error) {
      console.error("Failed to unlock journal:", error);
      setUnlockError("Incorrect password. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const openUnlockModal = () => {
    setShowUnlockModal(true);
    setUnlockError("");
  };

  const closeUnlockModal = () => {
    setShowUnlockModal(false);
    setUnlockPassword("");
    setUnlockError("");
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
          {journalError || "Your encrypted journal key is locked for this session. Enter your password to unlock it."}
        </p>
        <Button onClick={openUnlockModal} variant="dash-primary">Unlock Journal</Button>
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

  if (showUnlockModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-dash-card rounded-xl border border-dash-border p-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-semibold text-dash-text">Unlock Journal</h3>
            <button onClick={closeUnlockModal} className="text-dash-text-muted hover:text-dash-text transition-colors p-1">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[13px] text-dash-text-muted mb-6">Enter your password to unlock your encrypted journal for this session.</p>
          {unlockError && (
            <div className="mb-4 p-3 bg-dash-accent/10 border border-dash-accent/30 rounded-md text-[13px] text-dash-accent">
              {unlockError}
            </div>
          )}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              autoFocus
              className="w-full bg-dash-surface border border-dash-border rounded-md pl-3 pr-10 py-2.5 text-[14px] text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:border-dash-accent transition-dash"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-text-muted hover:text-dash-text transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex gap-3">
            <Button onClick={closeUnlockModal} variant="dash-secondary" className="flex-1" disabled={isUnlocking}>
              Cancel
            </Button>
            <Button onClick={handleUnlock} variant="dash-primary" className="flex-1" isLoading={isUnlocking} disabled={!unlockPassword.trim()}>
              Unlock
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
