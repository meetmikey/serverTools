read -p "This will delete and recreate the index $1. ARE YOU SURE (y/n)?? " -n 1
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo -e "\n"
  ./deleteIndex.sh "$1"
  echo -e "\n"
  ./createIndex.sh "$1"
  echo -e "\n"
  #./createAlias.sh
  echo -e "\n"
  ./putMapping.sh "$1"
  echo -e "\n"
  echo -e "God damnit leeroy."
  exit 1
fi
