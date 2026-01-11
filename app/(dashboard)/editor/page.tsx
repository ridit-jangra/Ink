"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { EditorComponent } from "@/components/editor-component";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book } from "lucide-react";
import { useState, useEffect } from "react";
import { Story } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Storage } from "@/lib/storage";

export default function EditorPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const storyId = searchParams.get("id");

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (storyId && stories.length > 0) {
      const story = stories.find((s) => s.id === storyId);
      if (story) {
        setCurrentStory(story);
      }
    } else {
      setCurrentStory(null);
    }
  }, [storyId, stories]);

  const loadStories = () => {
    try {
      const loadedStories = Storage.getItem<Story[]>("stories") || [];
      loadedStories.sort((a, b) => b.updatedAt - a.updatedAt);
      setStories(loadedStories);
    } catch (error) {
      console.log("No stories found or error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = (story: Story) => {
    try {
      const existingStories = Storage.getItem<Story[]>("stories") || [];
      const storyIndex = existingStories.findIndex((s) => s.id === story.id);

      if (storyIndex >= 0) {
        existingStories[storyIndex] = story;
      } else {
        existingStories.push(story);
      }

      Storage.setItem("stories", existingStories);
      loadStories();
      router.push(`/editor?id=${story.id}`);
    } catch (error) {
      console.error("Error saving story:", error);
    }
  };

  const handleDeleteStory = (id: string) => {
    try {
      const existingStories = Storage.getItem<Story[]>("stories") || [];
      const filteredStories = existingStories.filter((s) => s.id !== id);
      Storage.setItem("stories", filteredStories);
      loadStories();
      router.push("/");
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const handleNewStory = () => {
    router.push("/editor");
  };

  const handleSelectStory = (story: Story) => {
    router.push(`/editor?id=${story.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        stories={stories}
        onNewStory={handleNewStory}
        currentStoryId={currentStory?.id || null}
        onSelectStory={handleSelectStory}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span className="font-semibold">Story Editor</span>
          </div>
        </header>
        <EditorComponent
          currentStory={currentStory}
          onSave={handleSaveStory}
          onDelete={handleDeleteStory}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
