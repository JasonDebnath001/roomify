import React, { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { createProject, getProject } from "../../lib/puter.action";

const VisualizeId = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { userId } = useOutletContext<AuthContext>();
  const { initialImage, initialRender, name } = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );
  const [fetchedProject, setFetchedProject] = useState<any>(null);

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    const imageToUse = initialImage || fetchedProject?.sourceImage;
    if (!imageToUse) return;
    try {
      setIsProcessing(true);
      setGenerationError(null);
      const result = await generate3DView({ sourceImage: imageToUse });
      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        if (!fetchedProject) {
          console.error("No project found to update");
          return;
        }

        const updatedItem = {
          ...fetchedProject,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: fetchedProject.ownerId ?? userId ?? null,
          isPublic: fetchedProject.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) {
          setFetchedProject(saved);
          setCurrentImage(saved.renderedImage);
        }
      }
    } catch (error) {
      console.error("Error during generation:", error);
      setGenerationError(error.message || "Generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage && id) {
      // Fetch project using puter.action
      getProject(id)
        .then((project) => {
          if (project) {
            setFetchedProject(project);
            setCurrentImage(project.renderedImage || project.sourceImage);
          }
        })
        .catch((err) => console.error("Failed to fetch project:", err));
    }
  }, [initialImage, id]);

  useEffect(() => {
    const imageToUse = initialImage || fetchedProject?.sourceImage;
    if (!imageToUse || hasInitialGenerated.current) return;
    if (initialRender || fetchedProject?.renderedImage) {
      setCurrentImage(initialRender || fetchedProject.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender, fetchedProject]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />

          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>
      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{name ?? "Untitled Project"}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                size="sm"
                onClick={() => {}}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="3D Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Initial Image"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">
                    Generating your 3D visualization...
                  </span>
                </div>
              </div>
            )}
          </div>
          {generationError && (
            <div className="error-ui">
              <p>Error: {generationError}</p>
              <Button onClick={runGeneration} size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VisualizeId;
