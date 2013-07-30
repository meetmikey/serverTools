
#usage: ./stopAllWork <program> <"now"> (both optional)
#e.g. ./stopAllWork (stops all work, NOT immediately)
#e.g. ./stopAllWork mailReader (stops mailReader, NOT immediately)
#e.g. ./stopAllWork mailReader now (stops mailReader, immediately)
#e.g. ./stopAllWork now (stops all work, immediately)

program=$1
now=""

if [ "$program" != "" -a "$program" != "now" ];
	then
		now=$2
else
	program=""
	now=$1
fi

machines=( worker1 worker2 azureMail1 azureMail2 azureMail3 azureMail4 azureMail5 azureMail6 azureMail7 )

for i in "${machines[@]}"
do
	if [ "$program" != "" ];
		then
			echo "stopping $program on $i $now"
		  ssh $i /home/mikey/source/serverTools/build/stopWork.sh $program $now
		else
		  echo "stopping all work on $i $now"
		  ssh $i /home/mikey/source/serverTools/build/stopWork.sh $now
	fi
done