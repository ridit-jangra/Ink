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
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";
import { useState, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import { Upload, Save, Trash2 } from "lucide-react";
import { Story } from "@/lib/types";

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
  const editor = useCreateBlockNote({ animations: true });

  useEffect(() => {
    if (currentStory) {
      setTitle(currentStory.title);
      setSubtitle(currentStory.subtitle);
      setTags(currentStory.tags);
      if (currentStory.content) {
        editor.replaceBlocks(editor.document, currentStory.content);
      }
    } else {
      setTitle("");
      setSubtitle("");
      setTags([]);
      editor.replaceBlocks(editor.document, []);
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
  };

  const handleDelete = () => {
    if (
      currentStory &&
      confirm("Are you sure you want to delete this story?")
    ) {
      onDelete(currentStory.id);
    }
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

  return (
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
            <input
              type="text"
              placeholder="Title"
              className="scroll-m-20 text-4xl font-extrabold tracking-tight bg-transparent border-none outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Subtitle"
              className="text-muted-foreground text-xl font-semibold tracking-tight bg-transparent border-none outline-none"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-lg">Cover Image</p>
            <div className="relative group rounded-4xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
              <div className="text-muted-foreground">Cover Image</div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => alert("Image upload would go here")}
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
                onValueChange={setTags}
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
                className="w-full text-lg gap-2"
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
                  className="w-full text-lg gap-2"
                  onClick={handleDelete}
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
  );
}
