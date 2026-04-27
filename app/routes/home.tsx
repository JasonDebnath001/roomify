import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const loadProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        if (!cancelled) {
          setProjects((prev) => {
            const mergedMap = new Map<string, DesignItem>();
            prev.forEach((p) => mergedMap.set(p.id, p));
            fetchedProjects.forEach((p) => {
              if (!mergedMap.has(p.id)) {
                mergedMap.set(p.id, p);
              }
            });
            return Array.from(mergedMap.values());
          });
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleUploadComplete = async (base64Image: string) => {
    if (isCreatingProjectRef.current) return;
    isCreatingProjectRef.current = true;
    setIsCreating(true);
    try {
      const newId = crypto.randomUUID();
      const name = `Residence ${newId}`;

      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      const saved = await createProject({ item: newItem });
      if (saved) setProjects((prev) => [saved, ...prev]);

      navigate(`/visualize/${newId}`, {
        state: {
          initialImage: base64Image,
          initialRender: null,
          name,
        },
      });
    } catch (err) {
      console.error("Failed to persist project:", err);
      // Still navigate even if save fails?
      // Perhaps show error, but for now, navigate anyway
    } finally {
      isCreatingProjectRef.current = false;
      setIsCreating(false);
    }
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    // Optionally show a toast or alert
  };
  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="annouce">
          <div className="dot">
            <div className="pulse" />
          </div>

          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build Beautiful At The Speed Of Thought With Roomify</h1>

        <p className="subtitle">
          Roomify is an AI-first design environment that helps you visualize,
          render, and ship architectural projects faster than ever.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start building <ArrowRight className="icon" />
          </a>

          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          {isCreating && (
            <div className="loading-overlay">
              <div className="loading-spinner">Creating project...</div>
            </div>
          )}
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h3>Upload Your Floor Plan</h3>
              <p>Supports JPEG, PNG, formats up to 50MB</p>
            </div>

            <Upload
              onComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest works and shared community projects all in one place
              </p>
            </div>
          </div>

          <div className="projects-grid">
            {projects.map(
              ({ id, name, renderedImage, sourceImage, timestamp }) => (
                <div className="project-card group" key={id}>
                  <div className="preview">
                    <img src={renderedImage || sourceImage} alt="Project" />
                    <div className="badge">
                      <span>Community</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>
                      <div className="meta">
                        <Clock />
                        <span>
                          {new Date(timestamp).toLocaleDateString()}{" "}
                          <span>By Jason Stark</span>
                        </span>
                      </div>
                    </div>

                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
