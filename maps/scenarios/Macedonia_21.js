warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointShipInvasion = "B";
var triggerPointShipSpawn = "A";
var triggerPointCavalryAttack = "K";



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
	warn("The OnStructureBuilt event happened with the following data:");
	warn(uneval(data));
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
	
	if (data.from == 5 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.indexOf("Fortress") >= 0)
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}
	
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
				
				//send units to attack -- idle unit check will take care of this
				
				//send ship to attack
				//get possible list of dock targets
				let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
				let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);
			
				let targets = dock_targets.concat(ship_targets);

				//order attack
				if (targets.length > 0)
				{				
					let p = 6;
					ProcessCommand(p, {
						"type": "attack",
						"entities": [this.invasion_ship],
						"target": pickRandom(targets),
						"queued": false,
						"allowCapture": false
					});
				}
				
				//clear variables and schedule next attack
				this.invasion_under_way = false;			
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;
				
				//schedule next attack
				this.carthageInvasionAttackInterval = Math.floor(0.975 * this.carthageInvasionAttackInterval);
				if (this.carthageInvasionShipGarrisonSize < 49)
					this.carthageInvasionShipGarrisonSize = this.carthageInvasionShipGarrisonSize + 2;
				
				warn("Next invasion in "+uneval(this.carthageInvasionAttackInterval));
				this.DoAfterDelay(this.carthageInvasionAttackInterval * 1000,"SpawnNavalInvasionAttack",null);

				
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

//spawn naval attack
Trigger.prototype.SpawnNavalInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		warn("invasion attack ordered when already one is going on");
		this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
		return;
	}
	
	
	//check if carthage has docks
	let have_docks = false;
	let spawn_docks = [];
	let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks_e.length < 1)
		return;
	
	
	//decide how many ships to spawn and where
	let spawn_site = pickRandom(docks_e);
	let owner = 6;
	let attacker_ships = [];
	
	//let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,this.spawn_ship_templates[1],1,owner);
	let ship_spawned = TriggerHelper.SpawnUnits(spawn_site, "units/cart_ship_quinquereme", 1, owner);
	let ship_invasion_garrison = [];
		
	//spawn the invasion force inside the ship
	for (let j = 0; j < this.carthageInvasionShipGarrisonSize; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.cartAttackerTypes),1,owner);
		ship_invasion_garrison.push(u_j);
	}
			
	//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;
			
	attacker_ships.push(ship_spawned[0]);
	
	let ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipInvasion));
	let ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	this.ungarrisonPos = ungarrisonPos;
	
	//send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, true);
	
	
	//this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
	
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [3,5,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/kush_champion_infantry",5,p);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/kush_champion_infantry",fort_size,p);
			
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
	for (let p of [6])
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




Trigger.prototype.StartEpisode = function(data)
{
	let fort_A = 553;//TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
	let fort_B = 554;//TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
		
	
	//PLAYER 1
	var counts_A = [];
	for (let type of this.unitTypes)
	{
		let count_t = Math.floor(Math.random() * this.maxCountPerType);
		counts_A.push(count_t);
	}
	
	//spawn and attack
	let units_A = []
	for (let t= 0; t < this.unitTypes.length; t++)
	{
		for (let i = 0; i < counts_A[t]; i ++)
		{
			let units_i = TriggerHelper.SpawnUnits(fort_A,this.unitTypes[t],1,1);
			units_A.push(units_i[0]);
		}
	}
	
	//find target
	let target_A = this.FindClosestTarget(units_A[0],2,unitTargetClass);
	let target_pos_A = TriggerHelper.GetEntityPosition2D(target_A);
	
	//set formation
	//TriggerHelper.SetUnitFormation(1, units_A, pickRandom(unitFormations));

	
	ProcessCommand(1, {
		"type": "attack-walk",
		"entities": units_A,
		"x": target_pos_A.x,
		"z": target_pos_A.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
	
	
	//PLAYER 2
	var counts_B = [];
	for (let type of this.unitTypes)
	{
		let count_t = Math.floor(Math.random() * this.maxCountPerType);
		counts_B.push(count_t);
	}
	
	//spawn and attack
	let units_B = []
	for (let t= 0; t < this.unitTypes.length; t++)
	{
		for (let i = 0; i < counts_B[t]; i ++)
		{
			let units_i = TriggerHelper.SpawnUnits(fort_B,this.unitTypes[t],1,2);
			units_B.push(units_i[0]);
		}
	}
	
	//find target
	let target_B = this.FindClosestTarget(units_B[0],1,unitTargetClass);
	let target_pos_B = TriggerHelper.GetEntityPosition2D(target_B);
	
	//TriggerHelper.SetUnitFormation(2, units_B, pickRandom(unitFormations));

	
	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": units_B,
		"x": target_pos_B.x,
		"z": target_pos_B.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}


Trigger.prototype.GarrisonPlayerShips = function(data)
{
	let p = 1;
	//let ships_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p, "Warship").filter(TriggerHelper.IsInWorld));
	
	let units_pl1 = TriggerHelper.GetEntitiesByPlayer(1);
	let warships_pl1 = TriggerHelper.MatchEntitiesByClass(units_pl1, "Warship").filter(TriggerHelper.IsInWorld);
	
	
	warn("Found "+uneval(warships_pl1));
	for (let ship of warships_pl1)
	{
		//spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol_infantry_archer_e",5,p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol_infantry_slinger_e",5,p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol_infantry_pikeman_e",5,p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol_cavalry_javelinist_merc_e",5,p);
	}
}


Trigger.prototype.PatrolOrder = function(units,p)
{
	
	if (units.length <= 0)
		return;
	
	
	//list of patrol targets
	let patrolTargets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	

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

//garison AI entities with archers
Trigger.prototype.SpawnFortressPatrol = function(data)
{
	//which player
	let p = 5; 
	
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//calculate size of spawn units
	let num_patrols = 10;
	let patrol_size = 5;
	
	let inf_templates = ["units/kush_champion_infantry_amun","units/kush_champion_infantry","units/kush_champion_infantry_apedemak"];
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(ccs);
		
		//melee
		for (let i = 0; i < patrol_size; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		
		//send to patrol
		this.PatrolOrder(units,p);
		
	}
	
}

Trigger.prototype.CarthageShipAttack = function(data)
{
	//check if we have docks
	let p = 6;
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length == 0)
		return; //attacks end
		
	//pick spawn site
	let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointShipSpawn));
	
	//spawn ship
	let templates = ["units/cart_ship_trireme","units/cart_ship_bireme"];
	let ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(templates), 1, p);
	
	//spawn garrison
	for (let j = 0; j < this.cartShipGarrisonSize; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],"units/cart_champion_infantry",1,p);
	}
	
	//get possible targets
	//get possible list of dock targets
	let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
	//get possible trade ship targets -- TODO
	
	
	//full list of targets
	let targets = dock_targets;
	
	//TODO: add any idle ships to attackers
	
	
	//order attack
	if (targets.length > 0)
	{				
		ProcessCommand(p, {
			"type": "attack",
			"entities": ship_spawned,
			"target": pickRandom(targets),
			"queued": false,
			"allowCapture": false
		});
	}
	
	this.DoAfterDelay(this.cartShipAttackInterval * 1000,"CarthageShipAttack",null);
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

