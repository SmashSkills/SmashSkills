import React from "react";
import { Editor } from "@tldraw/tldraw";
import PencilSettingsPopup from "./PencilSettingsPopup";
import ShapeSettingsPopup from "./ShapeSettingsPopup";
import TextSettingsPopup from "./TextSettingsPopup";
import LayerSettingsPopup from "./LayerSettingsPopup";
import { motion, AnimatePresence } from "framer-motion";

export type SettingsType = "draw" | "shape" | "text" | "layer";

interface SettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
  className?: string;
  style?: React.CSSProperties;
  initialActiveTab?: SettingsType;
  type: SettingsType | null;
}

/**
 * Seitenleiste für Einstellungen, die auf der rechten Bildschirmseite angezeigt wird.
 * Enthält eine Tab-Navigation für die verschiedenen Einstellungstypen.
 * Passt sich dynamisch an den Inhalt an und ermöglicht das Scrollen, wenn der Inhalt
 * größer ist als der sichtbare Bereich.
 */
const SettingsPopup: React.FC<SettingsPopupProps> = ({
  editor,
  isVisible,
  className = "",
  style = {},
  type,
}) => {
  // Verwende immer "draw" als Standardwert, damit die Stift-Einstellungen
  // immer zuerst angezeigt werden
  const activeTab = type || "draw";

  // Animation für das äußere Container
  const containerVariants = {
    hidden: { opacity: 0, x: 20, transition: { duration: 0.3 } },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Animation für die Tab-Inhalte
  const contentVariants = {
    hidden: { opacity: 0, y: 10, transition: { duration: 0.15 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  if (!isVisible || !type) return null;

  return (
    <motion.div
      className={`bg-white w-xs flex flex-col ${className}`}
      style={{
        ...style,
        maxHeight: "100vh",
        height: "100%",
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Scrollbarer Inhaltsbereich */}
      <motion.div className="overflow-y-auto flex-1 max-h-full" layout>
        <AnimatePresence mode="wait">
          {activeTab === "draw" && (
            <motion.div
              key="draw"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PencilSettingsPopup editor={editor} isVisible={true} />
            </motion.div>
          )}
          {activeTab === "shape" && (
            <motion.div
              key="shape"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ShapeSettingsPopup editor={editor} isVisible={true} />
            </motion.div>
          )}
          {activeTab === "text" && (
            <motion.div
              key="text"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TextSettingsPopup editor={editor} isVisible={true} />
            </motion.div>
          )}
          {activeTab === "layer" && (
            <motion.div
              key="layer"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <LayerSettingsPopup editor={editor} isVisible={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPopup;
