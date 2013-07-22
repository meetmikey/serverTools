#azureConnections=( azureMail1 azureMail2 azureMail3 azureMail4 azureMail5 azureMail6 azureMail7 )
azureConnections=( azureMail1 )

for i in "${azureConnections[@]}"
do
  echo "building $i"
  ssh $i cd /home/mikey/source/serverTools/build/buildAzureServer.sh
done