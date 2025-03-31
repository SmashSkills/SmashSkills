import React from "react";
import LayoutExplanation from "../layouts/page_layouts/explanation";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";

interface CardData {
  id: number;
  title: string;
  text: string;
}

const items: CardData[] = [
  {
    id: 1,
    title: "Lehrplan auswählen",
    text: "Wähle ganz leicht aus einer Liste von Lehrplänen. Benutze den Filter um ",
  },
  {
    id: 2,
    title: "Card 2",
    text: "Dies ist die Beschreibung von Card 6. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1.",
  },
  {
    id: 3,
    title: "Card 3",
    text: "Dies ist die Beschreibung von Card 6. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1.",
  },
  {
    id: 4,
    title: "Card 4",
    text: "Dies ist die Beschreibung von Card 6. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1.",
  },
  {
    id: 5,
    title: "Card 5",
    text: "Dies ist die Beschreibung von Card 6. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1.",
  },
  {
    id: 6,
    title: "Card 6",
    text: "Dies ist die Beschreibung von Card 6. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1. Dies ist die Beschreibung von Card 1.",
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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim autem
            itaque, rerum eligendi ducimus tenetur. Repudiandae ex tempore ullam
            libero natus dolore recusandae quia! Fugit quidem ea facere quos
            nobis.
          </p>
          <ButtonPrimary title="Weiter zu den Lehrplänen" />
        </div>
        <div className="flex">
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-4xl">Aufgaben erstellen</h1>
            <p className="text-gray-500 text-center">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas
              id, quam ad nulla exercitationem laborum provident et earum
              tempora porro, qui saepe vel quos tempore, autem vero fugit sint
              dolores.
            </p>
            <ButtonPrimary title="Zur Aufgabenerstellung" />
          </div>
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-4xl">Inhalte teilen</h1>
            <p className="text-gray-500 text-center">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas
              id, quam ad nulla exercitationem laborum provident et earum
              tempora porro, qui saepe vel quos tempore, autem vero fugit sint
              dolores.
            </p>
            <ButtonPrimary title="Zur online Community" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToUse;
