"use client";

import { Book } from "lucide-react";
import { Story } from "@/lib/types";

export function StoriesList({
  stories,
  onSelectStory,
}: {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}) {
  return (
    <div className="p-8 text-foreground">
      <h1 className="text-4xl font-bold mb-8">Your Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectStory(story)}
          >
            <h2 className="text-2xl font-bold mb-2">{story.title}</h2>
            <p className="text-muted-foreground mb-4">{story.subtitle}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-accent/40 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Updated: {new Date(story.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {stories.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Book className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No stories yet. Create your first story!</p>
          </div>
        )}
      </div>
    </div>
  );
}
