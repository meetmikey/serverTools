azureConnections=( azureMail1 azureMail2 azureMail3 azureMail4 azureMail5 azureMail6 azureMail7 )

for i in "${azureConnections[@]}"
do
  echo "building $i"
  ssh $i /home/mikey/source/serverTools/build/buildAzureServer.sh
done