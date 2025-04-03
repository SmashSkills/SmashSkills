import React, { useState } from "react";
import ButtonFilterDropdown from "../components/ui_elements/buttons/button_filter_dropdown";
import CardCurriculumShowcase from "../components/ui_elements/cards/card_curriculum_showcase";
import BackgroundCurvedTransition from "../components/visuals/background_curved_transition";
import { FaClock, FaMapMarkerAlt, FaUserGraduate } from "react-icons/fa";

const CurriculaNotRegistered: React.FC = () => {
  const labelMap = {
    subject: "Lernfach",
    state: "Bundesland",
    grade: "Klassenstufe",
  };

  const iconMap = {
    subject: FaUserGraduate,
    state: FaMapMarkerAlt,
    grade: FaClock,
  };
  const curricula = [
    {
      id: "1",
      title: "Geometrie",
      subject: "Mathematik",
      state: "Sachsen",
      grade: "1-2",
    },
    {
      id: "2",
      title: "Grammatik",
      subject: "Englisch",
      state: "Bayern",
      grade: "3-4",
    },
    {
      id: "3",
      title: "Mechanik",
      subject: "Physik",
      state: "Nordrhein-Westfalen",
      grade: "5-6",
    },
    {
      id: "4",
      title: "Stofflehre",
      subject: "Chemie",
      state: "Hessen",
      grade: "7-8",
    },
    {
      id: "5",
      title: "Zellen & Natur",
      subject: "Biologie",
      state: "Baden-Württemberg",
      grade: "9-10",
    },
    {
      id: "6",
      title: "Historische Epochen",
      subject: "Geschichte",
      state: "Rheinland-Pfalz",
      grade: "11-12",
    },
    {
      id: "7",
      title: "Erdkunde Basics",
      subject: "Erdkunde",
      state: "Schleswig-Holstein",
      grade: "1-2",
    },
    {
      id: "8",
      title: "Farben & Formen",
      subject: "Kunst",
      state: "Sachsen-Anhalt",
      grade: "3-4",
    },
    {
      id: "9",
      title: "Musikalische Früherziehung",
      subject: "Musik",
      state: "Thüringen",
      grade: "5-6",
    },
    {
      id: "10",
      title: "Algorithmen Einführung",
      subject: "Informatik",
      state: "Bremen",
      grade: "7-8",
    },
    {
      id: "11",
      title: "Sport & Bewegung",
      subject: "Sport",
      state: "Berlin",
      grade: "9-10",
    },
    {
      id: "12",
      title: "Philosophisches Denken",
      subject: "Philosophie",
      state: "Hamburg",
      grade: "11-12",
    },
  ];

  const toDetails = (curriculum: (typeof curricula)[number]) =>
    (["subject", "state", "grade"] as const).map((key) => {
      const Icon = iconMap[key];
      return {
        label: labelMap[key],
        content: curriculum[key],
        icon: <Icon className="text-primary" />,
      };
    });

  const studySubject = [
    "Mathematik",
    "Deutsch",
    "Englisch",
    "Geografie",
    "Politik",
    "Physik",
    "Chemie",
    "Biologie",
    "Geschichte",
    "Erdkunde",
    "Kunst",
    "Musik",
    "Informatik",
    "Sport",
    "Philosophie",
    "Literatur",
    "Wirtschaft",
    "Psychologie",
    "Religion",
    "Sozialkunde",
    "Technik",
    "Medien",
  ];

  const federalState = [
    "Sachsen",
    "Berlin",
    "Hamburg",
    "Nordrhein-Westfalen",
    "Bayern",
    "Hessen",
    "Rheinland-Pfalz",
    "Schleswig-Holstein",
    "Sachsen-Anhalt",
    "Thüringen",
    "Bremen",
    "Baden-Württemberg",
    "Mecklenburg-Vorpommern",
    "Saarland",
    "Niedersachsen",
    "Brandenburg",
  ];
  const gradeLevel = [
    "Klassenstufe 1-2",
    "Klassenstufe 03",
    "Klassenstufe 04",
    "Klassenstufe 05",
    "Klassenstufe 06",
    "Klassenstufe 07",
    "Klassenstufe 08",
    "Klassenstufe 09",
    "Klassenstufe 10",
  ];
  const [selectedStudySubject, setSelectedStudySubject] = useState<
    string | undefined
  >(undefined);
  const [selectedFederalState, setSelectedFederalState] = useState<
    string | undefined
  >(undefined);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<
    string | undefined
  >(undefined);
  const filteredCurricula = curricula.filter((item) => {
    const matchesSubject =
      !selectedStudySubject ||
      item.subject.toLowerCase() === selectedStudySubject.toLowerCase();
    const matchesState =
      !selectedFederalState ||
      item.state.toLowerCase() === selectedFederalState.toLowerCase();
    const matchesGrade =
      !selectedGradeLevel ||
      item.grade === selectedGradeLevel.replace("Klassenstufe ", "");

    return matchesSubject && matchesState && matchesGrade;
  });

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5 items-center justify-center px-50 pb-10">
        <h1 className="text-6xl text-secondary">Lehrpläne durchsuchen</h1>
        <p className="text-gray-500 text-center">
          Finde den passenden Lehrplan nach Fach, Bundesland oder Klassenstufe –
          ganz einfach filterbar und übersichtlich aufbereitet. So gelangst du
          schnell und unkompliziert zu genau dem Lernstoff, der für dich
          relevant ist. Egal ob du nach bestimmten Themen, Jahrgangsstufen oder
          regionalen Vorgaben suchst – hier findest du die passenden Inhalte auf
          einen Blick.
        </p>
      </div>
      <BackgroundCurvedTransition textColorClassName="text-background-dark-white" />

      <div className="flex flex-col items-center justify-center py-10 pb-10 gap-10 bg-background-dark-white">
        <div className="flex flex-col gap-5 w-1/2">
          <div className="flex justify-between gap-6 w-full">
            <ButtonFilterDropdown<string>
              options={studySubject}
              selected={selectedStudySubject}
              onSelect={(option) => setSelectedStudySubject(option)}
              placeholder="Lernfach wählen"
            />
            <ButtonFilterDropdown<string>
              options={federalState}
              selected={selectedFederalState}
              onSelect={(option) => setSelectedFederalState(option)}
              placeholder="Bundesland wählen"
            />
            <ButtonFilterDropdown<string>
              options={gradeLevel}
              selected={selectedGradeLevel}
              onSelect={(option) => setSelectedGradeLevel(option)}
              placeholder="Klassenstufe wählen"
            />
          </div>
          <div className="flex flex-col gap-4 ">
            {filteredCurricula.map(({ id, title, ...rest }) => (
              <CardCurriculumShowcase
                key={id}
                title={title}
                items={toDetails({ id, title, ...rest })}
                buttonTitle="Lehrplan ansehen"
                className="bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculaNotRegistered;
