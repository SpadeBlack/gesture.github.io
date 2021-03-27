// Mediapipe landmarks
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
 canvasCtx.canvas.width  = window.innerWidth;
 canvasCtx.canvas.height = window.innerHeight;
videoElement.style.display = "none"
 var w = canvasElement.width
 var h = canvasElement.height
 

var counter = 0
var xt = " ";
async function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, w, h);
  canvasCtx.drawImage(
      results.image, 0, 0, w, h);
  if (results.multiHandLandmarks) {
//     counter += 1
    for (const landmarks of results.multiHandLandmarks) {
        // console.log("Main>>"+JSON.stringify(landmarks))
        //for x coordinates,...
        var x_list = []
        for(var i = 0 ; i<=20 ; i++){
            // console.log("M1>>"+JSON.stringify(landmarks[i]))
            // console.log("M2>>"+landmarks[i][Object.keys(landmarks[i])[0]])
            curr_x = landmarks[i][Object.keys(landmarks[i])[0]]
            x_list.push(curr_x) 
        }
        //For y coordinates,...
        var y_list = []
        for(var i = 0 ; i<=20 ; i++){
            // console.log("M1>>"+JSON.stringify(landmarks[i]))
            // console.log("M2>>"+landmarks[i][Object.keys(landmarks[i])[0]])
            curr_y = landmarks[i][Object.keys(landmarks[i])[1]]
            y_list.push(curr_y) 
        }
        var sorted_x_list = x_list.sort()
        var sorted_y_list = y_list.sort()

        var min_x = Math.round(sorted_x_list[0]*w)
        var max_x = Math.round(sorted_x_list[20]*w)
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        var min_y = Math.round(sorted_y_list[0]*h)
        var max_y = Math.round(sorted_y_list[20]*h)
     
        var box_x = max_x-min_x+50
        var box_y = max_y-min_y+50
        
        var box_main

        if(box_x>box_y){
            box_main = box_x +20
        }else{
            box_main = box_y +20
        }

    
        let frame = canvasCtx.getImageData(min_x-50, min_y-50, box_main, box_main).data;
       
        var input = [];

        for(var i = 0; i < frame.length; i += 4) {
            for(var j = i ; j< frame.length && j< i+3; j += 1){
                input.push(frame[j]/255)
            }
        }
        canvasCtx.font = "60px Arial";
        canvasCtx.fillText(xt.toString(), 100, 100);
//         if(counter%12==0){
            xt = await predict(input, box_main, canvasCtx)
//         }

          // console.log("KABADDI "+j)
          // canvasCtx.font = "60px Arial";
          // canvasCtx.fillText(xt, 0, 100);
        
        
        // canvasCtx.beginPath();
        // canvasCtx.rect(min_x-50, min_y-50, box_main+20, box_main+20);
        // canvasCtx.lineWidth= 5
        // canvasCtx.strokeStyle = '#00FF00'
        // canvasCtx.stroke();
        
        
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
   if(counter %15 == 0  ){
    await hands.send({image: videoElement});
   }
   counter +=1;
  },
  width: w,
  height: h
});
camera.start();


window.onload = function(){
  msg = new SpeechSynthesisUtterance();
    tf.loadGraphModel('model2/model.json').then(function(model) {
        window.model = model;
      });
    console.log(tf.backend());
}
var classes = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','DEL','NOTHING','SPACE']

var predict = async function(input, dim, canvasCtx) {
    if (window.model) {
        img = tf.reshape(input, [1, dim, dim, 3])
        img = tf.image.resizeBilinear(img, [64, 64])

        return window.model.predict(img).array().then(function(scores){
            scores = scores[0];
            predicted = scores.indexOf(Math.max(...scores));
            msg.text = classes[predicted];
            window.speechSynthesis.speak(msg);
            var k = classes[predicted]
            console.log(k)
            return k
            
      });
    } else {
      // The model takes a bit to load, if we are too fast, wait
      setTimeout(function(){predict(input)}, 50);
      return " "
    }
  }
