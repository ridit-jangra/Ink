"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { EditorComponent } from "@/components/editor-component";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Story, User } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Storage } from "@/lib/storage";
import { AuthService } from "@/lib/authService";

function EditorContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams()!;
  const storyId = searchParams.get("id");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Combined auth check and user fetch
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
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isClient, router]);

  // Load stories after auth is complete
  useEffect(() => {
    if (!isClient || !user) return;
    loadStories();
  }, [isClient, user]);

  useEffect(() => {
    if (storyId && stories?.length > 0) {
      const story = stories.find((s) => s.id === storyId);
      if (story) {
        if (
          !currentStory ||
          currentStory.id !== story.id ||
          currentStory.updatedAt !== story.updatedAt
        ) {
          setCurrentStory(story);
        }
      }
    } else if (!storyId && currentStory) {
      setCurrentStory(null);
    }
  }, [storyId, stories]);

  const loadStories = async () => {
    try {
      const loadedStories =
        (await Storage.getItem<Story[]>("stories", "stories")) || [];
      const typedStories: Story[] = loadedStories.sort(
        (a: Story, b: Story) => b.updatedAt - a.updatedAt
      );
      setStories(typedStories);
    } catch (error) {
      console.log("No stories found or error loading:", error);
      setStories([]);
    }
  };

  const handleSaveStory = async (story: Story) => {
    try {
      const existingStories =
        (await Storage.getItem<Story[]>("stories", "stories")) || [];
      const storyIndex = existingStories.findIndex(
        (s: Story) => s.id === story.id
      );

      if (storyIndex >= 0) {
        existingStories[storyIndex] = story;
      } else {
        existingStories.push(story);
      }

      await Storage.setItem("stories", "stories", existingStories);

      setStories(
        existingStories.sort((a: Story, b: Story) => b.updatedAt - a.updatedAt)
      );
      setCurrentStory(story);

      if (!storyId) {
        router.push(`/editor?id=${story.id}`);
      }
    } catch (error) {
      console.error("Error saving story:", error);
    }
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

  const handleNewStory = () => {
    router.replace("/editor");
  };

  const handleSelectStory = (story: Story) => {
    router.replace(`/editor?id=${story.id}`);
  };

  if (loading || !isClient || !user) {
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
        user={user}
      />
      <SidebarInset>
        <header className="flex min-h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span className="font-semibold">Story Editor</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto max-w-full">
          <EditorComponent
            currentStory={currentStory}
            onSave={handleSaveStory}
            onDelete={handleDeleteStory}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen ">
          <div>Loading editor...</div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
