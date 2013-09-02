
machines=( api1 api2 api3 )
instance_api1=i-421a0331
instance_api2=i-401a0333
instance_api3=i-f6adda90

loadBalancer=mikeyAPILoadBalancer
waitTimeSeconds=15

for i in "${machines[@]}"

do
  instanceVar=instance_$i
  instance=${!instanceVar}
  echo "pulling $i out of the load balancer..."
  elb-deregister-instances-from-lb $loadBalancer --instances $instance
  echo "waiting for traffic to stop on $i..."
  sleep $waitTimeSeconds
  echo "restarting mikeyAPI on $i..."
  ssh $i /home/mikey/source/serverTools/build/startProgram.sh mikeyAPI now
  echo "putting $i back in the load balancer..."
  elb-register-instances-with-lb $loadBalancer --instances $instance
  echo "waiting for traffic to start on $i..."
  sleep $waitTimeSeconds
  echo "done restarting mikeyAPI on $i."
done