REPOSITORIES=( serverTools serverCommon esMigration )


for i in "${REPOSITORIES[@]}"
do
  ./buildRepository.sh $i
done

for i in "${PROGRAMS[@]}"
do
  ./startProgram.sh $i
done