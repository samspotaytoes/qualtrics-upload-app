const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const FormData = require("form-data"); // ✅ Add FormData
require("dotenv").config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const password = req.body.password;

  if (password !== process.env.UPLOAD_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const file = req.file;
  if (!file || !file.originalname.endsWith(".csv")) {
    return res.status(400).json({ error: "Only .csv files are allowed" });
  }

  try {
    console.log("Uploaded file info:", file);

    // ✅ Use FormData to structure the request correctly
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);

    const response = await axios.post(
      process.env.QUALTRICS_UPLOAD_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-API-TOKEN": process.env.QUALTRICS_API_TOKEN,
        },
      },
    );

    res.json({ message: "Upload succeeded", result: response.data });
  } catch (err) {
    console.error(
      err.response && err.response.data ? err.response.data : err.message,
    );
    res.status(500).json({
      error: "Upload failed",
      detail:
        err.response && err.response.data ? err.response.data : err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
