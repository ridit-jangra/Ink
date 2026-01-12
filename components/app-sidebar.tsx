"use client";

import { Plus, Book } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Story } from "@/lib/types";
import { NavStories } from "./nav-stories";
import { useRouter } from "next/navigation";

export function AppSidebar({
  stories,
  onNewStory,
  currentStoryId,
  onSelectStory,
}: {
  stories: Story[];
  onNewStory: () => void;
  currentStoryId: string | null;
  onSelectStory: (story: Story) => void;
}) {
  const router = useRouter();

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.replace("/dashboard");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onNewStory}>
                <Plus className="h-4 w-4" />
                <span>New Story</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <span onClick={handleNavigation}>
                  <Book className="h-4 w-4" />
                  <span>View Stories</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavStories
          stories={stories}
          currentStoryId={currentStoryId}
          onSelectStory={onSelectStory}
        />
      </SidebarContent>
    </Sidebar>
  );
}
