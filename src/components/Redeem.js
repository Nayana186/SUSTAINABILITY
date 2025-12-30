import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../AuthProvider";
import { QRCodeCanvas } from "qrcode.react";

export default function Redeem() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [redeemed, setRedeemed] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [lastRedeemedReward, setLastRedeemedReward] = useState(null);

  // Reward catalog
  const rewardCatalog = useMemo(
    () => [
      { rewardId: "amazon50", name: "₹50 Amazon Voucher", requiredCredits: 10 },
      { rewardId: "gift200", name: "₹200 Gift Card", requiredCredits: 1 },
      { rewardId: "merch", name: "Exclusive Merchandise", requiredCredits: 50 },
    ],
    []
  );

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCredits(data.credits || 0);
          setRedeemed(data.redeemedRewards || []);
        }
        setAvailableRewards(rewardCatalog);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUser();
  }, [user, rewardCatalog]);

  // Redeem a reward
  const handleRedeem = async (reward) => {
    if (credits < reward.requiredCredits) {
      alert("Not enough credits to redeem this reward!");
      return;
    }

    if (redeemed.some((r) => r.rewardId === reward.rewardId)) {
      alert("Reward already redeemed!");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const qrValue = `${user.uid}-${reward.rewardId}-${Date.now()}`;

      await updateDoc(userRef, {
        redeemedRewards: arrayUnion({ rewardId: reward.rewardId, date: new Date(), qrValue }),
        credits: credits - reward.requiredCredits,
      });

      setCredits((prev) => prev - reward.requiredCredits);
      setRedeemed((prev) => [...prev, { rewardId: reward.rewardId, qrValue }]);
      setLastRedeemedReward({ ...reward, qrValue });

      alert(`🎉 Redeemed: ${reward.name}`);
    } catch (err) {
      console.error("Failed to redeem reward:", err);
      alert("Failed to redeem reward. Try again later.");
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <h1>🎁 Redeem Your Credits</h1>
      <p>You currently have <strong>{credits}</strong> credits.</p>

      <h2>Available Rewards</h2>
      <ul>
        {availableRewards.map((reward) => {
          const alreadyRedeemed = redeemed.some(r => r.rewardId === reward.rewardId);
          return (
            <li key={reward.rewardId} style={{ marginBottom: 10 }}>
              {reward.name} - {reward.requiredCredits} credits
              <button
                onClick={() => handleRedeem(reward)}
                disabled={credits < reward.requiredCredits || alreadyRedeemed}
                style={{
                  marginLeft: 10,
                  padding: "4px 8px",
                  cursor: credits < reward.requiredCredits || alreadyRedeemed ? "not-allowed" : "pointer",
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
          <h3>🎉 Redeemed: {lastRedeemedReward.name}</h3>
          <QRCodeCanvas
            value={lastRedeemedReward.qrValue}
            size={150}
            level="H"
          />
          <p>Scan this QR code to claim your reward!</p>
        </div>
      )}
    </div>
  );
}
