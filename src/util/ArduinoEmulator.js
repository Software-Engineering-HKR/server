// export class emulator {
//     constructor() {
//         this.ledPin = false;
//         this.yellowLedPin = false;
//         this.fanPin1 = false;
//         this.fanPin2 = false;
//         this.isFanOn = false;
//         this.isWindowOpen = false;
//         this.isDoorOpen = false;
//     }

//     // handleMotionSensor() {
//     //     console.log("Motion detected!");
//     //     for (let i = 0; i < 80; i++) {
//     //         console.log("Sound: Beep!");
//     //     }
//     //     for (let i = 0; i < 100; i++) {
//     //         console.log("Sound: Beep Beep!");
//     //     }

//     //     // Simulate fan turning on
//     //     fanOn();
//     // }

//     sendSensorDataAsJson() {
//         const lightSensorValue = Math.floor(Math.random() * 1024);
//         const gasSensorValue = Math.floor(Math.random() * 1024);
//         const motionDetected = Math.random() < 0.5 ? 0 : 1;
//         const steamSensorValue = Math.floor(Math.random() * 1024);
//         const moistureSensorValue = Math.floor(Math.random() * 1024);

//         // Construct the JSON string
//         const jsonData = JSON.stringify({
//             sensors: {
//                 light: lightSensorValue,
//                 gas: gasSensorValue,
//                 motion: motionDetected,
//                 steam: steamSensorValue,
//                 moisture: moistureSensorValue
//             },
//             devices: {
//                 led: this.ledPin,
//                 'yellow-led': this.yellowLedPin,
//                 fan: this.isFanOn,
//                 window: this.isWindowOpen,
//                 door: this.isDoorOpen
//             }
//         });
//         return jsonData
//     }

//     executeCommand(command) {
//         switch (command) {
//             case "LED_ON":
//                 this.ledOn();
//                 break;
//             case "LED_OFF":
//                 this.ledOff();
//                 break;
//             case "YELLOWLED_ON":
//                 this.yellowLedOn();
//                 break;
//             case "YELLOWLED_OFF":
//                 this.yellowLedOff();
//                 break;
//             case "FAN_ON":
//                 this.fanOn();
//                 break;
//             case "FAN_OFF":
//                 this.fanOff();
//                 break;
//             case "WINDOW_OPEN":
//                 this.openWindow();
//                 break;
//             case "WINDOW_CLOSE":
//                 this.closeWindow();
//                 break;
//             case "DOOR_OPEN":
//                 this.openDoor();
//                 break;
//             case "DOOR_CLOSE":
//                 this.closeDoor();
//                 break;
//             case "FETCH_DATA": 
//                 return this.sendSensorDataAsJson();
//             default:
//                 console.log("Invalid command!");
//         }
//     }

    
//     ledOn() {
//         this.ledPin = true;
//         console.log("LED turned ON");
//     }

//     ledOff() {
//         this.ledPin = false;
//         console.log("LED turned OFF");
//     }

//     yellowLedOn() {
//         this.yellowLedPin = true;
//         console.log("Yellow LED turned ON");
//     }

//     yellowLedOff() {
//         this.yellowLedPin = false;
//         console.log("Yellow LED turned OFF");
//     }

//     fanOn() {
//         this.fanPin1 = false;
//         this.fanPin1 = true;
//         this.isFanOn = true;
//         console.log("Fan turned ON");
//     }

//     fanOff() {
//         this.fanPin1 = false;
//         this.fanPin1 = false;
//         this.isFanOn = false;
//         console.log("Fan turned OFF");
//     }

//     openWindow() {
//         this.isWindowOpen = true;
//         console.log("Window opened");
//     }

//     closeWindow() {
//         this.isWindowOpen = false;
//         console.log("Window closed");
//     }

//     openDoor() {
//         this.isDoorOpen = true;
//         console.log("Door opened");
//     }

//     closeDoor() {
//         this.isDoorOpen = false;
//         console.log("Door closed");
//     }

//     start(callback) {
//         setInterval(() => {
//             const data = this.sendSensorDataAsJson();
//             callback(data);
//         }, 1000);
//     }
// }



