warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointPatrolA = "A";
var triggerPointPatrolB = "B";
var triggerPointPatrolMountainWest = "K";
var triggerPointPatrolMountainMiddle = "J";
var triggerPointPatrolMountainEast = "I";
var triggerPointRaid = "G";



var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "_corral",
	"structures/" + civ + "_farmstead",
	"structures/" + civ + "_field",
	"structures/" + civ + "_storehouse",
	"structures/" + civ + "_rotarymill",
	"structures/" + civ + "_market",
	
	// Expansions
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Walls
	"structures/" + civ + "_wallset_stone",
	"structures/rome_wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	"structures/" + civ + "_dock",
	"structures/brit/crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse",
	
	//villagers
	"units/" + civ + "_support_female_citizen"
];




Trigger.prototype.WalkAndGatherClosestTarget = function(attacker,target_player,target_class)
{
	let target = this.FindClosestTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker,target_player,siegeTargetClass);
	}
	
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.PerformGather(target,true,true);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
}


Trigger.prototype.WalkAndFightClosestTarget = function(attacker,target_player,target_class)
{
	let target = this.FindClosestTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker,target_player,siegeTargetClass);
	}
	
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
}

Trigger.prototype.FindClosestTarget = function(attacker,target_player,target_class)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}
	
	return closestTarget;
}

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	//warn("The OnStructureBuilt event happened with the following data:");
	//warn(uneval(data));
	this.lastFoundation = data.foundation;
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
	//check if darius is dead
	if (data.from == 3 && data.to == -1)
	{
		this.dariusDead = true;
	}
	
	//check if player 2 or 6 has lost a structure
	if ((data.from == 2 || data.from == 6) && data.to == -1 && data.entity != this.lastFoundation)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
	//	warn(uneval(data));
	//	warn(uneval(id));
		if (id != null && id.classesList.indexOf("Structure") >= 0)
		{
			
			//with small probability spawn mercenary squad
			if (Math.random() < this.mercSpawnProb)
			{
				this.DoAfterDelay(5 * 1000,"SpawnMercenarySquad",null);
				//warn("spawning mercs");
				
				//decay
				this.mercSpawnProb = this.mercSpawnProb * this.mercSpawnProbDecay;
				
				if (this.mercSpawnProb < 0.2)
				{
					this.mercSpawnProb = 0.2;
				}
				
				//warn("new prob = "+uneval(this.mercSpawnProb));
			}
		}
	}
	
	//check if player 5 has lost all units
	if (data.from == 5 && data.to == -1)
	{
		let cmpPlayer = QueryPlayerIDInterface(5);
		let pop = cmpPlayer.GetPopulationCount();

		if (pop == 0)
		{
			this.ShowText("The assasins are dead. Darius is severely wounded and as he lay dying, he utters his final words: 'Avenge me! The empire is yours, but you must defeat Bessus. My loyal followers will help you setup camp. You must destroy the traitor!","Sounds good","OK");
			
			//spawn servants
			let dariusID = 3328;
			let alexanderID = 3287;
			
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_archer_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_spearman_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_javelinist_a",5,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_support_healer_e",3,1);
			
			if (this.dariusDead == false)
			{
				//kill darius if alive
				let health_u = Engine.QueryInterface(dariusID, IID_Health);
				health_u.Kill();
			
				this.dariusDead = true;
			}
			
		}
	}
	
	/*if (this.specialAttackTriggered == false)
	{
		if ((data.from == 5 || data.from == 6) && data.to == -1)
		{
			//check if strucutre
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			//warn(uneval(id));
			if (id != null && id.classesList.indexOf("Structure") >= 0)
			{
				if (data.from == 5)
				{
					//spawn attack from player 6
					this.DoAfterDelay(5 * 1000,"SpecialArcadianAssault",null);
					this.specialAttackTriggered = true;
					
				}
				else if (data.from == 6)
				{
					//spawn attack from player 5
					this.DoAfterDelay(5 * 1000,"SpecialAchaeanAssault",null);
					this.specialAttackTriggered = true;
				}
			}
		}
	}
	*/
	
	/*warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));
	
	if (data.from == 5 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.indexOf("Fortress") >= 0)
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}*/
	
	//let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	/*if (data.from == 0 && data.to == 1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		warn(uneval(id));
		
		if (id.classesList.indexOf("Embassy") >= 0)
		{
			//captured camp, spawn some balistas
			TriggerHelper.SpawnUnits(data.entity,"units/mace_mechanical_siege_oxybeles_packed",8,1);
			
			//spawn the princess
			TriggerHelper.SpawnUnits(data.entity,"units/kush_hero_amanirenas",1,1);
		}
		else if (id.classesList.indexOf("Pyramid") >= 0)
		{
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			
			cmpTechnologyManager.ResearchTechnology("tower_armour");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				
		}
	}*/
	
	
	

	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};




