REPOSITORIES=( serverTools serverCommon mailReader )
PROGRAMS=( mailReader )

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for i in "${REPOSITORIES[@]}"
do
  $scriptDir/buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  $scriptDir/startProgram.sh $i
done