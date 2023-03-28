warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

//constants
var unitTargetClass = "Unit+!Ship";

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


Trigger.prototype.StructureDecayCheck = function(data)
{
	this.structureDecayCounter += 1;

	for (let p of [1])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				
				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);
				}
			}
		}
	}

	this.DoAfterDelay(15 * 1000, "StructureDecayCheck", null);
}


/*
 */
Trigger.prototype.OwnershipChangedAction = function(data)
{
	
	//if we captured gaia object
	if (data.from == 0 && data.to == 1)
	{
		
		//warn(uneval(data));
		
		//big temple
		if (data.entity == 2233)
		{ //big temple
			//spawn some healers
			TriggerHelper.SpawnUnits(2014,"units/mace/support_healer_e",6,1);
		
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			//cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			//cmpTechnologyManager.ResearchTechnology("phase_city");
			cmpTechnologyManager.ResearchTechnology("archer_attack_spread");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_rate");

			//warn("Temple captured events happened");
			
		
		}
		else if (data.entity == 2507) //little temple
		{
			//spawn some healers
			TriggerHelper.SpawnUnits(2014,"units/mace/support_healer_e",2,1);
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("health_regen_units");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");


		}
		else if (data.entity == 2553) // siege shop
		{
			//spawn some rams
			TriggerHelper.SpawnUnits(2553,"units/mace/siege_ram",3,1);
			TriggerHelper.SpawnUnits(2553,"units/mace/siege_lithobolos_packed",3,1);
			
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology("siege_attack");
			cmpTechnologyManager.ResearchTechnology("siege_health");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
		}
		
		
	}
	else if (data.from == 3 || data.from == 2) //possibly destroyed a structure
	{
		if (this.fields.indexOf(data.entity) >= 0)
		{
			//warn("Field destroyed");
			//add some points 
			this.current_points += 3;
		}
		else if (this.farmsteads.indexOf(data.entity) >= 0)
		{
			//warn("farmstead destroyed");
			//add some points 
			this.current_points += 5;
		}
		else if (this.storehouses.indexOf(data.entity) >= 0)
		{
			//warn("storehouse destroyed");
			//add some points 
			this.current_points += 5;
		}
		else if (this.docks.indexOf(data.entity) >= 0)
		{
			//warn("dock destroyed");
			//add some points 
			this.current_points += 10;
		}
		else if (this.gates.indexOf(data.entity) >= 0)
		{
			//gate was destroyed, send cavalry attack
			//warn("gate destroyed");
			if (this.gate_attack_done == false)
			{
				//get position of gate
				let pos_gate = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
			
				//get list of ccs
				let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
				
				//spawn cavalry
				let units = [];
				for (let i = 0; i < 30; ++i)
				{
					let unit_i = TriggerHelper.SpawnUnits(pickRandom(ccs),pickRandom(this.cavTypes),1,2);
					units.push(unit_i[0]);
				}
				
				//make them attack
				this.AttackOrder(units);
				this.gate_attack_done = true;
			}
			
		}
		else if (this.ccs.indexOf(data.entity) >= 0)
		{ //civil centered destroyed
			if (this.cc_attack_done == false)
			{
				
				//get list of ccs
				let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
				
				//spawn cavalry
				let units = [];
				for (let i = 0; i < 45; ++i)
				{
					let unit_i = TriggerHelper.SpawnUnits(pickRandom(ccs),pickRandom(this.cavTypes),1,2);
					units.push(unit_i[0]);
				}
				
				//make them attack
				this.AttackOrder(units);
				
				this.cc_attack_done = true;
			}
			
			this.numCCsDestroyed += 1;
			
			if (this.numCCsDestroyed  >= 2)
			{
				//win game
				TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
			}
		}
		else if (this.forts.indexOf(data.entity) >= 0)
		{ //forts destroyed
			if (this.fort_attack_done == false)
			{
				
				//spawn cavalry
				let units = [];
				for (let i = 0; i < 45; ++i)
				{
					let unit_i = TriggerHelper.SpawnUnits(2792,pickRandom(this.cavTypes),1,2);
					units.push(unit_i[0]);
				}
				
				//make them attack
				this.AttackOrder(units);
				
				this.fort_attack_done = true;
			}
		}
		else if (data.from == 2 || data.from == 3)
		{
			//defending forces lost a troop
			this.current_points += 0.25;
			//warn(uneval(data));
			//warn(this.current_points);
		}
		
	}
	
	
	//warn("The OnOwnershipChanged event happened with the following data:");
	/*warn(uneval(data));
	if ((data.from == 4 || data.from == 2) && (data.to == -1 || data.to == 1)){
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			warn(uneval(id));
			warn(typeof id.visibleClassesList);
			warn(uneval(id.visibleClassesList));
			
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
	}*/
	
};

