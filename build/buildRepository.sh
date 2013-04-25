REPOSITORY=$1

if [ ! $REPOSITORY ];
  then
    echo "ERROR: no repository specified"
    echo "usage: buildRepository.sh <repository_name>"
    exit 1
fi


mkdir -p $MIKEY_SOURCE

BUILD_BRANCHES_FILE=$MIKEY_SOURCE/buildBranches.sh

if [ ! -r $BUILD_BRANCHES_FILE ];
  then
    echo "ERROR: no buildBranches file!"
    echo "expected $BUILD_BRANCHES_FILE"
    exit 1
fi

source $BUILD_BRANCHES_FILE

if [ ! $MIKEY_BRANCH_DEFAULT ];
  then
    echo "ERROR: no default branch specified in buildBranches"
    exit 1
fi


MIKEY_BRANCH=$MIKEY_BRANCH_DEFAULT
BRANCH_VAR_NAME=MIKEY_BRANCH_$REPOSITORY
MIKEY_SPECIFIC_BRANCH=$(eval "echo \$${BRANCH_VAR_NAME}")
if [ $MIKEY_SPECIFIC_BRANCH ];
  then MIKEY_BRANCH=$MIKEY_SPECIFIC_BRANCH
fi

echo "buildRepository: $REPOSITORY with branch $MIKEY_BRANCH..."

cd $MIKEY_SOURCE/$REPOSITORY
git fetch
git checkout -t origin/$MIKEY_BRANCH
git pull origin $MIKEY_BRANCH
npm install
rm -rf $MIKEY_BUILD/$REPOSITORY
rsync -rq --exclude=.git $MIKEY_SOURCE/* $MIKEY_BUILD/
cd $MIKEY_BUILD/$REPOSITORY

echo "buildRepository $REPOSITORY done."