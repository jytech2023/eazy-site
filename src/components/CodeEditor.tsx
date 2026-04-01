"use client";

import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, indentWithTab, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";

// Language support loaded on demand
async function getLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "html":
      return (await import("@codemirror/lang-html")).html();
    case "css":
      return (await import("@codemirror/lang-css")).css();
    case "js":
    case "jsx":
      return (await import("@codemirror/lang-javascript")).javascript({ jsx: true });
    case "ts":
    case "tsx":
      return (await import("@codemirror/lang-javascript")).javascript({ jsx: true, typescript: true });
    case "json":
      return (await import("@codemirror/lang-json")).json();
    default:
      return (await import("@codemirror/lang-javascript")).javascript();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LangPromise = Promise<any>;

// Inner component that manages a single CodeMirror instance for one file
function CodeEditorInner({
  value,
  onChange,
  langPromise,
}: {
  value: string;
  onChange: (value: string) => void;
  langPromise: LangPromise;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isLocalUpdate = useRef(false);

  // Create editor on mount, destroy on unmount
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const langCompartment = new Compartment();

    // Start with no language, then load it async
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        isLocalUpdate.current = true;
        onChangeRef.current(update.state.doc.toString());
        requestAnimationFrame(() => { isLocalUpdate.current = false; });
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        foldGutter(),
        history(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,
        langCompartment.of([]),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        updateListener,
        EditorView.theme({
          "&": { height: "100%", fontSize: "13px" },
          ".cm-scroller": { overflow: "auto", fontFamily: "var(--font-geist-mono), monospace" },
          ".cm-gutters": { borderRight: "1px solid #333" },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    // Load language extension async
    langPromise.then((lang) => {
      if (cancelled || !viewRef.current) return;
      viewRef.current.dispatch({
        effects: langCompartment.reconfigure(lang),
      });
    });

    return () => {
      cancelled = true;
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Sync external value changes (AI updates, not user typing)
  useEffect(() => {
    const view = viewRef.current;
    if (!view || isLocalUpdate.current) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={containerRef} className="h-full w-full" />;
}

// Outer component that forces remount when filename changes
export default function CodeEditor({
  filename,
  value,
  onChange,
}: {
  filename: string;
  value: string;
  onChange: (value: string) => void;
}) {
  // Use filename as key to force full remount when switching files
  // This avoids stale state issues between CodeMirror instances
  const langPromiseRef = useRef<Map<string, LangPromise>>(new Map());

  // Cache language promises to avoid re-importing
  if (!langPromiseRef.current.has(filename)) {
    langPromiseRef.current.set(filename, getLanguage(filename));
  }

  return (
    <CodeEditorInner
      key={filename}
      value={value}
      onChange={onChange}
      langPromise={langPromiseRef.current.get(filename)!}
    />
  );
}
