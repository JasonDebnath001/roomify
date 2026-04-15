import React from "react";
import { useParams } from "react-router";

const visualizeId = () => {
  const { id } = useParams<{ id: string }>();
  const image = id ? localStorage.getItem(`roomify-image-${id}`) : null;

  return (
    <div>
      {image ? (
        <img src={image} alt="Uploaded floor plan" />
      ) : (
        <p>Image not found for ID: {id}</p>
      )}
    </div>
  );
};

export default visualizeId;
