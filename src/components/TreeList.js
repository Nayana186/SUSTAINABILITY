import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../AuthProvider";

/* ================= CONFIG ================= */

const GROWTH_BONUS_CO2 = 50; // kg CO₂ per growth image

/* ================= COMPONENT ================= */

export default function TreeList() {
  const { user } = useUser();
  const [trees, setTrees] = useState([]);
  const [uploadingTreeId, setUploadingTreeId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "trees"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTrees(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [user]);

  /* ================= CLOUDINARY ================= */

  const uploadToCloudinary = async (file) => {
    const url = "https://api.cloudinary.com/v1_1/dhl70c7m2/upload";
    const preset = "vuddza3n";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  /* ================= GROWTH UPLOAD ================= */

  const handleGrowthUpload = async (treeId, file) => {
    if (!file) return;

    try {
      setUploadingTreeId(treeId);

      const imageUrl = await uploadToCloudinary(file);

      const treeRef = doc(db, "trees", treeId);

      await updateDoc(treeRef, {
        growthUpdates: arrayUnion({
          imageUrl,
          uploadedAt: serverTimestamp(),
          bonusCO2: GROWTH_BONUS_CO2,
        }),
        totalCO2TillNow:
          (trees.find((t) => t.id === treeId)?.totalCO2TillNow || 0) +
          GROWTH_BONUS_CO2,
      });
    } catch (err) {
      console.error("Growth upload error:", err);
    } finally {
      setUploadingTreeId(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "trees", id));
  };

  /* ================= TOTAL ================= */

  const totalCO2 = trees.reduce(
    (sum, t) => sum + (t.totalCO2TillNow || 0),
    0
  );

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 700 }}>
      <h3>My Trees 🌳</h3>

      <p>
        <b>Total CO₂:</b> {totalCO2.toFixed(1)} kg
      </p>

      {trees.length === 0 && <p>No trees added yet.</p>}

      {trees.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ddd",
            marginTop: 14,
            padding: 14,
            borderRadius: 10,
          }}
        >
          {/* TREE HEADER */}
          <div style={{ display: "flex", gap: 12 }}>
            {t.imageUrl && (
              <img
                src={t.imageUrl}
                alt={t.species}
                width={90}
                height={90}
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
            )}

            <div style={{ flex: 1 }}>
              <p><b>{t.species}</b></p>
              <p>Age: {t.age} yrs</p>
              <p>CO₂: {t.totalCO2TillNow} kg</p>
              <p style={{ fontSize: 12, color: "#666" }}>
                Confidence: {t.confidence}
              </p>

              <button
                onClick={() => handleDelete(t.id)}
                style={{
                  background: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* 🌱 GROWTH UPLOAD */}
          <div style={{ marginTop: 12 }}>
            <label>
              📤 Upload growth photo:
              <input
                type="file"
                accept="image/*"
                disabled={uploadingTreeId === t.id}
                onChange={(e) =>
                  handleGrowthUpload(t.id, e.target.files[0])
                }
              />
            </label>
          </div>

          {/* 🌿 GROWTH GALLERY */}
          {t.growthUpdates && t.growthUpdates.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 13 }}>
                Growth updates (+{GROWTH_BONUS_CO2} kg each)
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                {t.growthUpdates.map((g, i) => (
                  <img
                    key={i}
                    src={g.imageUrl}
                    alt="Growth"
                    width={60}
                    height={60}
                    style={{ borderRadius: 6, objectFit: "cover" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
