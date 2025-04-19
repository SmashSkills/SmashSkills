import React from 'react';
import {
  TLBaseShape,
  ShapeUtil,
  Rectangle2d,
  SVGContainer,
  toDomPrecision,
  type TLResizeInfo,
  type TLShapePartial,
} from "@tldraw/tldraw";

// Definiere die Props für das Bild-Shape
export interface UserImportedImageProps {
  w: number;
  h: number;
  url: string; // Data URL des Bildes
  assetId?: string; // Optional: Für späteres Asset-Management
}

// Definiere den Shape-Typ
export type UserImportedImageShape = TLBaseShape<
  "user-image",
  UserImportedImageProps
>;

// Die ShapeUtil-Klasse für importierte Bilder
export class UserImportedImageUtil extends ShapeUtil<UserImportedImageShape> {
  static override type = "user-image" as const;

  override getDefaultProps(): UserImportedImageProps {
    return {
      w: 100,
      h: 100,
      url: "", // Leerer String als Default
    };
  }

  override getGeometry(shape: UserImportedImageShape): Rectangle2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true, // Wichtig für die Auswahl
    });
  }

  override component(shape: UserImportedImageShape): React.ReactElement {
    const { w, h, url } = shape.props;
    const width = toDomPrecision(w);
    const height = toDomPrecision(h);

    // Verhindere Rendering, wenn URL fehlt
    if (!url) {
      return (
        <SVGContainer id={shape.id}>
          <rect width={width} height={height} fill="#efefef" />
          <text x="5" y="15" fontSize="10" fill="#666">
            Fehlende URL
          </text>
        </SVGContainer>
      );
    }

    return (
      <SVGContainer id={shape.id}>
        <image
          href={url}
          width={width}
          height={height}
          preserveAspectRatio="none"
        />
      </SVGContainer>
    );
  }

  override indicator(shape: UserImportedImageShape): React.ReactElement {
    // Zeichne ein einfaches Rechteck, das exakt der Geometrie entspricht
    return (
      <rect
        width={toDomPrecision(shape.props.w)}
        height={toDomPrecision(shape.props.h)}
        strokeWidth={1}
        stroke="var(--color-selected)"
        fill="none"
      />
    );
  }

  // Resize-Handler ohne expliziten Typ
  override onResize = (
    shape: UserImportedImageShape,
    info: TLResizeInfo<UserImportedImageShape>
  ): TLShapePartial<UserImportedImageShape> | void => {
    // Typ-Check für Sicherheit
    if (shape.type !== UserImportedImageUtil.type) return;

    const { scaleX, scaleY } = info;

    const newWidth = Math.max(1, shape.props.w * scaleX);
    const newHeight = Math.max(1, shape.props.h * scaleY);

    if (shape.props.w === newWidth && shape.props.h === newHeight) {
        return;
    }

    return {
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        w: newWidth,
        h: newHeight,
      },
    };
  };
}
