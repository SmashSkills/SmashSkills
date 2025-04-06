import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontSize } from "./extensions/FontSize";

/**
 * Konfiguriert und liefert alle benötigten TipTap-Erweiterungen für den Worksheet-Editor (Tiptap v3)
 *
 * Dies zentralisiert die Extensions-Konfiguration und macht den Hauptcode übersichtlicher
 */
export const getEditorExtensions = () => {
  return [
    StarterKit.configure({}),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    Image.configure({}),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Highlight.configure({
      // multicolor: true, // Beispiel für v3
    }),
    CharacterCount.configure({
      // limit: 10000, // Beispiel für v3
      // mode: 'textSize', // Beispiel für v3
    }),
    TextStyle.configure({}),
    Color.configure({
      types: ["textStyle"],
    }),
    FontSize.configure({
      // Optional: Standardgröße konfigurieren
      // defaultSize: '16px',
    }),
  ];
};

export default getEditorExtensions;
