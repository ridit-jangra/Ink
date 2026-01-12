"use client";

import { Book } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Story } from "@/lib/types";

export function NavStories({
  stories,
  currentStoryId,
  onSelectStory,
}: {
  stories: Story[];
  currentStoryId: string | null;
  onSelectStory: (story: Story) => void;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Stories</SidebarGroupLabel>
      <SidebarMenu>
        {stories.slice(0, 10).map((story) => (
          <SidebarMenuItem key={story.id}>
            <SidebarMenuButton
              onClick={() => onSelectStory(story)}
              isActive={currentStoryId === story.id}
            >
              <Book className="h-4 w-4" />
              <span className="truncate">{story.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
