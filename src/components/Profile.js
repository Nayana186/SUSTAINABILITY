import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../AuthProvider";
import "./profile.css";

/* ================= BACKGROUND ================= */
const bgStyle = {
  backgroundImage: `linear-gradient(
    rgba(0,0,0,0.35),
    rgba(0,0,0,0.35)
  ), url(${process.env.PUBLIC_URL}/forest.jpg)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

/* ================= CONFIG ================= */
const CREDIT_THRESHOLD = 1000;

/* ================= BADGES ================= */
const badgeIcons = {
  seed_planter: "🌱",
  forest_builder: "🌳",
  carbon_saver: "🌍",
  top_contributor: "🏆",
};

const badgeHierarchy = ["seed_planter", "forest_builder", "carbon_saver", "top_contributor"];

const getBadges = ({ treeCount, credits }) => {
  const badges = [];
  if (treeCount >= 1) badges.push("seed_planter");
  if (treeCount >= 25) badges.push("forest_builder");
  if (credits >= 5) badges.push("carbon_saver");
  return badges;
};

// Get top badge for display
const getTopBadge = (badges) => {
  if (!badges.length) return null;
  return badgeHierarchy
    .slice()
    .reverse()
    .find((b) => badges.includes(b));
};

export default function Profile() {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [treeCount, setTreeCount] = useState(0);
  const [verifiedCO2, setVerifiedCO2] = useState(0);
  const [rawCO2, setRawCO2] = useState(0);
  const [credits, setCredits] = useState(0);
  const [badges, setBadges] = useState([]);
  const [topBadge, setTopBadge] = useState(null); // new: for star badge below avatar

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "trees"), where("userId", "==", user.uid));
        const snap = await getDocs(q);

        let totalVerified = 0;
        let totalRaw = 0;

        snap.forEach((doc) => {
          const tree = doc.data();
          totalRaw += tree.totalCO2TillNow || 0;
          totalVerified += tree.totalCO2TillNow || 0; // use actual value if weighted not available
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
        setTopBadge(getTopBadge(badgeList)); // update top badge dynamically
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  /* ================= GUARDS ================= */
  if (!user) return <p>Please log in to view your profile.</p>;
  if (loading) return <p>Loading profile...</p>;

  /* ================= PROGRESS ================= */
  const progressPercent = Math.min(((verifiedCO2 % CREDIT_THRESHOLD) / CREDIT_THRESHOLD) * 100, 100);

  /* ================= UI ================= */
  return (
    <div className="profile-page" style={bgStyle}>
      <h1 className="profile-title">MY PROFILE</h1>

      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar">
          <div className="avatar-head"></div>
          <div className="avatar-body"></div>

          {/* small static badge */}
          <div className="avatar-badge">★</div>

          {/* NEW: top badge dynamically below avatar */}
          {topBadge && (
            <div
              className="avatar-badge"
              style={{ bottom: "-30px", left: "50%", transform: "translateX(-50%)" }}
            >
              {badgeIcons[topBadge]}
            </div>
          )}
        </div>

        {/* Gold badge */}
        <div className="profile-badge"></div>

        <p className="profile-row">
          <span>Email</span><span>:</span><span>{user.email}</span>
        </p>

        <p className="profile-row">
          <span>Trees Added</span><span>:</span><span>{treeCount}</span>
        </p>

        <p className="profile-row">
          <span>Total CO₂</span><span>:</span>
          <span>{rawCO2.toFixed(1)}</span>
        </p>

        <p className="profile-row">
          <span>Verified CO₂</span><span>:</span>
          <span>{verifiedCO2.toFixed(1)}</span>
        </p>

        <p className="profile-row">
          <span>Credits</span><span>:</span><span>{credits}</span>
        </p>

        <p className="profile-row">
          <span>Badges earned</span><span>:</span>
          <span>{badges.map((b) => badgeIcons[b]).join(" ")}</span>
        </p>

        {/* PROGRESS BAR */}
        <p className="profile-row">
          <span>Progress</span><span>:</span>
          <span>Contribution towards next credit</span>
        </p>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="progress-text">{progressPercent.toFixed(0)}% of next credit</p>
      </div>
    </div>
  );
}
