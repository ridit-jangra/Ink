"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { StoriesList } from "@/components/stories-list";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book } from "lucide-react";
import { useState, useEffect } from "react";
import { Story } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Storage } from "@/lib/storage";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStories();
  }, []);

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
        currentStoryId={null}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span className="font-semibold">Story Editor</span>
          </div>
        </header>
        <StoriesList stories={stories} onSelectStory={handleSelectStory} />
      </SidebarInset>
    </SidebarProvider>
  );
}
