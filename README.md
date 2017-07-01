Theorymon Damage Calculator
=======================

Edited version of the Honoko Damage Calculator for using in BD ou theorymon new tier.

Instructions
------------

1. To apply modification to any pokemon, open js/data/pokedex.js. Find the name of the desired pokemon ( with ctrl+f. If a poekmon has different stat/typing/ability etc in different gens then it's name can be found multiple times, so go to the proper gen). Each pokemon are added in the following format.

"Primarina": {
    "t1": "Water",
    "t2": "Fairy",
    "bs": {
      "hp": 80,
      "at": 74,
      "df": 74,
      "sa": 126,
      "sd": 116,
      "sp": 60
    },
    "ab": "Serene Grace"
    "w": 44.0
  }
  
  't1' and 't2' are the primary and secondary typing, 'bs' is base stats, 'ab' is ability and 'w' is weight. Make necessary changes here.
  
  *IN PROGRESS*