Trigger.prototype.VictoryTextFnEnemy = function(n)
{
	return markForPluralTranslation(
          "You have lost too many troops! %(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

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
		//warn("PL3 appears dead");
		return;
	}
	
	
	this.gaul_cavalry_types = ["units/gaul/cavalry_swordsman_e", "units/gaul/cavalry_javelineer_e", "units/brit/war_dog_e", "units/gaul/champion_cavalry", "units/brit/champion_chariot"];
	
	
	//get list of barracks
	let sites = [];
	for (let e = 0; e < this.enemies.length; ++e)
	{
		let structs_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Barracks").filter(TriggerHelper.IsInWorld);
		
		//warn("Fouond " + structs_e.length + " barracks of player " + this.enemies[e]);
		sites = sites.concat(structs_e);
	}
	
	if (sites.length == 0)
		return;
		
	let spawn_site = pickRandom(sites);
	
	//decide how many troops to send
	let units_pl1 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Human").filter(TriggerHelper.IsInWorld);
	//warn("Found " + units_pl1.length + " human units");
	
	let attack_size = Math.floor(units_pl1.length/8.0)+2;
	if (attack_size > 30)
	{
		attack_size = 30;
	}
	
	let attackers = [];
	for (let i = 0; i < attack_size; ++i)
	{
		let attacker_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.gaul_cavalry_types),1,5);
		attackers = attackers.concat(attacker_i);
	}
	
	//warn("Attackers:");
	//warn(uneval(attackers));
	
	//find target
	let cmpPosAI = Engine.QueryInterface(attackers[0], IID_Position);
	let pos = cmpPosAI.GetPosition2D();
	let best_distance = 1000000;
	let d = -1;
	let best_target = -1;
	
	/*for (let unit_i of units_pl1)
	{
		let pos_i = Engine.QueryInterface(unit_i, IID_Position).GetPosition2D();
							
		d =  Math.sqrt( (pos_i.x-pos.x)*(pos_i.x-pos.x) + (pos_i.y-pos.y)*(pos_i.y-pos.y) );
						
		if (d < best_distance)
		{
			best_distance = d
			best_target = unit_i;
		}
	} */
	best_target = pickRandom(units_pl1);
	
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
			
			if (markets_e.length > 0)
			{
			
				//warn(uneval(markets_e));
				let site = pickRandom(markets_e);
				
				//warn("Spawning trader for player "+this.enemies[e]+" at site = " + site);
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
			if (cmpUnitAI)
			{
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


Trigger.prototype.AttackOrder = function(units)
{
	if (units.length <= 0)
		return;
	
	let human_ents = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Human").filter(TriggerHelper.IsInWorld);
	
	
	//find target
	let cmpPosAI = Engine.QueryInterface(units[0], IID_Position);
	let pos = cmpPosAI.GetPosition2D();
	let best_distance = 1000000;
	let d = -1;
	let best_target = -1;
	
	for (let unit_i of human_ents)
	{
		let pos_i = Engine.QueryInterface(unit_i, IID_Position).GetPosition2D();
							
		d =  Math.sqrt( (pos_i.x-pos.x)*(pos_i.x-pos.x) + (pos_i.y-pos.y)*(pos_i.y-pos.y) );
						
		if (d < best_distance)
		{
			best_distance = d
			best_target = unit_i;
		}
	} 

	let target_position = Engine.QueryInterface(best_target, IID_Position).GetPosition2D();
	for (let i = 0; i < units.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(units[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			//warn(uneval(cmpUnitAI));
			cmpUnitAI.SwitchToStance("violent");
			cmpUnitAI.WalkAndFight(target_position.x,target_position.y,null);
		}
	}
}


//scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		

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

Trigger.prototype.PatrolOrder = function(units)
{
	if (units.length <= 0)
		return;
	
	//make them patrol
	let patrolTargets = [];
	
	//pick sites
	let tower_sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "StoneTower").filter(TriggerHelper.IsInWorld);
	let cc_sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	let patrol_sites = [pickRandom(tower_sites),pickRandom(cc_sites),pickRandom(tower_sites),pickRandom(cc_sites),pickRandom(tower_sites),pickRandom(cc_sites),pickRandom(tower_sites),pickRandom(cc_sites)];
	
	//warn("Patrol targets: " + uneval(patrolTargets));
	
	for (let patrolTarget of patrol_sites)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(2, {
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


Trigger.prototype.IntervalDefenderCavSpawnAction = function(data)
{
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	let spawn_site = pickRandom(ccs);
		
	//check current population
	let currentPop = QueryPlayerIDInterface(2).GetPopulationCount();
	if (currentPop > 299)
		return;
		
	let spawn_size = 5;
	
	this.fields = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Field").filter(TriggerHelper.IsInWorld);
	
	this.farmsteads = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Farmstead").filter(TriggerHelper.IsInWorld);
	
	this.storehouses = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Storehouse").filter(TriggerHelper.IsInWorld);
	
	spawn_size += this.fields.length * 0.25 + this.farmsteads.length * 1.5 + this.storehouses.length * 1.5;
	
	spawn_size = Math.floor(spawn_size);
	
	//spawn infantry
	let units = [];
	for (let i = 0; i < spawn_size; ++i)
	{
		let unit_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.cavTypes),1,2);
		units.push(unit_i[0]);
	}
	
	//warn("cavalry spawn size = "+spawn_size);
	
	//send cavalry to attack
	this.AttackOrder(units);
}

Trigger.prototype.IntervalDefenderCheckAction = function(data)
{
	//check to make sure our fighters haven't gotten too far out beyond the walls
	
	/*let fighters = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Human+Infantry").filter(TriggerHelper.IsInWorld);
	
	let fighters_strays = [];
	
	for (let f of fighters)
	{
		let cmpUnitAI = Engine.QueryInterface(f, IID_UnitAI);
		if (cmpUnitAI)
		{
			//warn(uneval(cmpUnitAI.order));
			if (cmpUnitAI.order)
			{
				if (cmpUnitAI.order.type != "Patrol"){
					
					//check distance from nearest CC
					
					let closestTarget;
					let minDistance = Infinity;
					
					for (let target of this.ccs)
					{
						if (!TriggerHelper.IsInWorld(target))
							continue;

						let targetDistance = DistanceBetweenEntities(f, target);
						if (targetDistance < minDistance)
						{
							closestTarget = target;
							minDistance = targetDistance;
						}
					}
					
					if (minDistance != Infinity && minDistance > 125)
					{
						
						//warn("closest cc is "+minDistance);
						fighters_strays.push(f);
					}
					
				}
			}
			else if (cmpUnitAI.IsIdle())
			{
				fighters_strays.push(f);
			}
		}
		
	}
	
	//make strays patrol
	//send to patrol
	//warn("sending "+fighters_strays.length+" units back to patrol");
	
	//break them into groups and send to patrol
	let temp_list = [];
	let group_size = 5;
	for (let f of fighters_strays)
	{
		temp_list.push(f);
		
		if (temp_list.length == group_size)
		{
			//warn("patrol group: " + uneval(temp_list));
			this.PatrolOrder(temp_list);
			temp_list = [];
		}
	}
	
	if (temp_list.length > 0)
	{
		//warn("patrol group: " + uneval(temp_list));
		this.PatrolOrder(temp_list);
	}
	
	
	//this.PatrolOrder(fighters_strays);
	
	*/
}

Trigger.prototype.IntervalDefenderSpawnAction = function(data)
{
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//check to see if we're alive
	let cmpPlayer_v = QueryPlayerIDInterface(2);
	if (cmpPlayer_v.GetState() != "active")
		return; //we are dead	
		
	//check current population
	let currentPop = QueryPlayerIDInterface(2).GetPopulationCount();
	//warn("Player 2 population: "+currentPop);
	
	//calculate size of spawn units
	let spawn_size = 3;
	
	this.fields = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Field").filter(TriggerHelper.IsInWorld);
	this.farmsteads = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Farmstead").filter(TriggerHelper.IsInWorld);
	this.storehouses = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Storehouse").filter(TriggerHelper.IsInWorld);
	
	//1 per fields, 2 per storehouse and 2 per farmstead
	spawn_size += this.fields.length * 1 + this.farmsteads.length * 1 + this.storehouses.length * 1;
	
	//warn("defender spawn size = "+spawn_size);
	
	if (currentPop > 300)
		spawn_size = 0;
	
	//pre-compute sites for patrol
	//get trigger points
	let sites = this.GetTriggerPoints("K");
	let sites_reversed = [];
	for (let i = sites.length-1; i >= 0; i --)
	{
		sites_reversed.push(sites[i]);
	}
	
	let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "StoneTower").filter(TriggerHelper.IsInWorld);
	
	
	//spawn infantry
	let units = [];
	let p = 2;
	for (let i = 0; i < spawn_size; ++i)
	{
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(ccs),pickRandom(this.infTypes),1,p);
	
		//decide whether to patrol gates or towers
		if (Math.random() < 0.5 || towers.length == 0)
		{
			if (Math.random() < 0.5)
				this.PatrolOrderList(unit_i,p,sites);
			else 
				this.PatrolOrderList(unit_i,p,sites_reversed);
		}
		else
		{
			//towers
			let patrol_sites = [pickRandom(towers),pickRandom(towers),pickRandom(towers),pickRandom(towers)];
			this.PatrolOrderList(unit_i,p,patrol_sites);
		}
	}
	
	
	//check for idle units and add them to queue
	let all_ents = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Human").filter(TriggerHelper.IsInWorld);
	let patrol_ents = [];
	let attack_ents = [];
	for (let i = 0; i < all_ents.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(all_ents[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle() && Engine.QueryInterface(all_ents[i], IID_Attack))
			{
				let cmpI = Engine.QueryInterface(all_ents[i], IID_Identity);
				//warn(uneval(cmpI));
		
				if (cmpI.visibleClassesList.indexOf("Infantry") >= 0)
				{
					patrol_ents.push(all_ents[i]);
				}
				else if (cmpI.visibleClassesList.indexOf("Cavalry") >= 0)
				{
					attack_ents.push(all_ents[i]);
				}
			}
		}
	}
	
	//warn("Attack ents = "+attack_ents);
	//warn("Patrol ents = "+patrol_ents);
	
	//send to patrol
	this.PatrolOrder(patrol_ents);
	
	//send cavalry to attack
	this.AttackOrder(attack_ents);

	
	/*let units = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.gaul_cavalry_types),1,5);*/
};

var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome/wallset_siege",
	"structures/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse"
];


