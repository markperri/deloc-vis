from dataclasses import dataclass, field
from typing import List, Optional
import re
import argparse
import sys
import numpy as np

class UnexpectedOrbitalLineError(Exception):
    pass

@dataclass
class AtomicOrbital:
    atom_index: int
    atom_type: str
    orbital_type: str
    coefficient: float

@dataclass
class MolecularOrbital:
    index: int
    symmetry: Optional[str]
    occupancy: str
    eigenvalue: float
    atomic_orbitals: List[AtomicOrbital] = field(default_factory=list)

def is_float(string):
    try:
        float(string)
        return True
    except ValueError:
        return False

def parse_molecular_orbitals(lines: list) -> List[MolecularOrbital]:
    
    # Step 1: Parse header
    orbital_indices = [int(i) for i in lines[0].split() if i.isdigit()]
    
    # Check if symmetry information is present
    symmetry_occupancy = re.findall(r'\((\w+)\)--(\w)', lines[1])
    if symmetry_occupancy:
        orbitals = [MolecularOrbital(index=i, symmetry=sym, occupancy=occ, eigenvalue=0.0)
                    for i, (sym, occ) in zip(orbital_indices, symmetry_occupancy)]
    else:
        occupancies = [occ for occ in lines[1].split() if occ.isalpha()]
        # print(occupancies)
        orbitals = [MolecularOrbital(index=i, symmetry=None, occupancy=occ, eigenvalue=0.0)
                    for i, occ in zip(orbital_indices, occupancies)]
    
    # Step 2: Parse eigenvalues
    eigenvalues = [float(val) for val in re.findall(r'-?\d+\.\d+', lines[2])]
    for orbital, eigenvalue in zip(orbitals, eigenvalues):
        orbital.eigenvalue = eigenvalue
    
    # Step 3: Parse atomic orbital contributions
    current_atom_index = None
    current_atom_type = None
    
    for line in lines[3:]:
        parts = line.split()
        if len(parts) < 3:  # Skip lines that don't contain enough data
            continue

        if len(parts) == 9:
            current_atom_index = int(parts[1])
            current_atom_type = parts[2]
            orbital_type = parts[3]
            coefficients = [float(coeff) for coeff in parts[4:] if is_float(coeff)]
        # Check if this line starts a new atom
        elif len(parts) == 7:
            orbital_type = parts[1]
            coefficients = [float(coeff) for coeff in parts[2:] if is_float(coeff)]
        else:
            raise UnexpectedOrbitalLineError(f"Unhandled orbital line:\n{line}") 
            # orbital_type = parts[0]
            # coefficients = [float(coeff) for coeff in parts[1:] if is_float(coeff)]
        
        # Add atomic orbitals to molecular orbitals
        for orbital, coefficient in zip(orbitals, coefficients):
            atomic_orbital = AtomicOrbital(current_atom_index, current_atom_type, orbital_type, coefficient)
            orbital.atomic_orbitals.append(atomic_orbital)
    
    return orbitals


def detect_five_integers(line):
    pattern = r'^\s*\d+\s+\d+\s+\d+\s+\d+\s+\d+\s*$'
    return bool(re.match(pattern, line))

def calculate_total_p_contribution(orbital):
    return sum(abs(ao.coefficient) for ao in orbital.atomic_orbitals 
               if ao.orbital_type in ['PX', 'PY', 'PZ'])

def calculate_p_to_s_ratio(orbital):
    p_contribution = sum(abs(ao.coefficient) for ao in orbital.atomic_orbitals 
                         if ao.orbital_type in ['2PX', '2PY', '2PZ'])
    s_contribution = sum(abs(ao.coefficient) for ao in orbital.atomic_orbitals 
                         if 'S' in ao.orbital_type)
    return p_contribution / (s_contribution + 1e-10)  # Avoid division by zero

def analyze_relative_energy(orbital, min_energy, max_energy):
    normalized_energy = (orbital.eigenvalue - min_energy) / (max_energy - min_energy)
    return normalized_energy

P_WEIGHT = 3.0
P_S_RATIO_WEIGHT = 5
ENERGY_WEIGHT = 1.5

def rank_pi_orbitals(orbitals):
    scored_orbitals = []
    for orbital in orbitals:
        score = 0
        
        p_contribution = calculate_total_p_contribution(orbital)
        score += p_contribution * P_WEIGHT
        
        p_to_s_ratio = calculate_p_to_s_ratio(orbital)
        score += (p_to_s_ratio-1) * P_S_RATIO_WEIGHT

        energies = [orb.eigenvalue for orb in orbitals]
        median_eng = np.median(energies)
        min_energy, max_energy = min(energies), max(energies)
        energy_score = analyze_relative_energy(orbital, min_energy, max_energy)
        if orbital.eigenvalue < median_eng:
            score = 0
        else:
            score += energy_score * ENERGY_WEIGHT
        
        scored_orbitals.append((orbital, score))
    
    return sorted(scored_orbitals, key=lambda x: x[1], reverse=True)

def main():
    # Set up argument parser for command-line options
    parser = argparse.ArgumentParser(description="Parse Gaussian output and identify π-bonding orbitals.")
    parser.add_argument("--file", "-f", help="The Gaussian output file to be parsed.")
    parser.add_argument("--num_orbitals", "-n", type=int, help="The expected number of pi-bonding MOs")
    args = parser.parse_args()


    # Ensure the file exists
    try:
        with open(args.file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        print(f"Error: The file '{args.file}' does not exist.")
        sys.exit(1)
        
    MO_section = False
    all_orbital_data = []
    orbital_array = []
    for line in lines:
        if MO_section and detect_five_integers(line.strip()):
            if orbital_array:
                all_orbital_data.append(orbital_array)
            orbital_array = [line.strip()]
            # print(f"Valid: {line}")
        elif MO_section:
            orbital_array.append(line.strip())
        if "Coeff" in line:
            MO_section = True
        if "Density" in line:
            MO_section = False
    
    all_MOs = []
    for dat in all_orbital_data:
        orbs = parse_molecular_orbitals(dat)
        for i in orbs:
            all_MOs.append(i)
    
    occupied = [mo for mo in all_MOs if mo.occupancy == 'O']
    

    pi_orbitals = rank_pi_orbitals(occupied)
    top_n_orbitals = pi_orbitals[:args.num_orbitals]

    if top_n_orbitals:
        for orb in top_n_orbitals:
            print(f"{orb[0].index}")
    else:
        print("No π-bonding orbitals were identified.")

if __name__ == "__main__":
    main()
