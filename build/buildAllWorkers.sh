ec2Workers=( worker1 worker2 worker3 worker4 worker5 worker6 worker7 worker8 worker9 worker10 worker11 worker12 worker13 worker14 )

for i in "${ec2Workers[@]}"
do
  echo "building $i"
  ssh $i /home/mikey/source/serverTools/build/buildWorkersServer.sh
done