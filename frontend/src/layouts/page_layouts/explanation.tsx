import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import CardSimple from "../../components/ui_elements/cards/card_simple";

interface CardData {
  id: number;
  title: string;
  text: string;
}

interface LayoutExplanationProps {
  items: CardData[];
}

const LayoutExplanation: React.FC<LayoutExplanationProps> = ({ items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
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
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 10000); // 30.000 ms = 30 Sekunden

    return () => clearInterval(interval); // cleanup beim Unmount
  }, [emblaApi]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-5 w-full">
        <h1 className="text-6xl text-center mb-10">
          Wie benutzt du SmashSkills?
        </h1>
        <div className="flex items-center">
          <div className="flex items-center">
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="p-2 rounded-full text-6xl text-black hover:text-primary cursor-pointer focus:outline-none transition-all duration-300"
            >
              &#8592;
            </button>
          </div>
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-10 flex-shrink-0 w-full sm:w-1/2 md:w-1/3"
                >
                  <CardSimple
                    title={item.title}
                    text={item.text}
                    classNameWrapper="shadow-md"
                    classNameTitle="text-2xl"
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
