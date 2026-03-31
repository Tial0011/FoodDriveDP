// CREATE APP
const app = document.createElement("div");
app.className = "app";
document.body.appendChild(app);

// CANVAS
const canvas = document.createElement("canvas");
canvas.width = 600;
canvas.height = 800;
app.appendChild(canvas);

const ctx = canvas.getContext("2d");

// INPUTS
const businessInput = document.createElement("input");
businessInput.placeholder = "Business Name";
app.appendChild(businessInput);

const vendorInput = document.createElement("input");
vendorInput.placeholder = "Stand Number";
app.appendChild(vendorInput);

// BUTTON BOX
const btnBox = document.createElement("div");
btnBox.className = "btnBox";
app.appendChild(btnBox);

// UPLOAD BUTTON
const uploadBtn = document.createElement("button");
uploadBtn.innerText = "Upload";
uploadBtn.className = "upload";
btnBox.appendChild(uploadBtn);

// DOWNLOAD BUTTON
const downloadBtn = document.createElement("button");
downloadBtn.innerText = "Download";
downloadBtn.className = "download";
btnBox.appendChild(downloadBtn);

// SHARE BUTTON
const shareBtn = document.createElement("button");
shareBtn.innerText = "Share";
shareBtn.className = "share";
btnBox.appendChild(shareBtn);

// FILE INPUT
const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "image/*";
uploadInput.style.display = "none";
document.body.appendChild(uploadInput);

uploadBtn.onclick = () => uploadInput.click();

// IMAGE VARIABLES
let uploadedImage = null;
let imgX = 70;
let imgY = 120;
let imgWidth = 400;
let imgHeight = 300;

let dragging = false;
let startX = 0;
let startY = 0;
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

      imgX = 70;
      imgY = 120;

      drawCanvas();
    };
  };

  reader.readAsDataURL(file);
});

// LIVE TEXT UPDATE
businessInput.addEventListener("input", drawCanvas);
vendorInput.addEventListener("input", drawCanvas);

// TOUCH START
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

// TOUCH MOVE
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();

  if (!uploadedImage) return;

  if (dragging && e.touches.length === 1) {
    let dx = e.touches[0].clientX - startX;
    let dy = e.touches[0].clientY - startY;

    imgX += dx;
    imgY += dy;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    drawCanvas();
  }

  if (e.touches.length === 2) {
    let newDistance = getDistance(e.touches[0], e.touches[1]);

    let scale = newDistance / pinchStartDistance;

    imgWidth *= scale;
    imgHeight *= scale;

    pinchStartDistance = newDistance;

    drawCanvas();
  }
});

canvas.addEventListener("touchend", () => (dragging = false));

// DESKTOP DRAG
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

// PINCH DISTANCE
function getDistance(p1, p2) {
  let dx = p1.clientX - p2.clientX;
  let dy = p1.clientY - p2.clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

// DRAW CANVAS
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  // PHOTO AREA (shifted left slightly)
  const boxX = 110;
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

  // AUTO RESIZE BUSINESS NAME
  let name = businessInput.value;
  let fontSize = 50;

  ctx.font = fontSize + "px Bebas Neue";

  while (ctx.measureText(name).width > 500) {
    fontSize--;
    ctx.font = fontSize + "px Bebas Neue";
  }

  // BUSINESS NAME
  ctx.textAlign = "center";
  ctx.fillStyle = "#111";
  ctx.fillText(name, 300, 430);

  // STAND LABEL
  ctx.fillStyle = "#666";
  ctx.font = "22px Poppins";
  ctx.fillText("STAND NO", 300, 720);

  // STAND NUMBER
  ctx.fillStyle = "#2ecc71";
  ctx.font = "bold 70px Poppins";
  ctx.fillText(vendorInput.value, 300, 780);
}

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
      title: "Trade Fair DP",
      files: [file],
    });
  } else {
    alert("Sharing not supported on this browser");
  }
};
