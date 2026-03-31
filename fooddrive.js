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

// BUSINESS INPUT
const businessInput = document.createElement("input");
businessInput.placeholder = "Business Name";
app.appendChild(businessInput);

// STAND INPUT
const vendorInput = document.createElement("input");
vendorInput.placeholder = "Stand Number";
app.appendChild(vendorInput);

// BUTTON AREA
const btnBox = document.createElement("div");
btnBox.style.display = "flex";
btnBox.style.gap = "10px";
btnBox.style.marginTop = "15px";
app.appendChild(btnBox);

// PREVIEW BUTTON
const previewBtn = document.createElement("button");
previewBtn.innerText = "Preview";
btnBox.appendChild(previewBtn);

// DOWNLOAD BUTTON
const downloadBtn = document.createElement("button");
downloadBtn.innerText = "Download";
btnBox.appendChild(downloadBtn);

// SHARE BUTTON
const shareBtn = document.createElement("button");
shareBtn.innerText = "Share";
btnBox.appendChild(shareBtn);

// IMAGE SETTINGS
let uploadedImage = null;

let imgX = 0;
let imgY = 0;
let imgWidth = 0;
let imgHeight = 0;

// DRAG SETTINGS
let dragging = false;
let startX = 0;
let startY = 0;

// TEMPLATE IMAGE
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
      // AUTO FIT IMAGE
      imgWidth = 400;
      imgHeight = uploadedImage.height * (400 / uploadedImage.width);

      imgX = 100;
      imgY = 120;

      drawCanvas();
    };
  };

  reader.readAsDataURL(file);
});

// TEXT LIVE UPDATE
businessInput.addEventListener("input", drawCanvas);
vendorInput.addEventListener("input", drawCanvas);

// DRAG START
canvas.addEventListener("mousedown", (e) => {
  if (!uploadedImage) return;

  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;

  canvas.style.cursor = "grabbing";
});

// DRAG MOVE
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

// DRAG END
canvas.addEventListener("mouseup", () => {
  dragging = false;
  canvas.style.cursor = "grab";
});

canvas.addEventListener("mouseleave", () => {
  dragging = false;
  canvas.style.cursor = "grab";
});

canvas.style.cursor = "grab";

// ZOOM FEATURE
canvas.addEventListener("wheel", (e) => {
  if (!uploadedImage) return;

  e.preventDefault();

  let scale = e.deltaY < 0 ? 1.05 : 0.95;

  imgWidth *= scale;
  imgHeight *= scale;

  drawCanvas();
});

// DRAW FUNCTION
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

  // BUSINESS NAME
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Arial";

  ctx.fillText(businessInput.value, 300, 410);

  // STAND NUMBER
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