Trigger.prototype.CarthageAttack = function(data)
{
	//check if we have camps
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.carthageAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 0.975)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.cartAttackerTypes),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//elephant
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/cart_champion_elephant",1,p);
			attackers.push(units_i[0]);
		}
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
	
	let next_attack_interval_sec = this.carthageAttackInterval + Math.floor(Math.random() * 120);
	warn("Next attack = " + uneval(next_attack_interval_sec));
	this.carthageAttackLevel += this.carthageAttackIncrement;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"CarthageAttack",null);
}


Trigger.prototype.CheckForCC = function(data)
{
	//check if player 1 has built structure
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length > 1) //start after at least 2 structures
	{
		//start attacks
		warn("Has structure!");
		this.DoAfterDelay(180 * 1000,"CarthageAttack",null);
		
		//start ship attacks
		this.DoAfterDelay(300 * 1000,"CarthageShipAttack",null);

		//start naval invasion attacks
		this.DoAfterDelay(420 * 1000,"SpawnNavalInvasionAttack",null);


	}
	else 
	{
		this.DoAfterDelay(30 * 1000,"CheckForCC",null);
	}
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/*let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);*/
	/*cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/
	
	
	//carthage attacker types
	cmpTrigger.cartAttackerTypes = ["units/cart_champion_infantry","units/cart_champion_pikeman","units/cart_infantry_archer_a","units/cart_champion_cavalry","units/cart_infantry_slinger_iber_a"];
	
	//carthage attack level
	cmpTrigger.carthageAttackLevel = 15;
	cmpTrigger.carthageAttackIncrement = 2;
	cmpTrigger.carthageAttackInterval = 240;
	
	//ship attack variables
	cmpTrigger.cartShipGarrisonSize = 5;
	cmpTrigger.cartShipAttackInterval = 300;
	
	//invasion attack
	cmpTrigger.carthageInvasionAttackInterval = 360;
	cmpTrigger.carthageInvasionShipGarrisonSize = 30;
	
	cmpTrigger.invasion_under_way = false;

	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//garrison player ships
	cmpTrigger.DoAfterDelay(2 * 1000,"GarrisonPlayerShips",null);
	
	//check for cc periodically to start attacks
	cmpTrigger.DoAfterDelay(30 * 1000,"CheckForCC",null);
	
	//spawn patrols of forts
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressPatrol",null);
	
	//invasion sea attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);




	for (let p of [1,2,3,4,5,6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		
		//disable troop production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p == 5 || p == 6)
			cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 5) //boost nubian forts
		{
			cmpPlayer.AddStartingTechnology("tower_armour");
			cmpPlayer.AddStartingTechnology("tower_range");
			cmpPlayer.AddStartingTechnology("tower_watch");
			cmpPlayer.AddStartingTechnology("tower_murderholes");
			cmpPlayer.AddStartingTechnology("tower_crenellations");
		}
		
		if (p == 1)
			cmpPlayer.SetPopulationBonuses(100);
	}
	
	//interval and triggers for naval invasion
	cmpTrigger.RegisterTrigger("OnInterval", "checkInvasionAttack", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipInvasion), // central points to calculate the range circles
		"players": [6], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	//17 minutes in, it starts
	//cmpTrigger.DoAfterDelay(1080 * 1000,"StartNextAttack",null);
	
	//triggers
	// Activate all possible triggers
	let data = { "enabled": true };
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
