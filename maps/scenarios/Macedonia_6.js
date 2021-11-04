warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

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

Trigger.prototype.SpawnAndStartCavalryAttack = function()
{
	//check to see if pl 5 is alive
	let units_pl5 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(5), "Human").filter(TriggerHelper.IsInWorld);
	if (units_pl5.length < 1)
	{
		warn("PL5 appears dead");
		return;
	}
	
	//check to see if possible units to spawn need to change -- gets harder periodically
	if (this.gaul_cav_attack_counter == 2)
	{
		this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_b","units/gaul_cavalry_javelinist_b","units/brit_war_dog_b"];
	}
	else if (this.gaul_cav_attack_counter == 3)
	{
		this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_b","units/brit_war_dog_e"];
	}
	else if (this.gaul_cav_attack_counter == 4)
	{
		this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_e","units/brit_war_dog_e"];
	}
	else if (this.gaul_cav_attack_counter == 4)
	{
		this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_e","units/brit_war_dog_e","units/gaul/champion_cavalry"];
	}
	else if (this.gaul_cav_attack_counter == 5)
	{
		this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_e","units/brit_war_dog_e","units/gaul/champion_cavalry","units/brit/champion_chariot"];
	}
	
	//get list of barracks barracks
	let sites = [];
	for (let e = 0; e < this.enemies.length; ++e)
	{
		let structs_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Barracks").filter(TriggerHelper.IsInWorld);
		
		warn("Fouond " + structs_e.length + " barracks of player " + this.enemies[e]);
		sites = sites.concat(structs_e);
	}
	
	if (sites.length == 0)
		return;
		
	let spawn_site = pickRandom(sites);
	
	//decide how many troops to send
	let units_pl1 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Human").filter(TriggerHelper.IsInWorld);
	warn("Found " + units_pl1.length + " human units");
	
	let attack_size = Math.floor(units_pl1.length/6.0)+2+this.spawn_attack_bonus;
	if (attack_size > 35)
	{
		attack_size = 35;
		this.gaul_cavalry_interval = this.gaul_cavalry_interval * 0.99;
		if (this.gaul_cavalry_interval < 100 * 1000){
			this.gaul_cavalry_interval = 100 * 1000;
		}
	}
	
	let attackers = [];
	for (let i = 0; i < attack_size; ++i){
		let attacker_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.gaul_cavalry_types),1,5);
		attackers = attackers.concat(attacker_i);
	}
	
	warn("Attackers:");
	warn(uneval(attackers));
	
	//set formation
	TriggerHelper.SetUnitFormation(5, attackers, pickRandom(unitFormations));

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

	ProcessCommand(5, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});
	
	//find target
	/*let cmpPosAI = Engine.QueryInterface(attackers[0], IID_Position);
	let pos = cmpPosAI.GetPosition2D();
	let best_distance = 1000000;
	let d = -1;
	let best_target = -1;
	
	for (let unit_i of units_pl1)
	{
		let pos_i = Engine.QueryInterface(unit_i, IID_Position).GetPosition2D();
							
		d =  Math.sqrt( (pos_i.x-pos.x)*(pos_i.x-pos.x) + (pos_i.y-pos.y)*(pos_i.y-pos.y) );
						
		if (d < best_distance)
		{
			best_distance = d
			best_target = unit_i;
		}
	} */
	
	//warn("Found target: "+best_target);
	
	/*let target_position = Engine.QueryInterface(best_target, IID_Position).GetPosition2D();
	
	for (let i = 0; i < attackers.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(attackers[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			//warn(uneval(cmpUnitAI));
			cmpUnitAI.SwitchToStance("violent");
			cmpUnitAI.WalkAndFight(target_position.x,target_position.y,null);
		}
	}*/
	
	//schedule next attack
	this.DoAfterDelay(this.gaul_cavalry_interval, "SpawnAndStartCavalryAttack",null);
	this.gaul_cav_attack_counter = this.gaul_cav_attack_counter + 1;
}


Trigger.prototype.IntervalActionTraders = function(data)
{

	for (let e = 0; e < this.enemies.length; ++e)
	{
		//make list of traders
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader").filter(TriggerHelper.IsInWorld);
		traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Human");
		
		//warn("Traders from player " + this.enemies[e]);
		//warn(uneval(traders_e));
		
		//make list of own markets
		let markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
		//warn("Markets from player " + this.enemies[e]);
		//warn(uneval(markets_e));
		
		//make list of possible other markets
		let markets_others = [];
		for (let p = 0; p < this.enemies.length; ++p)
		{
			if (this.enemies[e] != this.enemies[p])
			{
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Market").filter(TriggerHelper.IsInWorld);
		
				markets_others = markets_others.concat(markets_p);
			}
		}
		
		//randomly assign each trader to a market of another player
		for (let trader of traders_e)
		{
			let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			if (cmpUnitAI) {
				if (cmpUnitAI.IsIdle())
				{
					//warn("updating trade orders");
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),markets_e[0],null,true);
				}
			}
			
		}
		
	}
}

Trigger.prototype.IntervalAction = function(data)
{
	
};


Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of this.enemies)
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (player == 5)
		{
			if (ai_mult == 1.25)
			{
				this.spawn_attack_bonus = 6;
				
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
			}
			else if (ai_mult >= 1.5)
			{
				this.spawn_attack_bonus = 10;
				
				//add some tech
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
				cmpTechnologyManager.ResearchTechnology("armor_cav_02");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");


			}
		}
		else if (player == 7)
		{
			if (ai_mult == 1.25)
			{
				this.greek_spawn_attack_bonus = 6;
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			}
			else if (ai_mult >= 1.5)
			{
				this.greek_spawn_attack_bonus = 10;
				
				//add some tech
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			}
		}
	}
}