Trigger.prototype.IntervalReinforcementSpawnAction = function(data)
{
	let size = this.current_points;
	
	for (let i = 0;  i < size; ++i)
	{
		TriggerHelper.SpawnUnits(2014,pickRandom(this.reinforceTypes),1,1);
	}

	this.current_points = this.current_points - Math.floor(this.current_points);
}



Trigger.prototype.TriggerDiplomacy = function(data)
{
	let towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"StoneTower").filter(TriggerHelper.IsInWorld);
	for (let t of towers)
	{
		var cmpOwnership = Engine.QueryInterface(t, IID_Ownership);
		cmpOwnership.SetOwner(3);
	}
}


Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of this.enemies)
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (player == 2)
		{
			if (ai_mult == 1.25)
			{
				this.spawn_attack_bonus = 3;
				
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
				
			}
			else if (ai_mult >= 1.5)
			{
				this.spawn_attack_bonus = 8;
				
				//add some tech
				cmpTechnologyManager.ResearchTechnology("armor_cav_01");
				cmpTechnologyManager.ResearchTechnology("armor_cav_02");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
				cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
				

			}
		}
		else if (player == 3)
		{
			if (ai_mult == 1.25)
			{
				
			}
			else if (ai_mult >= 1.5)
			{
				
			}
		}
	}
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	let data = { "enabled": true };
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	//cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	//cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	//cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	//cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	//cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	//get list of possible gaul ships
	/*cmpTrigger.gaul_ships = TriggerHelper.GetTemplateNamesByClasses("Warship", "gaul", undefined, undefined, true);
	warn(uneval(cmpTrigger.gaul_ships));*/
	
	//list of gates
	cmpTrigger.gates = [1588,1597,1610,1619,1627,1640,1652];
	
	//list of enemy players
	cmpTrigger.enemies = [2,3];
	cmpTrigger.spawn_attack_bonus = 0;
	
	//disable some techs and buildings
	
	//player 3
	let cmpPlayer = QueryPlayerIDInterface(3);

	cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(3, IID_Identity).GetCiv()));
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	
	cmpTechnologyManager.ResearchTechnology("phase_town_athen");
	cmpTechnologyManager.ResearchTechnology("phase_city_athen");
	//cmpTechnologyManager.ResearchTechnology("tower_armour");
	cmpTechnologyManager.ResearchTechnology("tower_range");
	cmpTechnologyManager.ResearchTechnology("tower_watch");
	cmpTechnologyManager.ResearchTechnology("tower_murderholes");
	cmpTechnologyManager.ResearchTechnology("tower_crenellations");
	cmpTechnologyManager.ResearchTechnology("hellenistic_metropolis");
	
	//player 2
	cmpPlayer = QueryPlayerIDInterface(2);
	cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(2, IID_Identity).GetCiv()));
	cmpTechnologyManager.ResearchTechnology("phase_town_athen");
	cmpTechnologyManager.ResearchTechnology("phase_city_athen");
	
	//player 1
	cmpPlayer = QueryPlayerIDInterface(1);
	cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(1, IID_Identity).GetCiv()));
	cmpTechnologyManager.ResearchTechnology("phase_town");
	cmpTechnologyManager.ResearchTechnology("phase_city");
	cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
	cmpPlayer.SetPopulationBonuses(300);
	
	//set temporary diplomacy
