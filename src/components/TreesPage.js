import React from "react";
import { useNavigate } from "react-router-dom";
import AddTree from "../components/AddTree";
import TreeList from "../components/TreeList";

export default function TreesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1>🌳 Trees</h1>

      {/* ================= BUTTON TO GROWTH GALLERY ================= */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate("/growth-gallery")}
          style={{
            padding: "10px 18px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🌿 Want to add more images of your plant babies?
        </button>
      </div>

      {/* ================= ADD TREE + TREE LIST ================= */}
      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ flex: 1 }}>
          <AddTree />
        </div>
        <div style={{ flex: 2 }}>
          <TreeList />
        </div>
      </div>
    </div>
  );
}
