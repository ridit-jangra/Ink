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

export function AppSidebar({
  stories,
  onNewStory,
  currentStoryId,
  onSelectStory,
}: {
  stories: Story[];
  onNewStory: () => void;
  currentStoryId: string | null;
  onSelectStory?: (story: Story) => void;
}) {
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
                <a href="/">
                  <Book className="h-4 w-4" />
                  <span>View Stories</span>
                </a>
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
