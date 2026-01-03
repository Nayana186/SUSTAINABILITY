import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../AuthProvider";

const GROWTH_BONUS_CO2 = 50;

export default function GrowthGallery() {
  const { user } = useUser();
  const [trees, setTrees] = useState([]);
  const [uploadingTreeId, setUploadingTreeId] = useState(null);
  const [expandedTrees, setExpandedTrees] = useState({});

  /* ================= FETCH TREES ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "trees"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      fetched.forEach((t) => {
        t.growthUpdates = (t.growthUpdates || []).sort(
          (a, b) => (a.uploadedAt || 0) - (b.uploadedAt || 0)
        );
      });

      setTrees(fetched);
    });

    return () => unsub();
  }, [user]);

  if (!user) return <p>Loading...</p>;

  /* ================= CLOUDINARY UPLOAD ================= */
  const uploadToCloudinary = async (file) => {
    const url = "https://api.cloudinary.com/v1_1/dhl70c7m2/upload";
    const preset = "vuddza3n";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);

    const res = await fetch(url, { method: "POST", body: fd });
    const data = await res.json();

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  };

  /* ================= UPLOAD ================= */
  const handleGrowthUpload = async (treeId, file) => {
    if (!file) return;

    try {
      setUploadingTreeId(treeId);

      const { secure_url, public_id } = await uploadToCloudinary(file);
      const timestamp = Date.now();

      const newUpdate = {
        imageUrl: secure_url,
        publicId: public_id,
        bonusCO2: GROWTH_BONUS_CO2,
        uploadedAt: timestamp,
      };

      setTrees((prev) =>
        prev.map((t) =>
          t.id === treeId
            ? {
                ...t,
                growthUpdates: [...(t.growthUpdates || []), newUpdate],
                totalCO2TillNow:
                  (t.totalCO2TillNow || 0) + GROWTH_BONUS_CO2,
              }
            : t
        )
      );

      await updateDoc(doc(db, "trees", treeId), {
        growthUpdates: [
          ...(trees.find((t) => t.id === treeId)?.growthUpdates || []),
          newUpdate,
        ],
        totalCO2TillNow:
          (trees.find((t) => t.id === treeId)?.totalCO2TillNow || 0) +
          GROWTH_BONUS_CO2,
      });
    } finally {
      setUploadingTreeId(null);
    }
  };

  /* ================= DELETE ================= */
const handleDeleteGrowth = async (treeId, growth) => {
  if (!window.confirm("Delete this growth image?")) return;

  try {
    const tree = trees.find((t) => t.id === treeId);
    if (!tree) return;

    const updatedGrowth = tree.growthUpdates.filter(
      (g) => g.uploadedAt !== growth.uploadedAt
    );

    await updateDoc(doc(db, "trees", treeId), {
      growthUpdates: updatedGrowth,
      totalCO2TillNow:
        Math.max(
          (tree.totalCO2TillNow || 0) - (growth.bonusCO2 || 0),
          0
        ),
    });
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


  return (
    <div style={{ maxWidth: 900, padding: 20 }}>
      <h1>🌿 Growth Gallery</h1>

      {trees.map((tree) => {
        const expanded = expandedTrees[tree.id];

        return (
          <div
            key={tree.id}
            style={{
              marginTop: 20,
              border: "1px solid #ddd",
              padding: 16,
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <img
                src={tree.imageUrl}
                alt={`${tree.species} tree`}
                width={100}
                height={100}
                style={{ borderRadius: 8 }}
              />

              <div>
                <h3>{tree.species}</h3>
                <p>Total CO₂: {tree.totalCO2TillNow || 0} kg</p>
              </div>

              <button
                onClick={() =>
                  setExpandedTrees((p) => ({
                    ...p,
                    [tree.id]: !p[tree.id],
                  }))
                }
                style={{ marginLeft: "auto" }}
              >
                {expanded ? "Hide" : "Show"}
              </button>
            </div>

            {expanded && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingTreeId === tree.id}
                  onChange={(e) =>
                    handleGrowthUpload(tree.id, e.target.files[0])
                  }
                />

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  {tree.growthUpdates?.map((g, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <img
                        src={g.imageUrl}
                        alt={`Growth update for ${tree.species}`}
                        width={120}
                        height={120}
                        style={{ borderRadius: 8 }}
                      />
                      <p>+{g.bonusCO2} kg</p>
                      <button
                        style={{ color: "red", fontSize: 12 }}
                        onClick={() => handleDeleteGrowth(tree.id, g)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
