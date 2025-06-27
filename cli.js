import Replicate from "replicate";
import fs from "node:fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import chalk from "chalk";
import boxen from "boxen";
dotenv.config();
import path from "node:path";
import open from "open";

// Usage: node cli.js [-o] "your prompt here" /path/to/image.jpg [-o]
const args = process.argv.slice(2);
let openImage = false;
let prompt, imagePath;

// Support -o at any position
const oIndex = args.indexOf('-o');
if (oIndex !== -1) {
  openImage = true;
  args.splice(oIndex, 1); // Remove -o from args
}

prompt = args[0];
imagePath = args[1];

if (!prompt || !imagePath) {
  console.log(boxen(chalk.bold.red("Usage: node cli.js [-o] \"your prompt here\" /path/to/image.jpg [-o]"), {padding: 1, borderColor: 'red', borderStyle: 'round'}));
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
    console.log(boxen(chalk.cyanBright("Calling Replicate API..."), {padding: 1, borderColor: 'cyan', borderStyle: 'round'}));
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
      console.log(boxen(chalk.greenBright("Prompt: ") + chalk.white(prompt), {padding: 1, borderColor: 'green', borderStyle: 'round'}));
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
      console.log(boxen(chalk.greenBright(`Image downloaded to: ${filePath}`), {padding: 1, borderColor: 'green', borderStyle: 'round'}));
      // Store filePath for later use
      return filePath;
    } else {
      console.log(boxen(chalk.yellow("No image URL returned."), {padding: 1, borderColor: 'yellow', borderStyle: 'round'}));
      return null;
    }
  } catch (err) {
    console.error(boxen(chalk.red("Error from Replicate API: ") + chalk.white(err), {padding: 1, borderColor: 'red', borderStyle: 'round'}));
    return null;
  }
}

main().then((filePath) => {
  if (openImage && filePath) {
    open(filePath);
  }
}); 