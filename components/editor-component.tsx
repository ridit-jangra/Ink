"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";
import { useState, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import {
  Upload,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, Story } from "@/lib/types";
import Image from "next/image";

const darkRedTheme = {
  colors: {
    editor: {
      background: "#0A0A0A",
    },
  },
} satisfies Theme;

export function EditorComponent({
  currentStory,
  onSave,
  onDelete,
}: {
  currentStory: Story | null;
  onSave: (story: Story) => void;
  onDelete: (id: string) => void;
}) {
  const [sheets, setSheets] = useState<Sheet[]>([
    {
      id: "sheet_1",
      title: "",
      subtitle: "",
      tags: [],
      content: [],
      isSaved: true,
    },
  ]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
  const [visibleSheets, setVisibleSheets] = useState<number[]>([]);
  const [overflowSheets, setOverflowSheets] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useCreateBlockNote({ animations: true });

  const currentSheet = sheets[currentSheetIndex];

  useEffect(() => {
    if (currentStory) {
      if (currentStory.sheets && currentStory.sheets.length > 0) {
        setSheets(
          currentStory.sheets.map((sheet) => ({ ...sheet, isSaved: true }))
        );
        setCurrentSheetIndex(0);
        if (currentStory.sheets[0].content) {
          editor.replaceBlocks(editor.document, currentStory.sheets[0].content);
        }
      } else {
        const newSheets = [
          {
            id: "sheet_1",
            title: currentStory.title,
            subtitle: currentStory.subtitle,
            tags: currentStory.tags,
            content: currentStory.content || [],
            isSaved: true,
          },
        ];
        setSheets(newSheets);
        setCurrentSheetIndex(0);
        if (currentStory.content) {
          editor.replaceBlocks(editor.document, currentStory.content);
        }
      }
    }
  }, [currentStory?.id]);

  useEffect(() => {
    if (currentSheet) {
      editor.replaceBlocks(editor.document, currentSheet.content);
    }
  }, [currentSheetIndex]);

  useEffect(() => {
    const calculateVisibleSheets = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const buttonWidth = 150; // Approximate width per button
      const dropdownWidth = 50; // Width for dropdown button
      const addButtonWidth = 50; // Width for add button

      const availableWidth =
        containerWidth - dropdownWidth - addButtonWidth - 32; // 32px for padding
      const maxVisible = Math.floor(availableWidth / buttonWidth);

      const visible = sheets
        .slice(0, Math.max(1, maxVisible))
        .map((_, idx) => idx);
      const overflow = sheets
        .slice(visible.length)
        .map((_, idx) => idx + visible.length);

      setVisibleSheets(visible);
      setOverflowSheets(overflow);
    };

    calculateVisibleSheets();
    window.addEventListener("resize", calculateVisibleSheets);
    return () => window.removeEventListener("resize", calculateVisibleSheets);
  }, [sheets.length]);

  const updateCurrentSheet = (updates: Partial<Sheet>) => {
    setSheets((prev) =>
      prev.map((sheet, idx) =>
        idx === currentSheetIndex
          ? { ...sheet, ...updates, isSaved: false }
          : sheet
      )
    );
  };

  const handleSave = () => {
    const updatedSheets = sheets.map((sheet, idx) =>
      idx === currentSheetIndex
        ? { ...sheet, content: editor.document, isSaved: true }
        : { ...sheet, isSaved: true }
    );
    setSheets(updatedSheets);

    const firstSheet = updatedSheets[0];

    const story: Story = {
      id: currentStory?.id || `story_${Date.now()}`,
      title: firstSheet.title || "Untitled Story",
      subtitle: firstSheet.subtitle || "",
      content: firstSheet.content,
      tags: firstSheet.tags,
      coverImage: "/assets/cover-image.png",
      sheets: updatedSheets,
      createdAt: currentStory?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(story);
    toast("Story saved successfully!");
  };

  const handleDelete = () => {
    if (currentStory) {
      onDelete(currentStory.id);
      setShowDeleteDialog(false);
      toast.success("Story deleted", {
        description: "Your story has been deleted.",
      });
    }
  };

  const handleAddSheet = () => {
    const newSheet: Sheet = {
      id: `sheet_${Date.now()}`,
      title: "",
      subtitle: "",
      tags: [],
      content: [],
      isSaved: true,
    };
    setSheets((prev) => [...prev, newSheet]);
    setCurrentSheetIndex(sheets.length);
    editor.replaceBlocks(editor.document, []);
    toast.success("New sheet added");
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (sheets.length === 1) {
      toast.error("Cannot delete the last sheet");
      return;
    }

    const sheetIndex = sheets.findIndex((s) => s.id === sheetId);
    setSheets((prev) => prev.filter((s) => s.id !== sheetId));

    if (currentSheetIndex >= sheets.length - 1) {
      setCurrentSheetIndex(Math.max(0, sheets.length - 2));
    }

    toast.success("Sheet deleted");
  };

  const handleImageUpload = () => {
    toast.info("Image upload coming soon!", {
      description: "This feature will be available in the next update.",
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sheets, currentSheetIndex, currentStory, editor]);

  useEffect(() => {
    editor.onChange(() => {
      updateCurrentSheet({ content: editor.document });
    });
  }, [editor, currentSheetIndex]);

  const switchToSheet = (idx: number) => {
    const updatedSheets = sheets.map((s, i) =>
      i === currentSheetIndex ? { ...s, content: editor.document } : s
    );
    setSheets(updatedSheets);
    setCurrentSheetIndex(idx);
  };

  return (
    <>
      <div className="flex w-full bg-background text-foreground gap-8 p-4 min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex-1 px-8 overflow-x-hidden">
        <div className="flex flex-col bg-[#171717] w-[75%] min-w-0 rounded-[46px] p-4 gap-4 overflow-hidden">
          <div className="bg-background w-full flex-1 rounded-[46px] overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                <BlockNoteView editor={editor} theme={darkRedTheme} />
              </div>
            </ScrollArea>
          </div>
          <div className="w-full overflow-hidden px-8 pb-2" ref={containerRef}>
            <div className="flex items-center gap-2 justify-center">
              {visibleSheets.map((idx) => (
                <ContextMenu key={sheets[idx].id}>
                  <ContextMenuTrigger>
                    <Button
                      variant={
                        idx === currentSheetIndex ? "default" : "outline"
                      }
                      className={`relative p-4 rounded-2xl transition-all ${
                        idx === currentSheetIndex
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "bg-background hover:bg-accent"
                      }`}
                      onClick={() => switchToSheet(idx)}
                    >
                      <span className="font-semibold">
                        {sheets[idx].title || `Sheet ${idx + 1}`}
                      </span>
                      {!sheets[idx].isSaved && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border-2 border-background" />
                      )}
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => switchToSheet(idx)}>
                      Select Sheet
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setSheetToDelete(sheets[idx].id);
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive"
                    >
                      Delete Sheet
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

              {overflowSheets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="p-4 rounded-2xl">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {overflowSheets.map((idx) => (
                      <ContextMenu key={sheets[idx].id}>
                        <ContextMenuTrigger>
                          <DropdownMenuItem
                            onClick={() => switchToSheet(idx)}
                            className={
                              idx === currentSheetIndex ? "bg-accent" : ""
                            }
                            onSelect={(e) => e.preventDefault()}
                          >
                            <span className="flex items-center gap-2">
                              {sheets[idx].title || `Sheet ${idx + 1}`}
                              {!sheets[idx].isSaved && (
                                <span className="h-2 w-2 bg-yellow-500 rounded-full" />
                              )}
                            </span>
                          </DropdownMenuItem>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => switchToSheet(idx)}>
                            Select Sheet
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => {
                              setSheetToDelete(sheets[idx].id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive"
                          >
                            Delete Sheet
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="outline"
                className="p-4 rounded-2xl"
                onClick={handleAddSheet}
              >
                <Plus style={{ height: "18px", width: "auto" }} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[25%] justify-between py-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 shrink-0 border-b pb-8">
              <div className="flex items-center justify-center">
                <input
                  type="text"
                  placeholder="Title"
                  className="scroll-m-20 text-4xl font-bold font-employed tracking-tight bg-transparent border-none outline-none flex-1 w-12"
                  value={currentSheet.title}
                  onChange={(e) =>
                    updateCurrentSheet({ title: e.target.value })
                  }
                />
                <Tooltip>
                  <TooltipTrigger>
                    {currentSheet.isSaved ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-yellow-500 shrink-0" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {currentSheet.isSaved
                      ? "All changes saved"
                      : "Unsaved changes"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <input
                type="text"
                placeholder="Subtitle"
                className="text-muted-foreground text-xl font-semibold tracking-tight bg-transparent border-none outline-none"
                value={currentSheet.subtitle}
                onChange={(e) =>
                  updateCurrentSheet({ subtitle: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-lg">Cover Image</p>
              <div className="relative group rounded-4xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
                <Image
                  src={"/assets/cover-image.png"}
                  alt="cover-image"
                  width={350}
                  height={300}
                  style={{ width: "100%", height: "100%" }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={handleImageUpload}
                  >
                    <Upload className="h-4 w-4" />
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative">
              <div className="border-2 rounded-4xl w-full h-full p-2">
                <p className="absolute -top-3 left-3.5 bg-background w-18 text-center text-lg font-semibold">
                  Tags
                </p>
                <TagsInput
                  value={currentSheet.tags}
                  onValueChange={(newTags) =>
                    updateCurrentSheet({ tags: newTags })
                  }
                  editable
                  addOnPaste
                  className="mt-4 w-full"
                >
                  <TagsInputList className="border-0 focus-within:ring-0 gap-3 w-full">
                    {currentSheet.tags.map((tag) => (
                      <TagsInputItem
                        key={tag}
                        value={tag}
                        className="text-[16px] bg-accent/40 px-4 py-2 rounded-full"
                      >
                        {tag}
                      </TagsInputItem>
                    ))}
                    <TagsInputInput
                      placeholder="Add tag..."
                      className="text-lg"
                    />
                  </TagsInputList>
                </TagsInput>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full gap-3">
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Button className="w-full gap-2" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  Save Story
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save your story</TooltipContent>
            </Tooltip>
            {currentStory && (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Button
                    variant={"destructive"}
                    className="w-full gap-2"
                    onClick={() => {
                      setSheetToDelete(null);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Story
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this story</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {sheetToDelete
                ? `This will permanently delete this sheet. This action cannot be undone.`
                : `This action cannot be undone. This will permanently delete your story "${
                    currentSheet.title || "Untitled Story"
                  }".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (sheetToDelete) {
                  handleDeleteSheet(sheetToDelete);
                  setSheetToDelete(null);
                } else {
                  handleDelete();
                }
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
