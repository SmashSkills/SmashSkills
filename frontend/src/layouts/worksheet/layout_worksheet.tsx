import React, { forwardRef } from "react";
import { Stage, Layer, Rect } from "react-konva";

// DIN A4 Größe in Pixel (bei 96 DPI)
const DIN_A4_WIDTH = 794;
const DIN_A4_HEIGHT = 1123;

type LayoutWorksheetProps = Record<never, never>;

const LayoutWorksheet = forwardRef<HTMLDivElement, LayoutWorksheetProps>(
  (props, ref) => {
    return (
      <div className="flex justify-center items-center p-8 min-h-full overflow-auto">
        <div
          ref={ref}
          className="rounded-lg shadow-lg mb-8 sheet-container"
          style={{
            width: `${DIN_A4_WIDTH}px`,
            height: `${DIN_A4_HEIGHT}px`,
            minHeight: `${DIN_A4_HEIGHT}px`,
          }}
        >
          <Stage width={DIN_A4_WIDTH} height={DIN_A4_HEIGHT}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={DIN_A4_WIDTH}
                height={DIN_A4_HEIGHT}
                fill="white"
                cornerRadius={8}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    );
  }
);

LayoutWorksheet.displayName = "LayoutWorksheet";

export default LayoutWorksheet;
