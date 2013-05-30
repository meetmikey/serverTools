REPOSITORIES=( serverTools serverCommon mikeyAPI )
PROGRAMS=( mikeyAPI )

FLAG_FILE=/usr/local/mikey/mikeyAPI/views/index.html
rm -f $FLAG_FILE

for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i $1
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done