warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointInf = "I";
var triggerPointPersInf = "K";
var triggerPointCav = "C";
var triggerPointEle = "E";
var triggerPointSiege = "A";



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
	
	//let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	if (data.from == 0 && data.to == 1)
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
	}
	
	
	

	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [2,3])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",5,p);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		if (p == 5)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (let p of [2,3])
	{
		let target_p = 1;
			
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



Trigger.prototype.StartNextAttack = function(data)
{
	warn("Starting atack "+uneval(this.attack_index));
	
	if (this.attack_index == 0)
	{
		this.ShowText("The enemy forces are in sight! Prepare for battle!","We're readdy!","May the Gods help us!");
	}
	else if (this.attack_index == 1)
	{
		this.ShowText("A second wave is approaching! Prepare!","We're readdy!","May the Gods help us!");
	}
	else if (this.attack_index == 2)
	{
		this.ShowText("The last of the enemy forfes are approaching! If we survive this assualt, we win!","We're readdy!","May the Gods help us!");
	}
	
	//spawn pers infantry
	let owner = 3;
	for (let i = 0; i < this.attack_level; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointPersInf));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.pers_inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn kush infantry
	owner = 2;
	for (let i = 0; i < this.attack_level; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointInf));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.kush_inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn elephants
	owner = 2;
	for (let i = 0; i < Math.floor(this.eleRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointEle));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.kush_ele_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn kush cavalry
	owner = 2;
	for (let i = 0; i < Math.floor(this.cavRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.kush_cav_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn pers cavalry
	owner = 3;
	for (let i = 0; i < Math.floor(this.cavRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.pers_cav_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn pers siege
	owner = 3;
	for (let i = 0; i < Math.floor(this.siegeRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.pers_siege_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	
	//increment variables
	this.attack_level = this.attack_level + 20;
	this.attack_index = this.attack_index + 1;
	this.eleRatio = this.eleRatio * 1.15;
	
	if (this.attack_index == 2)
	{
		this.pers_siege_templates.push("units/mace/siege_lithobolos_packed");
	}
	
	if (this.attack_index < 3)
		this.DoAfterDelay(300 * 1000,"StartNextAttack",null);
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	let data = { "enabled": true };
	/*cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/

	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	

	
	cmpTrigger.pers_inf_templates = ["units/pers_arstibara", "units/pers_champion_infantry","units/pers_infantry_archer_a", "units/pers_infantry_javelinist_a","units/pers_infantry_spearman_a", "units/pers_kardakes_hoplite", "units/pers_kardakes_skirmisher"]
	
	cmpTrigger.pers_cav_templates = ["units/pers_cavalry_archer_a","units/pers_cavalry_javelinist_a", "units/pers_cavalry_spearman_a", "units/pers_cavalry_swordsman_a","units/pers_champion_cavalry", "units/pers_champion_cavalry_archer"];
	
	cmpTrigger.pers_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "pers", undefined, undefined, true);
	
	cmpTrigger.kush_inf_templates = ["units/kush_champion_infantry", "units/kush_champion_infantry_amun", "units/kush_champion_infantry_apedemak","units/kush_infantry_archer_a","units/kush_infantry_clubman_a","units/kush_infantry_javelinist_merc_a", "units/kush_infantry_javelinist_merc_b", "units/kush_infantry_pikeman_a", "units/kush_infantry_spearman_a", "units/kush_infantry_swordsman_a"];
	
	cmpTrigger.kush_cav_templates = ["units/kush_cavalry_javelinist_a", "units/kush_cavalry_javelinist_merc_a","units/kush_cavalry_spearman_a", "units/kush_champion_cavalry"];
	
	cmpTrigger.kush_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "kush", undefined, undefined, true);
	
	//some variables
	cmpTrigger.attack_index = 0;
	cmpTrigger.attack_level = 100;
	
	cmpTrigger.cavRatio = 0.45;
	cmpTrigger.eleRatio = 0.06;
	cmpTrigger.siegeRatio = 0.05;
	
	
	
	
	for (let p of [1,2,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		cmpPlayer.SetPopulationBonuses(300);
		
		//disable troop production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p == 2 || p == 3)
			cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("siege_armor");
			cmpPlayer.AddStartingTechnology("siege_attack");
			cmpPlayer.AddStartingTechnology("siege_bolt_accuracy");
			cmpPlayer.AddStartingTechnology("siege_packing");
		}
		
	}
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
	//22 minutes in, it starts
	cmpTrigger.DoAfterDelay(1320 * 1000,"StartNextAttack",null);
	
	//then 27 and 32 minutes for next 2 attacks
	
	//40 minutes in, if we survive, we win
	
	//triggers
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "SpawnPatrolPeriodic", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 60 * 1000,
	});


	cmpTrigger.RegisterTrigger("OnInterval", "checkInvasionAttack", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction1", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload1), // central points to calculate the range circles
		"players": [3], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction2", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload2), // central points to calculate the range circles
		"players": [3], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	*/

	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/
	
	
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "LevelUpPers", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 300 * 1000,
	});
	
	
	
	// register winning trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerK", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/
	
	
};
