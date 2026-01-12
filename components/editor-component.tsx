"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
import { useState, useEffect, useRef, useMemo } from "react";
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
  GripVertical,
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

interface SheetWithEditorState extends Sheet {
  editorState?: {
    content: any[];
    selection?: any;
  };
}

export function EditorComponent({
  currentStory,
  onSave,
  onDelete,
}: {
  currentStory: Story | null;
  onSave: (story: Story) => void;
  onDelete: (id: string) => void;
}) {
  const [sheets, setSheets] = useState<SheetWithEditorState[]>([
    {
      id: "sheet_1",
      title: "",
      subtitle: "",
      tags: [],
      content: [],
      isSaved: true,
      editorState: {
        content: [],
        selection: null,
      },
    },
  ]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
  const [visibleSheets, setVisibleSheets] = useState<number[]>([]);
  const [overflowSheets, setOverflowSheets] = useState<number[]>([]);
  const [editingSheetIndex, setEditingSheetIndex] = useState<number | null>(
    null
  );
  const [editingSheetName, setEditingSheetName] = useState<string>("");
  const [draggedSheet, setDraggedSheet] = useState<number | null>(null);
  const [dragOverSheet, setDragOverSheet] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSwitchingRef = useRef<boolean>(false);
  const editorInstancesRef = useRef<Map<string, any>>(new Map());

  const currentSheet = sheets[currentSheetIndex];

  const editor = useCreateBlockNote({
    animations: true,
  });

  useEffect(() => {
    if (
      editor &&
      sheets.length > 0 &&
      !editorInstancesRef.current.has("initialized")
    ) {
      const firstSheet = sheets[0];
      const content = firstSheet.editorState?.content || [];
      console.log("[INIT] Loading initial content for first sheet:", content);
      if (content.length > 0) {
        try {
          editor.insertBlocks(content, editor.document[0]);
          console.log("[INIT] Successfully loaded initial content");
        } catch (e) {
          console.error("[INIT] Error loading initial content:", e);
        }
      } else {
        console.log("[INIT] No initial content to load");
      }
      editorInstancesRef.current.set("initialized", true);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && currentSheet) {
      editorInstancesRef.current.set(currentSheet.id, editor);
    }
  }, [editor, currentSheet?.id]);

  useEffect(() => {
    if (currentStory) {
      console.log("Loading story:", currentStory);
      if (currentStory.sheets && currentStory.sheets.length > 0) {
        const enhancedSheets: SheetWithEditorState[] = currentStory.sheets.map(
          (sheet) => {
            const content =
              (sheet as any).editorState?.content || sheet.content || [];
            console.log(`Sheet ${sheet.id} content:`, content);
            return {
              ...sheet,
              isSaved: true,
              content: content,
              editorState: {
                content: content,
                selection: (sheet as any).editorState?.selection || null,
              },
            };
          }
        );
        setSheets(enhancedSheets);
        setCurrentSheetIndex(0);

        if (editor && enhancedSheets[0]) {
          setTimeout(() => {
            const firstSheetContent =
              enhancedSheets[0].editorState?.content || [];
            console.log("Loading first sheet into editor:", firstSheetContent);
            if (firstSheetContent.length > 0) {
              try {
                const currentBlocks = editor.document;
                if (currentBlocks.length > 0) {
                  editor.replaceBlocks(currentBlocks, firstSheetContent);
                } else {
                  editor.insertBlocks(firstSheetContent, editor.document[0]);
                }
              } catch (e) {
                console.error("Error loading first sheet:", e);
              }
            }
          }, 100);
        }
      } else {
        const newSheets: SheetWithEditorState[] = [
          {
            id: "sheet_1",
            title: currentStory.title,
            subtitle: currentStory.subtitle,
            tags: currentStory.tags || [],
            content: currentStory.content || [],
            isSaved: true,
            editorState: {
              content: currentStory.content || [],
              selection: null,
            },
          },
        ];
        setSheets(newSheets);
        setCurrentSheetIndex(0);
      }
    }
  }, [currentStory?.id, editor]);

  useEffect(() => {
    if (editor && currentSheet && !isSwitchingRef.current) {
      const content = currentSheet.editorState?.content || [];
      console.log("[RESTORE] Attempting to restore sheet content:", {
        sheetId: currentSheet.id,
        contentLength: content.length,
        content: content,
      });

      if (JSON.stringify(editor.document) !== JSON.stringify(content)) {
        console.log("[RESTORE] Content differs, updating editor");
        const currentBlocks = editor.document;
        if (currentBlocks.length > 0) {
          editor.replaceBlocks(currentBlocks, content);
          console.log("[RESTORE] Replaced blocks");
        } else if (content.length > 0) {
          editor.insertBlocks(content, editor.document[0]);
          console.log("[RESTORE] Inserted blocks");
        }
      } else {
        console.log("[RESTORE] Content is the same, no update needed");
      }
    }
  }, [currentSheetIndex, editor]);

  useEffect(() => {
    const calculateVisibleSheets = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const buttonWidth = 150;
      const dropdownWidth = 50;
      const addButtonWidth = 50;

      const availableWidth =
        containerWidth - dropdownWidth - addButtonWidth - 32;
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

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      if (isSwitchingRef.current) {
        console.log("[CHANGE] Ignoring change - switching sheets");
        return;
      }

      setSheets((prev) => {
        const newSheets = [...prev];
        const currentSheetData = newSheets[currentSheetIndex];

        if (
          JSON.stringify(currentSheetData.editorState?.content) !==
          JSON.stringify(editor.document)
        ) {
          console.log("[CHANGE] Editor content changed:", {
            sheetIndex: currentSheetIndex,
            newContent: editor.document,
          });

          newSheets[currentSheetIndex] = {
            ...currentSheetData,
            editorState: {
              content: editor.document,
              selection: editor.getSelection(),
            },
            content: editor.document,
            isSaved: false,
          };
        }

        return newSheets;
      });
    });

    return unsubscribe;
  }, [editor, currentSheetIndex]);

  const updateCurrentSheet = (updates: Partial<SheetWithEditorState>) => {
    setSheets((prev) =>
      prev.map((sheet, idx) =>
        idx === currentSheetIndex
          ? { ...sheet, ...updates, isSaved: false }
          : sheet
      )
    );
  };

  const switchToSheet = (idx: number) => {
    if (idx === currentSheetIndex) return;

    console.log("[SWITCH] Starting switch from", currentSheetIndex, "to", idx);
    isSwitchingRef.current = true;

    if (editor) {
      const currentContent = editor.document;
      const currentSelection = editor.getSelection();

      console.log("[SWITCH] Saving current sheet state:", {
        sheetIndex: currentSheetIndex,
        contentLength: currentContent.length,
        content: currentContent,
      });

      setSheets((prev) => {
        const newSheets = [...prev];
        newSheets[currentSheetIndex] = {
          ...newSheets[currentSheetIndex],
          editorState: {
            content: currentContent,
            selection: currentSelection,
          },
          content: currentContent,
        };
        console.log("[SWITCH] Updated sheets state:", newSheets);
        return newSheets;
      });
    }

    setTimeout(() => {
      setCurrentSheetIndex(idx);

      setTimeout(() => {
        if (editor) {
          setSheets((currentSheets) => {
            const targetSheet = currentSheets[idx];
            const content = targetSheet.editorState?.content || [];
            const currentBlocks = editor.document;

            console.log("[SWITCH] Restoring target sheet:", {
              targetIndex: idx,
              contentLength: content.length,
              content: content,
            });

            try {
              if (content.length > 0) {
                editor.replaceBlocks(currentBlocks, content);
                console.log("[SWITCH] Replaced blocks successfully");
              } else {
                if (currentBlocks.length > 0) {
                  editor.removeBlocks(currentBlocks);
                  console.log("[SWITCH] Cleared editor for empty sheet");
                }
              }
            } catch (e) {
              console.error("[SWITCH] Error loading sheet content:", e);
            }

            if (targetSheet.editorState?.selection) {
              try {
                const savedSelection = targetSheet.editorState.selection;
                if (savedSelection?.blocks?.[0]) {
                  editor.setTextCursorPosition(savedSelection.blocks[0]);
                }
              } catch (e) {
                console.log("[SWITCH] Could not restore selection");
              }
            }

            return currentSheets;
          });
        }
        isSwitchingRef.current = false;
        console.log("[SWITCH] Switch complete");
      }, 50);
    }, 50);
  };

  const handleSave = () => {
    const currentEditorContent = editor.document;
    console.log("Current editor content:", currentEditorContent);

    const updatedSheets = sheets.map((sheet, idx) => {
      if (idx === currentSheetIndex) {
        const updated = {
          ...sheet,
          content: currentEditorContent,
          editorState: {
            content: currentEditorContent,
            selection: editor.getSelection(),
          },
          isSaved: true,
        };
        console.log(`Saving current sheet ${idx}:`, updated);
        return updated;
      } else {
        const preserved = {
          ...sheet,

          content: sheet.content || sheet.editorState?.content || [],
          editorState: sheet.editorState || {
            content: sheet.content || [],
            selection: null,
          },
          isSaved: true,
        };
        console.log(`Preserving sheet ${idx}:`, preserved);
        return preserved;
      }
    });

    console.log("All updated sheets:", updatedSheets);
    setSheets(updatedSheets);

    const firstSheet = updatedSheets[0];

    const story: Story & {
      sheets: SheetWithEditorState[];
    } = {
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

    console.log("Saving story:", story);
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
    if (editor) {
      setSheets((prev) => {
        const newSheets = [...prev];
        newSheets[currentSheetIndex] = {
          ...newSheets[currentSheetIndex],
          editorState: {
            content: editor.document,
            selection: editor.getSelection(),
          },
          content: editor.document,
        };
        return newSheets;
      });
    }

    const newSheet: SheetWithEditorState = {
      id: `sheet_${Date.now()}`,
      title: "",
      subtitle: "",
      tags: [],
      content: [],
      isSaved: true,
      editorState: {
        content: [],
        selection: null,
      },
    };

    setSheets((prev) => [...prev, newSheet]);

    setTimeout(() => {
      const newIndex = sheets.length;
      setCurrentSheetIndex(newIndex);

      if (editor && editor.document.length > 0) {
        editor.removeBlocks(editor.document);
      }
    }, 50);

    toast.success("New sheet added");
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (sheets.length === 1) {
      toast.error("Cannot delete the last sheet");
      return;
    }

    const sheetIndex = sheets.findIndex((s) => s.id === sheetId);
    const updatedSheets = sheets.filter((s) => s.id !== sheetId);

    let newIndex = currentSheetIndex;
    if (sheetIndex === currentSheetIndex) {
      newIndex = Math.min(currentSheetIndex, updatedSheets.length - 1);
    } else if (sheetIndex < currentSheetIndex) {
      newIndex = currentSheetIndex - 1;
    }

    setSheets(updatedSheets);
    setCurrentSheetIndex(newIndex);

    setTimeout(() => {
      if (editor && updatedSheets[newIndex]) {
        const content = updatedSheets[newIndex].editorState?.content || [];
        const currentBlocks = editor.document;

        if (currentBlocks.length > 0) {
          editor.replaceBlocks(currentBlocks, content);
        } else if (content.length > 0) {
          editor.insertBlocks(content, editor.document[0]);
        }
      }
    }, 50);

    toast.success("Sheet deleted");
  };

  const handleImageUpload = () => {
    toast.info("Image upload coming soon!", {
      description: "This feature will be available in the next update.",
    });
  };

  const handleRenameSheet = (idx: number) => {
    setEditingSheetIndex(idx);
    setEditingSheetName(sheets[idx].title || `Sheet ${idx + 1}`);
  };

  const handleSaveSheetName = () => {
    if (editingSheetIndex !== null) {
      setSheets((prev) =>
        prev.map((sheet, idx) =>
          idx === editingSheetIndex
            ? { ...sheet, title: editingSheetName, isSaved: false }
            : sheet
        )
      );
      setEditingSheetIndex(null);
      setEditingSheetName("");
    }
  };

  const handleCancelRename = () => {
    setEditingSheetIndex(null);
    setEditingSheetName("");
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedSheet(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSheet(idx);
  };

  const handleDragLeave = () => {
    setDragOverSheet(null);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();

    if (draggedSheet === null || draggedSheet === dropIdx) {
      setDraggedSheet(null);
      setDragOverSheet(null);
      return;
    }

    const newSheets = [...sheets];
    const [draggedItem] = newSheets.splice(draggedSheet, 1);
    newSheets.splice(dropIdx, 0, draggedItem);

    setSheets(newSheets);

    if (currentSheetIndex === draggedSheet) {
      setCurrentSheetIndex(dropIdx);
    } else if (
      draggedSheet < currentSheetIndex &&
      dropIdx >= currentSheetIndex
    ) {
      setCurrentSheetIndex(currentSheetIndex - 1);
    } else if (
      draggedSheet > currentSheetIndex &&
      dropIdx <= currentSheetIndex
    ) {
      setCurrentSheetIndex(currentSheetIndex + 1);
    }

    setDraggedSheet(null);
    setDragOverSheet(null);
  };

  const handleDragEnd = () => {
    setDraggedSheet(null);
    setDragOverSheet(null);
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

  return (
    <>
      <div className="bg-background gap-8 p-4 min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] px-8">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]"
        >
          <ResizablePanel defaultSize={75} minSize={70} className="min-w-0">
            <div className="flex flex-col bg-[#171717] h-full rounded-[46px] p-4 gap-4 overflow-hidden">
              <div className="bg-background flex-1 py-5 rounded-[46px] overflow-hidden">
                <ScrollArea>
                  <BlockNoteView editor={editor} theme={darkRedTheme} />
                </ScrollArea>
              </div>
              <div
                className="w-full overflow-hidden px-8 pb-2"
                ref={containerRef}
              >
                <div className="flex items-center gap-2 justify-center">
                  {visibleSheets.map((idx) =>
                    sheets[idx] ? (
                      <ContextMenu key={sheets[idx].id}>
                        <ContextMenuTrigger>
                          {editingSheetIndex === idx ? (
                            <div className="relative p-4 rounded-2xl bg-primary">
                              <input
                                type="text"
                                value={editingSheetName}
                                onChange={(e) =>
                                  setEditingSheetName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveSheetName();
                                  } else if (e.key === "Escape") {
                                    handleCancelRename();
                                  }
                                }}
                                onBlur={handleSaveSheetName}
                                autoFocus
                                className="w-32 bg-transparent border-none outline-none text-primary-foreground font-semibold text-center"
                              />
                            </div>
                          ) : (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, idx)}
                              onDragEnd={handleDragEnd}
                              className={`relative flex items-center gap-1 ${
                                dragOverSheet === idx && draggedSheet !== idx
                                  ? "opacity-50"
                                  : ""
                              }`}
                            >
                              <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent/50 rounded">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Button
                                variant={
                                  idx === currentSheetIndex
                                    ? "default"
                                    : "outline"
                                }
                                className={`relative p-4 rounded-2xl transition-all ${
                                  idx === currentSheetIndex
                                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                    : "bg-background hover:bg-accent"
                                }`}
                                onClick={() => switchToSheet(idx)}
                                onDoubleClick={() => handleRenameSheet(idx)}
                              >
                                <span className="font-semibold">
                                  {sheets[idx].title || `Sheet ${idx + 1}`}
                                </span>
                                {!sheets[idx].isSaved && (
                                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border-2 border-background" />
                                )}
                              </Button>
                            </div>
                          )}
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => switchToSheet(idx)}>
                            Select Sheet
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleRenameSheet(idx)}
                          >
                            Rename Sheet
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
                    ) : null
                  )}

                  {overflowSheets.some((idx) => sheets[idx]) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="p-4 rounded-2xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {overflowSheets.map((idx) =>
                          sheets[idx] ? (
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
                                <ContextMenuItem
                                  onClick={() => switchToSheet(idx)}
                                >
                                  Select Sheet
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onClick={() => handleRenameSheet(idx)}
                                >
                                  Rename Sheet
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
                          ) : null
                        )}
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
          </ResizablePanel>
          <ResizableHandle className="w-2 mx-2 my-6 rounded-full bg-transparent" />
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="flex flex-col max-w-full h-full justify-between py-4">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 shrink-0 border-b pb-8">
                  <div className="flex items-center justify-center">
                    <input
                      type="text"
                      placeholder="Title"
                      className="scroll-m-20 text-4xl font-bold tracking-tight bg-transparent border-none outline-none flex-1 w-12"
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
          </ResizablePanel>
        </ResizablePanelGroup>
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
