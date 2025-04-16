import React from "react";
import { DEFAULT_SNAP_SETTINGS } from "./SnappingUtils";

interface SnappingSettingsPopupProps {
  settings: typeof DEFAULT_SNAP_SETTINGS;
  onSettingsChange: (settings: typeof DEFAULT_SNAP_SETTINGS) => void;
  isVisible: boolean;
}

/**
 * Popup-Komponente für Snapping-Einstellungen
 */
export const SnappingSettingsPopup: React.FC<SnappingSettingsPopupProps> = ({
  settings,
  onSettingsChange,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Handler für die Änderung der Einstellungen
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      onSettingsChange({ ...settings, threshold: value });
    }
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 5 && value <= 50) {
      onSettingsChange({ ...settings, gridSize: value });
    }
  };

  const handleCenterSnappingToggle = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSettingsChange({ ...settings, enableCenter: e.target.checked });
  };

  const handleEdgeSnappingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, enableEdges: e.target.checked });
  };

  const handleGridSnappingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, enableGrid: e.target.checked });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex flex-col gap-3 absolute right-4 top-20 z-10"
      style={{ width: "300px" }}
    >
      <div className="font-semibold text-sm text-gray-700 mb-1">
        Snapping-Einstellungen
      </div>

      {/* Schwellenwert */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">
          Snapping-Schwellenwert (px)
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={settings.threshold}
          onChange={handleThresholdChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-500 text-right">
          {settings.threshold}px
        </div>
      </div>

      {/* Trennlinie */}
      <div className="border-t border-gray-200 my-1"></div>

      {/* Mittelpunkt-Snapping */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-700">Mittelpunkt-Snapping</label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.enableCenter}
            onChange={handleCenterSnappingToggle}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Kanten-Snapping */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-700">Kanten-Snapping</label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.enableEdges}
            onChange={handleEdgeSnappingToggle}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Raster-Snapping */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-700">Raster-Snapping</label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.enableGrid}
            onChange={handleGridSnappingToggle}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Rastergröße (nur anzeigen, wenn Raster-Snapping aktiviert ist) */}
      {settings.enableGrid && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Rastergröße (px)
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={settings.gridSize}
            onChange={handleGridSizeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 text-right">
            {settings.gridSize}px
          </div>
        </div>
      )}
    </div>
  );
};
