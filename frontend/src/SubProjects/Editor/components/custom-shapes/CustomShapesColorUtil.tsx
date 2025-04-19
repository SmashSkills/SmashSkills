/**
 * Wandelt einen Farbwert (tldraw-Farbname oder Hex-Code) in einen Hex-Code um.
 * @param colorInput - Der Farbwert (z.B. 'blue', '#ff0000').
 * @returns Der Hex-Code oder ein Fallback (schwarz).
 */
const resolveColorToHex = (colorInput: string): string => {
  // Prüfe, ob es bereits ein Hex-Code ist
  if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
    return colorInput.toUpperCase();
  }

  // Standard tldraw Farben in Hex umwandeln (Beispiele)
  // Diese Liste kann erweitert werden, falls tldraw-Namen weiterhin unterstützt werden sollen.
  // Aktuell verlassen wir uns aber primär auf Hex-Codes vom Picker.
  switch (colorInput) {
    case "black":
      return "#1E1E1E"; // tldraw schwarz ist nicht ganz #000000
    case "grey":
      return "#808080";
    case "white":
      return "#FFFFFF";
    case "red":
      return "#DC2626";
    case "light-red":
      return "#FF8787";
    case "orange":
      return "#FF5722";
    case "yellow":
      return "#F59E0B";
    case "green":
      return "#16A34A";
    case "light-green":
      return "#4ADE80";
    case "blue":
      return "#2563EB";
    case "light-blue":
      return "#38BDF8";
    case "violet":
      return "#8B5CF6";
    case "light-violet":
      return "#A28ADD";
    // Füge hier bei Bedarf weitere tldraw-Farben hinzu
    default:
      // Wenn es kein bekannter Name und kein Hex ist, Fallback
      console.warn(`Unbekannter Farbwert: ${colorInput}, verwende Schwarz.`);
      return "#000000";
  }
};

/**
 * Berechnet die Stroke- und Fill-Farben für ein benutzerdefiniertes Shape.
 * Akzeptiert Hex-Codes direkt.
 *
 * @param colorProp - Der Farbwert aus den Shape-Props (kann Hex oder tldraw-Name sein).
 * @param fillProp - Der Füllstil ('none', 'solid' für halbtransparent, 'semi' für voll).
 * @returns Ein Objekt mit { stroke: string; fill: string }.
 */
export const getShapeColors = (
  colorProp: string,
  fillProp: string
): { stroke: string; fill: string } => {
  const resolvedHexColor = resolveColorToHex(colorProp);

  const strokeColor = resolvedHexColor;
  let fillColor = "none";

  switch (fillProp) {
    case "none":
      fillColor = "none";
      break;
    case "solid": // solid -> halbtransparent
      // Füge Alpha-Kanal für 50% Transparenz hinzu (80 in Hex)
      fillColor = `${resolvedHexColor}80`;
      break;
    case "semi": // semi -> voll gefüllt
      fillColor = resolvedHexColor;
      break;
    default:
      fillColor = "none"; // Fallback
  }

  return { stroke: strokeColor, fill: fillColor };
};
