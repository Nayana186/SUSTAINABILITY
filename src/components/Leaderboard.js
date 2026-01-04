import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./leaderboard.css";

/* ================= CONFIG ================= */

const CREDIT_THRESHOLD = 1000; // 1000 kg CO₂ = 1 credit

const confidenceWeights = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

const trustWeights = {
  self: 0.5,
  photo: 0.8,
  community: 0.9,
  ai: 1.0,
};

/* ================= BADGES ================= */

const badgeIcons = {
  seed_planter: "🌱",
  forest_builder: "🌳",
  carbon_saver: "🌍",
  top_contributor: "🏆",
};

const getBadges = ({ treeCount, credits, rank }) => {
  const badges = [];
  if (treeCount >= 1) badges.push("seed_planter");
  if (treeCount >= 25) badges.push("forest_builder");
  if (credits >= 5) badges.push("carbon_saver");
  if (rank <= 10) badges.push("top_contributor");
  return badges;
};

/* ================= LOCATION WEIGHT ================= */

const getLocationWeight = (tree) => {
  if (!tree.location || !tree.location.lat || !tree.location.lng) return 0.5;

  const accuracy = tree.location.accuracy ?? 999;
  if (accuracy <= 30) return 1.0;
  if (accuracy <= 100) return 0.85;
  return 0.7;
};

/* ================= COMPONENT ================= */

export default function Leaderboard() {
  const [userLeaderboard, setUserLeaderboard] = useState([]);
  const [treeLeaderboard, setTreeLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const treeSnap = await getDocs(collection(db, "trees"));

        const trees = treeSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        /* ================= TREE WEIGHTING ================= */

        const treesWithWeightedCO2 = trees.map((tree) => {
          const confidenceWeight = confidenceWeights[tree.confidence] ?? 0.4;
          const trustWeight = trustWeights[tree.trustLevel] ?? 0.6;
          const locationWeight = getLocationWeight(tree);

          const weightedCO2 =
            (tree.totalCO2TillNow || 0) *
            confidenceWeight *
            trustWeight *
            locationWeight;

          return { ...tree, weightedCO2 };
        });

        /* ================= TREE LEADERBOARD ================= */

        const topTrees = [...treesWithWeightedCO2]
          .sort((a, b) => b.weightedCO2 - a.weightedCO2)
          .slice(0, 10);

        setTreeLeaderboard(topTrees);

        /* ================= USER AGGREGATION ================= */

        const userMap = {};

        treesWithWeightedCO2.forEach((tree) => {
          if (!tree.userId) return;

          if (!userMap[tree.userId]) {
            userMap[tree.userId] = {
              userId: tree.userId,
              email: tree.userEmail || "Unknown",
              rawCO2: 0,
              verifiedCO2: 0,
              treeCount: 0,
            };
          }

          userMap[tree.userId].rawCO2 += tree.totalCO2TillNow || 0;
          userMap[tree.userId].verifiedCO2 += tree.weightedCO2 || 0;
          userMap[tree.userId].treeCount += 1;
        });

        const users = Object.values(userMap)
          .map((user) => ({
            ...user,
            credits: Math.floor(user.verifiedCO2 / CREDIT_THRESHOLD),
          }))
          .sort((a, b) => b.verifiedCO2 - a.verifiedCO2)
          .slice(0, 10)
          .map((user, index) => ({
            ...user,
            badges: getBadges({
              treeCount: user.treeCount,
              credits: user.credits,
              rank: index + 1,
            }),
          }));

        setUserLeaderboard(users);
      } catch (err) {
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-container"
      style={{ backgroundImage: "url(/forest.jpg)" }}>
        <h2>Loading leaderboard...</h2>
      </div>
    );
  }

  return (
    <div className="leaderboard-container"
    style={{ backgroundImage: "url(/forest.jpg)" }}
    >
      {/* ================= TITLE ================= */}
      <h1 className="leaderboard-title">CQUESTER LEADERBOARD</h1>

      {/* ================= GRID ================= */}
      <div className="leaderboard-grid">
        {/* ================= USER LEADERBOARD ================= */}
        <div className="leaderboard-card">
          <h2 className="section-title">TOP CONTRIBUTORS</h2>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>CO₂ (kg)</th>
                <th>Verified CO₂</th>
                <th>Credits</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {userLeaderboard.map((user, index) => (
                <tr key={user.userId}>
                  <td>{index + 1}</td>
                  <td>{user.email}</td>
                  <td>{user.rawCO2.toFixed(1)}</td>
                  <td>{user.verifiedCO2.toFixed(1)}</td>
                  <td>{user.credits}</td>
                  <td>
                    {user.badges.map((b) => (
                      <span key={b}>{badgeIcons[b]}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="info-text">
            ℹ️ Credits are weighted by confidence, trust & GPS accuracy.  
            1 credit = 1000 kg CO₂ (informational).
          </p>
        </div>

        {/* ================= TREE LEADERBOARD ================= */}
        <div
         className="leaderboard-card"
        >
          <h2 className="section-title">TOP TREES BY VERIFIED CO₂</h2>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Species</th>
                <th>Age</th>
                <th>Confidence</th>
                <th>Trust</th>
                <th>Location</th>
                <th>CO₂</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {treeLeaderboard.map((tree, index) => (
                <tr key={tree.id}>
                  <td>{index + 1}</td>
                  <td>{tree.species}</td>
                  <td>{tree.age}</td>
                  <td>{tree.confidence}</td>
                  <td>{tree.trustLevel}</td>
                  <td>
                    {tree.location
                      ? `📍 ${Math.round(tree.location.accuracy)}m`
                      : "❌"}
                  </td>
                  <td>{tree.weightedCO2.toFixed(1)}</td>
                  <td>
                    {tree.imageUrl && (
                      <img
                        src={tree.imageUrl}
                        alt={tree.species}
                        width={50}
                        height={50}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
