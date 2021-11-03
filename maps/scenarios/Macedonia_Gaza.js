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
	"structures/" + civ + "_house",
	
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
	
	// barracks
	"structures/" + civ + "_barracks",
	"structures/" + civ + "_workshop",
	"structures/pers_elephant_stables",
	
	//villagers
	"units/" + civ + "_support_female_citizen"
];


var textSiegeChoice1 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the first ship!";
var textSiegeChoice2 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the second ship!";
var textSiegeChoice3 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the third ship!";

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

Trigger.prototype.Dialog1 = function(data)
{
	this.ShowText(textSiegeChoice1,"4 Ballistas","2 Siege Towers");
}


Trigger.prototype.Dialog2 = function(data)
{
	this.ShowText(textSiegeChoice2,"3 Rams","3 Catapults");
}


Trigger.prototype.Dialog3 = function(data)
{
	this.ShowText(textSiegeChoice3,"2 Catapults","4 Ballistas");
}


Trigger.prototype.SpawnSiegeEquipment = function(data)
{
	//spawn next to allied dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length == 0)
		return;
		
	let site = docks[0];
	
	let units = [];
	
	if (this.dialogAnswers[0] == 1)
	{
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
	}
	else {
		units.push("units/mace/siege_tower");
		units.push("units/mace/siege_tower");
	}
	
	if (this.dialogAnswers[1] == 1)
	{
		units.push("units/mace/siege_ram");
		units.push("units/mace/siege_ram");
		units.push("units/mace/siege_ram");
	}
	else {
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
	}
	
	if (this.dialogAnswers[2] == 1)
	{
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
	}
	else {
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
		units.push("units/athen_mechanical_siege_oxybeles_packed");
	}
	
	for (let u of units)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,u,1,1);
	}
	
	this.ShowText("Our siege equipment has arrived!","Great!","Awesome!");
	
	this.siegeDeliverd = true;
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
	warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));
	
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
	
	
	if (data.cmd.type == "dialog-answer" && this.currentDialog < 3)
	{
		warn("The OnPlayerCommand event happened with the following data:");
		warn(uneval(data));
		
		if (data.cmd.answer == "button1")
			this.dialogAnswers[this.currentDialog] = 1;
		else 
			this.dialogAnswers[this.currentDialog] = 2;
			
		this.currentDialog ++;	
		warn(uneval(this.dialogAnswers));
	}
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

//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [1,2,4,5])
	{
		
		//defense towers
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//sentry tower
		let towers_s = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_s)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",3,p);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		if (p == 2)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}
		
		if (p == 1 || p == 5)
		{
			let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
				
			for (let c of camps_p)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",1,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(c,true);
				}
			}
		}
	}
}	


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (let p of [4,5])
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




Trigger.prototype.PatrolOrder = function(units,p,site_a, site_b)
{
	
	if (units.length <= 0)
		return;
	
	
	//list of patrol targets
	let patrolTargets = [site_a,site_b];

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
Trigger.prototype.SpawnIntervalPatrol = function(data)
{
	//which player
	let p = 2; 
	
	//see if we can add more patrols
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	
	if (units.length < this.maxPatrolSize)
	{
		
		//targets A
		let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		
		let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Fortress").filter(TriggerHelper.IsInWorld);
		
		let market = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld);
		
		let village = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Village").filter(TriggerHelper.IsInWorld);
		
		let gates = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld);
		
		
		let targets_A = ccs.concat(forts).concat(market).concat(village).concat(gates);
		
		//targets B
		let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		
		if (targets_A.length == 0 || targets_B.length == 0)
			return;
		
		//calculate size of spawn units
		let num_patrols = 1;
		let patrol_size = 1;
		
		let inf_templates = ["units/pers_champion_infantry","units/pers_champion_infantry","units/pers_champion_infantry","units/pers_champion_infantry","units/pers_infantry_archer_e","units/pers_infantry_javelinist_e"];
		
		//spawn infantry
		for (let j = 0; j < num_patrols; j++)
		{
			let units = [];
			let site_j = pickRandom(targets_B);
			
			//melee
			for (let i = 0; i < patrol_size; i++)
			{
				let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
				units.push(unit_i[0]);
			}
			
			//set formation
			TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

			
			//send to patrol
			this.PatrolOrder(units,p,pickRandom(targets_A),site_j);
			
			warn("spawning additional patrol");
		}
	}
	
	this.DoAfterDelay(15 * 1000,"SpawnIntervalPatrol",null);

}

