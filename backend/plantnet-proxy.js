import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

const app = express();
const PORT = 3000;

app.use(cors());

// Multer to handle file upload
const upload = multer();

const PLANTNET_API_KEY = "2b10REMiSx8Es15ked4wC3kcb";

app.post("/plantnet", upload.single("images"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const formData = new FormData();
    formData.append("organs", req.body.organs || "leaf");
    // Append the uploaded file as a buffer with filename and MIME type
    formData.append("images", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (err) {
    console.error("PlantNet proxy error:", err.response?.data || err.message);
    res.status(500).json({ error: "PlantNet request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`PlantNet proxy running on port ${PORT}`);
});