//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [4,5,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		let owner = 7;
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_infantry",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		let fort_size = 20;
	
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",fort_size,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_w)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,owner);
					
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers_kardakes_hoplite",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	




Trigger.prototype.HorseCheck = function(data)
{
	for (let p of [0])
	{
		let animals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Animal").filter(TriggerHelper.IsInWorld);
		
		let horses = [];
		
		for (let a of animals)
		{
			let id = Engine.QueryInterface(a, IID_Identity);
			if (id.template.SpecificName == "Horse")
			{
				//warn("Found horse");
				horses.push(a);
			}
		}
		
		//warn("Found "+horses.length+" horses");
		
		if (horses.length < 300)
		{
			//with small probability reproduce
			let rate = 0.05;
			
			let new_horses = Math.round((horses.length*rate)+1);
			
			//warn("Adding "+new_horses);
			for (let i = 0; i < new_horses; i ++)
			{
				TriggerHelper.SpawnUnits(pickRandom(horses),"gaia/fauna_horse",1,0);	
			}
		}
	}
}

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [3,4,5])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
		//warn("checking decay");
		
		
		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				//warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
				//warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));
				
				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);

				}
				
			}
		}
	}
	
}



Trigger.prototype.IdleUnitCheck = function(data)
{
	
	//find idle hunters
	for (let p of [4,5])
	{
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Javelin").filter(TriggerHelper.IsInWorld);
		
		//warn("Found "+units_cav.length+" javelins");
		
		//hunters
		for (let u of units_cav)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndGatherClosestTarget(u,0,"Animal");
				}
			}
		}
		
		//check other cavalry
		let units_cav_soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry+!Javelin").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_cav_soldiers)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//send to patrol
					if (p == 4)
					{
						this.PatrolOrderList([u],p,this.GetTriggerPoints(triggerPointPatrolA));
					}
					else if (p == 5)
					{
						this.PatrolOrderList([u],p,this.GetTriggerPoints(triggerPointPatrolB));
					}
				}
			}
		}
		
		//check infantry
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_inf)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					if (p == 4)
					{
						//pick points to patrol
						let patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainWest),5);
						
						this.PatrolOrderList([u],p,patrol_points);
										
					}
					else if (p == 5)
					{
						let patrol_points = [];
						if (Math.random() < 0.5)
							patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainMiddle),5);
						else
							patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainEast),5);
						
						this.PatrolOrderList([u],p,patrol_points);
						
					}
				}
			}
		}
		
		
		/*let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		let units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);
		
		let units_all = units_inf.concat(units_cav,units_siege,units_ele);
		
		for (let u of units_all)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,target_p,unitTargetClass);
				}
			}
		}*/
	}
	
	for (let p of [6])
	{
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_cav)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,1,unitTargetClass);
				}
			}
		}
	}
	

	
}




Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		
	//warn("targets: "+uneval(patrolTargets));

	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
	}
}

Trigger.prototype.PatrolOrder = function(units,p,A,B)
{
	
	if (units.length <= 0)
		return;
	
	
	//list of patrol targets
	let patrolTargets = [A,B];

	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
	}
}


Trigger.prototype.SpawnEastMountainPatrol = function(data)
{
	let p = 5;
	
	//find site
	let structures = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	//warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player "+p);
		return; //no more structures, must be defeated
	}
	
	//choose spawn site
	let site = pickRandom(structures);
	
	//templates, mostly archers
	let templates = ["units/pers_infantry_archer_e","units/pers_infantry_archer_a"];
	
	//spawn a single template
	let inf_units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	
	if (inf_units.length < this.maxSacaInf)
	{
		
		//spawn unit
		let unit = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		
		//pick points to patrol
		let patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainEast),5);
		
		this.PatrolOrderList(unit,p,patrol_points);
	}
	
	//schedule next spawn
	let next_spawn_seconds = Math.round(Math.sqrt(2*inf_units.length))+1;
	//warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000,"SpawnEastMountainPatrol",null);

}

Trigger.prototype.SpawnMiddleMountainPatrol = function(data)
{
	let p = 5;
	
	//find site
	let structures = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	//warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player "+p);
		return; //no more structures, must be defeated
	}
	
	//choose spawn site
	let site = pickRandom(structures);
	
	//templates, mostly archers
	let templates = ["units/pers_infantry_archer_e","units/pers_infantry_archer_a"];
	
	//spawn a single template
	let inf_units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	
	if (inf_units.length < this.maxSacaInf)
	{
		
		//spawn unit
		let unit = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		
		//pick points to patrol
		let patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainMiddle),5);
		
		this.PatrolOrderList(unit,p,patrol_points);
	}
	
	//schedule next spawn
	let next_spawn_seconds = Math.round(Math.sqrt(2*inf_units.length))+1;
	//warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000,"SpawnMiddleMountainPatrol",null);

}