//garison AI entities with archers
Trigger.prototype.SpawnFanaticSquad = function(data)
{
	//which player
	let p = 4; 
	
	//structures
	let spwan_sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (spwan_sites.length == 0)
		return;
		
	let inf_templates = ["units/pers_champion_infantry","units/pers_infantry_spearman_a","units/pers_infantry_spearman_b","units/pers_infantry_spearman_e","units/pers_infantry_archer_a","units/pers_infantry_javelinist_a"];
	
	let units = [];
	let site_j = pickRandom(spwan_sites);
	
	let squad_size = Math.floor(Math.random()*(this.fanaticSquadSizeMax-this.fanaticSquadSizeMin))+this.fanaticSquadSizeMin;
	warn("Squad size = "+uneval(squad_size));
	//let squad_size = 5;
		
	//melee
	for (let i = 0; i < squad_size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
		units.push(unit_i[0]);
	}
		
	//set formation
	TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));
	
	//find target
	let target_player = 1;
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Soldier").filter(TriggerHelper.IsInWorld);
	
	let target = pickRandom(targets);
	
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
	
	//possibly increase min and max
	if (Math.random() < 0.04 && this.fanaticSquadSizeMin < this.fanaticSquadSizeMax - 2)
		this.fanaticSquadSizeMin ++;
	
	if (Math.random() < 0.075)
		this.fanaticSquadSizeMax ++;
		
	warn("new min and max: "+this.fanaticSquadSizeMin+" "+this.fanaticSquadSizeMax);
	
	this.DoAfterDelay(this.fanaticAttackInterval * 1000,"SpawnFanaticSquad",null);
}

//garison AI entities with archers
Trigger.prototype.SpawnInitialPatrol = function(data)
{
	//which player
	let p = 2; 
	
	
	//targets A
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Fortress").filter(TriggerHelper.IsInWorld);
	
	let market = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld);
	
	let village = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Village").filter(TriggerHelper.IsInWorld);
	
	let gates = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld);
	
	
	let targets_A = ccs.concat(forts).concat(market).concat(village).concat(gates);
	
	//targets B
	let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		
	if (targets_A.length == 0 || targets_B.length == 0)
		return;
		
	//calculate size of spawn units
	let num_patrols = 115;
	let patrol_size = 1;
	
	let inf_templates = ["units/pers_champion_infantry","units/pers_infantry_spearman_a","units/pers_infantry_spearman_b","units/pers_infantry_spearman_e","units/pers_infantry_archer_a","units/pers_infantry_javelinist_a"];
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(targets_B);
		
		//melee
		for (let i = 0; i < patrol_size; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		
		//send to patrol
		this.PatrolOrder(units,p,pickRandom(targets_A),site_j);
		
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


Trigger.prototype.ToggleTowerOwnershipA = function(data)
{
	//defense towers
	let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "DefenseTower").filter(TriggerHelper.IsInWorld);
	
	//switch ownership
	for (let t of towers_p)
	{
		//change ownership back
		var cmpOwnership = Engine.QueryInterface(t, IID_Ownership);
		cmpOwnership.SetOwner(1);
		
	}
}

Trigger.prototype.ToggleTowerOwnershipB = function(data)
{
	//defense towers
	let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "DefenseTower").filter(TriggerHelper.IsInWorld);
	
	//switch ownership
	for (let t of towers_p)
	{
		//change ownership back
		var cmpOwnership = Engine.QueryInterface(t, IID_Ownership);
		cmpOwnership.SetOwner(2);
		
	}
}

