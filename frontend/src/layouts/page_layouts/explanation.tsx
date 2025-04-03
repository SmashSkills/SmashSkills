import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import CardSimple from "../../components/ui_elements/cards/card_simple";
import TagSingleStringInfo from "../../components/ui_elements/tags/tag_single_string_info";
import ButtonSlider from "../../components/ui_elements/buttons/button_slider";
interface CardData {
  id: number;
  title: string;
  text: string;
  icon: React.ReactNode;
}

interface LayoutExplanationProps {
  items: CardData[];
}

const LayoutExplanation: React.FC<LayoutExplanationProps> = ({ items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
  });
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progressValue = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setProgress(progressValue);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("scroll", onScroll);
    emblaApi.scrollTo(1);
    onScroll();
  }, [emblaApi, onScroll]);

  return (
    <div className="flex flex-col items-center justify-center ">
                  <ButtonSlider />
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col items-center">
          <TagSingleStringInfo
            text={`Einfach erklärt`}
            classNameWrapper="mb-3"
          />
          <h1 className="flex items-center justify-center text-6xl text-secondary text-center mb-5">
            Wie benutzt du&nbsp;
            <span className="text-primary">SmashSkills?</span>
          </h1>
          <p className="text-xl text-center text-gray-500">
            Entdecke, wie du mit SmashSkills deinen Unterricht effizienter
            gestalten und mehr Zeit für das Wesentliche gewinnen kannst.
          </p>
        </div>

        <div className="flex items-center ">
          <div className="flex items-center ">

            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="p-2 rounded-full text-6xl text-black hover:text-primary cursor-pointer focus:outline-none transition-all duration-300"
            >
              &#8592;
            </button>
          </div>
          <div className="flex-1 overflow-hidden " ref={emblaRef}>
            <div className="flex ">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-10 flex-shrink-0 w-full h-[300px]"
                >
                  <CardSimple
                    icon={item.icon}
                    title={
                      <div className="flex items-center justify-between">
                        <span className="text-4xl text-secondary">
                          {item.title}
                        </span>
                        <TagSingleStringInfo
                          text={`Schritt ${item.id}/${items.length}`}
                          classNameWrapper="bg-secondary"
                          classNameText="text-white"
                        />
                      </div>
                    }
                    text={item.text}
                    classNameWrapper="shadow-md hover:border-primary cursor-move h-full px-10 py-5 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="p-2 rounded-full text-6xl text-black hover:text-primary cursor-pointer focus:outline-none transition-all duration-300"
            >
              &#8594;
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-300 relative mt-4">
          <div
            className="h-full bg-red-500 transition-transform duration-200"
            style={{
              transform: `scaleX(${progress})`,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LayoutExplanation;

