REPOSITORIES=( serverTools serverCommon mikeymail mailReader )
PROGRAMS=( mikeymail mailReader )


for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done