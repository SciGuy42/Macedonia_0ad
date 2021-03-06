warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

var triggerPointsMace = "A";
var triggerPointsPers = "B";
var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

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
	"structures/brit_crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse",
	
	//villagers
	"units/" + civ + "_support_female_citizen"
];



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
	
	if (data.player == 1)
	{
		if (data.tech != "phase_town_generic" && data.tech != "phase_city_generic")
		{
			let cmpPlayer = QueryPlayerIDInterface(3);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology(data.tech);
			
			//warn("Researching tech for ally");
		}
		
	}
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
	
	let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	/*if (data.from == 0 && data.to == 1)
	{
		if (id.classesList.indexOf("Dock") >= 0)
		{
			this.num_docks_captured += 1;
			warn("dock captured");
			
			TriggerHelper.SpawnUnits(data.entity,"units/mace_ship_merchant",2,1);
		}
		else if (id.classesList.indexOf("Blacksmith") >= 0)
		{
			warn("smith captured");
			this.num_smith_captured += 1;
			if (this.num_smith_captured == 1)
				this.BlacksmithShipAttackRepeats();
		}
		else if (id.classesList.indexOf("Workshop") >= 0)
		{
			warn("shop captured");
			this.DoAfterDelay(240 * 1000,"WorkshopShipAttack",null);
		}
	}
	else if (data.from == 2 && id.classesList.indexOf("Gates") >= 0)
	{
		warn("gate destroyed");
		this.GateDestroyedAttack();
	}
	else if (data.from == 2 && id.classesList.indexOf("CivilCentre") >= 0)
	{
		warn("cc destroyed");
		// TO DO: win
	}
	else if (data.from == 3 && id.classesList.indexOf("GarrisonTower") >= 0)
	{
		warn("tower destroyed");
		this.TowerDestroyedAttack();
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
	
	for (let p of [2,3,4])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		

		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_ranged",5,p);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_ranged",fort_size,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_ranged",2,p);
				
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen_champion_ranged",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	




Trigger.prototype.LevelUpPers = function(data)
{
	this.persLevel = this.persLevel + 1;
	warn("pers level up");
}

Trigger.prototype.IdleUnitCheck = function(data)
{
	for (let p of [3,4])
	{
		let target_p = 4;
		if (p == 4)
			target_p = 3;
			
		//find any idle soldiers
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
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
		}
	}
}


Trigger.prototype.RandomTemplatePers= function(data)
{
	let r = Math.random();
	
	if (r < 0.925)
		return pickRandom(this.pers_inf_templates);
	else if (r < 0.975)
		return pickRandom(this.pers_cav_templates);
	else 
		return pickRandom(this.pers_ele_templates);
}


Trigger.prototype.RandomTemplateMace= function(data)
{
	let r = Math.random();
	
	if (r < 0.9)
		return pickRandom(this.mace_inf_templates);
	else if (r <= 1.0)
		return pickRandom(this.mace_cav_templates);
	else 
		return pickRandom(this.mace_siege_templates);
}


Trigger.prototype.EliteWaveUnitSpawn = function(data)
{
	//PERSIA
	let num_spawn = 3*this.pers_spawn_size;
	let attackers_per = [];
	
	for (let i = 0; i < num_spawn; i ++)
	{
		//pick spawn point
		let pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	
		//pick soldier type
		let class_type = pickRandom(this.pers_elite_templates);
		
		let unit_i = TriggerHelper.SpawnUnits(pers_site,class_type,1,2);
		attackers_per.push(unit_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));

	
	let target = this.FindClosestTarget(attackers_per[0],1,unitTargetClass);
	warn(target);
	let target_pos_pers = TriggerHelper.GetEntityPosition2D(target);
		
	ProcessCommand(2, {
			"type": "attack",
			"entities": attackers_per,
			"target": target,
			"queued": false,
			"allowCapture": false
	});
	
	//pick target
	for (let u of attackers_per)
	{
		/*let target = this.FindClosestTarget(u,1,unitTargetClass);
		let target_pos_pers = TriggerHelper.GetEntityPosition2D(target);
		
		ProcessCommand(2, {
			"type": "attack",
			"entities": [u],
			"target": target,
			"queued": false,
			"allowCapture": false
		});*/
		
		/*ProcessCommand(2, {
			"type": "attack-walk",
			"entities": [u],
			"x": target_pos_pers.x,
			"z": target_pos_pers.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});*/
	}
}

Trigger.prototype.ElephantWaveUnitSpawn = function(data)
{
	//PERSIA
	let num_spawn = this.pers_spawn_size;
	let attackers_per = [];
	
	for (let i = 0; i < num_spawn; i ++)
	{
		//pick spawn point
		let pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	
		//pick soldier type
		let class_type = pickRandom(this.pers_ele_templates);
		
		let unit_i = TriggerHelper.SpawnUnits(pers_site,class_type,1,2);
		attackers_per.push(unit_i[0]);
	}
	
	//pick target
	let target = this.FindClosestTarget(attackers_per[0],1,unitTargetClass);
	let target_pos_pers = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}

