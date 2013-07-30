
#usage: ./stopWork <program> <"now"> (both optional)
#e.g. ./stopWork (stops all work, NOT immediately)
#e.g. ./stopWork mailReader (stops mailReader, NOT immediately)
#e.g. ./stopWork mailReader now (stops mailReader, immediately)
#e.g. ./stopWork now (stops all work, immediately)

program=$1
now=""

if [ "$program" != "" -a "$program" != "now" ];
	then
		now=$2
else
	program=""
	now=$1
fi

baseDir=/usr/local/mikey
programs=( mailReader mikeymail workers )

if [ "$program" != "" ];
	then
		programDir=$baseDir/$program
	  if [ -d $programDir ]; then
	  	echo "stopping $program $now"
		  $programDir/stop.sh $now
		fi
	else
		for i in "${programs[@]}"
		do
		  programDir=$baseDir/$i
		  if [ -d $programDir ]; then
		  	echo "stopping $i $now"
			  $programDir/stop.sh $now
			fi
		done
fi