program=$1

baseDir=/usr/local/mikey
programs=( mailReader mikeymail workers )

if [ $program ];
	then
		programDir=$baseDir/$program
	  if [ -d $programDir ]; then
	  	echo "stopping $program"
		  $programDir/stop.sh
		fi
	else
		for i in "${programs[@]}"
		do
		  programDir=$baseDir/$i
		  if [ -d $programDir ]; then
		  	echo "stopping $i"
			  $programDir/stop.sh
			fi
		done
fi