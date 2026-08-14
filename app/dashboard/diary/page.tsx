"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, Edit3, Calendar, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { DiaryEntry } from "@/types";
import { hasUnlockedJournalKey } from "@/lib/journalCrypto";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

export default function DiaryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DiaryEntry[]>([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(true);
  const [journalError, setJournalError] = useState("");
  const [needsFreshLogin, setNeedsFreshLogin] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // State for pop-up editing modal
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const retryLoadJournal = async () => {
    if (!user) return;

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

  const signInAgain = async () => {
    await authService.logout();
  };

  const submitNewEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || needsFreshLogin || !content.trim()) return;
    const item = await personalService.addDiaryEntry(
      user.uid,
      title.trim() || "Untitled entry",
      content.trim()
    );
    setItems((v) => [item, ...v]);
    setTitle("");
    setContent("");
  };

  const removeEntry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await personalService.remove("diary", id);
    setItems((v) => v.filter((item) => item.id !== id));
  };

  const openEditModal = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const closeEditModal = () => {
    setSelectedEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEditedEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || needsFreshLogin || !selectedEntry || !editContent.trim()) return;
    setIsUpdating(true);
    try {
      const updated = await personalService.updateDiaryEntry(
        selectedEntry.id,
        user.uid,
        editTitle.trim() || "Untitled entry",
        editContent.trim()
      );
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      closeEditModal();
    } catch (err) {
      console.error("Failed to update diary entry:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Journal</h2>
          <Lock className="h-4 w-4 text-muted" />
        </div>
        <p className="mt-1 text-xs text-muted">
          Your entries are encrypted before they are saved.
        </p>
      </div>

      {journalError ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted">{journalError}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={signInAgain}>
                Sign in again
              </Button>
              <Button type="button" variant="outline" onClick={retryLoadJournal}>
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoadingJournal ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted">Opening encrypted journal...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {needsFreshLogin && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted">
                  Sign in again to unlock journal saving and sync encryption for every device.
                </p>
                <Button type="button" className="mt-3" onClick={signInAgain}>
                  Sign in again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* New Journal Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Write an entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitNewEntry} className="space-y-3">
                <Input
                  label="Title"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="How was your day?"
                />
                <textarea
                  aria-label="Journal entry"
                  maxLength={10000}
                  className="min-h-32 w-full rounded border border-border bg-white p-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write whatever is on your mind..."
                  required
                />
                <Button type="submit" disabled={needsFreshLogin}>Save entry</Button>
              </form>
            </CardContent>
          </Card>

          {/* Saved Entries List (Titles Only) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
              Saved Entries
            </h3>
            {items.length ? (
              items.map((item) => (
                <Card
                  key={item.id}
                  className="group cursor-pointer transition-all hover:border-black/40 hover:shadow-sm"
                  onClick={() => openEditModal(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <Edit3 className="h-4 w-4 shrink-0 text-muted group-hover:text-black transition-colors" />
                        <span className="truncate font-semibold text-black text-base group-hover:underline">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={(e) => removeEntry(e, item.id)}
                          aria-label="Delete journal entry"
                          className="p-1 rounded text-muted hover:text-red-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted">Your journal is empty.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Edit Entry Pop-up Modal */}
      <Modal
        isOpen={!!selectedEntry}
        onClose={closeEditModal}
        title="Journal Entry"
        description="View or edit your entry below."
      >
        <form onSubmit={saveEditedEntry} className="space-y-4 pt-1">
          <Input
            label="Title"
            value={editTitle}
            maxLength={200}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Entry Title"
          />
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Content</label>
            <textarea
              aria-label="Edit journal content"
              maxLength={10000}
              className="min-h-48 w-full rounded border border-border bg-white p-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Journal thoughts..."
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditModal}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
