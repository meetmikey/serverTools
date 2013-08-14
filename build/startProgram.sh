PROGRAM=$1

if [ ! $PROGRAM ];
  then
    echo "ERROR: no program specified"
    echo "usage: startProgram.sh <program_name>"
    exit 1
fi

echo "startProgram: $PROGRAM..."

cd $MIKEY_BUILD/$PROGRAM
./stop.sh $2
./start.sh
cd -

echo "startProgram $PROGRAM done."