import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../AuthProvider";

const GROWTH_BONUS_CO2 = 50; // kg CO₂ per growth image

export default function GrowthGallery() {
  const { user } = useUser();
  const [trees, setTrees] = useState([]);
  const [uploadingTreeId, setUploadingTreeId] = useState(null);
  const [expandedTrees, setExpandedTrees] = useState({});

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "trees"), where("userId", "==", user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedTrees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const processedTrees = fetchedTrees.map((tree) => ({
        ...tree,
        growthUpdates: (tree.growthUpdates || []).sort((a, b) => {
          const tA = a.uploadedAt?.toMillis?.() || a.tempTimestamp || 0;
          const tB = b.uploadedAt?.toMillis?.() || b.tempTimestamp || 0;
          return tA - tB;
        }),
      }));

      setTrees(processedTrees);
    });

    return () => unsub();
  }, [user]);

  if (!user) return <p>Loading user...</p>;

  const uploadToCloudinary = async (file) => {
    const url = "https://api.cloudinary.com/v1_1/dhl70c7m2/upload";
    const preset = "vuddza3n";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleGrowthUpload = async (treeId, file) => {
    if (!file) return;

    try {
      setUploadingTreeId(treeId);

      // 1️⃣ Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      console.log("Uploaded Image URL:", imageUrl);

      // 2️⃣ Prepare a temporary growth update for optimistic rendering
      const tempUpdate = {
        tempTimestamp: Date.now(),
        imageUrl,
        bonusCO2: GROWTH_BONUS_CO2,
        uploadedAt: { toMillis: () => Date.now() },
      };

      // 3️⃣ Optimistic local update
      setTrees((prev) =>
        prev.map((t) =>
          t.id === treeId
            ? {
                ...t,
                growthUpdates: [...(t.growthUpdates || []), tempUpdate],
                totalCO2TillNow: (t.totalCO2TillNow || 0) + GROWTH_BONUS_CO2,
              }
            : t
        )
      );

      // 4️⃣ Update Firestore
      const treeRef = doc(db, "trees", treeId);
      await updateDoc(treeRef, {
        growthUpdates: arrayUnion({
          imageUrl,
          bonusCO2: GROWTH_BONUS_CO2,
          uploadedAt: serverTimestamp(),
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

  const toggleTreeExpansion = (treeId) => {
    setExpandedTrees((prev) => ({
      ...prev,
      [treeId]: !prev[treeId],
    }));
  };

  return (
    <div style={{ maxWidth: 900, padding: 20 }}>
      <h1>🌿 Growth Gallery</h1>
      <p style={{ color: "#555" }}>Upload and view growth updates per tree</p>

      {trees.length === 0 && <p>No trees added yet.</p>}

      {trees.map((tree) => {
        const isExpanded = expandedTrees[tree.id] || false;

        return (
          <div
            key={tree.id}
            style={{
              marginTop: 20,
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 12,
            }}
          >
            {/* TREE HEADER */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {tree.imageUrl && (
                <img
                  src={tree.imageUrl}
                  alt={tree.species}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: 10 }}
                />
              )}

              <div>
                <h3>{tree.species}</h3>
                <p>Age: {tree.age} yrs</p>
                <p>
                  Total CO₂: <b>{tree.totalCO2TillNow || 0} kg</b>
                </p>
              </div>

              <button
                onClick={() => toggleTreeExpansion(tree.id)}
                style={{ marginLeft: "auto", padding: "6px 12px", cursor: "pointer" }}
              >
                {isExpanded ? "Hide Growth" : "Show Growth"}
              </button>
            </div>

            {/* GROWTH SECTION */}
            {isExpanded && (
              <div style={{ marginTop: 16 }}>
                <label>
                  📤 Upload growth photo:
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingTreeId === tree.id}
                    onChange={(e) =>
                      handleGrowthUpload(tree.id, e.target.files[0])
                    }
                  />
                </label>

                {tree.growthUpdates && tree.growthUpdates.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 12,
                    }}
                  >
                    {tree.growthUpdates
                      .sort((a, b) => {
                        const tA = a.uploadedAt?.toMillis?.() || a.tempTimestamp || 0;
                        const tB = b.uploadedAt?.toMillis?.() || b.tempTimestamp || 0;
                        return tA - tB;
                      })
                      .map((g, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <img
                            src={g.imageUrl}
                            alt="Growth"
                            width={120}
                            height={120}
                            style={{ objectFit: "cover", borderRadius: 10 }}
                          />
                          <p style={{ fontSize: 12, marginTop: 4 }}>
                            +{g.bonusCO2} kg CO₂
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p style={{ color: "#777", marginTop: 12 }}>No growth updates yet.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
