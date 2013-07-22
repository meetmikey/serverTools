program=$1

machines=( worker1 worker2 azureMail1 azureMail2 azureMail3 azureMail4 azureMail5 azureMail6 azureMail7 )

for i in "${machines[@]}"
do
	if [ $program ];
		then
			echo "stopping $program on $i"
		  ssh $i /home/mikey/source/serverTools/build/stopWork.sh $program
		else
		  echo "stopping all work on $i"
		  ssh $i /home/mikey/source/serverTools/build/stopWork.sh
	fi
done