/*	let cmpPlayer_p3 = QueryPlayerIDInterface(3);
	cmpPlayer.SetAlly(3);
	cmpPlayer_p3.SetAlly(1);*/
			
	cmpTrigger.DoAfterDelay(5,"TriggerDiplomacy",null);
	
			
			
	//same state variables
	cmpTrigger.current_points = 0;
	cmpTrigger.gate_attack_done = false;
	cmpTrigger.cc_attack_done = false;
	cmpTrigger.fort_attack_done = false;
	cmpTrigger.numCCsDestroyed = 0;
	
	//store list of defender types
	cmpTrigger.infTypes = ["units/theb_sacred_band","units/athen/champion_marine","units/athen/champion_ranged","units/athen/champion_ranged","units/merc_black_cloak","units/athen/infantry_slinger_e","units/athen/infantry_javelineer_e"];
	cmpTrigger.cavTypes = ["units/athen/cavalry_javelineer_e","units/athen/cavalry_swordsman_e","units/spart/cavalry_spearman_e"];
	
	//list of reinforcements
	cmpTrigger.reinforceTypes = ["units/mace/champion_cavalry","units/merc_black_cloak","units/mace/champion_infantry_spearman","units/mace/infantry_archer_a","units/mace/infantry_slinger_a","units/mace/cavalry_javelineer_a","units/merc_thureophoros"];
	
	//structure decay check
	cmpTrigger.structureDecayCounter = 0;
	cmpTrigger.DoAfterDelay(15 * 1000, "StructureDecayCheck",null);
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderSpawnAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 45 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderCheckAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 15 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderCavSpawnAction", {
		"enabled": true,
		"delay": 115 * 1000,
		"interval": 125 * 1000,
	});
	
	//reinforcements
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalReinforcementSpawnAction", {
		"enabled": true,
		"delay": 60 * 1000,
		"interval": 60 * 1000,
	});
	
	//cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	
	//make list of certain types of player 3 structures
	//spawn random infantry next to a cc
	cmpTrigger.fields = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Field").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.farmsteads = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Farmstead").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.storehouses = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Storehouse").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Dock").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Fortress").filter(TriggerHelper.IsInWorld);
	
	
	/*warn(uneval(cmpTrigger.fields));
	warn(uneval(cmpTrigger.farmsteads));
	warn(uneval(cmpTrigger.storehouses));
	warn(uneval(cmpTrigger.docks));*/
	
	/*let cmpTech = Engine.QueryInterface(3, IID_TechnologyManager);*/
	
	//list of crannogs of player 4
	//we randomly spawn units near them just to help the AI of player 4
	/*cmpTrigger.crannog_ids = [7366,7371,7382];
	cmpTrigger.infantryTypesSpawn = ["units/brit/infantry_javelineer_b","units/brit/infantry_slinger_b","units/brit/infantry_spearman_b"];
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
	});*/
	

	/*let ents_3 = TriggerHelper.GetEntitiesByPlayer(3);
	for (let e of ents_3)
	{
		let cmpBuildingAI = Engine.QueryInterface(e, IID_Identity);
		if (cmpBuildingAI)
		{
			warn(uneval(cmpBuildingAI));
		}
		
	}*/
	
	
	
};
