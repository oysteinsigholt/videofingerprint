import subprocess


command =  "ffmpeg -loop 1 -i PM5644.png -c:v libx264 -t 1 -pix_fmt yuv420p -vf scale=1280:720 -profile:v {0} -level {1}.{2} {0}-{1}-{2}.mp4"
profiles = ["baseline", "main", "high", "high10", "high422", "high444"]

for profile in profiles:
	level = 6
	for sublevel in range(0,3):
		process = subprocess.Popen(command.format(profile,level,sublevel), shell=True, stdout=subprocess.PIPE)
		process.wait()