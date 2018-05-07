function sha256(imageData) {
  return crypto.subtle.digest("SHA-256", imageData.data).then(function (hash) {
    return hex(hash);
  });
}

function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    var value = view.getUint32(i)
    var stringValue = value.toString(16)
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
  }

  return hexCodes.join("");
}

function getFilename(str) {
  var n = str.lastIndexOf('/');
  return str.substring(n + 1);
}

var step = 1;
var index = 0;
var videos= ['baseline-0-9.mp4', 'baseline-1-0.mp4', 'baseline-3-2.mp4', 'baseline-6-2.mp4', 'high-0-9.mp4', 'high-1-0.mp4', 'high-3-2.mp4', 'high-6-2.mp4', 'high10-0-9.mp4', 'high10-1-0.mp4', 'high10-3-2.mp4', 'high10-6-2.mp4', 'high422-0-9.mp4', 'high422-1-0.mp4', 'high422-3-2.mp4', 'high422-6-2.mp4', 'high444-0-9.mp4', 'high444-1-0.mp4', 'high444-3-2.mp4', 'high444-6-2.mp4', 'main-0-9.mp4', 'main-1-0.mp4', 'main-3-2.mp4', 'main-6-2.mp4', 'vp8.webm', 'vp9.webm'];
var result = {
  videos: {}
};

var timeout;

var video = document.createElement('video');
video.muted = true;
video.autoplay = true;

video.onloadedmetadata = function() {
  var src = getFilename(video.src);
  timeout = setTimeout(function () {
    result.videos[src].errors.push("Timed out");
    nextVideo();
  }, 1000);

  var playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      video.pause();
      video.currentTime = 0;
    })
    .catch(error => {
      result.videos[src].errors.push(error.toString());
    });
  } else {
    setTimeout(function() {
      video.pause();
      video.currentTime = 0;
    }, 1000);
  }
};

video.onseeked = function(e) {
  clearTimeout(timeout);
  var src = getFilename(video.src);
  var canvas = document.createElement('canvas');
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    sha256(data).then(function(digest) {
      result.videos[src].digest = digest;
    }, function(error) {
      result.videos[src].errors.push(error.toString());
    });
  } catch(e) {
    result.videos[src].errors.push(e.toString());
  }

  nextVideo();
};

function next() {
  switch (step) {
    case 1:
      step+=1;
      $('.step-1').hide();
      $('.step-2').show();
      $(".controls").hide();
      nextVideo();
      break;
    case 3:
      step+=1;
      location.reload();
      break;
    default:
  }
}

function nextVideo() {
  $('.progress-bar').width((100 * index/videos.length) + "%");
  if(index < videos.length) {
    result.videos[videos[index]] = {
      digest: null,
      errors: []
    };
    video.src = "video/" + videos[index];
    index+=1;
  } else {
    setTimeout(function() {
      console.log(result);
      $('.step-2').hide();
      $('.step-3').show();
      $('.results').html(JSON.stringify(result.videos, undefined, 2));
    }, 1000);
  }
}

$(".controls").show();
