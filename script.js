document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');
  const promptInput = document.getElementById('prompt');
  const form = document.getElementById('upload-form');
  const displaySection = document.getElementById('display-section');
  const displayPrompt = document.getElementById('display-prompt');
  const displayImage = document.getElementById('display-image');
  const resetBtn = document.getElementById('reset-btn');
  const bwDisplayPrompt = document.getElementById('bw-display-prompt');
  const bwDisplayImage = document.getElementById('bw-display-image');

  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        imagePreview.src = ev.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const prompt = promptInput.value.trim();
    const file = imageInput.files[0];
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    displayPrompt.value = prompt;
    displayImage.src = imagePreview.src;
    bwDisplayPrompt.value = prompt;
    displaySection.style.display = 'block';
    form.style.display = 'none';
  });

  resetBtn.addEventListener('click', function() {
    form.reset();
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    displaySection.style.display = 'none';
    form.style.display = 'block';
    promptInput.value = '';
  });

  async function processWithReplicate(prompt, imageDataUrl) {
    // Convert dataURL to Blob
    const blob = await (await fetch(imageDataUrl)).blob();
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('image', blob, 'input.png');

    const response = await fetch('http://localhost:3001/process-image', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.image; // This is the URL to the processed image
  }

  async function workWithImage(promptText, imageSrc) {
    displayPrompt.value = promptText;
    displayImage.src = imageSrc;
    bwDisplayPrompt.value = promptText;
    // Show loading state
    bwDisplayImage.src = '';
    bwDisplayImage.alt = 'Processing...';
    bwDisplayImage.style.opacity = 0.5;
    try {
      console.log('About to POST to /process-image'); // Debug log before fetch
      const processedImageUrl = await processWithReplicate(promptText, imageSrc);
      bwDisplayImage.src = processedImageUrl;
      bwDisplayImage.alt = 'Processed Image';
      bwDisplayImage.style.opacity = 1;
    } catch (err) {
      bwDisplayImage.alt = 'Error processing image';
      alert('Error processing image: ' + err.message);
    }
    displaySection.style.display = 'block';
    form.style.display = 'none';
  }
  // Add event listeners for 'Work with This Image' buttons
  document.getElementById('work-original-btn').addEventListener('click', async function() {
    const promptText = promptInput.value;
    const currentImage = displayImage.src;
    await workWithImage(promptText, currentImage);
  });

  document.getElementById('work-bw-btn').addEventListener('click', async function() {
    const promptText = bwDisplayPrompt.value;
    const currentImage = bwDisplayImage.src;
    await workWithImage(promptText, currentImage);
    // Update the prompt input field with the prompt just used (only for bw)
    promptInput.value = promptText;
  });
});