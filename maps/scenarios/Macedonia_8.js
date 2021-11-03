warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

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


/*
 * TODO: add some spawn attacks the first time a gate or wall is destroyed
 * 
 */
Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));
	if ((data.from == 4 || data.from == 2) && (data.to == -1 || data.to == 1)){
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			/*warn(uneval(id));
			warn(typeof id.visibleClassesList);
			warn(uneval(id.visibleClassesList));*/
			
			if (id.visibleClassesList.indexOf("Trader") >= 0){
				//give reward to human player for killing trader
				let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "CivilCentre").filter(TriggerHelper.IsInWorld);
				
				TriggerHelper.SpawnUnits(pickRandom(ccs),"units/mace/support_trader",1,1);
			}
			else if (this.crannog_ids.indexOf(data.entity) >= 0 || data.entity == 7176 || data.entity == 7177) //if pl2 or pl4 lose a civic center
			{
				//stage attack from player 3 in response to a civil centre lost by player 4
				warn("crannog destroyed or captured");
				this.SpawnAndStartCavalryAttack();
			}
		}
	}
	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.SpawnAndStartCavalryAttack = function()
{
	//check to see if target player is alive
	let units_pl3 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Human").filter(TriggerHelper.IsInWorld);
	if (units_pl3.length < 1)
	{
		warn("PL3 appears dead");
		return;
	}
	
	
	this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_e","units/brit_war_dog_e","units/gaul/champion_cavalry","units/brit/champion_chariot"];
	
	
	//get list of barracks
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
	
	let attack_size = Math.floor(units_pl1.length/8.0)+2+this.spawn_cav_bonus;
	if (attack_size > 40)
	{
		attack_size = 40;
	}
	
	let attackers = [];
	for (let i = 0; i < attack_size; ++i){
		let attacker_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.gaul_cavalry_types),1,5);
		attackers = attackers.concat(attacker_i);
	}
	
	warn("Attackers:");
	warn(uneval(attackers));
	
	//find target
	let cmpPosAI = Engine.QueryInterface(attackers[0], IID_Position);
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
	} 
	
	//warn("Found target: "+best_target);
	
	let target_position = Engine.QueryInterface(best_target, IID_Position).GetPosition2D();
	
	for (let i = 0; i < attackers.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(attackers[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			//warn(uneval(cmpUnitAI));
			cmpUnitAI.SwitchToStance("violent");
			cmpUnitAI.WalkAndFight(target_position.x,target_position.y,null);
		}
	}
}



Trigger.prototype.IntervalActionSpawnTraders = function(data)
{
	for (let e = 0; e < this.enemies.length; ++e)
	{
		//make list of traders
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader").filter(TriggerHelper.IsInWorld);
		traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Human");
		
		if (traders_e.length < this.ai_traders_spawn_limit)
		{
			//make list of own markets
			let markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
			
			if (markets_e.length > 0){
			
				warn(uneval(markets_e));
				let site = pickRandom(markets_e);
				
				warn("Spawning trader for player "+this.enemies[e]+" at site = " + site);
				let trader_i = TriggerHelper.SpawnUnits(site,"units/brit/support_trader",1,this.enemies[e]);
				//warn("Spawning trader for player "+this.enemies[e]);
			}
		}
	}
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
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),pickRandom(markets_e),null,true);
				}
			}
			
		}
		
	}
}

Trigger.prototype.IntervalAction = function(data)
{
	
};

Trigger.prototype.IntervalCrannogSpawnAction = function(data)
{
	//spawn random infantry next to each crannog
	let crannogs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	for (let i = 0; i < crannogs.length; ++i)
	{
		TriggerHelper.SpawnUnits(crannogs[i],pickRandom(this.infantryTypesSpawn),1+this.spawn_crannog_bonus,4);
		warn("spawning crannog unit");
	}
};


Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	let difficulty = 0;
	
	for (let player of this.enemies)
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (ai_mult == 1.25 && difficulty < 1)
		{
			difficulty = 1;
		}
		else if (ai_mult >= 1.5 && difficulty < 2)
		{
			difficulty = 2;
			break;
		}
	}
	
	if (difficulty == 1)
	{
		this.spawn_cav_bonus = 4;
		this.spawn_crannog_bonus = 1;
		this.infantryTypesSpawn = ["units/brit_infantry_javelinist_a","units/brit/infantry_slinger_a","units/brit/infantry_spearman_a"];
	
	}
	else if (difficulty == 2)
	{
		this.spawn_cav_bonus = 8;
		this.spawn_crannog_bonus = 2;
		this.infantryTypesSpawn = ["units/brit_infantry_javelinist_e","units/brit_infantry_slinger_e","units/brit_infantry_spearman_e"];
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

	//get list of possible gaul ships
	/*cmpTrigger.gaul_ships = TriggerHelper.GetTemplateNamesByClasses("Warship", "gaul", undefined, undefined, true);
	warn(uneval(cmpTrigger.gaul_ships));*/
	
	//list of enemy players
	cmpTrigger.enemies = [2,3,4];
	
	//list of crannogs of player 4
	//we randomly spawn units near them just to help the AI of player 4
	cmpTrigger.crannog_ids = [7366,7371,7382];
	cmpTrigger.infantryTypesSpawn = ["units/brit_infantry_javelinist_b","units/brit/infantry_slinger_b","units/brit_infantry_spearman_b"];
	
	cmpTrigger.spawn_cav_bonus = 0;
	cmpTrigger.spawn_crannog_bonus = 0;
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalCrannogSpawnAction", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 90 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 20 * 1000,
	});
	
	//every so often, check for idle traders
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 60 * 1000,
	});
	
	//spawn traders for AIs if less than limit
	cmpTrigger.ai_traders_spawn_limit = 8;
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionSpawnTraders", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 90 * 1000,
	});
	

	/*let ents_5 = TriggerHelper.GetEntitiesByPlayer(4);
	for (let e of ents_5)
	{
		let cmpBuildingAI = Engine.QueryInterface(e, IID_Identity);
		if (cmpBuildingAI)
		{
			warn(uneval(cmpBuildingAI));
		}
		
	}*/
	
	
	
};

