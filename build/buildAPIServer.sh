REPOSITORIES=( serverTools serverCommon mikeyAPI )
PROGRAMS=( mikeyAPI )

#note: it would be good to pull the API server out of rotation during this process.
#just removing the index.html file doesn't work, though.

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for i in "${REPOSITORIES[@]}"
do
  $scriptDir/buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  $scriptDir/startProgram.sh $i
done