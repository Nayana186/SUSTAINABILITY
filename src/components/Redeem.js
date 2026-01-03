import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../AuthProvider";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com";

/* ================= ADMIN CONFIG ================= */
const ADMIN_EMAILS = ["b24ee046@gmail.com"]; // 🔐 change this

export default function Redeem() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [redeemed, setRedeemed] = useState([]);
  const [lastRedeemedReward, setLastRedeemedReward] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  /* ================= REWARDS ================= */
  const rewardCatalog = useMemo(
    () => [
      { rewardId: "amazon50", name: "₹50 Amazon Voucher", requiredCredits: 10 },
      { rewardId: "gift200", name: "₹200 Gift Card", requiredCredits: 1 },
      { rewardId: "merch", name: "Exclusive Merchandise", requiredCredits: 1 },
    ],
    []
  );

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setCredits(data.credits || 0);
        setRedeemed(data.redeemedRewards || []);
      }
    };

    fetchUser();
  }, [user]);

  /* ================= EMAIL ================= */
  const sendEmail = (reward, qrValue) => {
    const templateParams = {
      email: user.email,
      rewardName: reward.name,
      creditsSpent: reward.requiredCredits,
      qrCode: qrValue,
    };

    emailjs
      .send(
        "service_9xh1upk",
        "template_mgxpmfd",
        templateParams,
        "avg7c4hPcgQ8J5nJ8"
      )
      .then(() => {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 4000);
      })
      .catch((err) => {
        console.error("Email error:", err);
        alert("Email failed. Check EmailJS logs.");
      });
  };

  /* ================= REDEEM ================= */
  const handleRedeem = async (reward) => {
    if (credits < reward.requiredCredits) {
      alert("Not enough credits!");
      return;
    }

    if (redeemed.some((r) => r.rewardId === reward.rewardId)) {
      alert("Reward already redeemed!");
      return;
    }

    const qrValue = `${user.uid}-${reward.rewardId}-${Date.now()}`;
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      credits: credits - reward.requiredCredits,
      redeemedRewards: arrayUnion({
        rewardId: reward.rewardId,
        date: new Date(),
        qrValue,
      }),
    });

    setCredits((prev) => prev - reward.requiredCredits);
    setRedeemed((prev) => [...prev, { rewardId: reward.rewardId, qrValue }]);
    setLastRedeemedReward({ ...reward, qrValue });

    sendEmail(reward, qrValue);
    alert(`🎉 ${reward.name} redeemed!`);
  };

  /* ================= DEMO CREDITS (ADMIN ONLY) ================= */
  const addDemoCredits = () => {
    setCredits((prev) => prev + 10);
    alert("💰 +10 Demo Credits added");
  };

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  /* ================= UI ================= */
  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <h1>🎁 Redeem Credits</h1>

      <p>
        Logged in as <strong>{user?.email}</strong>
      </p>

      <p>
        Credits: <strong>{credits}</strong>
      </p>

      {isAdmin && (
        <button
          onClick={addDemoCredits}
          style={{
            marginBottom: 20,
            padding: "6px 12px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          +10 Demo Credits (Admin)
        </button>
      )}

      <h2>Available Rewards</h2>

      <ul>
        {rewardCatalog.map((reward) => {
          const alreadyRedeemed = redeemed.some(
            (r) => r.rewardId === reward.rewardId
          );

          return (
            <li key={reward.rewardId} style={{ marginBottom: 10 }}>
              {reward.name} — {reward.requiredCredits} credits
              <button
                onClick={() => handleRedeem(reward)}
                disabled={alreadyRedeemed || credits < reward.requiredCredits}
                style={{
                  marginLeft: 10,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {alreadyRedeemed ? "Redeemed" : "Redeem"}
              </button>
            </li>
          );
        })}
      </ul>

      {lastRedeemedReward && (
        <div style={{ marginTop: 30, textAlign: "center" }}>
          <h3>🎉 {lastRedeemedReward.name}</h3>

          <QRCodeCanvas
            value={lastRedeemedReward.qrValue}
            size={150}
            level="H"
          />

          <p>Scan to claim reward</p>

          {emailSent && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              📧 Email sent to {user.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
