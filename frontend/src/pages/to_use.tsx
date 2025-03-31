import React from "react";
import LayoutExplanation from "../layouts/page_layouts/explanation";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import CardSimple from "../components/ui_elements/cards/card_simple";

interface CardData {
  id: number;
  title: string;
  text: string;
}

const items: CardData[] = [
  {
    id: 1,
    title: "Lehrplan auswählen",
    text: "Wähle mühelos den passenden Lehrplan für dein Bundesland aus – ganz einfach per Filterfunktion. Unsere Lehrpläne basieren auf offiziellen Vorgaben, sodass du sicherstellen kannst, dass alle Inhalte den Bildungsstandards deines Bundeslandes zu 100 % entsprechen.",
  },
  {
    id: 2,
    title: "Aufgaben einfach erstellen",
    text: "Erstelle deine Aufgaben mühelos per Drag-and-Drop im Baukasten-Prinzip. Struktur, Inhalte und Layout lassen sich individuell anpassen – so sparst du wertvolle Zeit und kannst dich auf das Wesentliche konzentrieren: den Unterricht.",
  },
  {
    id: 3,
    title: "Aufgaben herunterladen",
    text: "Mit der Download-Funktion hast du immer die passenden Aufgaben dabei. Lade sie als PDF herunter, druck sie aus und nimm sie einfach mit in den Unterricht!",
  },
  {
    id: 4,
    title: "Gemeinsam besser unterrichten",
    text: "SIn der Online-Community kannst du Aufgaben mit anderen Lehrkräften teilen oder dir Inspiration und fertige Materialien holen. Einfach kopieren, anpassen und loslegen – ganz ohne Extra-Aufwand.",
  },
  {
    id: 5,
    title: "Mehr Freiraum für dich",
    text: "Gestalte deinen Unterricht noch kreativer, entwickle bessere Aufgaben oder genieße einfach mehr Freizeit – mit der gewonnenen Zeit entscheidest du, was für dich zählt.",
  },
];

const ToUse: React.FC = () => {
  return (
    <div className="py-20">
      <LayoutExplanation items={items} />

      <div className="flex flex-col items-center justify-center gap-20 pt-20">
        <div className="flex flex-col items-center justify-center gap-5">
          <h1 className="text-6xl">Lehrpläne durchsuchen</h1>
          <p className="text-gray-500 text-center">
            Finde den passenden Lehrplan für dein Bundesland – schnell,
            übersichtlich und lehrplankonform. Mit der integrierten
            Filterfunktion kannst du gezielt nach Fächern, Jahrgangsstufen und
            Bildungsgängen suchen. So behältst du den Überblick und planst
            deinen Unterricht auf Basis aktueller Vorgaben.
          </p>
          <ButtonPrimary title="Weiter zu den Lehrplänen" />
        </div>
        <div className="flex gap-100">
          <div className="flex flex-col items-center justify-center gap-5">
            <CardSimple
              title="Aufgaben erstellen"
              text="Erstelle individuelle Aufgaben mit nur wenigen Klicks – flexibel, interaktiv und auf deine Klasse zugeschnitten. Mit dem intuitiven Baukasten-System strukturierst du Übungen per Drag-and-Drop und passt sie schnell an deinen Unterricht an."
              titleButton="Zur Aufgabenerstellung"
              classNameTitle="text-2xl"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-5">
            <CardSimple
              title="Inhalte teilen"
              text="Teile deine erstellten Aufgaben mit Kollegen oder lass dich von den Ideen anderer inspirieren. In der Online-Community kannst du Materialien austauschen, kommentieren und gemeinsam weiterentwickeln – für mehr Zusammenarbeit und weniger Doppelarbeit."
              titleButton="Zur Online Community"
              classNameTitle="text-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToUse;
