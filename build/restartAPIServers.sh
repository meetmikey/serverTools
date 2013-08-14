machines=( api1 api2 )

for i in "${machines[@]}"

do
  echo "stopping mikeyAPI on $i $now"
  ssh $i /home/mikey/source/serverTools/build/startProgram.sh mikeyAPI $now
done