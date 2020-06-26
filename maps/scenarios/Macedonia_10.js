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


/*
 * TODO: add some spawn attacks the first time a gate or wall is destroyed
 * 
 */
Trigger.prototype.OwnershipChangedAction = function(data)
{
	
	//if we captured gaia object
	if (data.from == 0 && data.to == 1){
		
		warn(uneval(data));
		
		//big temple
		if (data.entity == 2233){ //big temple
			//spawn some healers
			TriggerHelper.SpawnUnits(2014,"units/mace_support_healer_e",4,1);
		
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			//cmpPlayer.AddStartingTechnology("attack_infantry_ranged_01");
			//cmpPlayer.AddStartingTechnology("phase_city");

			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");

			warn("Temple captured events happened");
		}
		else if (data.entity == 2507) //little temple
		{
			//spawn some healers
			TriggerHelper.SpawnUnits(2014,"units/mace_support_healer_e",2,1);
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_rate");
		}
		else if (data.entity == 2553) // siege shop
		{
			//spawn some rams
			TriggerHelper.SpawnUnits(2014,"units/mace_mechanical_siege_ram",3,1);
			
			//add some points 
			this.current_points += 10;
			
			//get some tech
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology("siege_packing");
		}
		
		
	}
	else if (data.from == 3 || data.from == 2) //possibly destroyed a structure
	{
		if (this.fields.indexOf(data.entity) >= 0)
		{
			warn("Field destroyed");
			//add some points 
			this.current_points += 3;
		}
		else if (this.farmsteads.indexOf(data.entity) >= 0)
		{
			warn("farmstead destroyed");
			//add some points 
			this.current_points += 5;
		}
		else if (this.storehouses.indexOf(data.entity) >= 0)
		{
			warn("storehouse destroyed");
			//add some points 
			this.current_points += 5;
		}
		else if (this.docks.indexOf(data.entity) >= 0)
		{
			warn("dock destroyed");
			//add some points 
			this.current_points += 10;
		}
		else if (this.gates.indexOf(data.entity) >= 0)
		{
			//gate was destroyed, send cavalry attack
			warn("gate destroyed");
			if (this.gate_attack_done == false){
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
		else if (this.ccs.indexOf(data.entity) >= 0){ //civil centered destroyed
			if (this.cc_attack_done == false){
				
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
		}
		else if (this.forts.indexOf(data.entity) >= 0){ //forts destroyed
			if (this.fort_attack_done == false){
				
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
		else if (data.from == 2) {
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
				
				TriggerHelper.SpawnUnits(pickRandom(ccs),"units/mace_support_trader",1,1);
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
	
	
	this.gaul_cavalry_types = ["units/gaul_cavalry_swordsman_e","units/gaul_cavalry_javelinist_e","units/brit_war_dog_e","units/gaul_champion_cavalry","units/brit_champion_cavalry"];
	
	
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
	for (let i = 0; i < attack_size; ++i){
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
			
			if (markets_e.length > 0){
			
				//warn(uneval(markets_e));
				let site = pickRandom(markets_e);
				
				//warn("Spawning trader for player "+this.enemies[e]+" at site = " + site);
				let trader_i = TriggerHelper.SpawnUnits(site,"units/brit_support_trader",1,this.enemies[e]);
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


Trigger.prototype.AttackOrder = function(units)
{
	if (units.length <= 0)
		return;
	
	//let human_ents = TriggerHelper.GetEntitiesByPlayer(1).filter(TriggerHelper.IsInWorld);
	
	
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

Trigger.prototype.PatrolOrder = function(units)
{
	if (units.length <= 0)
		return;
	
	//make them patrol
	let patrolTargets = [];
	
	//randomly pick 3 gates
	while (patrolTargets.length < Math.min(3,this.ccs.length))
	{
		let gate_k = Math.floor(Math.random() * this.ccs.length);
		if (patrolTargets.indexOf(this.ccs[gate_k]) < 1) 
			patrolTargets.push(this.ccs[gate_k]);
	}
	
	//warn("Patrol targets: " + uneval(patrolTargets));
	
	for (let patrolTarget of patrolTargets)
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
		
	let spawn_size = 5+this.spawn_attack_bonus;
	
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
	
	let fighters = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Human+Infantry").filter(TriggerHelper.IsInWorld);
	
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
	
	
}

Trigger.prototype.IntervalDefenderSpawnAction = function(data)
{
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//check current population
	let currentPop = QueryPlayerIDInterface(2).GetPopulationCount();
	//warn("Player 2 population: "+currentPop);
	
		
	//calculate size of spawn units
	let spawn_size = 3+this.spawn_attack_bonus;
	
	this.fields = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Field").filter(TriggerHelper.IsInWorld);
	
	this.farmsteads = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Farmstead").filter(TriggerHelper.IsInWorld);
	
	this.storehouses = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Storehouse").filter(TriggerHelper.IsInWorld);
	
	//1 per fields, 2 per storehouse and 2 per farmstead
	spawn_size += this.fields.length * 1 + this.farmsteads.length * 1 + this.storehouses.length * 1;
	
	//warn("defender spawn size = "+spawn_size);
	
	if (currentPop > 270)
		spawn_size = 0;
	
	//spawn infantry
	let units = [];
	for (let i = 0; i < spawn_size; ++i)
	{
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(ccs),pickRandom(this.infTypes),1,2);
		units.push(unit_i[0]);
	}
	
	//send to patrol
	this.PatrolOrder(units);
	
	//check for idle units and add them to queue
	let all_ents = TriggerHelper.GetEntitiesByPlayer(2);
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
	"structures/ptol_lighthouse"
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
	
	//list of gates
	cmpTrigger.gates = [1588,1597,1610,1619,1627,1640,1652];
	
	//list of enemy players
	cmpTrigger.enemies = [2,3];
	cmpTrigger.spawn_attack_bonus = 0;
	
	//disable some techs and buildings
	let cmpPlayer = QueryPlayerIDInterface(3);
	cmpPlayer.SetDisabledTemplates(disabledTemplates(cmpPlayer.GetCiv()));
	cmpPlayer.AddStartingTechnology("phase_town_athen");
	cmpPlayer.AddStartingTechnology("phase_city_athen");
	cmpPlayer.AddStartingTechnology("tower_armour");
	cmpPlayer.AddStartingTechnology("tower_range");
	cmpPlayer.AddStartingTechnology("tower_watch");
	cmpPlayer.AddStartingTechnology("tower_murderholes");
	cmpPlayer.AddStartingTechnology("tower_crenellations");
	
	cmpPlayer = QueryPlayerIDInterface(2);
	cmpPlayer.SetDisabledTemplates(disabledTemplates(cmpPlayer.GetCiv()));
	cmpPlayer.AddStartingTechnology("phase_town_athen");
	cmpPlayer.AddStartingTechnology("phase_city_athen");
	
	cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetDisabledTemplates(disabledTemplates(cmpPlayer.GetCiv()));
	cmpPlayer.AddStartingTechnology("phase_town");
	cmpPlayer.AddStartingTechnology("phase_city");
	cmpPlayer.SetPopulationBonuses(300);
			
	//same state variables
	cmpTrigger.current_points = 0;
	cmpTrigger.gate_attack_done = false;
	cmpTrigger.cc_attack_done = false;
	cmpTrigger.fort_attack_done = false;
	
	//store list of defender types
	cmpTrigger.infTypes = ["units/thebes_sacred_band_hoplitai","units/athen_champion_marine","units/athen_champion_ranged","units/athen_champion_ranged_gastraphetes","units/athen_black_cloak"];
	cmpTrigger.cavTypes = ["units/athen_cavalry_javelinist_e","units/athen_cavalry_swordsman_b","units/spart_cavalry_spearman_e"];
	
	//list of reinforcements
	cmpTrigger.reinforceTypes = ["units/mace_champion_cavalry","units/athen_black_cloak","units/mace_champion_infantry_a","units/mace_infantry_archer_a","units/mace_infantry_slinger_a","units/mace_cavalry_javelinist_a"];
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderSpawnAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 50 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderCheckAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 15 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalDefenderCavSpawnAction", {
		"enabled": true,
		"delay": 115 * 1000,
		"interval": 105 * 1000,
	});
	
	//reinforcements
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalReinforcementSpawnAction", {
		"enabled": true,
		"delay": 60 * 1000,
		"interval": 60 * 1000,
	});
	
	cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	
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
	cmpTrigger.infantryTypesSpawn = ["units/brit_infantry_javelinist_b","units/brit_infantry_slinger_b","units/brit_infantry_spearman_b"];
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