Trigger.prototype.GreekAttackAction = function(data)
{
	let greek_sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(7), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (greek_sites.length <= 0)
		return;
		
	let spawn_site = pickRandom(greek_sites);
	
	//decide how many troops to send
	let units_pl1 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Human").filter(TriggerHelper.IsInWorld);
	warn("Found " + units_pl1.length + " human units");
	
	let attack_size = Math.floor(units_pl1.length/7.0)+2+this.greek_spawn_attack_bonus;
	warn("attack size = "+attack_size);
	
	let attackers = [];
	for (let i = 0; i < attack_size; ++i){
		if (Math.random() < this.siege_prob)
		{
			let attacker_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greekSiegeTypes),1,7);
			attackers = attackers.concat(attacker_i);
		}
		else 
		{
			let attacker_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greekInfTypes),1,7);
			attackers = attackers.concat(attacker_i);
		}
	}
	
	//warn("Attackers:");
	//warn(uneval(attackers));
	
	//set formation
	TriggerHelper.SetUnitFormation(7, attackers, pickRandom(unitFormations));

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

	ProcessCommand(7, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});
	
	this.DoAfterDelay(this.greek_merc_interval,"GreekAttackAction",null);
}


Trigger.prototype.GarrisonAction = function(data)
{
	for (let camp_id of this.greek_camps)
	{	
		//spawn the garrison inside the tower
		let archers_e = TriggerHelper.SpawnUnits(camp_id, "units/athen/champion_ranged",10,7);
				
		for (let a of archers_e)
		{
			let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
			cmpUnitAI.Garrison(camp_id,true);
		}
	}
};

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

	//get list of possible gaul ships
	/*cmpTrigger.gaul_ships = TriggerHelper.GetTemplateNamesByClasses("Warship", "gaul", undefined, undefined, true);
	warn(uneval(cmpTrigger.gaul_ships));*/
	
	//list of enemy players
	cmpTrigger.enemies = [2,4,5,6,7];
	
	
	/*let structs_pl4 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Structure").filter(TriggerHelper.IsInWorld);
	let structs_pl2 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Structure").filter(TriggerHelper.IsInWorld);
	let structs_pl5 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(5), "Structure").filter(TriggerHelper.IsInWorld);
	let structs_pl6 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "Structure").filter(TriggerHelper.IsInWorld);
	*/
	//warn(uneval(docks_pl4));

	
	//cavalry attack variables
	cmpTrigger.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_a","units/gaul_cavalry_javelinist_a","units/brit_war_dog_a"];
	cmpTrigger.gaul_cavalry_types_all = ["units/gaul_cavalry_swordsman_a","units/gaul_cavalry_javelinist_a","units/gaul_cavalry_swordsman_b","units/gaul_cavalry_javelinist_b","units/brit/champion_chariot","units/brit_war_dog_e"];
	cmpTrigger.gaul_cavalry_interval = 200 * 1000;
	cmpTrigger.gaul_cav_attack_counter = 0;
	cmpTrigger.spawn_attack_bonus = 2;
	
	//greek mercenaries variables
	cmpTrigger.greekInfTypes = ["units/athen/cavalry_javelineer_a","units/athen/cavalry_swordsman_a","units/athen/champion_ranged","units/athen/champion_marine","units/athen/champion_infantry","units/athen_champion_ranged_gastraphetes","units/thebes_sacred_band_hoplitai"];
	cmpTrigger.greekSiegeTypes = ["units/athen/siege_oxybeles_packed","units/mace/siege_lithobolos_packed"];
	
	cmpTrigger.greek_camps = [3802,4578];
	cmpTrigger.siege_prob = 0.1;
	cmpTrigger.greek_merc_attack_counter = 0;
	cmpTrigger.greek_spawn_attack_bonus = 2;
	cmpTrigger.greek_merc_interval = 120 * 1000;
	
	cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	
	//garrison for greek mercs
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonAction",null);
	
	//schedule greek
	//cmpTrigger.DoAfterDelay(6 * 1000,"GreekAttackAction",null);
	cmpTrigger.DoAfterDelay(120 * 1000 + cmpTrigger.greek_merc_interval,"GreekAttackAction",null);
	
	
	
	//schedule next attack
	cmpTrigger.DoAfterDelay(60 * 1000 + cmpTrigger.gaul_cavalry_interval, "SpawnAndStartCavalryAttack",null);
	//cmpTrigger.DoAfterDelay(5 * 1000, "SpawnAndStartCavalryAttack",null);
	
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.AddStartingTechnology("unlock_shared_los");
	
	
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
		"delay": 6 * 1000,
		"interval": 20 * 1000,
	});
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 200 * 1000,
	});*/
	
	
	/*let ents_5 = TriggerHelper.GetEntitiesByPlayer(5);
	for (let e of ents_5)
	{
		let cmpBuildingAI = Engine.QueryInterface(e, IID_Identity);
		if (cmpBuildingAI)
		{
			warn(uneval(cmpBuildingAI));
		}
		
	}*/
	
	//make traders trade
	//start ship traders
	/*var traders_pl4 = [8114,8115,8116];
	for (let i = 0; i < traders_pl4.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(traders_pl4[i], IID_UnitAI);
		if (cmpUnitAI) {
			warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(8037,7930,null,true);
		}
	}*/
	
};