Trigger.prototype.CavalryWaveUnitSpawn = function(data)
{
	//PERSIA
	let num_spawn = 3*this.pers_spawn_size;
	let attackers_per = [];
	
	
	for (let i = 0; i < num_spawn; i ++)
	{
		//pick spawn point
		let pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	
		//pick soldier type
		let class_type = pickRandom(this.pers_cav_templates);
		
		let unit_i = TriggerHelper.SpawnUnits(pers_site,class_type,1,2);
		attackers_per.push(unit_i[0]);
	}
	
	//pick target
	let target = this.FindClosestTarget(attackers_per[0],1,unitTargetClass);
	let target_pos_pers = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}

Trigger.prototype.WaveUnitSpawn = function(data)
{
	//pick spawn point
	let pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	
	//pick target point
	let mace_site = pickRandom(this.GetTriggerPoints(triggerPointsMace));
	let target_pos_pers = TriggerHelper.GetEntityPosition2D(mace_site);
	
	//PERSIA
	let num_spawn = this.pers_spawn_size;
	let attackers_per = [];
	
	
	for (let i = 0; i < num_spawn; i ++)
	{
		
		//pick soldier type
		let class_type = this.RandomTemplatePers();
		
		let unit_i = TriggerHelper.SpawnUnits(pers_site,class_type,1,2);
		attackers_per.push(unit_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}

Trigger.prototype.IntervalUnitSpawn = function(data)
{
	//pick spawn point
	let pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	let mace_site = pickRandom(this.GetTriggerPoints(triggerPointsMace));
	
	//pick target point
	let target_pos_pers = TriggerHelper.GetEntityPosition2D(mace_site);
	let target_pos_mace = TriggerHelper.GetEntityPosition2D(pers_site);
	
	
	
	
	//PERSIA
	let num_spawn = this.pers_spawn_size;
	let attackers_per = [];
	
	
	for (let i = 0; i < num_spawn; i ++)
	{
		
		//pick soldier type
		let class_type = this.RandomTemplatePers();
		
		let unit_i = TriggerHelper.SpawnUnits(pers_site,class_type,1,2);
		attackers_per.push(unit_i[0]);
		//let cmpUnitAI = Engine.QueryInterface(unit_i, IID_UnitAI);
		//cmpUnitAI.SwitchToStance("violent");
		//cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
		
		/*ProcessCommand(2, {
			"type": "attack-walk",
			"entities": unit_i,
			"x": target_pos.x,
			"z": target_pos.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});*/
	}
	
	//set formation
	warn(uneval(attackers_per));
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
	
	
	//MACEDONIA
	let currentPop = QueryPlayerIDInterface(1).GetPopulationCount();
	
	if (currentPop < 300)
	{
		num_spawn = this.mace_spawn_size;
		let attackers_mace = [];
		for (let i = 0; i < num_spawn; i ++)
		{
			//pick soldier type
			let class_type = this.RandomTemplateMace();
			
			let unit_i = TriggerHelper.SpawnUnits(mace_site,class_type,1,1);
			attackers_mace.push(unit_i[0]);
			/*ProcessCommand(1, {
				"type": "attack-walk",
				"entities": unit_i,
				"x": target_pos.x,
				"z": target_pos.y,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"queued": true,
				"allowCapture": false
			});*/
		}
		
		//set formation
		warn(uneval(attackers_mace));
		TriggerHelper.SetUnitFormation(1, attackers_mace, pickRandom(unitFormations));

		ProcessCommand(1, {
			"type": "attack-walk",
			"entities": attackers_mace,
			"x": target_pos_mace.x,
			"z": target_pos_mace.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});
	}
}




Trigger.prototype.RepeatUnitSpawnGreek = function(data)
{
	let owner = 3;
	
	//find site
	let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "GarrisonTower").filter(TriggerHelper.IsInWorld);
	let spawn_site = pickRandom(forts_p);
	
	//spawn
	let spawn_size = pickRandom([6,8,10]);
	
	for (let i = 0; i < spawn_size; i++)
	{
		//decide what to spawn
		let unit_type = this.RandomTemplateMace();
		let spawned_units = TriggerHelper.SpawnUnits(spawn_site,unit_type,1,owner);
		
		//issue orders
		for (let u of spawned_units)
		{
			this.WalkAndFightClosestTarget(u,4,unitTargetClass);
		}
	}
	
	this.DoAfterDelay(this.greekSpawnInterval,"RepeatUnitSpawnGreek",null);
	
}

Trigger.prototype.RepeatUnitSpawnPers = function(data)
{
	let owner = 4;
	
	//find site
	let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "Fortress").filter(TriggerHelper.IsInWorld);
	let spawn_site = pickRandom(forts_p);
	
	//spawn
	let spawn_size = pickRandom([4,5,6]) + this.persLevel;
	for (let i = 0; i < spawn_size; i++)
	{
		//decide what to spawn
		let unit_type = this.RandomTemplatePers();
		let spawned_units = TriggerHelper.SpawnUnits(spawn_site,unit_type,1,owner);
		
		//issue orders
		for (let u of spawned_units)
		{
			this.WalkAndFightClosestTarget(u,1,unitTargetClass);
		}
	}
	
	this.DoAfterDelay(this.persSpawnInterval,"RepeatUnitSpawnPers",null);
	
}



