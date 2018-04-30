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
$(function() {
  console.log("loaded");
  $(".video").each(function() {
    var video = $( this ).find( "video" )[0];
    var hash = $( this ).find( "hash" )[0];

    video.onseeked = function(e) {
      var canvas = document.createElement('canvas');
      document.body.append(canvas);
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        sha256(data).then(function(digest) {
          hash.innerHTML = digest;
        }, function(error) {
          console.log(error);
          hash.innerHTML = null;
        });
      } catch(e) {
        console.log(e);
        hash.innerHTML = null;
      }
    };
    video.currentTime = 0;
  });
});
