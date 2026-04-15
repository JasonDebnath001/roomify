import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    localStorage.setItem(`roomify-image-${newId}`, base64Image);
    navigate(`/visualize/${newId}`);
    return true;
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
            <div className="project-card group">
              <div className="preview">
                <img
                  src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                  alt="Rendered preview of Project Manhattan"
                />
                <div className="badge">
                  <span>Community</span>
                </div>
              </div>

              <div className="card-body">
                <div>
                  <h3>Project Manhattan</h3>
                  <div className="meta">
                    <Clock />
                    <span>
                      {new Date("2027-01-01").toLocaleDateString()}{" "}
                      <span>By Jason Stark</span>
                    </span>
                  </div>
                </div>

                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
