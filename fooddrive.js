// APP CONTAINER
const app = document.createElement("div");
app.className = "app";
document.body.appendChild(app);

// DP CONTAINER
const dpContainer = document.createElement("div");
dpContainer.className = "dp-container";
app.appendChild(dpContainer);

// CANVAS
const canvas = document.createElement("canvas");
canvas.width = 600;
canvas.height = 800;
dpContainer.appendChild(canvas);

const ctx = canvas.getContext("2d");

// UPLOAD AREA
const uploadArea = document.createElement("div");
uploadArea.className = "upload-area";
uploadArea.innerText = "Upload Photo";
dpContainer.appendChild(uploadArea);

// FILE INPUT
const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "image/*";
uploadInput.style.display = "none";
document.body.appendChild(uploadInput);

uploadArea.onclick = () => uploadInput.click();

// INPUTS
const businessInput = document.createElement("input");
businessInput.placeholder = "Business Name";
app.appendChild(businessInput);

const vendorInput = document.createElement("input");
vendorInput.placeholder = "Stand Number";
app.appendChild(vendorInput);

// BUTTON AREA
const btnBox = document.createElement("div");
btnBox.style.display = "flex";
btnBox.style.gap = "10px";
btnBox.style.marginTop = "15px";
app.appendChild(btnBox);

const previewBtn = document.createElement("button");
previewBtn.innerText = "Preview";
btnBox.appendChild(previewBtn);

const downloadBtn = document.createElement("button");
downloadBtn.innerText = "Download";
btnBox.appendChild(downloadBtn);

const shareBtn = document.createElement("button");
shareBtn.innerText = "Share";
btnBox.appendChild(shareBtn);

// IMAGE SETTINGS
let uploadedImage = null;

let imgX = 100;
let imgY = 120;
let imgWidth = 400;
let imgHeight = 300;

// DRAG STATE
let dragging = false;
let startX = 0;
let startY = 0;

// PINCH STATE
let pinchStartDistance = 0;

// TEMPLATE
const template = new Image();
template.src = "FoodDrive.jpg";
template.onload = drawCanvas;

// IMAGE UPLOAD
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    uploadedImage = new Image();
    uploadedImage.src = reader.result;

    uploadedImage.onload = () => {
      imgWidth = 400;
      imgHeight = uploadedImage.height * (400 / uploadedImage.width);

      imgX = 100;
      imgY = 120;

      drawCanvas();
    };
  };

  reader.readAsDataURL(file);
});

// LIVE TEXT UPDATE
businessInput.addEventListener("input", drawCanvas);
vendorInput.addEventListener("input", drawCanvas);

// ------------------
// TOUCH DRAG
// ------------------

canvas.addEventListener("touchstart", (e) => {
  if (!uploadedImage) return;

  if (e.touches.length === 1) {
    dragging = true;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }

  if (e.touches.length === 2) {
    pinchStartDistance = getDistance(e.touches[0], e.touches[1]);
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();

  if (!uploadedImage) return;

  // DRAG
  if (dragging && e.touches.length === 1) {
    let dx = e.touches[0].clientX - startX;
    let dy = e.touches[0].clientY - startY;

    imgX += dx;
    imgY += dy;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    drawCanvas();
  }

  // PINCH ZOOM
  if (e.touches.length === 2) {
    let newDistance = getDistance(e.touches[0], e.touches[1]);

    let scale = newDistance / pinchStartDistance;

    imgWidth *= scale;
    imgHeight *= scale;

    pinchStartDistance = newDistance;

    drawCanvas();
  }
});

canvas.addEventListener("touchend", () => {
  dragging = false;
});

// ------------------
// DESKTOP DRAG (optional)
// ------------------

canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  let dx = e.offsetX - startX;
  let dy = e.offsetY - startY;

  imgX += dx;
  imgY += dy;

  startX = e.offsetX;
  startY = e.offsetY;

  drawCanvas();
});

canvas.addEventListener("mouseup", () => (dragging = false));

// ------------------
// DISTANCE FOR PINCH
// ------------------

function getDistance(p1, p2) {
  let dx = p1.clientX - p2.clientX;
  let dy = p1.clientY - p2.clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

// ------------------
// DRAW CANVAS
// ------------------

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  const boxX = 150;
  const boxY = 120;
  const boxW = 300;
  const boxH = 250;

  if (uploadedImage) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    ctx.drawImage(uploadedImage, imgX, imgY, imgWidth, imgHeight);

    ctx.restore();
  }

  // TEXT
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Arial";

  ctx.fillText(businessInput.value, 300, 410);

  ctx.font = "bold 26px Arial";

  ctx.fillText("Stand No: " + vendorInput.value, 300, 760);
}

// PREVIEW
previewBtn.onclick = drawCanvas;

// DOWNLOAD
downloadBtn.onclick = () => {
  const link = document.createElement("a");

  link.download = "tradefair-dp.png";

  link.href = canvas.toDataURL("image/png");

  link.click();
};

// SHARE
shareBtn.onclick = async () => {
  const dataUrl = canvas.toDataURL();

  const blob = await (await fetch(dataUrl)).blob();

  const file = new File([blob], "dp.png", { type: "image/png" });

  if (navigator.share) {
    navigator.share({
      title: "My Trade Fair DP",
      files: [file],
    });
  } else {
    alert("Sharing not supported on this browser");
  }
};