Trigger.prototype.RangeActionTriggerK = function(data)
{
	warn(uneval(data));
	
	//check to make sure player 1 hasn't just sent a cavalry unit, must have over 60 units to claim victory
	//find any idle soldiers
	let p = 1;
	let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
	let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
	let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
	let units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);
		
	let units_all = units_inf.concat(units_cav,units_siege,units_ele);
		
	if (data.currentCollection.length > 10)
	{
		warn("Win!");
		// try out the dialog
		var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
		cmpGUIInterface.PushNotification({
			"type": "dialog",
			"players": [1],
			"dialogName": "yes-no",
			"data": {
				"text": {
					"caption": {
						"message": markForTranslation("Congratulations, you have won! Alas, Alexadner's attempt to conquer Tyre via the bridge ultimately failed. Let's see what he comes up with next ..."),
						"translateMessage": true,
					},
				},
				"button1": {
					"caption": {
						"message": markForTranslation("Sure"),
						"translateMessage": true,
					},
					"tooltip": {
						"message": markForTranslation("Say sure"),
						"translateMessage": true,
					},
				},
			},
		});
		
		this.persLevel = this.persLevel + 1;
		
		/*let cmpEndGameManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_EndGameManager);
		cmpEndGameManager.MarkPlayerAndAlliesAsWon(1, markForTranslation("You have won!"), markForTranslation("You have lost!"));*/
	}
}

Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//process difficulty levels
		if (ai_mult == 1.25)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		}
		else if (ai_mult >= 1.5)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
		}
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

	cmpTrigger.enemies = [2,4];
	
	
	//persian soldier types
	cmpTrigger.pers_inf_templates = ["units/pers_arstibara", "units/pers_champion_infantry","units/pers_champion_infantry", "units/pers_infantry_archer_a","units/pers_infantry_javelinist_a","units/pers_infantry_spearman_b","units/pers_infantry_spearman_a","units/pers_infantry_spearman_e","units/pers_kardakes_hoplite","units/pers_kardakes_hoplite", "units/pers_kardakes_skirmisher"];
	cmpTrigger.pers_cav_templates = ["units/pers_cavalry_javelinist_a","units/pers_cavalry_spearman_a","units/pers_cavalry_swordsman_a","units/pers_champion_cavalry", "units/pers_champion_cavalry_archer"];
	cmpTrigger.pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	cmpTrigger.pers_elite_templates = ["units/pers_arstibara","units/pers_champion_infantry","units/pers_kardakes_hoplite", "units/pers_kardakes_skirmisher","units/pers_infantry_archer_e","units/pers_cavalry_archer_e","units/pers_champion_cavalry_archer","units/pers_champion_cavalry","units/pers_cavalry_swordsman_e"];
	
	//macedonian
	cmpTrigger.mace_inf_templates = ["units/mace_champion_infantry_a", "units/mace_champion_infantry_a","units/mace_champion_infantry_e","units/mace_infantry_archer_b","units/mace_infantry_javelinist_b","units/mace_infantry_pikeman_a","units/mace_infantry_slinger_b","units/mace_thorakites", "units/mace_thureophoros","units/athen_champion_ranged","units/athen_champion_marine","units/athen_champion_marine"];
	cmpTrigger.mace_cav_templates = ["units/mace_champion_cavalry", "units/mace_cavalry_spearman_a","units/mace_cavalry_javelinist_a"];
	cmpTrigger.mace_siege_templates = ["units/mace_mechanical_siege_oxybeles_packed"];
	
	//some constants
	cmpTrigger.persSpawnInterval = 5 * 1000;
	cmpTrigger.greekSpawnInterval = 8 * 1000;
	
	//some state variables
	cmpTrigger.persLevel = 2;
	
	
	/*warn(uneval(cmpTrigger.greek_inf_templates));
	warn(uneval(cmpTrigger.mace_inf_templates));
	warn(uneval(cmpTrigger.mace_cav_templates));
	warn(uneval(cmpTrigger.mace_siege_templates));	*/
	
	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	
	//spawn persian units
	cmpTrigger.DoAfterDelay(cmpTrigger.persSpawnInterval,"RepeatUnitSpawnPers",null);
	
	//spawn greek units
	cmpTrigger.DoAfterDelay(10*1000+cmpTrigger.greekSpawnInterval,"RepeatUnitSpawnGreek",null);
	
	
	//cmpTrigger.DoAfterDelay(5 * 1000,"EliteWaveUnitSpawn",null);
	//cmpTrigger.DoAfterDelay(5 * 1000,"CavalryWaveUnitSpawn",null);
	//cmpTrigger.DoAfterDelay(5 * 1000,"ElephantWaveUnitSpawn",null);
	
	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		cmpPlayer.SetPopulationBonuses(300);
		
		//disable troop production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p == 2)
		{
			let unit_templates = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			disTemplates = disTemplates.concat(unit_templates);	
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 1)
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
		
	}


	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/
	
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "LevelUpPers", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 300 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	// register winning trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerK", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
};

