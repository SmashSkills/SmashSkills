import React from "react";
//Components
import LayoutExplanation from "../layouts/page_layouts/explanation";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import CardSimple from "../components/ui_elements/cards/card_simple";
import TagSingleStringInfo from "../components/ui_elements/tags/tag_single_string_info";
import LayoutBannerLowerHook from "../layouts/banner/lower_hook_banner";
import BackgroundCurvedTransition from "../components/visuals/background_curved_transition";
//Assets
import { FaGraduationCap } from "react-icons/fa";
import { AiOutlineFolderAdd } from "react-icons/ai";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { CiClock1 } from "react-icons/ci";

interface CardData {
  id: number;
  title: string;
  text: string;
  icon: React.ReactNode;
}

const items: CardData[] = [
  {
    id: 1,
    title: "Lehrplan auswählen",
    text: "Wähle mühelos den passenden Lehrplan für dein Bundesland aus – ganz einfach per Filterfunktion. Unsere Lehrpläne basieren auf offiziellen Vorgaben, sodass du sicherstellen kannst, dass alle Inhalte den Bildungsstandards deines Bundeslandes zu 100 % entsprechen.",
    icon: <FaGraduationCap size={30} className="text-primary" />,
  },
  {
    id: 2,
    title: "Aufgaben einfach erstellen",
    text: "Erstelle deine Aufgaben mühelos per Drag-and-Drop im Baukasten-Prinzip. Struktur, Inhalte und Layout lassen sich individuell anpassen – so sparst du wertvolle Zeit und kannst dich auf das Wesentliche konzentrieren: den Unterricht.",
    icon: <AiOutlineFolderAdd size={30} className="text-primary" />,
  },
  {
    id: 3,
    title: "Aufgaben herunterladen",
    text: "Mit der Download-Funktion hast du immer die passenden Aufgaben dabei. Lade sie als PDF herunter, druck sie aus und nimm sie einfach mit in den Unterricht!",
    icon: <IoCloudDownloadOutline size={30} className="text-primary" />,
  },
  {
    id: 4,
    title: "Gemeinsam besser unterrichten",
    text: "SIn der Online-Community kannst du Aufgaben mit anderen Lehrkräften teilen oder dir Inspiration und fertige Materialien holen. Einfach kopieren, anpassen und loslegen – ganz ohne Extra-Aufwand.",
    icon: <FaUserFriends size={30} className="text-primary" />,
  },
  {
    id: 5,
    title: "Mehr Freiraum für dich",
    text: "Gestalte deinen Unterricht noch kreativer, entwickle bessere Aufgaben oder genieße einfach mehr Freizeit – mit der gewonnenen Zeit entscheidest du, was für dich zählt.",
    icon: <CiClock1 size={30} className="text-primary" />,
  },
];

const ToUse: React.FC = () => {
  return (
    <div className="">
      <div className="pb-20 px-50">
        <LayoutExplanation items={items} />
      </div>
      <BackgroundCurvedTransition textColorClassName="text-background-dark-white" />
      <div className="flex bg-background-dark-white flex-col items-center justify-center gap-20 py-20">
        <div className="flex flex-col items-center px-50">
          <div className="w-200 text-center mb-20">
            <div className="flex flex-col mb-10 items-center justify-center">
              <TagSingleStringInfo
                text="Jetzt starten"
                classNameWrapper="mb-3"
              />
              <h1 className="text-6xl text-secondary mb-5">
                Lehrpläne durchsuchen
              </h1>
              <p className="text-gray-500 text-xl">
                Finde den passenden Lehrplan für dein Bundesland – schnell,
                übersichtlich und lehrplankonform. Mit der integrierten
                Filterfunktion kannst du gezielt nach Fächern, Jahrgangsstufen
                und Bildungsgängen suchen. So behältst du den Überblick und
                planst deinen Unterricht auf Basis aktueller Vorgaben.
              </p>
            </div>
            <ButtonPrimary title="Weiter zu den Lehrplänen" />
          </div>

          <div className="flex gap-20">
            <CardSimple
              title="Aufgaben erstellen"
              text="Erstelle individuelle Aufgaben mit nur wenigen Klicks – flexibel, interaktiv und auf deine Klasse zugeschnitten. Mit dem intuitiven Baukasten-System strukturierst du Übungen per Drag-and-Drop und passt sie schnell an deinen Unterricht an."
              titleButton="Zur Aufgabenerstellung"
              icon={<AiOutlineFolderAdd size={30} className="text-primary" />}
              classNameTitle="text-2xl text-secondary"
              classNameWrapper="bg-white shadow-md"
              classNameText="mb-5"
            />
            <CardSimple
              title="Inhalte teilen"
              text="Teile deine erstellten Aufgaben mit Kollegen oder lass dich von den Ideen anderer inspirieren. In der Online-Community kannst du Materialien austauschen, kommentieren und gemeinsam weiterentwickeln – für mehr Zusammenarbeit und weniger Doppelarbeit."
              titleButton="Zur Online Community"
              classNameTitle="text-2xl text-secondary"
              classNameWrapper="bg-white shadow-md"
              classNameText="mb-5"
              icon={<FaUserFriends size={30} className="text-primary" />}
            />
          </div>
        </div>
      </div>
      <div className="flex py-20 px-50 bg-secondary justify-center">
        <LayoutBannerLowerHook
          title="Bereit, deinen Unterricht zu revolutionieren?"
          text="Starte jetzt mit SmashSkills und erlebe, wie einfach moderne Unterrichtsgestaltung sein kann."
          buttonTitle="Jetzt registrieren"
          classNameWrapper="flex flex-col items-center"
          classNameText=""
        />
      </div>
    </div>
  );
};

export default ToUse;
