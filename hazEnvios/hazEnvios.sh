#!/bin/bash
# Ficheros necesarios:
#
#   contest.txt: URL al api del concurso lanzado
#   users.txt: Usuarios que hacen los envíos (uno por línea)
#   pass.txt: Contraseñas de cada usuario
#   vers.txt: Veredictos posibles. Se espera AC y demás.
#   langs.txt: Lista de lenguajes
#   sleep.txt: dos líneas con el tiempo mínimo y máximo entre dos envíos
#	accounts.tsv: exportado de domjudge
#
# Se puede regular la probabilidad de selección de cada cosa:
#
#   probProblemas.txt: probabilidad de que se haga envío al problema i-ésimo
#   probUsers.txt: probabilidad de que sea elegido el usuario i-ésimo
#   probVer-[A,B,C,..].txt: probabilidad de cada veredicto en el problema dado.
#   probVer.txt: lo mismo que antes, pero sin probabilidades distintas por problema
#   probLang.txt: probabilidad de hacer un envío en el lenguaje dado

# Elige un número entre 1..$1
# Se puede especificar la probabilidad de cada número en un fichero
# con $1 líneas de enteros, cada una con la probabilidad de elegir ese número
random() {

	 local probFile=$2

	 if [ ! -f $probFile ]; then
		  shuf -i1-$1 -n1
		  return
	 fi

	 # Calculamos la suma de probabilidades
	 let suma=0
	 let i=0

	 while [ $i -lt $1 ]; do
		  read line
		  if [ -z $line ]; then
				line=0
		  fi
		  let suma=suma+$line
		  let i=i+1
	 done < $probFile

	 # Elegimos numero
	 local r=$(shuf -i1-$suma -n1)
	 
	 # Vemos cuál corresponde
	 local ret=0
	 while [ $r -gt 0 ]; do
		  read line
		  if [ -z $line ]; then
				line=0
		  fi
		  let r=r-$line
		  let ret=ret+1
	 done < $probFile

	 echo $ret
}

randomSleep() {

	 local minSleep=$(head -n 1 FicherosDeSoporte/sleep.txt)
	 local maxSleep=$(tail -n 1 FicherosDeSoporte/sleep.txt)

	 sleep $(shuf -i$minSleep-$maxSleep -n1)
}

submit() {
	 local userId=$1
	 local pass=$2
	 local prob=$3
	 local lang=$4
	 local ver=$5

	 echo $userId / $pass envía al problema $idProblema en $lang un $veredicto


	 local solFile
	 if [ $veredicto == "AC" ]; then
		  solFile="sols/$prob/solution.$lang"
	 else
		  solFile="sols/$ver.$lang"
	 fi

	 if [ ! -f $solFile -a $lang != "cpp" ]; then
		  echo "WARNING: No existe $solFile. Probamos con C++"
		  submit $userId $pass $prob cpp $ver
		  return
	 fi

	 if [ ! -f $solFile ]; then
		  echo "ERROR: No existe $solFile"
		  return
	 fi

	 # ¡Enviamos!
	 local contest=$(cat FicherosDeSoporte/contest.txt)

	 echo -n "   "
	 curl --user $userId:$pass -X POST $contest"/submissions" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -F "problem=$prob" -F "language=$lang" -F "code=@$solFile;type=text/x-c++src"
	 echo
	 
}

while true; do

	 # Miramos cuántos problemas hay
	 contest=$(cat FicherosDeSoporte/contest.txt)

	 numProblems=$(curl -s "$contest/problems" | jq -r 'length')

	 # Elegimos problema para enviar
	 problemNumber=$(random $numProblems FicherosDeSoporte/probProblemas.txt)
	 idProblema=$(curl -s "$contest/problems" | jq -r '.['$problemNumber'-1].short_name')

	 # Y qué usuario lo hará
	 totalUsers=$(cat FicherosDeSoporte/accounts.tsv | wc -l)
	 ((totalUsers--))
	 numUser=$(random $totalUsers FicherosDeSoporte/probUsers.txt)
	 ((numUser++))
	 userId=$(cat FicherosDeSoporte/accounts.tsv | head -n $numUser | tail -n 1 | cut -f2)
	 pass=$(cat FicherosDeSoporte/accounts.tsv | head -n $numUser | tail -n 1 | cut -f4)
	 
	 #userId=$(head -n $numUser+1 FicherosDeSoporte/users.txt | tail -n 1)
	 #pass=$(head -n $numUser+1 FicherosDeSoporte/pass.txt | tail -n 1)

	 # Veredicto
	 veredictosDistintos=$(cat FicherosDeSoporte/vers.txt | wc -l)
	 if [ -f FicherosDeSoporte/probVer-$idProblema.txt ]; then
		  numVer=$(random $veredictosDistintos probVer-$idProblema.txt)
	 else
		  numVer=$(random $veredictosDistintos probVer.txt)
	 fi
	 veredicto=$(head -n $numVer FicherosDeSoporte/vers.txt | tail -n 1)

	 # Y lenguaje
	 langsDistintos=$(cat FicherosDeSoporte/langs.txt | wc -l)
	 langId=$(random $langsDistintos FicherosDeSoporte/probLang.txt)
	 lang=$(head -n $langId FicherosDeSoporte/langs.txt | tail -n 1)

	 # ¡Listo!
	 submit $userId $pass $idProblema $lang $veredicto
	 
	 
#	 echo $veredicto

#	 echo $problemNumber - $idProblema
	 #	 sleep 1
	 randomSleep
done
