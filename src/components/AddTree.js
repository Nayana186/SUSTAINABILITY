import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useUser } from "../AuthProvider";
import { useNavigate } from "react-router-dom"; // <- import navigate

/* ================= CONFIG ================= */
const DAILY_LIMIT = 3;
const DEMO_EMAIL = "b24ee046@gmail.com"; // unlimited access

const speciesMap = {
  "Azadirachta indica": "Neem",
  "Mangifera indica": "Mango",
  "Tectona grandis": "Teak",
  "Bambusa vulgaris": "Bamboo",
};

const speciesCO2 = {
  Neem: 22,
  Mango: 30,
  Teak: 50,
  Bamboo: 12,
};

const ageRangeMap = {
  seedling: 1,
  young: 3,
  mature: 8,
  old: 12,
};

export default function AddTree() {
  const { user } = useUser();
  const navigate = useNavigate(); // <- initialize navigate

  const [species, setSpecies] = useState("");
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [organ, setOrgan] = useState("leaf");
  const [ageMode, setAgeMode] = useState("exact");
  const [age, setAge] = useState("");
  const [ageRange, setAgeRange] = useState("young");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= LOCATION ================= */
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => setMessage("Location permission denied")
    );
  };

  /* ================= CLOUDINARY ================= */
  const uploadImageToCloudinary = async (file) => {
    const url = "https://api.cloudinary.com/v1_1/dhl70c7m2/upload";
    const preset = "vuddza3n";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  /* ================= PLANTNET ================= */
  const identifyPlant = async (file) => {
    const formData = new FormData();
    formData.append("organs", organ);
    formData.append("images", file);

    try {
      const response = await fetch("http://localhost:3000/plantnet", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data?.results?.length > 0) {
        const options = data.results.map((r) => ({
          scientific: r.species.scientificName,
          common:
            r.species.commonNames?.[0] ||
            speciesMap[r.species.scientificName] ||
            r.species.scientificName,
          imageUrl: r.species.defaultImage?.url || null,
        }));

        setSpeciesOptions(options);
        return options[0].scientific;
      }

      return null;
    } catch (err) {
      console.error("PlantNet error:", err);
      return null;
    }
  };

  /* ================= DAILY LIMIT ================= */
  const checkDailyLimit = async () => {
    if (user.email === DEMO_EMAIL) return true;

    const q = query(collection(db, "trees"), where("userId", "==", user.uid));
    const snap = await getDocs(q);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = snap.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate?.();
      if (!createdAt) return false;
      return createdAt >= today;
    }).length;

    return todayCount < DAILY_LIMIT;
  };

  /* ================= IMAGE HANDLER ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setLoading(true);
    setMessage("Identifying plant species...");

    const guessedScientific = await identifyPlant(file);

    if (!guessedScientific) {
      setSpecies("");
      setMessage("Could not identify species. You can type it manually.");
    } else {
      const matched = speciesOptions.find(
        (s) => s.scientific === guessedScientific
      );
      setSpecies(matched?.common || guessedScientific);
      setMessage(`Detected: ${matched?.common || guessedScientific}`);
    }

    setLoading(false);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!species || !imageFile || !location) {
      setMessage("Species, image, and location required");
      return;
    }

    setLoading(true);

    try {
      const allowed = await checkDailyLimit();

      if (!allowed) {
        setMessage("Daily limit reached (3 trees/day)");
        setLoading(false);
        return;
      }

      const imageUrl = await uploadImageToCloudinary(imageFile);
      const co2PerYear = speciesCO2[species] || 10;

      let finalAge = 1;
      let confidence = "low";
      let ageEstimateType = "unknown";

      if (ageMode === "exact" && age) {
        finalAge = Number(age);
        confidence = "high";
        ageEstimateType = "exact";
      }

      if (ageMode === "range") {
        finalAge = ageRangeMap[ageRange];
        confidence = "medium";
        ageEstimateType = "range";
      }

      finalAge = Math.min(finalAge, 30);
      const totalCO2TillNow = finalAge * co2PerYear;

      await addDoc(collection(db, "trees"), {
        species,
        age: finalAge,
        ageMode,
        ageEstimateType,
        confidence,
        co2PerYear,
        totalCO2TillNow,
        imageUrl,
        location,
        trustLevel: "photo",
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setMessage("Tree added successfully 🌱");
      setSpecies("");
      setAge("");
      setImageFile(null);
      setSpeciesOptions([]);
      setLocation(null);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add tree");
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, width: 450 }}>
      <h2>Add Tree</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <br /><br />

        <label>Plant organ</label>
        <select value={organ} onChange={(e) => setOrgan(e.target.value)}>
          <option value="leaf">Leaf</option>
          <option value="flower">Flower</option>
          <option value="fruit">Fruit</option>
        </select>
        <br /><br />

        <label>Species</label>
        <input
          list="speciesList"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          placeholder="Type or select species"
        />
        <datalist id="speciesList">
          {speciesOptions.map((s, i) => (
            <option key={i} value={s.common}>
              {s.common} ({s.scientific})
            </option>
          ))}
        </datalist>

        <br /><br />

        <label>Age mode</label>
        <select value={ageMode} onChange={(e) => setAgeMode(e.target.value)}>
          <option value="exact">Exact</option>
          <option value="range">Range</option>
          <option value="unknown">Unknown</option>
        </select>
        <br /><br />

        {ageMode === "exact" && (
          <input
            type="number"
            min="1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age in years"
          />
        )}

        {ageMode === "range" && (
          <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            <option value="seedling">Seedling</option>
            <option value="young">Young</option>
            <option value="mature">Mature</option>
            <option value="old">Old</option>
          </select>
        )}

        <br /><br />

        <button type="button" onClick={captureLocation}>
          📍 Capture Location
        </button>
        {location && (
          <p>
            Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
          </p>
        )}
        <br />

        <button disabled={loading}>
          {loading ? "Processing..." : "Add Tree"}
        </button>
      </form>

      <br />
      {/* ================= NEW BUTTON ================= */}
      <button
  onClick={() => navigate("/plantation")}
  style={{
    marginTop: 10,
    background: "#4caf50",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  }}
>
  Switch to Plantation / Farm Mode
</button>

    </div>
  );
}