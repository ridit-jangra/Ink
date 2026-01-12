"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { StoriesList } from "@/components/stories-list";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Story } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Storage } from "@/lib/storage";
import { AuthService } from "@/lib/authService";

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;

    let handlePopState: (() => void) | null = null;

    const checkAuth = async () => {
      try {
        const authenticated = AuthService.isAuthenticated();

        if (authenticated) {
          router.push("/dashboard");
        }
      } catch (error) {}
    };

    const timeoutId = setTimeout(() => {
      hasCheckedAuth.current = true;
      checkAuth();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (handlePopState) {
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, [router]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const loadedStories =
        (await Storage.getItem<Story[]>("stories", "stories")) || [];
      loadedStories.sort((a: Story, b: Story) => b.updatedAt - a.updatedAt);
      setStories(loadedStories);
    } catch (error) {
      console.log("No stories found or error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewStory = () => {
    router.replace("/editor");
  };

  const handleSelectStory = (story: Story) => {
    router.replace(`/editor?id=${story.id}`);
  };

  const handleDeleteStory = async (id: string) => {
    try {
      const existingStories =
        (await Storage.getItem<Story[]>("stories", "stories")) || [];
      const filteredStories = existingStories.filter((s: Story) => s.id !== id);
      await Storage.setItem("stories", "stories", filteredStories);
      loadStories();
      router.push("/");
    } catch (error) {
      console.error("Error deleting story:", error);
    }
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
        <StoriesList
          stories={stories}
          onSelectStory={handleSelectStory}
          onDeleteStory={handleDeleteStory}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
