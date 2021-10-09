import jsQR from 'jsqr';
import { parseShc } from './parsers';
import axios from 'axios'
var { patientTemplate } = require("./patient.js");

const { findPatientResource, findImmunizationResources } = require('./helpers');

var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
let patientData = {};
var patientElement = document.getElementById("patient");
var iosPassButton = document.getElementById("generateiOSPass");
var linkToiOS = document.getElementById("linkToiOS");
var instructions = document.getElementById("instructions");


var requestID;
function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
  video.srcObject = stream;
  video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
  video.play();
  requestID = requestAnimationFrame(tick);
});

function tick() {
  loadingMessage.innerText = "⌛ Loading video..."
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;


    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

      console.log(code.data);
      canvasElement.hidden = true;
      parseShc(code.data).then(data => {
        patientData.shc = code.data;
        patientData.patient = findPatientResource(data.payload);
        patientData.immunizations = findImmunizationResources(data.payload);
        patientData.verifications = data.verifications;
        console.log(patientData)
        var patientTemplateCompiled = Handlebars.compile(patientTemplate);
        const t = patientTemplateCompiled(patientData)
        patientElement.innerHTML = t;
        let name = patientData.patient.name[0].family + ', ' + patientData.patient.name[0].given.join(' ');

        //linkToiOS.setAttribute('href', `https://370f-50-65-182-139.ngrok.io/api/GeneratePass?shc=${patientData.shc}&name=${name}&birthdate=${patientData.patient.birthDate}&code=BhnFLvyjJbYjxtzEovAPpZZPdEBNIFobkfOR3Jaf5bbC81C2TNOf1Q==`);
        linkToiOS.setAttribute('href', `https://generatepasses.azurewebsites.net/api/GeneratePass?code=BhnFLvyjJbYjxtzEovAPpZZPdEBNIFobkfOR3Jaf5bbC81C2TNOf1Q==&shc=${patientData.shc}&name=${name}&birthdate=${patientData.patient.birthDate}`);

        linkToiOS.hidden = false;
        instructions.style.display="none"
      })
      return;
    } else {
      // outputMessage.hidden = false;
      // outputData.parentElement.hidden = true;
    }
  }
  requestAnimationFrame(tick);
}

iosPassButton.onclick = function GenerateIOSPass() {
  canvasElement.hidden = true;
  parseShc(shcStatic).then(data => {
    patientData.shc = shcStatic;
    patientData.patient = findPatientResource(data.payload);
    patientData.immunizations = findImmunizationResources(data.payload);
    patientData.verifications = data.verifications;
    console.log(patientData)
    var patientTemplateCompiled = Handlebars.compile(patientTemplate);
    const t = patientTemplateCompiled(patientData)
    patientElement.innerHTML = t;
    let name = patientData.patient.name[0].family + ', ' + patientData.patient.name[0].given.join(' ');

    linkToiOS.setAttribute('href', `https://370f-50-65-182-139.ngrok.io/api/GeneratePass?shc=${patientData.shc}&name=${name}&birthdate=${patientData.patient.birthDate}`);
    linkToiOS.hidden = false;
    axios.get(`https://370f-50-65-182-139.ngrok.io/api/GeneratePass?shc=${patientData.shc}&name=${name}&birthdate=${patientData.patient.birthDate}`)
    // axios.post('https://370f-50-65-182-139.ngrok.io/api/GeneratePass', {
    //   shc: patientData.shc,
    //   name: patientData.patient.name[0].family + ', ' + patientData.patient.name[0].given.join(' '),
    //   birthDate: patientData.patient.birthDate,

    // });
  }
  )
}



