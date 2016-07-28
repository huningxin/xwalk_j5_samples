//var five = require('johnny-five');
//var board = new five.Board({repl: false});

// TODO: avoid to use global variable to share
var colorStream, depthStream, fisheyeStream, infraredStream, infrared2Stream;
/*
board.on('ready', function() {
  console.log('Johnny-Five is ready');

  var control = CreateControl(board);

  InitUI(control);

  InitServer(control);

  InitCamera();
});
*/

InitTitle();

InitServer();

InitCamera();

function CreateControl(board) {
  var control = {board: board};
  // Plug the LED module into the
  // Grove Shield's D6 jack.
  //
  // Select an LED from the kit
  // (red, green, blue) and insert
  // it into the LED module, with
  // the long pin in + and short
  // pin in -.
  control.led = new five.Led(6);

  // Plug the Button module into the
  // Grove Shield's D4 jack
  control.button = new five.Button(4);

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  control.rotary = new five.Sensor("A0");

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  control.lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  // Plug the Temperature sensor module
  // into the Grove Shield's A1 jack
  control.thermometer = new five.Thermometer({
    controller: "GROVE",
    pin: "A1"
  });

  // Plug the Servo module
  // into the Grove Shield's D5 jack
  control.servo = new five.Servo(5);

  control.mds = [];
  // Plug the Motor Driver module
  // into the I2C jack.
  // Set the I2C address of driver
  // with 2 motors to 8.
  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 8,
    pin: "A",
  }));

  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 8,
    pin: "B",
  }));

  // Set the I2C address of driver
  // with 1 motor to 9.
  control.mds.push(new five.Motor({
    controller: "GROVE_I2C_MOTOR_DRIVER",
    address: 9,
    pin: "B",
  }));
  return control;
}

function InitCamera() {
  var colorVideo = document.querySelector("#color-preview");
  var depthVideo = document.querySelector("#depth-preview");
  var infraredVideo = document.querySelector("#infrared-preview");
  var infrared2Video = document.querySelector("#infrared2-preview");
  var fisheyeVideo = document.querySelector("#fisheye-preview");

  function gotColorStream(stream) {
    colorStream = stream; // colorStream available to WebRTCSignalServer
    colorVideo.srcObject = stream;
    colorVideo.play();
  }

  function gotDepthStream(stream) {
    depthStream = stream; // colorStream available to WebRTCSignalServer
    depthVideo.srcObject = stream;
    depthVideo.play();
  }

  function gotInfraredStream(stream) {
    infraredStream = stream; // colorStream available to WebRTCSignalServer
    infraredVideo.srcObject = stream;
    infraredVideo.play();
  }

  function gotInfrared2Stream(stream) {
    infrared2Stream = stream; // colorStream available to WebRTCSignalServer
    infrared2Video.srcObject = stream;
    infrared2Video.play();
  }

  function gotFisheyeStream(stream) {
    fisheyeStream = stream; // colorStream available to WebRTCSignalServer
    fisheyeVideo.srcObject = stream;
    fisheyeVideo.play();
  }

  function errorCallback(error){
    console.log("navigator.getUserMedia error: ", error);
  }

  var depthCameraId = colorCameraId = fisheyeCameraId = '';

  function gotDevices(deviceInfos) {
    const depthCameraName = 'Intel RealSense ZR300-DEPTH';
    const colorCameraName = 'Intel RealSense ZR300-COLOR';
    const infraredCameraName = 'Intel RealSense ZR300-INFRARED';
    const infrared2CameraName = 'Intel RealSense ZR300-INFRARED2';
    const fisheyeCameraName = 'Intel RealSense ZR300-FISHEYE';
    for (var i = 0; i < deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === 'videoinput') {
        console.log(deviceInfo.label);
        if (deviceInfo.label === depthCameraName) {
          depthCameraId = deviceInfo.deviceId;
        } else if (deviceInfo.label === colorCameraName) {
          colorCameraId = deviceInfo.deviceId;
        } else if (deviceInfo.label === infraredCameraName) {
          infraredCameraId = deviceInfo.deviceId;
        } else if (deviceInfo.label === infrared2CameraName) {
          infrared2CameraId = deviceInfo.deviceId;
        } else if (deviceInfo.label === fisheyeCameraName) {
          fisheyeCameraId = deviceInfo.deviceId;
        }
      }
    }


    if (depthCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: depthCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotDepthStream, errorCallback);
    }

    if (colorCameraId !== '') {
      var constraints = {video: {}};
      constraints.video.deviceId = {exact: colorCameraId};
      navigator.mediaDevices.getUserMedia(constraints).then(gotColorStream, errorCallback);
    }

    if (infraredCameraId !== '') {
      setTimeout(function() {
        var constraints = {video: {}};
        constraints.video.deviceId = {exact: infraredCameraId};
        navigator.mediaDevices.getUserMedia(constraints).then(gotInfraredStream, errorCallback);
      }, 1000);
    }


    if (infrared2CameraId !== '') {
      setTimeout(function() {
        var constraints = {video: {}};
        constraints.video.deviceId = {exact: infrared2CameraId};
        navigator.mediaDevices.getUserMedia(constraints).then(gotInfrared2Stream, errorCallback);
      }, 2000);
    }

    if (fisheyeCameraId !== '') {
      setTimeout(function() {
        var constraints = {video: {}};
        constraints.video.deviceId = {exact: fisheyeCameraId};
        navigator.mediaDevices.getUserMedia(constraints).then(gotFisheyeStream, errorCallback);
      }, 3000);
    }
    
  }

  navigator.mediaDevices.enumerateDevices().then(gotDevices, errorCallback);
}
