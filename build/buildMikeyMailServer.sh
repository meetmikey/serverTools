REPOSITORIES=( serverTools serverCommon mikeymail )
PROGRAMS=( mikeymail )


for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done