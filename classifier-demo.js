/* Image Classifier Demo — runs MobileNetV2 in-browser via TensorFlow.js */

let classifierModel = null;

function openImageClassifierDemo(e) {
  e.preventDefault();
  document.getElementById('classifier-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
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

async function handleImage(file) {
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('demo-image');
    img.src = e.target.result;
    document.getElementById('demo-preview').style.display = 'block';
    document.getElementById('demo-results').style.display = 'none';
  };
  reader.readAsDataURL(file);

  // Show loading
  document.getElementById('demo-loading').style.display = 'flex';
  document.getElementById('demo-results').style.display = 'none';

  try {
    // Load model on first use
    if (!classifierModel) {
      classifierModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    }

    // Wait for image to load
    const img = document.getElementById('demo-image');
    await new Promise((resolve) => {
      if (img.complete) resolve();
      else img.onload = resolve;
    });

    // Classify
    const predictions = await classifierModel.classify(img, 5);

    // Show results
    const container = document.getElementById('demo-predictions');
    container.innerHTML = predictions
      .map((p) => {
        const pct = (p.probability * 100).toFixed(1);
        return `
          <div class="demo-pred-row">
            <span class="demo-pred-label">${p.className}</span>
            <div class="demo-pred-bar-bg">
              <div class="demo-pred-bar" style="width: ${pct}%"></div>
            </div>
            <span class="demo-pred-score">${pct}%</span>
          </div>`;
      })
      .join('');

    document.getElementById('demo-results').style.display = 'block';
  } catch (err) {
    document.getElementById('demo-predictions').innerHTML =
      '<p style="color:#ef4444;">Error classifying image. Please try again.</p>';
    document.getElementById('demo-results').style.display = 'block';
  } finally {
    document.getElementById('demo-loading').style.display = 'none';
  }
}
