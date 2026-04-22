import React from "react";
import { useLocation, useParams } from "react-router";

const VisualizeId = () => {
  const location = useLocation()
  const { id } = useParams()
  const {initialImage, initialRender, name} = location.state || {}

  return (
   <section>
    <h1>{name || "Untitled Project"}</h1>

    <div className="visualizer">
      {initialImage && (
        <div className="image-container">
          <h2>Source Image</h2>
          <img src={initialImage} alt="Source floor plan" />
        </div>
      )}
      {initialRender && (
        <div className="image-container">
          <h2>Rendered Image</h2>
          <img src={initialRender} alt="Rendered design" />
        </div>
      )}
    </div>
   </section>
  );
};

export default VisualizeId;
