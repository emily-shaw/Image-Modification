document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const promptInput = document.getElementById('prompt');
  const form = document.getElementById('upload-form');
  const displaySection = document.getElementById('display-section');
  const displayPrompt = document.getElementById('display-prompt');
  const displayImage = document.getElementById('display-image');
  const resetBtn = document.getElementById('reset-btn');
  const bwDisplayPrompt = document.getElementById('bw-display-prompt');
  const bwDisplayImage = document.getElementById('bw-display-image');
  const copyOriginalBtn = document.getElementById('copy-original-btn');
  const copyBwBtn = document.getElementById('copy-bw-btn');
  const workOriginalBtn = document.getElementById('work-original-btn');
  const workBwBtn = document.getElementById('work-bw-btn');

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
    reduceImageOpacity(imagePreview.src, 0.9, function(opacityDataUrl) {
      bwDisplayImage.src = opacityDataUrl;
    });
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

  // Work with This Image logic
  function workWithImage(promptText, imageSrc) {
    displayPrompt.value = promptText;
    displayImage.src = imageSrc;
    bwDisplayPrompt.value = promptText;
    reduceImageOpacity(imageSrc, 0.9, function(opacityDataUrl) {
      bwDisplayImage.src = opacityDataUrl;
    });
    displaySection.style.display = 'block';
    form.style.display = 'none';
  }

  workOriginalBtn.addEventListener('click', function() {
    workWithImage(displayPrompt.value, displayImage.src);
  });

  workBwBtn.addEventListener('click', function() {
    workWithImage(bwDisplayPrompt.value, bwDisplayImage.src);
  });
});

function reduceImageOpacity(imageSrc, opacityFactor, callback) {
  const img = new window.Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i+3] = Math.round(data[i+3] * opacityFactor); // reduce alpha
    }
    ctx.putImageData(imageData, 0, 0);
    callback(canvas.toDataURL());
  };
  img.src = imageSrc;
} 