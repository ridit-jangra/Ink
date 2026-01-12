"use client";

import { Book, MoreVertical, Trash2, Edit, Calendar, Tag } from "lucide-react";
import { Story } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

export function StoriesList({
  stories,
  onSelectStory,
  onDeleteStory,
}: {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  const handleDelete = () => {
    if (storyToDelete && onDeleteStory) {
      onDeleteStory(storyToDelete.id);
      toast.success("Story deleted", {
        description: `"${storyToDelete.title}" has been deleted.`,
      });
      setShowDeleteDialog(false);
      setStoryToDelete(null);
    }
  };

  const confirmDelete = (story: Story, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStoryToDelete(story);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="p-8 text-foreground ">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Stories
          </h1>
          <p className="text-muted-foreground text-lg">
            {stories.length === 0
              ? "Start your creative journey"
              : `${stories.length} ${
                  stories.length === 1 ? "story" : "stories"
                } in your collection`}
          </p>
        </div>

        {stories.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-6">
                <Book className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No stories yet</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Create your first story and start writing your masterpiece
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <ContextMenu key={story.id}>
                <ContextMenuTrigger>
                  <Card
                    className="group py-0 pb-6 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full flex flex-col"
                    onClick={() => onSelectStory(story)}
                  >
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {story.coverImage ? (
                        <Image src={story.coverImage} alt={story.title} fill />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                          <Book className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onSelectStory(story)}
                            >
                              <Edit />
                              Edit Story
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => confirmDelete(story, e as any)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 />
                              Delete Story
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <CardHeader className="pb-0">
                      <CardTitle className="text-2xl line-clamp-1 group-hover:text-primary transition-colors">
                        {story.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-base">
                        {story.subtitle || "No description"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {story.tags && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-accent/40 hover:bg-accent/60 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {story.tags.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              +{story.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="text-sm text-muted-foreground border-t pt-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Updated {new Date(story.updatedAt).toLocaleDateString()}
                      </span>
                      {story.sheets && story.sheets.length > 1 && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            <Book className="h-4 w-4" />
                            {story.sheets.length} sheets
                          </span>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onSelectStory(story)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Story
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => confirmDelete(story)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Story
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{storyToDelete?.title}"? This
              action cannot be undone and all sheets will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Story
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