Trigger.prototype.SpawnWestMountainPatrol = function(data)
{
	let p = 4;
	
	//find site
	let structures = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	//warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player "+p);
		return; //no more structures, must be defeated
	}
	
	//choose spawn site
	let site = pickRandom(structures);
	
	//templates, mostly archers
	let templates = ["units/pers_infantry_archer_e","units/pers_infantry_archer_a"];
	
	//spawn a single template
	let inf_units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	
	if (inf_units.length < this.maxSacaInf)
	{
		
		//spawn unit
		let unit = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		
		//pick points to patrol
		let patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainWest),5);
		
		this.PatrolOrderList(unit,p,patrol_points);
	}
	
	//schedule next spawn
	let next_spawn_seconds = Math.round(Math.sqrt(2*inf_units.length))+1;
	//warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000,"SpawnWestMountainPatrol",null);

}


Trigger.prototype.pickRandomK = function(inputs,K)
{
	let subset = [];
	
	while (subset.length < K)
	{
		let next = pickRandom(inputs);
		
		if (subset.indexOf(next) < 0)
		{
			subset.push(next);
		}
	}
	
	return subset;
	
}

Trigger.prototype.SpawnMaPatrol = function(data)
{
	let p = 4;
	
	//find site
	let structures = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Structure+!MercenaryCamp").filter(TriggerHelper.IsInWorld);
	//warn(structures.length);
	if (structures.length == 0)
	{
		return; //no more structures, must be defeated
	}
	
	//choose spawn site
	let site = pickRandom(structures);
	
	//templates, mostly archers
	let cav_templates = ["units/pers_champion_cavalry","units/pers_champion_cavalry_archer","units/pers_champion_cavalry_archer"];
	
	//see if we have room to spawn more
	let cmpPlayer = QueryPlayerIDInterface(p);
	let pop = cmpPlayer.GetPopulationCount();
	//warn(pop);
	
	let cav_units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		
	if (cav_units.length < this.maxSacaCav)
	{
		let patrol_size = 5;
		let units = [];
		for (let i = 0; i < patrol_size; i ++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(cav_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//warn(uneval(units));
		
		//send to patrol
		//set formation
		//TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		this.PatrolOrderList(units,p,this.GetTriggerPoints(triggerPointPatrolA));
	}
	
	this.DoAfterDelay(45 * 1000,"SpawnMaPatrol",null);

}


Trigger.prototype.SpawnApaPatrol = function(data)
{
	let p = 5;
	
	//find site
	let structures = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Structure+!MercenaryCamp").filter(TriggerHelper.IsInWorld);
	//warn(structures.length);
	if (structures.length == 0)
	{
		return; //no more structures, must be defeated
	}
	
	//choose spawn site
	let site = pickRandom(structures);
	
	//templates, mostly archers
	let cav_templates = ["units/pers_champion_cavalry","units/pers_champion_cavalry_archer","units/pers_champion_cavalry_archer"];
	
	//see if we have room to spawn more
	let cmpPlayer = QueryPlayerIDInterface(p);
	
	let cav_units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		
	if (cav_units.length < this.maxSacaCav)
	{
		let patrol_size = 5;
		let units = [];
		for (let i = 0; i < patrol_size; i ++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(cav_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//warn(uneval(units));
		
		//send to patrol
		//set formation
		//TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		this.PatrolOrderList(units,p,this.GetTriggerPoints(triggerPointPatrolB));
	}
	
	this.DoAfterDelay(45 * 1000,"SpawnApaPatrol",null);

}


Trigger.prototype.SpawnCavalryRaid = function(data)
{
	//size of raid is determined by number of strucures owned by 4 and 5
	let structures_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Structure").filter(TriggerHelper.IsInWorld);
	let structures_p5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Structure").filter(TriggerHelper.IsInWorld);
	
	let num_squads = Math.round((structures_p4.length + structures_p5.length)/2);
	
	for (let i = 0; i < num_squads; i ++)
	{
		this.DoAfterDelay((i*5) * 1000,"SpawnCavalryRaidSquad",null);
	}
	
	//repeat after 6 minutes
	this.DoAfterDelay(360 * 1000,"SpawnCavalryRaid",null);
	
}

Trigger.prototype.SpawnCavalryRaidSquad = function(data)
{
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	//pick spawn site
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointRaid));
	
	//templates
	let cav_templates = ["units/pers_champion_cavalry","units/pers_champion_cavalry_archer","units/pers_champion_cavalry_archer","units/pers_cavalry_javelinist_e","units/pers_cavalry_swordsman_e"];
	
	let num_attackers = 8;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//send to attack
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}

Trigger.prototype.CavalryAttack = function(data)
{
	//check if we have structures left, if not, end
	let p = 5;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
	
	//pick spawn site
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));
	
	//how big should the attack be
	let min_size = 20;
	let units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);
	
	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;
	
	//types
	let cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry", "kush", undefined, undefined, true);
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//attack
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}



