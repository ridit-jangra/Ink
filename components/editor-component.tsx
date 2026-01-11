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
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";
import { useState, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import { Upload, Save, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Story } from "@/lib/types";
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
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const editor = useCreateBlockNote({ animations: true });

  useEffect(() => {
    if (currentStory) {
      setTitle(currentStory.title);
      setSubtitle(currentStory.subtitle);
      setTags(currentStory.tags);
      if (currentStory.content) {
        editor.replaceBlocks(editor.document, currentStory.content);
      }
      setIsSaved(true);
    } else {
      setTitle("");
      setSubtitle("");
      setTags([]);
      editor.replaceBlocks(editor.document, []);
      setIsSaved(true);
    }
  }, [currentStory?.id]);

  const handleSave = () => {
    const content = editor.document;
    const story: Story = {
      id: currentStory?.id || `story_${Date.now()}`,
      title: title || "Untitled Story",
      subtitle: subtitle || "",
      content,
      tags,
      coverImage: "/assets/cover-image.png",
      createdAt: currentStory?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(story);
    setIsSaved(true);
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
  }, [title, subtitle, tags, currentStory, editor]);

  useEffect(() => {
    editor.onChange(() => {
      setIsSaved(false);
    });
  }, [editor]);

  return (
    <>
      <div className="flex w-full bg-background text-foreground gap-8 p-4 max-h-[calc(100vh-4rem)] flex-1 px-8">
        <div className="relative flex flex-col bg-[#171717] w-[75%] rounded-[46px] p-4">
          <div className="bg-background w-full flex-1 rounded-[46px] overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                <BlockNoteView editor={editor} theme={darkRedTheme} />
              </div>
            </ScrollArea>
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
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsSaved(false);
                  }}
                />
                <Tooltip>
                  <TooltipTrigger>
                    {isSaved ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-yellow-500 shrink-0" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSaved ? "All changes saved" : "Unsaved changes"}
                  </TooltipContent>
                </Tooltip>
              </div>
              <input
                type="text"
                placeholder="Subtitle"
                className="text-muted-foreground text-xl font-semibold tracking-tight bg-transparent border-none outline-none"
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                  setIsSaved(false);
                }}
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
                  value={tags}
                  onValueChange={(newTags) => {
                    setTags(newTags);
                    setIsSaved(false);
                  }}
                  editable
                  addOnPaste
                  className="mt-4 w-full"
                >
                  <TagsInputList className="border-0 focus-within:ring-0 gap-3 w-full">
                    {tags.map((tag) => (
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
                <Button
                  variant={"secondary"}
                  className="w-full gap-2"
                  onClick={handleSave}
                >
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
                    onClick={() => setShowDeleteDialog(true)}
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
              This action cannot be undone. This will permanently delete your
              story "{title || "Untitled Story"}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
