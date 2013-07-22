baseDir=/usr/local/mikey
programs=( mailReader mikeymail workers )

for i in "${programs[@]}"
do
  programDir=$baseDir/$i
  if [ -d $programDir ]; then
  	echo "stopping $i"
	  $programDir/stop.sh
	fi
done