import { BaseBoxShapeUtil, TLBaseShape, TLCustomShapeUtil } from '@tldraw/tldraw'

// 1. Definieren des Shape-Typs (Props)
export interface LayerDividerShapeProps {
  name: string // z.B. "Layer 1"
  w: number // Feste kleine Breite/Höhe, da unsichtbar
  h: number
}

// 2. Definieren des Shape-Interfaces
export type LayerDividerShape = TLBaseShape<'layer-divider', LayerDividerShapeProps>

// 3. Erstellen der Shape Util Klasse
export class LayerDividerShapeUtil extends BaseBoxShapeUtil<LayerDividerShape> implements TLCustomShapeUtil<LayerDividerShape> {
  static override type = 'layer-divider' as const

  // Standard-Props für neue Divider
  override getDefaultProps(): LayerDividerShapeProps {
    return {
      name: 'Neuer Layer',
      w: 1, // Minimale Größe, nicht relevant für die Darstellung
      h: 1,
    }
  }

  // Diese Komponente rendert NICHTS auf dem Canvas
  override component(shape: LayerDividerShape): null {
    return null // Absolut unsichtbar
  }

  // Der Indikator (Auswahlrahmen) rendert ebenfalls NICHTS
  override indicator(shape: LayerDividerShape): null {
    return null // Nicht auswählbar/sichtbar bei Auswahl
  }

  // Wir wollen nicht, dass man diese Shape versehentlich erstellt
  override canEdit = () => false
  override canBind = () => false
  override canClone = () => false
  override canReceiveNewText = () => false
  override canRotate = () => false
  override isAspectRatioLocked = () => true
  override isStateful = false
  // WICHTIG: Verhindert, dass die Shape versehentlich ausgewählt/verschoben wird
  override isInterceptable = false
  override hideSelectionBoundsFg = () => true
  override hideSelectionBoundsBg = () => true
  override hideResizeHandles = () => true
  override hideRotateHandle = () => true
  override hideHoverIndicator = () => true
} 