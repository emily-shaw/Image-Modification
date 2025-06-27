import express from "express";
import multer from "multer";
import Replicate from "replicate";
import fs from "node:fs";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.send('Backend is working!');
});

app.post("/process-image", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt;
  const imagePath = req.file.path;

  // Log when the endpoint is hit
  console.log("Received POST /process-image");
  console.log("Prompt:", prompt);
  console.log("Image path:", imagePath);

  // Read image as base64 data URL
  const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
  const dataUrl = `data:${req.file.mimetype};base64,${imageData}`;

  const input = {
    prompt: prompt,
    input_image: dataUrl,
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    safety_tolerance: 2
  };

  try {
    console.log("Calling Replicate API...");
    const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input });

    let imageUrl = null;

    if (output && typeof output.url === 'function') {
      // The output is an object with a .url() method
      imageUrl = await output.url();
      console.log("Replicate API response (image URL):", imageUrl);
    } else if (Array.isArray(output)) {
      imageUrl = output[output.length - 1];
      console.log("Replicate API response (image URL):", imageUrl);
    } else if (typeof output === 'string') {
      imageUrl = output;
      console.log("Replicate API response (image URL):", imageUrl);
    } else {
      console.log("Output is not a url object, array, or string. Type:", typeof output, "Value:", output);
    }

    res.json({ image: imageUrl });
  } catch (err) {
    console.error("Error from Replicate API:", err);
    res.status(500).json({ error: err.message });
  } finally {
    fs.unlinkSync(imagePath); // Clean up
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 