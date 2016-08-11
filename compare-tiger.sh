#!/bin/bash

list=`ls *.jpg`
for i in $list ; do 
	for j in $list; do
		CMD="compare -verbose -metric phash $i $j /dev/null"
		echo $CMD >> out.txt 2>&1
		$CMD >> out.txt 2>&1
	done
done
