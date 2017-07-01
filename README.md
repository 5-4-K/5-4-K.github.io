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
    "ab": "Liquid Voice"    
    "w": 44.0    
  }
  
  't1' and 't2' are the primary and secondary typing, 'bs' is base stats, 'ab' is ability and 'w' is weight. Make changes here to change typing, ability, weight or base stats.
  
2. To show the changes in the following section:

New Type: --    
New Ability: --    
New Stat: --    
New Move: --    
Mechanic Changes: --
  
Add the following attribute to the pokemon ("t1", "t2", "bs" etc are attributes and "Water", 80, "Serene Grace" etc are the values of those attributes): 

For New Type - "nt"    
For New Ability - "na"    
For New Move - "nm"    
For Mechanic Changes - "mc"

Example:

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
    "na": "Serene Grace",
    "nm": "Wish",
    "mc": "Sparkling Aria damages (90 bp), has heal bell effect, 20% chance to reduce opponent's Atk by 1 stage."
  }
  
The output will be like this:
  
New Type: --    
New Ability: Serene Grace    
New Stat: --    
New Move: Wish    
Mechanic Changes: Sparkling Aria damages (90 bp), has heal bell effect, 20% chance to reduce opponent's Atk by 1 stage.

3. To add a set go to js/data/setdex_sm.js (as theorymon new is for SM ou). The format is like this:

"Pokemon Name": {    
		"Set Name": {"level":100,"evs":{"hp":0,"at":0,"df":0,"sa":0,"sd":0,"sp":0},"ivs":{"hp":0,"at":0,"df":0,"sa":0,"sd":0,"sp":0},"nature":"Pokemon's Nature","ability":"Pokemon's Ability","item":"Pokemon's Item","moves":["Move1","Move2","Move3","Move4"]},
	}
    
*Note:* 
- The "Pokemon Name" must match the name in js/data/pokedex.js
- The set name for theory mod is usually "Theorymon modification". If there are multiple set for theory mods then you can name them like "Theorymon modification 2", "Theorymon modification 3" and so on.
- ev of each stat is by default 0 and iv of each stat is by default 31. So if any ev is 0 or any iv is 31 then you can skip it. If all ivs are 31 then you may skip the whole "ivs" part (same goes for the "evs" part if all evs are 0 but it's highly unlikely).
- Be careful about commas, brackets, quotation marks etc.

Example:

"Shiinotic": {    
		"Theorymon modification": {"level":100,"evs":{"sd":4,"df":252,"hp":252},"ivs":{"at":0},"nature":"Bold","ability":"Effect Spore","item":"Leftovers","moves":["Strength Sap","Spore","Leech Seed","Moonblast"]},
	}
    
4. If you need to make changes in damage calculation then you need to make changes in js/damage.cs.

That's all. For any question give me a knock in facebook - fb/Shaafi.Al.Kader.Sopan
