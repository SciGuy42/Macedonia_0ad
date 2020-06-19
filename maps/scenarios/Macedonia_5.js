warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

/**
 * Which entities units should focus when attacking and patrolling.
 */
var unitTargetClass = "Unit+!Ship";


var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	//warn("The OnStructureBuilt event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.ConstructionStartedAction = function(data)
{
	//warn("The OnConstructionStarted event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.TrainingFinishedAction = function(data)
{
	//warn("The OnTrainingFinished event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.TrainingQueuedAction = function(data)
{
	//warn("The OnTrainingQueued event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.ResearchFinishedAction = function(data)
{
	//warn("The OnResearchFinished event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.ResearchQueuedAction = function(data)
{
	//warn("The OnResearchQueued event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};


Trigger.prototype.PersianAttackCav = function(data)
{
	//warn("The PersianAttackCav event happened");

	//we must have too much pop, delay
	if (this.temp_site == -1){
		this.DoAfterDelay(this.persAttackInterval,"PersianAttackCav",null);
		return;
	}
	
	let temp_name = "";
	
	let num_attackers = Math.floor(this.cavRatio*this.prog_seq[this.numberOfTimerTriggerCav])+1;
	
	//spawn cavalry -- done later so cavalry catches up with infantry
	if (this.numberOfTimerTriggerCav == 3){
		this.persianCavTypes.push("units/pers_cavalry_archer_b");
	}
	else if (this.numberOfTimerTriggerCav == 5){
		this.persianCavTypes.push("units/pers_cavalry_archer_e");
	}
	else if (this.numberOfTimerTriggerCav == 7){
		this.persianCavTypes.push("units/pers_champion_cavalry_archer");
	}
	else if (this.numberOfTimerTriggerCav == 9){
		this.persianCavTypes.push("units/sele_champion_cavalry");
	}
	
	let attackers = [];
	
	for (let i = 0; i < num_attackers; ++i)
	{
		temp_name = this.persianCavTypes[Math.floor(Math.random() * Math.floor(this.persianCavTypes.length))];
		let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[this.temp_site],temp_name,1,2);
		attackers.push(units_i[0]);
	}
	
	//spawn a few infantry to catch up with siege -- 1 per siege unit
	let num_siege_guard = Math.floor(this.prog_seq[this.numberOfTimerTriggerCav]*this.siegeRatio)+1;
	for (let i = 0; i < num_attackers; ++i)
	{
		temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
		let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[this.temp_site],temp_name,1,2);
		
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(2, attackers, pickRandom(unitFormations));

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = DistanceBetweenEntities(attackers[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(2, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});
	
	this.numberOfTimerTriggerCav++;
	this.DoAfterDelay(this.persAttackInterval,"PersianAttackCav",null);

};


Trigger.prototype.PersianAttack = function(data)
{
	//warn("Persian attack:");
	//warn(uneval(this.numberOfTimerTrigger));
	
	
	var all_units = TriggerHelper.GetEntitiesByPlayer(2).filter(TriggerHelper.IsInWorld);
	//warn("found "+all_units.length+" entities");
	var pop_limit = 200;//30+10*this.numberOfTimerTrigger;
	
	let cmpPlayer = QueryPlayerIDInterface(2);
	let popUsed = cmpPlayer.GetPopulationCount();
	//warn("found "+popUsed+" pop");
	
	
	if (popUsed > pop_limit)
	{
		this.temp_site = -1;
		this.DoAfterDelay(this.persAttackInterval,"PersianAttack",null);
		return;
	}
	
	
	//pick spawn site
	let site = Math.floor(Math.random() * Math.floor(this.persianSpawnSites.length));
	//site = 2;
	this.temp_site = site;
	
	let temp_name = "";
	
	//spawn infantry
	let attackers = [];
	for (let i = 0; i < this.prog_seq[this.numberOfTimerTrigger]; ++i)
	{
		temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
		let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[site],temp_name,1,2);
		attackers.push(units_i[0]);
	}
	
	//TriggerHelper.SetUnitFormation(2, infantry, "special/formations/box");
	
	//spawn siege
	if (this.numberOfTimerTrigger == 4)
	{
		// add elephant
		this.persianSiegeTypes.push("units/pers_champion_elephant");
	}
	else if (this.numberOfTimerTrigger == 7)
	{
		// add ram
		this.persianSiegeTypes.push("units/pers_mechanical_siege_ram");
	}
	
	let num_siege = Math.floor(this.siegeRatio*this.prog_seq[this.numberOfTimerTrigger]);
	for (let i = 0; i < num_siege; ++i)
	{
		temp_name = this.persianSiegeTypes[Math.floor(Math.random() * Math.floor(this.persianSiegeTypes.length))];
		let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[site],temp_name,1,2);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(2, attackers, pickRandom(unitFormations));

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = DistanceBetweenEntities(attackers[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(2, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});
	
	//spawn some distractors
	let num_distractors = Math.floor(this.prog_seq[this.numberOfTimerTrigger] / 3);
	for (let i = 0; i < this.persianSpawnSites.length; i ++){
		if (site != this.persianSpawnSites[i]){
			temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
			TriggerHelper.SpawnUnits(this.persianSpawnSites[i],temp_name,num_distractors,2);
		}
	}
	
	//after a certain level, spawn a secondary attack
	if (this.numberOfTimerTrigger > 7) 
	{
		//warn("spawning secondary attack");
		
		let second_site = site + 1;
		if (second_site >= this.persianSpawnSites.length)
		{
			second_site = 0;
		}
		
		//spawn infantry
		let sec_attackers = [];
		
		for (let i = 0; i < this.prog_seq[this.numberOfTimerTrigger-7]; ++i)
		{
			temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
			let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[second_site],temp_name,1,2);
			
			sec_attackers.push(units_i[0]);
		}
		
		//spawn siege
		let num_siege = Math.floor(this.siegeRatio*this.prog_seq[this.numberOfTimerTrigger]);
		for (let i = 0; i < num_siege; ++i)
		{
			temp_name = this.persianSiegeTypes[Math.floor(Math.random() * Math.floor(this.persianSiegeTypes.length))];
			let units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[second_site],temp_name,1,2);
			
			sec_attackers.push(units_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(2, sec_attackers, pickRandom(unitFormations));

		let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
		let closestTarget;
		let minDistance = Infinity;
		
		for (let target of targets)
		{
			if (!TriggerHelper.IsInWorld(target))
				continue;

			let targetDistance = DistanceBetweenEntities(sec_attackers[0], target);
			if (targetDistance < minDistance)
			{
				closestTarget = target;
				minDistance = targetDistance;
			}
		}

		ProcessCommand(2, {
			"type": "attack",
			"entities": sec_attackers,
			"target": closestTarget,
			"queued": true,
			"allowCapture": false
		});
	}
	
	this.numberOfTimerTrigger++;
	
	this.persAttackInterval = this.persAttackInterval * this.persGamma;
	//warn(uneval(this.persAttackInterval));
	this.DoAfterDelay(this.persAttackInterval,"PersianAttack",null);
	
}



Trigger.prototype.GreekAttack = function(data)
{
	//warn("Greek attack:");
	//warn(uneval(this.greekAttackCounter));
	
	var all_units = TriggerHelper.GetEntitiesByPlayer(4);
	var pop_limit = 30+8*this.greekAttackCounter;
	if (all_units.length > pop_limit)
	{
		//warn("greeks have too much pop, no spawn");
		return;
	}
	
	
	
	let temp_name = "";
	
	//spawn infantry
	for (let i = 0; i < Math.floor(this.greekRatio*this.prog_seq[this.greekAttackCounter]); ++i)
	{
		//pick spawn site
		let site = Math.floor(Math.random() * Math.floor(this.greekSpawnSites.length));
		
		temp_name = this.greekInfTypes[Math.floor(Math.random() * Math.floor(this.greekInfTypes.length))];
		TriggerHelper.SpawnUnits(this.greekSpawnSites[site],temp_name,1,4);
	}
	
	//spawn siege
	let num_siege = Math.floor(this.greekRatio*this.siegeRatio*this.prog_seq[this.greekAttackCounter]);
	for (let i = 0; i < num_siege; ++i)
	{
		//pick spawn site
		let site = Math.floor(Math.random() * Math.floor(this.greekSpawnSites.length));
		
		temp_name = this.greekSiegeTypes[Math.floor(Math.random() * Math.floor(this.greekSiegeTypes.length))];
		TriggerHelper.SpawnUnits(this.greekSpawnSites[site],temp_name,1,4);
	}
	
	
	this.greekAttackCounter++;
	/*if (this.greekAttackCounter >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "GreekAttack");*/
	
	
	this.greekAttackInterval = this.greekAttackInterval * this.greekGamma;
	//warn("greek interval = ");
	//warn(uneval(this.greekAttackInterval));
	
	//schedule the next attack
	this.DoAfterDelay(this.greekAttackInterval,"GreekAttack",null);

}

Trigger.prototype.IntervalAction = function(data)
{
	
	//warn("The OnInterval event happened:");
	//warn(uneval(data));
	/*this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");*/
	
	
	var enemy_players = [2,4];
	
	for (let p = 0; p < enemy_players.length; ++p)
	{
	
	
		var enemy_units = TriggerHelper.GetEntitiesByPlayer(enemy_players[p]);
		var human_units = TriggerHelper.GetEntitiesByPlayer(1);
		
		if (human_units.length > 0){
			var d = 0
			var best_distance = 100000
			var best_index = -1
			
			for (let i = 0; i < enemy_units.length; ++i)
			{
				let cmpUnitAI = Engine.QueryInterface(enemy_units[i], IID_UnitAI);
				
				
				
				//check if the unit is idle and if it can attack
				if (cmpUnitAI){
					let cmpPosAI = Engine.QueryInterface(enemy_units[i], IID_Position);
					let pos_i = 0;
					if (cmpPosAI.IsInWorld())
					{
						//warn("calling get pos");
						pos_i = cmpPosAI.GetPosition2D();
					}
					
					if (cmpUnitAI.IsIdle() && Engine.QueryInterface(enemy_units[i], IID_Attack))
					{
					
						for (let j = 0; j < human_units.length; j++)
						{
							let cmpPosHuman = Engine.QueryInterface(human_units[j], IID_Position);
							let pos_j = 0;
							if (cmpPosHuman.IsInWorld())
							{
								//warn("calling get pos");
								pos_j = cmpPosHuman.GetPosition2D();
								
								d =  Math.sqrt( (pos_i.x-pos_j.x)*(pos_i.x-pos_j.x) + (pos_i.y-pos_j.y)*(pos_i.y-pos_j.y) );
							
								if (d < best_distance)
								{
									best_distance = d
									best_index = j
								}
							}
							
					
							
						}
						
						cmpUnitAI.SwitchToStance("violent");
						
						//option 1: attack the entity
						//cmpUnitAI.Attack(human_units[best_index])
						
						//option 2: walk and fight to the location
						let cmpPosition = Engine.QueryInterface(human_units[best_index], IID_Position);
						if (cmpPosition)
						{
							let pos_target = cmpPosition.GetPosition2D();
							cmpUnitAI.WalkAndFight(pos_target.x,pos_target.y,null);
						}
					}
				}
				
				best_distance = 100000
				best_index = -1
			}
		}
	}
};

Trigger.prototype.TestAction = function(data)
{
	//warn("test action")
}



Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of [2,4])
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//process difficulty levels
		if (ai_mult == 1.25)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		
			for (let k = 0; k < this.prog_seq.length; ++k)
			{
				this.prog_seq[k] += 2
			}
		}
		else if (ai_mult >= 1.5)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
			
			cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");


			for (let k = 0; k < this.prog_seq.length; ++k)
			{
				this.prog_seq[k] += 4
			}
		}
		
		//warn(uneval(this.prog_seq));
	}
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	//generate sequence 
	cmpTrigger.prog_seq = [];
	
	for (let i = 0; i < 100; ++i)
	{
		cmpTrigger.prog_seq.push(5+Math.floor(Math.sqrt(2.25*i))+Math.floor(i/2));
	}
	//warn(uneval(cmpTrigger.prog_seq));

	cmpTrigger.cavRatio = 0.55;
	cmpTrigger.siegeRatio = 0.1;

	//persion info
	cmpTrigger.persianSpawnSites = [7647,7646,7645];
	cmpTrigger.persianInfTypes = ["units/pers_champion_infantry","units/pers_kardakes_hoplite","units/pers_kardakes_skirmisher","units/athen_champion_ranged","units/pers_arstibara"];
	
	cmpTrigger.persianSiegeTypes = ["units/rome_mechanical_siege_scorpio_packed","units/rome_mechanical_siege_scorpio_packed"];
	cmpTrigger.persianSiegeTypesAll = ["units/rome_mechanical_siege_scorpio_packed","units/pers_champion_elephant","units/pers_mechanical_siege_ram"];
	
	
	cmpTrigger.persianCavTypes = ["units/pers_cavalry_spearman_b","units/pers_cavalry_javelinist_b"];

	cmpTrigger.persianCavTypesAll = ["units/pers_cavalry_spearman_b","units/pers_cavalry_javelinist_b","units/pers_champion_cavalry_archer","units/pers_cavalry_archer_e","units/sele_champion_cavalry"];


	cmpTrigger.numberOfTimerTrigger = 0;
	cmpTrigger.maxNumberOfTimerTrigger = 100; // execute it that many times
	cmpTrigger.numberOfTimerTriggerCav = 0;
	cmpTrigger.maxNumPersUnits = 70;
	
	//greek info
	cmpTrigger.greekSpawnSites = [7670,7671,7672,7680];
	cmpTrigger.greekInfTypes = ["units/athen_cavalry_javelinist_a","units/athen_cavalry_swordsman_a","units/athen_cavalry_javelinist_b","units/athen_cavalry_swordsman_b","units/athen_champion_ranged","units/athen_champion_marine","units/athen_champion_infantry","units/athen_champion_ranged_gastraphetes","units/thebes_sacred_band_hoplitai","units/athen_champion_ranged"];
	cmpTrigger.greekSiegeTypes = ["units/rome_mechanical_siege_scorpio_packed","units/athen_mechanical_siege_oxybeles_packed","units/mace_mechanical_siege_lithobolos_packed", "units/rome_mechanical_siege_scorpio_packed"];
	
	cmpTrigger.greekRatio = 0.85;
	cmpTrigger.greekAttackCounter = 0;
	cmpTrigger.maxNumGreekAttacks = 100;
	cmpTrigger.maxNumGreekUnits = 70;
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "PersianAttackCav", {
		"enabled": true,
		"delay": 45 * 1000,
		"interval":  95 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "PersianAttack", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 95 * 1000,
	});*/
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "GreekAttack", {
		"enabled": true,
		"delay": 55 * 1000,
		"interval": 75 * 1000,
	});*/
	


	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 3 * 1000,
	});
	
	cmpTrigger.persAttackInterval = 95 * 1000;
	cmpTrigger.persAttackDelay = 35 * 1000;
	cmpTrigger.persAttackDelayCav = 50 * 1000;
	cmpTrigger.persGamma = 0.9825;
	cmpTrigger.DoAfterDelay(cmpTrigger.persAttackDelay,"PersianAttack",null);
	cmpTrigger.DoAfterDelay(cmpTrigger.persAttackDelayCav,"PersianAttackCav",null);

	
	cmpTrigger.greekAttackInterval = 75 * 1000;
	cmpTrigger.greekAttackDelay = 65 * 1000;
	cmpTrigger.greekGamma = 0.9825;
	cmpTrigger.DoAfterDelay(cmpTrigger.greekAttackDelay,"GreekAttack",null);

	cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	

	//make traders trade
	//var all_ents = TriggerHelper.GetEntitiesByPlayer(2);
	
	

		

	
};

