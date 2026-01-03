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
import "./growthgallery.css";

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

      const tree = trees.find((t) => t.id === treeId);

      await updateDoc(doc(db, "trees", treeId), {
        growthUpdates: [...(tree.growthUpdates || []), newUpdate],
        totalCO2TillNow: (tree.totalCO2TillNow || 0) + GROWTH_BONUS_CO2,
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
        totalCO2TillNow: Math.max(
          (tree.totalCO2TillNow || 0) - (growth.bonusCO2 || 0),
          0
        ),
      });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div
     className="growth-page"
     style={{ backgroundImage: "url(/forest.jpg)" }}
     >
      <h1 className="growth-title">GROWTH GALLERY</h1>

      {trees.map((tree) => {
        const expanded = expandedTrees[tree.id];

        return (
          <div key={tree.id} className="growth-card">
            {/* HEADER */}
            <div className="growth-header">
              <img
                src={tree.imageUrl}
                alt={tree.species}
                className="tree-main-img"
              />

              <div>
                <h3>{tree.species}</h3>
                <p>Total CO₂: {tree.totalCO2TillNow || 0} kg</p>
              </div>

              <button
                className="toggle-btn"
                onClick={() =>
                  setExpandedTrees((p) => ({
                    ...p,
                    [tree.id]: !p[tree.id],
                  }))
                }
              >
                {expanded ? "Hide" : "Show"}
              </button>
            </div>

            {/* EXPANDED CONTENT */}
            {expanded && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="upload-input"
                  disabled={uploadingTreeId === tree.id}
                  onChange={(e) =>
                    handleGrowthUpload(tree.id, e.target.files[0])
                  }
                />

                <div className="growth-images">
                  {tree.growthUpdates?.map((g, i) => (
                    <div key={i} className="growth-img-card">
                      <img src={g.imageUrl} alt="growth update" />
                      <p>+{g.bonusCO2} kg CO₂</p>
                      <button
                        className="delete-btn"
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

