#!/bin/bash
# author : ivan

shopt -s extglob

# 解析入参 map
parameterString=$1
parameters=(${parameterString//,/ })
for (( i=0;i<${#parameters[*]};i++ ))
  do
    key_value=${parameters[$i]}
    KV=(${key_value//=/ })
    if [[ ${KV[0]} = COMPONENT ]];then
        COMPONENT=${KV[1]}
    fi
done

COMPONENT="gfloan-web-rc"

function Log(){
    dateFormat=`date "+%Y-%m-%d %H:%M:%S"`
    level="INFO"
    messageShow="message is null"
    if [[ $1 != "" ]];then
        typeset -u level=$1
    fi
    if [[ $2 != "" ]];then
        messageShow=$2
    fi
    printf "[%s] %s %s\n" "$level" "$dateFormat" "$messageShow"
}

function isError(){
  if [ $? -ne 0 ];then
      Log ERROR "Compilation failed, request the developer to confirm it."
      exit 1
  fi
}

function build(){
    Log INFO "Function [build]."
    Log INFO "npm install"
    npm install
    Log INFO "npm run build"
    npm run build
    isError
    Log INFO "build end."
}

function cleanSpace(){
    rm -rf !(htdocs|deploy)
}

function main(){
    build
    cleanSpace
}
#main
