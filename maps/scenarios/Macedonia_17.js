warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointShipUnload1 = "K";
var triggerPointShipInvasionSpawn1 = "A";

var triggerPointShipUnload2 = "J";
var triggerPointShipInvasionSpawn2 = "B";

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
	warn("The OnResearchFinished event happened with the following data:");
	warn(uneval(data));
	
	if (data.player == 1)
	{
		if (data.tech != "phase_town_generic" && data.tech != "phase_city_generic")
		{
			let cmpPlayer = QueryPlayerIDInterface(3);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology(data.tech);
			
			warn("Researching tech for ally");
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
			
			TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_merchant",2,1);
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


Trigger.prototype.PatrolOrder = function(units)
{
	let p = 5;// city watch player
	
	if (units.length <= 0)
		return;
	
	//make them patrol
	let patrolTargetPool = [];
	let patrolTargets = [];
	
	//list of ccs, gates, and docks
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	let gates = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Gate").filter(TriggerHelper.IsInWorld);
	let docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Dock").filter(TriggerHelper.IsInWorld);
	
	for (let e of ccs)
		patrolTargetPool.push(e)
	for (let e of gates)
		patrolTargetPool.push(e)
	for (let e of docks)
		patrolTargetPool.push(e)

	if (patrolTargetPool.length < 3)
		return;

	//randomly pick 3 gates
	while (patrolTargets.length < 3)
	{
		let taget_k = Math.floor(Math.random() * patrolTargetPool.length);
		if (patrolTargets.indexOf(patrolTargetPool[taget_k]) < 1) 
			patrolTargets.push(patrolTargetPool[taget_k]);
	}

	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(5, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": false,
			"allowCapture": false
		});
	}
}


//spawn allied attack
Trigger.prototype.SpawnAlliedInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		warn("invasion attack ordered when already one is going on");
		this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
		return;
	}
	
	let target_point = triggerPointShipUnload1;
	let spawn_point = triggerPointShipInvasionSpawn1;
	if (Math.random() < 0.5)
	{
		let target_point = triggerPointShipUnload2;
		let spawn_point = triggerPointShipInvasionSpawn2;
	}
	
	//prompt for target
	// try out the dialog
	/*var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	var result = cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation("Testing the yes-no dialog. Do you want to say sure or rather not?"),
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
			"button2": {
				"caption": {
					"message": markForTranslation("Rather not"),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation("Say rather not"),
					"translateMessage": true,
				},
			},

		},
	});*/
	
	//warn(uneval(result));
	
	//check if alluy have docks
	let have_docks = false;
	let spawn_docks = [];
	let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks_e.length < 1)
		return;
	
	
	//decide how many ships to spawn and where
	let spawn_site = pickRandom(docks_e);
	let owner = 3;//TriggerHelper.GetOwner(spawn_site);
	let attacker_ships = [];
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	let triggerPoint = pickRandom(this.GetTriggerPoints(spawn_point));
	
	//let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,this.spawn_ship_templates[1],1,owner);
	let ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, this.spawn_ship_templates[1], 1, owner);
	let ship_invasion_garrison = [];
		
	//spawn the invasion force inside the ship
	for (let j = 0; j < 28; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.greekInfTypes),1,owner);
		ship_invasion_garrison.push(u_j);
	}
		
	//spawn some siege
	for (let j = 0; j < 2; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.greekSiegeTypes),1,owner);
		ship_invasion_garrison.push(u_j);

	}
		
		
	//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;
			
	attacker_ships.push(ship_spawned[0]);
	
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	
	let ungarrison_point = pickRandom(this.GetTriggerPoints(target_point));
	let ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	this.ungarrisonPos = ungarrisonPos;
	
	//send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, true);
	
	//cmpUnitAI.WalkToTarget(12101,true);
	//cmpUnitAI.WalkAndFight(target_position.x,target_position.y,null);
	
	
	/*let gholder = Engine.QueryInterface(ship_spawned[0], IID_GarrisonHolder);
	for (let unit of garrison_units)
	{
		//let uAI = Engine.QueryInterface(unit, IID_UnitAI);
		//uAI.AddOrder("Ungarrison", null, true);
		gholder.Unload(unit,false);
	}*/
	
	//cmpUnitAI.AddOrder("Walk", { "x": target_position.x, "y": target_position.y, "force": true }, true);
	//cmpUnitAI.AddOrder("Ungarrison", null, true);
	
	/*for (let unit of garrison_units)
	{
		let uAI = Engine.QueryInterface(unit, IID_UnitAI);
		uAI.AddOrder("Ungarrison", null, true);
	}*/
			
	
	
	this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
	
}



Trigger.prototype.PersianCavalryAttack = function(data)
{
	let p = 4;
	
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (camps.length == 0)
		return;
	
	let spawn_site = camps[0];
	
	let num_attackers = this.persAttackLevel;
	let attackers = [];
	
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.persianCavTypes),1,p);
		attackers.push(units_i[0]);
	}
	
	
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
	
	let next_attack_interval_sec = 240 + Math.floor(Math.random() * 120);
	warn("Next attack = " + uneval(next_attack_interval_sec));
	this.persAttackLevel += Math.floor(Math.random() * 5)+1;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"PersianCavalryAttack",null);
	
}


