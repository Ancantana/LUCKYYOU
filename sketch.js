let messageIndex = 0;
let messages = [
  "Hello",
  "My name is AVI. I am a digital assistant created by An.",
  "If it's alright with you, I'd like to ask you to do something for me.",
  "But first, let me explain why.",
  "You will be given a number based on the area and duration you hold your mouse down for.",
  "Okay now, hold your mouse down for me. You are free to let go whenever you'd like.",
  "You have been assigned the number (). Please click one more time to have your picture taken."
];

let holdingMouse = false;
let startTime, endTime;
let assignedNumber;
let currentSize = 5;
let pinkHue = 330;
let pictureTaken = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  randomSeed(); // Set a random seed
  displayMessage();
}

function draw() {
  if (holdingMouse) {
    let pulseSpeed = calculatePulseSpeed();
    let targetSize = map(sin(frameCount * pulseSpeed), -1, 1, 5, 20);
    currentSize = lerp(currentSize, targetSize, 0.1);

    let circleColor = color('hsb(' + pinkHue + ', 100%, 100%)');

    background(255);
    fill(circleColor);
    noStroke();
    ellipse(mouseX, mouseY, currentSize, currentSize);
  }
}

function mousePressed() {
  holdingMouse = true;
  startTime = millis();
}

function mouseReleased() {
  holdingMouse = false;
  endTime = millis();
  calculateAssignedNumber();
  if (messageIndex < messages.length - 1) {
    messageIndex++;
    displayMessage();
  } else if (!pictureTaken) {
    takePicture();
    pictureTaken = true; // Set the flag to true after taking one picture
  }
}

function calculateAssignedNumber() {
  let holdDuration = (endTime - startTime) / 1000;
  let area = sq(mouseX - width / 2) + sq(mouseY - height / 2);

  let noiseValue = noise(area * 0.01, holdDuration * 0.1);
  
  assignedNumber = floor(map(noiseValue, 0, 1, 1, 20));
  assignedNumber = constrain(assignedNumber, 1, 20);

  messages[6] = `You have been assigned the number (${assignedNumber}). Please click one more time to have your picture taken.`;
}

function calculatePulseSpeed() {
  let holdDuration = (millis() - startTime) / 1000;
  let area = sq(mouseX - width / 2) + sq(mouseY - height / 2);

  let pulseSpeed = map(area * holdDuration, 0, width * height * 10, 0.01, 0.1);
  pulseSpeed = constrain(pulseSpeed, 0.01, 0.1);

  return pulseSpeed;
}

function displayMessage() {
  background(255);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  
  let textY = height / 2;
  text(messages[messageIndex], width / 2, textY);
}

function takePicture() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      // Create a video element to display the camera stream
      let video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for a short time to ensure the camera is ready
      setTimeout(() => {
        // Create a canvas with the same aspect ratio as the video
        let aspectRatio = video.videoWidth / video.videoHeight;
        let canvas = document.createElement('canvas');
        canvas.width = windowWidth;
        canvas.height = windowWidth / aspectRatio;

        // Draw the current frame from the video stream onto the canvas
        let context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas content to a data URL
        let dataURL = canvas.toDataURL();

        // Create a link element to download the picture
        let link = document.createElement('a');
        link.href = dataURL;
        link.download = 'picture.png';

        // Trigger a click on the link to start the download
        link.click();

        // Stop the video stream
        stream.getTracks().forEach(track => track.stop());
      }, 1000); // Adjust the time delay as needed
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
    });
}