Trigger.prototype.ShowText = function(text,option_a,option_b)
{
	var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1,2,3,4,5,6,7,8],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation(text),
					"translateMessage": true,
				},
			},
			"button1": {
				"caption": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
			},
			"button2": {
				"caption": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
			},
		},
	});
	
}


Trigger.prototype.DiplomacyStatusCheck = function(data)
{
	if (this.warStarted == false)
	{
		let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Fortress").filter(TriggerHelper.IsInWorld);
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "DefenseTower").filter(TriggerHelper.IsInWorld);
	
		if (forts.length >= 3 && towers.length >= 6)
		{
			this.warStarted = true;
			
			for (let p of [2,4,5])
			{
				let cmpPlayer = QueryPlayerIDInterface(p);
				cmpPlayer.SetEnemy(1);
			}
			
			let cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.SetEnemy(2);
			cmpPlayer.SetEnemy(4);
			cmpPlayer.SetEnemy(5);
			
			this.DoAfterDelay(5 * 1000,"SpawnWestMountainPatrol",null);
			this.DoAfterDelay(6 * 1000,"SpawnMiddleMountainPatrol",null);
			this.DoAfterDelay(7 * 1000,"SpawnEastMountainPatrol",null);
	
			
			//warn("WAR STARTED");
			this.ShowText("Our scouts have some disturbing news to report! The Sogdians and the Sacae are now in open rebellion against us! We must destroy the Sogdian settlement and all posts and tents set up by the Ma and Apa Saka!","I knew it!","OK");
			
			//repeat after 6 minutes
			this.DoAfterDelay(360 * 1000,"SpawnCavalryRaid",null);
	
		}
		else 
		{
			this.DoAfterDelay(30 * 1000,"DiplomacyStatusCheck",null);
		}
		
	}
	
}


Trigger.prototype.ResearchTechs = function(data)
{
	for (let p of [1,2,4,5,6])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
		}
		else if (p == 2)
		{
			//give some trade gains
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		}
		else if (p == 4 || p ==5 || p == 6)
		{
			//infantry archer and cav tech
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");

			
		}
		
	}
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);


	//some templates
	
	//some variables
	cmpTrigger.maxSacaCav = 200; 
	cmpTrigger.maxSacaInf = 150;
	
	//some state variables
	cmpTrigger.warStarted = false;
	
	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//some patrols
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnMaPatrol",null);
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnApaPatrol",null);
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);
	
	
	//debug - this only happens once they become hostile
	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnCavalryRaid",null);

	
	//check whether to start war
	cmpTrigger.DoAfterDelay(30 * 1000,"DiplomacyStatusCheck",null);
		
	
	//set diplomacy
	//everyone is neutral towards 3 and 1
	for (let p of [2,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(1);
		cmpPlayer.SetNeutral(3);
		cmpPlayer.SetNeutral(6);
	}
	
	//everyone else is neutral towards 2,4,5
	for (let p of [1,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(2);
		cmpPlayer.SetNeutral(4);
		cmpPlayer.SetNeutral(5);
	}
	
	//1 and 3 are neutral
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetAlly(3);
	cmpPlayer = QueryPlayerIDInterface(3);
	cmpPlayer.SetAlly(1);
	
	//6 is neutral towards everyone but player 1
	cmpPlayer = QueryPlayerIDInterface(6);
	for (let p of [2,3,4,5])
	{
		cmpPlayer.SetNeutral(p);
	}

	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		
		if (true) //disable civil centres
		{
			//disable buildings production
			//let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
			//disable units as well
			//let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			
			//disTemplates = disTemplates.concat(unit_templaes);
		
			let disTemplates = ["structures/" + cmpPlayer.GetCiv() + "_civil_centre","structures/" + cmpPlayer.GetCiv() + "_dock"];
		
			cmpPlayer.SetDisabledTemplates(disTemplates);
			//warn("Disabling templates for player "+uneval(p));
		}
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p != 1)
		{
			cmpPlayer.AddStartingTechnology("trade_commercial_treaty");
			cmpPlayer.AddStartingTechnology("trade_gain_01");
			cmpPlayer.AddStartingTechnology("trade_gain_02");
		}
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 6)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 5 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "HorseCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 60 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 60 * 1000,
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	//cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
