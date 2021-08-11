#!/bin/bash 

usage()
{
    echo "Usage : $0 <version>"
    echo "e.g. $0 v0.0.1"
}

if [[ $# != 1 ]]; then
    usage && exit
fi

registry=xa.repo.ndp.com:5000
repo=guava/admin
version=$1
img=${registry}/${repo}:${version}

SHELL_FOLDER=$(cd "$(dirname "$0")";pwd)
docker build -f $SHELL_FOLDER/Dockerfile -t $img $SHELL_FOLDER/..

docker push $img


