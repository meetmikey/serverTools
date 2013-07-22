ec2Connections=( worker1 worker2 )
azureConnections=( azureMail1 azureMail2 azureMail3 azureMail4 azureMail5 azureMail6 azureMail7 )

for i in "${ec2Connections[@]}"
do
  echo "stopping work on $i"
  ssh $i /home/mikey/source/serverTools/build/stopWork.sh
done

for i in "${azureConnections[@]}"
do
  echo "stopping work on $i"
  ssh $i /home/mikey/source/serverTools/build/stopWork.sh
done