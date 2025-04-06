import { Mark, mergeAttributes } from "@tiptap/core";

export interface FontSizeOptions {
  types: string[];
  defaultSize: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

/**
 * Custom FontSize Mark Extension (adapted for Tiptap v3)
 */
export const FontSize = Mark.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"], // Apply to textStyle marks if they exist
      defaultSize: null, // Default to no specific size
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: this.options.defaultSize,
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }

          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-size",
        // Potentially get attribute from existing textStyle mark if needed
        // getAttrs: value => {
        //   if (typeof value === 'string') {
        //     return value.replace(/['"]+/g, '');
        //   }
        //   return null;
        // },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Render as a simple span with the style attribute
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, { fontSize }) // Set our custom mark
            .run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          // Remove our custom mark, potentially keeping other textStyle attributes
          return (
            chain()
              .setMark(this.name, { fontSize: null }) // Set size to null/default
              // Alternatively, unset the mark completely if desired:
              // .unsetMark(this.name, { extendEmptyMarkRange: true })
              .run()
          );
        },
    };
  },
});

export default FontSize;
