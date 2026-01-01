import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../AuthProvider";

/* ================= BADGES ================= */
const badgeIcons = {
  seed_planter: "🌱",
  forest_builder: "🌳",
  carbon_saver: "🌍",
  top_contributor: "🏆",
};

const getBadges = ({ treeCount, credits }) => {
  const badges = [];
  if (treeCount >= 1) badges.push("seed_planter");
  if (treeCount >= 25) badges.push("forest_builder");
  if (credits >= 5) badges.push("carbon_saver");
  return badges;
};

const CREDIT_THRESHOLD = 1000;

export default function Profile() {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [treeCount, setTreeCount] = useState(0);
  const [verifiedCO2, setVerifiedCO2] = useState(0);
  const [rawCO2, setRawCO2] = useState(0);
  const [credits, setCredits] = useState(0);
  const [badges, setBadges] = useState([]);

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "trees"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);

        let totalVerified = 0;
        let totalRaw = 0;

        snap.forEach((doc) => {
          const tree = doc.data();
          totalRaw += tree.totalCO2TillNow || 0;
          totalVerified += tree.weightedCO2 || 0;
        });

        const creditCount = Math.floor(totalVerified / CREDIT_THRESHOLD);
        const badgeList = getBadges({
          treeCount: snap.size,
          credits: creditCount,
        });

        setTreeCount(snap.size);
        setRawCO2(totalRaw);
        setVerifiedCO2(totalVerified);
        setCredits(creditCount);
        setBadges(badgeList);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  /* ================= GUARDS ================= */
  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <h1>👤 Your Profile</h1>

      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Trees Added:</strong> {treeCount}</p>
      <p><strong>Total CO₂ (kg):</strong> {rawCO2.toFixed(1)}</p>
      <p><strong>Verified CO₂ (kg):</strong> {verifiedCO2.toFixed(1)}</p>
      <p><strong>Credits:</strong> {credits}</p>

      <h2>🏅 Badges Earned</h2>
      <div style={{ fontSize: 24 }}>
        {badges.length > 0
          ? badges.map((b) => (
              <span key={b} style={{ marginRight: 10 }}>
                {badgeIcons[b]}
              </span>
            ))
          : "No badges yet. Start adding trees!"}
      </div>

      <h2 style={{ marginTop: 30 }}>🌳 Progress</h2>
      <div>
        <label>CO₂ Contribution Progress (toward next credit)</label>
        <div
          style={{
            background: "#eee",
            borderRadius: 6,
            overflow: "hidden",
            height: 24,
            marginTop: 5,
          }}
        >
          <div
            style={{
              width: `${Math.min(
                (verifiedCO2 / CREDIT_THRESHOLD) * 100,
                100
              )}%`,
              background: "#4caf50",
              height: "100%",
              transition: "width 0.3s",
            }}
          />
        </div>
        <p>
          {Math.min(
            (verifiedCO2 / CREDIT_THRESHOLD) * 100,
            100
          ).toFixed(0)}
          % of next credit
        </p>
      </div>
    </div>
  );
}
