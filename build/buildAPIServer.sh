REPOSITORIES=( serverTools serverCommon mikeyAPI )
PROGRAMS=( mikeyAPI )

#note: it would be good to pull the API server out of rotation during this process.
#just removing the index.html file doesn't work, though.

for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done