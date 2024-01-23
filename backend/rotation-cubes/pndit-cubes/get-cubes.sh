#!/bin/bash

module load gaussian

fchk_dir="../rotation-run"

for file in $fchk_dir/*.fchk
    do
        name=`basename --suffix=.fchk $file`
        if [ ! -f "$name.cube" ]; then
            cubegen 4 MO=Homo $file $name.cube 50
        fi
    done
