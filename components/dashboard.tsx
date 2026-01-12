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
import { Story, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Storage } from "@/lib/storage";
import { AuthService } from "@/lib/authService";

export default function Dashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle auth check and user fetch
  useEffect(() => {
    if (!isClient) return;

    const initializeAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    };

    initializeAuth();
  }, [isClient, router]);

  useEffect(() => {
    if (!isClient || !user) return;
    loadStories();
  }, [isClient, user]);

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

  if (!isClient || loading || !user) {
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
        user={user}
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
