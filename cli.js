import Replicate from "replicate";
import fs from "node:fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();
import path from "node:path";
import open from "open";

// Usage: node cli.js "your prompt here" /path/to/image.jpg
const [,, prompt, imagePath] = process.argv;

if (!prompt || !imagePath) {
  console.log("Usage: node cli.js \"your prompt here\" /path/to/image.jpg");
  process.exit(1);
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
  const dataUrl = `data:image/jpeg;base64,${imageData}`;

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
      imageUrl = await output.url();
    } else if (Array.isArray(output)) {
      imageUrl = output[output.length - 1];
    } else if (typeof output === 'string' || output instanceof URL) {
      imageUrl = String(output);
    }
    if (imageUrl) {
      console.log("Prompt:", prompt);
      // Download the image
      const imagesDir = path.join(process.cwd(), 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
      }
      const fileName = `output_${Date.now()}.jpg`;
      const filePath = path.join(imagesDir, fileName);
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
      const dest = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        response.body.pipe(dest);
        response.body.on('error', reject);
        dest.on('finish', resolve);
      });
      console.log(`Image downloaded to: ${filePath}`);
      await open(filePath);
    } else {
      console.log("No image URL returned.");
    }
  } catch (err) {
    console.error("Error from Replicate API:", err);
  }
}

main(); 