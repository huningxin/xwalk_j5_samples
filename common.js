function Message (object, method, args) {
  this.type = 'message';
  this.data = {
    object: object,
    method: method,
    args: args
  };
}

function InitTitle() {
  if (typeof process !== 'undefined') {
    console.log('Running in Crosswalk + Node.js mode');
    var device = document.getElementById('device');
    device.innerHTML = 'Device GUI';
  } else {
    console.log('Running in Browser mode');
    var device = document.getElementById('device');
    device.innerHTML = 'Remote GUI';
  }
}

function MessageClient(ws) {
  this.ws = ws;

  this.send = function (object, method, args) {
    var message = new Message(object, method, args);
    this.ws.send(JSON.stringify(message));
  }
}

function MessageDispatcher() {
  this.objects = {};
  this.on = function(object, method, handler) {
    if (typeof this.objects[object] === 'undefined')
      this.objects[object] = {};
    if (typeof this.objects[object][method] === 'undefined')
      this.objects[object][method] = [];
    this.objects[object][method].push(handler);
  };
  this.dispatch = function(message) {
    var object = message.object;
    var method = message.method;
    var args = message.args;
    if (typeof this.objects[object] !== 'undefined' &&
        typeof this.objects[object][method] !== 'undefined') {
      var handlers = this.objects[object][method];
      for (var i in handlers) {
        handlers[i](args);
      }
    }
  };
}

function drawPtData(overlayCanvas, overlayContext, data) {
  overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  var xScale = overlayCanvas.width / 640;
  var yScale = overlayCanvas.height / 480;

  //console.log('new data ' + Date.now());
  //console.log('    number of people ' + data.numberOfPeople);
  for (var i = 0; i < data.numberOfPeople; ++i) {
    var data = data.personDataArray[i];
    console.log('    id ' + data.id);
    console.log('        bounding box ' + data.boundingBox.x + ', ', + data.boundingBox.y + ', ' + data.boundingBox.w + ', ' + data.boundingBox.h);
    console.log('        center ' + data.center.x + ', ', + data.center.y);

    // Draw bounding box
    overlayContext.strokeStyle = 'yellow';
    overlayContext.lineWidth = 3;
    overlayContext.strokeRect(
        data.boundingBox.x, data.boundingBox.y, data.boundingBox.w, data.boundingBox.h);

    // Draw center
    overlayContext.strokeStyle = 'green';
    overlayContext.lineWidth = 3;
    overlayContext.beginPath();
    overlayContext.arc(data.center.x, data.center.y, 2, 0, Math.PI * 2, true);
    overlayContext.stroke();

    // Print user ID
    overlayContext.font = '20px';
    overlayContext.fillStyle = 'white';
    overlayContext.fillText(
        'User ID: ' + data.id, (data.boundingBox.x + 5) * xScale, (data.boundingBox.y + 10) * yScale);
  }
}

var accX = document.querySelector("#acc-x");
var accY = document.querySelector("#acc-y");
var accZ = document.querySelector("#acc-z");
var gyroX = document.querySelector("#gyro-x");
var gyroY = document.querySelector("#gyro-Y");
var gyroZ = document.querySelector("#gyro-Z");

function drawMtData(data) {
  console.log('on data');
  console.log('    accelerometer: ' + data.accelerometer.x + ', ' + data.accelerometer.y + ', ' + data.accelerometer.z);
  console.log('    gyroscope: ' + data.gyroscope.x + ', ' + data.gyroscope.y + ', ' + data.gyroscope.z);

  accX.value = data.accelerometer.x;
  accY.value = data.accelerometer.y;
  accZ.value = data.accelerometer.z;

  gyroX.value = data.gyroscope.x;
  gyroY.value = data.gyroscope.y;
  gyroZ.value = data.gyroscope.z;

}