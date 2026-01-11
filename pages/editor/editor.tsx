"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";
import Image from "next/image";
import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Upload,
} from "lucide-react";

const theme = {
  heading: {
    h1: "text-4xl md:text-5xl font-medium tracking-tight mb-8 mt-12",
    h2: "text-3xl md:text-4xl font-medium tracking-tight mb-6 mt-10 pt-8 border-t border-muted/50",
    h3: "text-2xl md:text-3xl font-medium tracking-tight mb-6 mt-8",
  },
  text: {
    default: "leading-relaxed",
    bold: "font-black",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
    code: "relative rounded bg-muted/80 px-[0.3em] py-[0.2em] font-mono text-sm border",
  },
  paragraph: "leading-[1.8] text-lg mb-8 [&:not(:first-child)]:mt-8",
  quote:
    "mt-12 border-l-[4px] pl-8 italic text-muted-foreground bg-muted/30 py-6 rounded-r-lg mb-12",
  list: {
    ul: "my-8 ml-8 list-disc space-y-3 [&>li]:leading-relaxed",
    ol: "my-8 ml-8 list-decimal space-y-3 [&>li]:leading-relaxed",
    listitem: "text-lg",
  },
  code: "relative rounded-xl bg-muted/50 px-6 py-5 font-mono text-sm my-8 overflow-x-auto border border-muted/50",
};

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (tag: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const toolButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => formatHeading("h1"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => formatHeading("h2"),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => formatHeading("h3"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    },
  ];

  return (
    <div className="absolute -left-5 top-[30%] flex flex-col bg-zinc-100 w-min px-2 text-black rounded-full flex-wrap gap-2 shrink-0 border-b py-4">
      {toolButtons.map((tool) => (
        <Tooltip key={tool.label}>
          <TooltipTrigger>
            <Button variant={"ghost"} className="p-2" onClick={tool.action}>
              <tool.icon
                style={{
                  width: "22px",
                  height: "22px",
                }}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            <p>{tool.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export default function Editor() {
  const [tricks, setTricks] = useState<string[]>([]);

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
  };

  return (
    <div className="flex w-full bg-background text-foreground gap-8 p-4 h-screen px-8">
      <div className="relative flex flex-col bg-[#171717] w-[65%] rounded-[46px] p-8 px-16">
        <div className="flex flex-col gap-6 shrink-0 border-b pb-8">
          <input
            type="text"
            placeholder="Title"
            className="scroll-m-20 text-4xl font-extrabold tracking-tight bg-transparent border-none outline-none"
            defaultValue="Too Perfect"
          />
          <input
            type="text"
            placeholder="Subtitle"
            className="text-muted-foreground text-xl font-semibold tracking-tight bg-transparent border-none outline-none"
            defaultValue="A future which is too perfect."
          />
        </div>

        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="bg-background w-full flex-1 mt-6 rounded-[46px] overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="relative p-8 h-full max-w-4xl">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="outline-none text-lg leading-[1.8] h-full min-h-full"
                      spellCheck={false}
                    />
                  }
                  placeholder={
                    <div className="absolute top-8 left-8 text-muted-foreground pointer-events-none text-lg font-medium">
                      Start writing...
                    </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              </div>
            </ScrollArea>
          </div>
        </LexicalComposer>
      </div>

      <div className="flex flex-col w-[35%] justify-between py-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-lg">Cover Image</p>
            <div className="relative group rounded-4xl overflow-hidden">
              <Image
                src={"/assets/cover-image.png"}
                alt="cover-image"
                width={650}
                height={500}
                className="rounded-4xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {}}
                >
                  <Upload className="h-4 w-4" />
                  Change Image
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 relative">
            <div className="border-2 rounded-4xl w-full h-full p-2">
              <p className="absolute -top-3 left-3.5 bg-background w-18 text-center text-lg font-semibold">
                Tags
              </p>
              <TagsInput
                value={tricks}
                onValueChange={setTricks}
                editable
                addOnPaste
                className="mt-4 w-full"
              >
                <TagsInputList className="border-0 focus-within:ring-0 gap-3 w-full">
                  {tricks.map((trick) => (
                    <TagsInputItem
                      key={trick}
                      value={trick}
                      className="text-[16px] bg-accent/40 px-4 py-2 rounded-full"
                    >
                      {trick}
                    </TagsInputItem>
                  ))}
                  <TagsInputInput
                    placeholder="Add tag..."
                    className="text-lg"
                  />
                </TagsInputList>
              </TagsInput>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Button variant={"outline"} className="w-full text-lg">
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Story</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
