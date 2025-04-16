import React from "react";
import Worksheet from "../SubProjects/Editor/layouts/Worksheet";
import "@tldraw/tldraw/tldraw.css";

const DesignEditorPage: React.FC = () => {
  return (
    <div className="w-full h-screen bg-background-dark-white">
      <div className="h-full w-full">
        <Worksheet />
      </div>
    </div>
  );
};

export default DesignEditorPage;