//garison AI entities with archers
Trigger.prototype.SpawnPatrolPeriodic = function(data)
{
	//which player
	let p = 5; //city watch 
	
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	let currentPop = QueryPlayerIDInterface(p).GetPopulationCount();
	if (currentPop > 290)
		return;
		
	//calculate size of spawn units
	let num_patrols = 1;
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(ccs);
		
		//melee
		for (let i = 0; i < 3; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,"units/cart_champion_infantry",1,p);
			units.push(unit_i[0]);
		}
		
		//archers
		for (let i = 0; i < 2; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,"units/cart_infantry_archer_e",1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(5, units, pickRandom(unitFormations));

		
		//send to patrol
		this.PatrolOrder(units);
		
	}
	
}

//garison AI entities with archers
Trigger.prototype.SpawnInitialPatrol = function(data)
{
	//which player
	let p = 5; //city watch 
	
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//calculate size of spawn units
	let num_patrols = 15;
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(ccs);
		
		//melee
		for (let i = 0; i < 3; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,"units/cart_champion_infantry",1,p);
			units.push(unit_i[0]);
		}
		
		//archers
		for (let i = 0; i < 2; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,"units/cart_infantry_archer_e",1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(5, units, pickRandom(unitFormations));

		
		//send to patrol
		this.PatrolOrder(units);
		
	}
	
}

//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [2,3,4,5])
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

Trigger.prototype.InvasionRangeAction1 = function(data)
{
	this.InvasionRangeAction(data);
}

Trigger.prototype.InvasionRangeAction2 = function(data)
{
	this.InvasionRangeAction(data);
}


Trigger.prototype.InvasionRangeAction = function(data)
{
	//warn("The Invasion OnRange event happened with the following data:");
	//warn(uneval(data));
	
	if (this.invasion_under_way == true)
	{
		let cmpGarrisonHolder = Engine.QueryInterface(this.invasion_ship, IID_GarrisonHolder);
		
		if (cmpGarrisonHolder)
		{
			let humans = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Human");
			let siegeEngines = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Siege");
			if (humans.length > 0 || siegeEngines.length > 0)
			{
				warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				warn("Done unloading");
				
				//send units to attack
				
				this.invasion_under_way = false;			
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;
			}
		}
	}
}

Trigger.prototype.checkInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		let cmpUnitAI = Engine.QueryInterface(this.invasion_ship, IID_UnitAI);
		if (cmpUnitAI)
		{
			warn(uneval(cmpUnitAI.order));
			if (!cmpUnitAI.order)
			{
				warn("assigning order to ship");
				//send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			}
			else if (cmpUnitAI.order.type != "Walk")
			{
				warn("assigning order to ship");
				//send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			
			}
		}
		else 
		{
			//ship must have been destroyed
			this.invasion_under_way == false;
		}
	}
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
	/*cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/

	cmpTrigger.enemies = [2,4,5];

	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//spawn patrols
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInitialPatrol",null);

	
	cmpTrigger.persianCavTypes = ["units/pers_cavalry_spearman_a","units/pers_cavalry_javelinist_a","units/pers_champion_cavalry_archer","units/pers_cavalry_archer_a","units/sele_champion_cavalry"];
	cmpTrigger.persAttackLevel = 15;
	
	
	cmpTrigger.greekInfTypes = ["units/athen/champion_ranged","units/athen/champion_marine","units/athen/champion_marine","units/athen_champion_infantry","units/athen_champion_infantry","units/athen_champion_ranged_gastraphetes","units/thebes_sacred_band_hoplitai"];
	cmpTrigger.greekSiegeTypes = ["units/athen_mechanical_siege_oxybeles_packed","units/athen_mechanical_siege_oxybeles_packed","units/mace/siege_lithobolos_packed"];
	cmpTrigger.spawn_ship_templates = TriggerHelper.GetTemplateNamesByClasses("Warship", "athen", undefined, undefined, true);

	//whether allied inasion is under way
	cmpTrigger.invasion_under_way = false;
	cmpTrigger.invasion_ship = undefined;
	cmpTrigger.ship_invasion_garrison = undefined;

	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p != 3)
		{
			cmpPlayer.AddStartingTechnology("phase_town_generic");
			cmpPlayer.AddStartingTechnology("phase_city_generic");
		}
		else 
		{
			cmpPlayer.AddStartingTechnology("phase_town_athen");
			cmpPlayer.AddStartingTechnology("phase_city_athen");
		}
		
		//disable templates
		if (p == 4 || p == 5 || p == 3)
		{
			//disable troop production
			let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
			cmpPlayer.SetDisabledTemplates(disTemplates);
		}
		else if (p == 2)
		{
			cmpPlayer.SetDisabledTemplates(["structures/" + cmpPlayer.GetCiv() + "_civil_centre"]);
		}
		
		//add tower techs to city watch
		if (p == 5)
		{
			cmpPlayer.AddStartingTechnology("tower_armour");
			cmpPlayer.AddStartingTechnology("tower_range");
			cmpPlayer.AddStartingTechnology("tower_watch");
			cmpPlayer.AddStartingTechnology("tower_murderholes");
			cmpPlayer.AddStartingTechnology("tower_crenellations");
		}
	}
	
	
	
	
	cmpTrigger.DoAfterDelay(180 * 1000,"PersianCavalryAttack",null);
	
	
	cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
	
	
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
	});*/
	
	
};
