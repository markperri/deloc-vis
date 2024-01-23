#!/bin/bash
#SBATCH --job-name="pndit-cubegen"
#SBATCH --partition=shared
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=8
#SBATCH -t 4:00:00
#SBATCH -A csd799
#SBATCH --mail-type=ALL 

cd /home/rramji/project-csd799/aromodel/pndit-qchem/rotation-cubes

module load gaussian

fchk_dir="../rotation-run"

for file in $fchk_dir/*.fchk
    do
        name=`basename --suffix=.fchk $file`
        if [ ! -f "$name.cube" ]; then
            cubegen 4 MO=Homo $file $name.cube 50
        fi
    done
