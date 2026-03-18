/* Image Classifier Demo — runs MobileNetV2 in-browser via TensorFlow.js */

let classifierModel = null;

function openImageClassifierDemo(e) {
  e.preventDefault();
  document.getElementById('classifier-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Preload model in background
  if (!classifierModel) {
    mobilenet.load({ version: 2, alpha: 1.0 }).then(m => { classifierModel = m; });
  }
}

function closeClassifierDemo() {
  document.getElementById('classifier-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// Close on overlay click
document.getElementById('classifier-modal').addEventListener('click', function (e) {
  if (e.target === this) closeClassifierDemo();
});

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeClassifierDemo();
});

// File upload handling
const dropZone = document.getElementById('demo-drop-zone');
const fileInput = document.getElementById('demo-file-input');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImage(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleImage(file);
});

/**
 * Preprocess image: resize to 224x224 with center crop for better accuracy.
 * MobileNetV2 expects 224x224 input — stretching distorts features.
 */
function preprocessImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const targetSize = 224;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Center-crop: use the largest square from the center of the image
  const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
  const srcX = (img.naturalWidth - srcSize) / 2;
  const srcY = (img.naturalHeight - srcSize) / 2;

  // Draw with high-quality resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, targetSize, targetSize);

  return canvas;
}

async function handleImage(file) {
  // Show loading immediately
  document.getElementById('demo-loading').style.display = 'flex';
  document.getElementById('demo-results').style.display = 'none';

  // Load image from file using a fresh Image object (avoids race conditions)
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = URL.createObjectURL(file);
  });

  // Show preview
  const previewImg = document.getElementById('demo-image');
  previewImg.src = img.src;
  document.getElementById('demo-preview').style.display = 'block';

  try {
    // Load model if not yet loaded
    if (!classifierModel) {
      classifierModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    }

    // Preprocess: center-crop and resize to 224x224
    const processedCanvas = preprocessImage(img);

    // Classify the preprocessed canvas (not the raw img element)
    const predictions = await classifierModel.classify(processedCanvas, 5);

    // Show results
    const container = document.getElementById('demo-predictions');
    container.innerHTML = predictions
      .map((p) => {
        const pct = (p.probability * 100).toFixed(1);
        // Clean up ImageNet class names (remove comma-separated synonyms)
        const label = p.className.split(',')[0].trim();
        return `
          <div class="demo-pred-row">
            <span class="demo-pred-label" title="${p.className}">${label}</span>
            <div class="demo-pred-bar-bg">
              <div class="demo-pred-bar" style="width: ${pct}%"></div>
            </div>
            <span class="demo-pred-score">${pct}%</span>
          </div>`;
      })
      .join('');

    document.getElementById('demo-results').style.display = 'block';
  } catch (err) {
    console.error('Classification error:', err);
    document.getElementById('demo-predictions').innerHTML =
      '<p style="color:#ef4444;">Error classifying image. Please try again.</p>';
    document.getElementById('demo-results').style.display = 'block';
  } finally {
    document.getElementById('demo-loading').style.display = 'none';
  }
}
