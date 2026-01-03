import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "../AuthProvider";
import "./PlantationForm.css";

export default function PlantationForm() {
  const { user } = useUser();

  const [plotName, setPlotName] = useState("");
  const [plotTreeCount, setPlotTreeCount] = useState("");
  const [plotCO2PerTree, setPlotCO2PerTree] = useState("");
  const [treeType, setTreeType] = useState("Oak");
  const [plantingDate, setPlantingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalCO2, setTotalCO2] = useState(0);

  useEffect(() => {
    const trees = Number(plotTreeCount) || 0;
    const co2 = Number(plotCO2PerTree) || 0;
    setTotalCO2(trees * co2);
  }, [plotTreeCount, plotCO2PerTree]);

  if (!user) {
    return (
      <div className="plantation-form">
        <p className="error">Please log in to add a plantation plot.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!plotName || !plotTreeCount || !plotCO2PerTree) {
      setMessage("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "plots"), {
        userId: user.uid,
        userEmail: user.email,
        plotName,
        treeCount: Number(plotTreeCount),
        co2PerTree: Number(plotCO2PerTree),
        totalCO2,
        treeType,
        plantingDate: plantingDate || null,
        createdAt: serverTimestamp(),
      });

      setMessage(`Plot "${plotName}" added successfully 🌱`);
      handleReset();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add plot");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setPlotName("");
    setPlotTreeCount("");
    setPlotCO2PerTree("");
    setTreeType("Oak");
    setPlantingDate("");
    setTotalCO2(0);
    setMessage("");
  };

  return (
    <div className="plantation-form">
      <h3>Plantation / Farm Mode</h3>

      {message && (
        <p className={message.includes("successfully") ? "success" : "error"}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Plot / Farm Name</label>
        <input value={plotName} onChange={(e) => setPlotName(e.target.value)} />

        <label>Tree Type</label>
        <select value={treeType} onChange={(e) => setTreeType(e.target.value)}>
          <option value="Oak">Oak</option>
          <option value="Pine">Pine</option>
          <option value="Maple">Maple</option>
          <option value="Teak">Teak</option>
        </select>

        <label>Number of Trees</label>
        <input
          type="number"
          min="1"
          value={plotTreeCount}
          onChange={(e) => setPlotTreeCount(e.target.value)}
        />

        <label>Estimated CO₂ per Tree (kg)</label>
        <input
          type="number"
          min="1"
          value={plotCO2PerTree}
          onChange={(e) => setPlotCO2PerTree(e.target.value)}
        />

        <label>Planting Date (optional)</label>
        <input
          type="date"
          value={plantingDate}
          onChange={(e) => setPlantingDate(e.target.value)}
        />

        <div className="total-co2">
          Total CO₂ Captured: {totalCO2} kg 🌱
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Add Plot"}
        </button>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>
    </div>
  );
}
