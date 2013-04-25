REPOSITORIES=( serverTools serverCommon mikeyAPI )
PROGRAMS=( mikeyAPI )


for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done