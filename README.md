# Iterative Image Generation App using Replicate + uv

# Image & Prompt Display Webpage

A modern, responsive static webpage that allows users to input a prompt and upload an image, then displays both the prompt and the image side-by-side, including a black & white version of the image.

## Features

- **Prompt Input**: Enter a custom prompt in a textarea
- **Image Upload**: Upload an image file (JPG, PNG, GIF, etc.) via file picker
- **Live Preview**: See a preview of the uploaded image before submitting
- **Display Section**: After submitting, view your prompt and image, plus a black & white version of the image and prompt
- **Reset Option**: Start over easily with the "Start Over" button
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Client-side Processing**: All image handling and conversion is done in the browser
- **Input Validation**: Ensures both prompt and image are provided before displaying

## How to Use

1. **Open the webpage**: Open `index.html` in any modern web browser
2. **Enter a prompt**: Type your description or prompt in the text area
3. **Upload an image**: Click to select an image file from your device
4. **Submit**: Click "Display Image & Prompt" to see your content
5. **View Results**: See your prompt and image, plus a black & white version, side by side
6. **Reset**: Use "Start Over" to clear everything and begin again

## File Structure

```
Image-Modification/
├── index.html       # Main HTML file
├── styles.css       # CSS styling and responsive design
├── script.js        # JavaScript functionality
└── README.md        # This file
```

## Browser Compatibility

This webpage works in all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Technical Details

- **No server required**: This is a pure static webpage
- **Client-side processing**: All image handling and black & white conversion is done in the browser using JavaScript and Canvas
- **File validation**: Only accepts image files (jpg, png, gif, etc.)
- **Responsive design**: Adapts to different screen sizes
- **Accessibility**: Includes proper labels and semantic HTML

## Customization

You can easily customize the webpage by:
- Modifying colors and layout in `styles.css`
- Changing the structure in `index.html`
- Adding new features in `script.js`

The webpage is designed to be easily extensible for additional functionality.

## Backend Setup for Replicate Image Generation

This project uses a Node.js backend to securely call the Replicate API for prompt-based image editing.

### 1. Install dependencies

```
npm install express multer replicate cors dotenv
```

### 2. Create a .env file

Add your Replicate API key to a `.env` file in the project root:

```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

### 3. Run the backend server

```
node server.js
```

The backend will listen on port 3001 by default.

### 4. How it works
- The frontend sends the current prompt and image to `http://localhost:3001/process-image`.
- The backend calls Replicate's `black-forest-labs/flux-kontext-pro` model and returns the generated image URL.
- The frontend displays the new image in the UI.

---