Trigger.prototype.SpawnCavalryAttack = function(data)
{
	//check if allied dock exists
	//find target -- allied dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);
	if (docks.length == 0)
		return;
	
	let target = docks[0];
	
	//if siege is delivered, then alexander becomes the target
	if (this.siegeDeliverd == true)
	{
		let heros = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Hero").filter(TriggerHelper.IsInWorld);
		target = heros[0];
	}
	
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
	let cav_templates = ["units/pers_cavalry_archer_a","units/pers_cavalry_javelinist_a", "units/pers_cavalry_spearman_a", "units/pers_cavalry_swordsman_a","units/pers_champion_cavalry", "units/pers_champion_cavalry_archer"];
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
	
	this.DoAfterDelay(this.cavalryAttackInerval * 1000,"SpawnCavalryAttack",null);

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
		this.DoAfterDelay(120 * 1000,"CarthageAttack",null);
		
		//start ship attacks
		this.DoAfterDelay(240 * 1000,"CarthageShipAttack",null);

		//start naval invasion attacks
		this.DoAfterDelay(360 * 1000,"SpawnNavalInvasionAttack",null);


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
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);*/
	
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	//carthage attacker types
	cmpTrigger.cartAttackerTypes = ["units/cart_champion_infantry","units/cart_champion_pikeman","units/cart_infantry_archer_a","units/cart_champion_cavalry","units/cart_infantry_slinger_iber_a"];
	
	//some variables
	cmpTrigger.maxPatrolSize = 150;
	cmpTrigger.fanaticAttackInterval = 65;
	cmpTrigger.fanaticSquadSizeMin = 2;
	cmpTrigger.fanaticSquadSizeMax = 5;
	cmpTrigger.cavalryAttackInerval = 420;
	
	//answers to dialogue questions
	cmpTrigger.dialogAnswers = [0,0,0];
	cmpTrigger.currentDialog = 0;
	cmpTrigger.siegeDeliverd = false;
	cmpTrigger.siegeDeliveryTime = 15 * 60;
	
	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	cmpTrigger.DoAfterDelay(1 * 1000,"ToggleTowerOwnershipA",null);
	cmpTrigger.DoAfterDelay(1 * 1050,"ToggleTowerOwnershipB",null);
	
	
	//spawn patrols of forts
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnInitialPatrol",null);
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnIntervalPatrol",null);
	
	//small persistant attacks
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFanaticSquad",null);
	
	//dialog for siege equipment
	cmpTrigger.DoAfterDelay(2 * 1000,"Dialog1",null);
	cmpTrigger.DoAfterDelay(4 * 1000,"Dialog2",null);
	cmpTrigger.DoAfterDelay(6 * 1000,"Dialog3",null);
	cmpTrigger.DoAfterDelay(cmpTrigger.siegeDeliveryTime * 1000,"SpawnSiegeEquipment",null);
	
	//cavalry attack targetting dock/blacksmith
	cmpTrigger.DoAfterDelay(cmpTrigger.cavalryAttackInerval * 1000,"SpawnCavalryAttack",null);

	
	
	//invasion sea attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);

	for (let p of [1,2,3,4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		
		//disable troop production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p != 1)
		{
			let unit_templates = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			disTemplates = disTemplates.concat(unit_templates);	
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 2) //boost forts
		{
			cmpPlayer.AddStartingTechnology("tower_armour");
			cmpPlayer.AddStartingTechnology("tower_range");
			cmpPlayer.AddStartingTechnology("tower_watch");
			cmpPlayer.AddStartingTechnology("tower_murderholes");
			cmpPlayer.AddStartingTechnology("tower_crenellations");
		}
		
		if (p == 1)
		{
			cmpPlayer.SetPopulationBonuses(400);
			
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			cmpPlayer.AddStartingTechnology("siege_armor");
			cmpPlayer.AddStartingTechnology("siege_attack");
			cmpPlayer.AddStartingTechnology("siege_bolt_accuracy");
			cmpPlayer.AddStartingTechnology("siege_packing");
			cmpPlayer.AddStartingTechnology("unlock_champion_units");
			cmpPlayer.AddStartingTechnology("unlock_spies");
			cmpPlayer.AddStartingTechnology("speed_cavalry_01");
			cmpPlayer.AddStartingTechnology("speed_cavalry_02");
			
			//add some siege techs
			
		}
	}
	
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
	
};
