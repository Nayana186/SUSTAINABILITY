import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../AuthProvider";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com";
import "./Redeem.css";

/* ================= ADMIN CONFIG ================= */
const ADMIN_EMAILS = ["b24ee046@gmail.com"];

export default function Redeem() {
  const { user } = useUser();
  const [credits, setCredits] = useState(0);
  const [redeemed, setRedeemed] = useState([]);
  const [lastRedeemedReward, setLastRedeemedReward] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const rewardCatalog = useMemo(
    () => [
      { rewardId: "amazon50", name: "₹50 Amazon Voucher", requiredCredits: 10 },
      { rewardId: "gift200", name: "₹200 Gift Card", requiredCredits: 1 },
      { rewardId: "merch", name: "Exclusive Merchandise", requiredCredits: 1 },
    ],
    []
  );

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setCredits(data.credits || 0);
        setRedeemed(data.redeemedRewards || []);
      }
    };

    fetchUser();
  }, [user]);

  const sendEmail = (reward, qrValue) => {
    emailjs
      .send(
        "service_9xh1upk",
        "template_mgxpmfd",
        {
          email: user.email,
          rewardName: reward.name,
          creditsSpent: reward.requiredCredits,
          qrCode: qrValue,
        },
        "avg7c4hPcgQ8J5nJ8"
      )
      .then(() => {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 4000);
      })
      .catch(() => alert("Email failed"));
  };

  const handleRedeem = async (reward) => {
    if (credits < reward.requiredCredits) return alert("Not enough credits!");
    if (redeemed.some((r) => r.rewardId === reward.rewardId))
      return alert("Already redeemed!");

    const qrValue = `${user.uid}-${reward.rewardId}-${Date.now()}`;

    await updateDoc(doc(db, "users", user.uid), {
      credits: credits - reward.requiredCredits,
      redeemedRewards: arrayUnion({
        rewardId: reward.rewardId,
        date: new Date(),
        qrValue,
      }),
    });

    setCredits((c) => c - reward.requiredCredits);
    setRedeemed((r) => [...r, { rewardId: reward.rewardId, qrValue }]);
    setLastRedeemedReward({ ...reward, qrValue });

    sendEmail(reward, qrValue);
  };

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  return (
    <div
     className="redeem-page"
     style={{ backgroundImage: "url(/forest.jpg)" }}
     >
      <div className="redeem-card">
        <h1>Redeem Credits</h1>

        <p className="redeem-info">
          Logged in as <strong>{user?.email}</strong>
        </p>

        <p className="redeem-credits">Credits: {credits}</p>

        {isAdmin && (
          <button className="admin-btn" onClick={() => setCredits((c) => c + 10)}>
            +10 Demo Credits (Admin)
          </button>
        )}

        <h2>Available Rewards</h2>

        <ul className="reward-list">
          {rewardCatalog.map((reward) => {
            const used = redeemed.some(
              (r) => r.rewardId === reward.rewardId
            );

            return (
              <li key={reward.rewardId} className="reward-item">
                {reward.name} — {reward.requiredCredits} credits
                <button
                  className="redeem-btn"
                  disabled={used || credits < reward.requiredCredits}
                  onClick={() => handleRedeem(reward)}
                >
                  {used ? "Redeemed" : "Redeem"}
                </button>
              </li>
            );
          })}
        </ul>

        {lastRedeemedReward && (
          <div className="qr-box">
            <h3>{lastRedeemedReward.name}</h3>
            <QRCodeCanvas value={lastRedeemedReward.qrValue} size={150} />
            <p>Scan to claim reward</p>

            {emailSent && (
              <p className="email-success">
                📧 Email sent to {user.email}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
