warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointSouth = "A";
var triggerPointArc = "K";
var triggerPointAch = "J";



var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];


var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",
	"structures/" + civ + "/house",
	
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
	"structures/ptol/lighthouse",
	
	//villagers
	"units/" + civ + "/support_female_citizen"
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

		let targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
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


Trigger.prototype.SpecialAchaeanAssault = function(data)
{
	let owner = 5;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 40;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointAch));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.achaeanAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}

Trigger.prototype.SpecialArcadianAssault = function(data)
{
	let owner = 6;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 30;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointArc));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.arcadiaAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}

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
			this.ShowText("The assassins are dead. Darius is severely wounded and as he lay dying, he utters his final words: 'Avenge me! The empire is yours, but you must defeat Bessus. My loyal followers will help you setup camp. You must destroy the traitor!","Sounds good","OK");
			
			//spawn servants
			let dariusID = 3328;
			let alexanderID = 3287;
			
			TriggerHelper.SpawnUnits(alexanderID,"units/pers/infantry_archer_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers/infantry_spearman_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers/infantry_javelineer_a",5,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers/support_healer_e",3,1);
			
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
			//check if structure
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
			TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_oxybeles_packed",8,1);
			
			//spawn the princess
			TriggerHelper.SpawnUnits(data.entity,"units/kush/hero_amanirenas",1,1);
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
	
	for (let p of [2,6,7])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		let owner = 7;
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_infantry",5,owner);
			
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
		
		
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",5,p);
			
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
	
	//look for idle units
	for (let p of [7])
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
				if (cmpUnitAI.IsIdle())
				{
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,target_p,unitTargetClass);
				}
			}
		}
	}
	
	//check if enemies have ccs, if not, win
	let ccs_p2 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let ccs_p6 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6),"CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (ccs_p2.length == 0 && ccs_p6.length == 0)
	{
		//win
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
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
	
	let inf_templates = ["units/kush/champion_infantry_amun", "units/kush/champion_infantry", "units/kush/champion_infantry_apedemak"];
	
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

Trigger.prototype.ArcadianAttack = function(data)
{
	//check if we have camps
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.arcadiaAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 1.0 - this.arcadiaSiegeProb)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.arcadiaAttackTemplates),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//siege
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/mace/siege_lithobolos_packed",1,p);
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
	
	let next_attack_interval_sec = this.arcadiaAttackInterval + Math.floor(Math.random() * 120);
	//warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 2;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"ArcadianAttack",null);
}


Trigger.prototype.AchaeanAttack = function(data)
{
	//check if we have camps
	let p = 5;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.achaeanAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 1.0 - this.achaeanSiegeProb)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.achaeanAttackTemplates),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//siege
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/athen/siege_oxybeles_packed",1,p);
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
	
	let next_attack_interval_sec = this.achaeanAttackInterval + Math.floor(Math.random() * 120);
	//warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 4;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"AchaeanAttack",null);
}


Trigger.prototype.SpawnAchaeanPatrol = function(data)
{
	let p = 5; //arcdians
	
	//see how many units we have
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("player 6 has "+uneval(units_p.length) + " units");
	
	if (units_p.length < 40)
	{
	
		//targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld));
		
		let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld));
		
		
		if (targets_A.length == 0 || targets_B.length == 0)
			return;
			
		let site_j = pickRandom(targets_B);	
		let patrol_units = TriggerHelper.SpawnUnits(site_j,pickRandom(this.patrolTemplates),1,p);	
		
		//send to patrol
		this.PatrolOrder(patrol_units,p,pickRandom(targets_A),site_j);
	}
	
	this.DoAfterDelay(30 * 1000,"SpawnAchaeanPatrol",null);

}

Trigger.prototype.SpawnBessusPatrol = function(data)
{
	let p = 7; //greek mercs
	
	//warn("checking to spawn patrol");
	
	//get state and see if player is alive
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "defeated")
	{	
		
		//see how many units we have
		let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		
		//warn("player 7 has "+uneval(units_p.length) + " units");
		
		if (units_p.length < 40)
		{
		
			//targets A
			let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
			targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Market").filter(TriggerHelper.IsInWorld));
			
			
			let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "StoneTower").filter(TriggerHelper.IsInWorld);
			targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld));
			
			if (targets_A.length == 0 || targets_B.length == 0)
				return;
				
			let site_j = pickRandom(targets_B);	
			
			let patrol_units = [];
			let patrol_size = 5;
			
			for (let i = 0; i < patrol_size; i ++)
			{
				let units_i = TriggerHelper.SpawnUnits(site_j,pickRandom(this.squadTemplates),1,p);
				patrol_units.push(units_i[0]);
			}

			//send to patrol
			this.PatrolOrder(patrol_units,p,pickRandom(targets_A),site_j);
		}
		
		this.DoAfterDelay(30 * 1000,"SpawnBessusPatrol",null);
	}
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


Trigger.prototype.CheckForCC = function(data)
{
	//warn("checking for cc");
	
	//check if player 1 has built structure
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (structures.length > 0) //start after at least 2 structures
	{
		//disable new civil centres
		let cmpPlayer = QueryPlayerIDInterface(1);
		let disTemplates = ["structures/" + QueryPlayerIDInterface(1, IID_Identity).GetCiv() + "/civil_centre"];
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		warn("disabling civil centres");
		//warn(uneval(cmpPlayer.GetDisabledTemplates()));
	}
	else 
	{
		this.DoAfterDelay(10 * 1000,"CheckForCC",null);
	}
}

Trigger.prototype.SpawnMercenarySquad = function(data)
{
	//check if camp is there
	let p = 7;
	
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = 8;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.squadTemplates),1,p);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,unitTargetClass);
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

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);


	//some templates
	cmpTrigger.squadTemplates = ["units/athen/champion_ranged","units/merc_black_cloak","units/athen/champion_marine","units/athen/champion_infantry","units/merc_thureophoros"];

	//some variables
	cmpTrigger.mercSpawnProb = 0.95; //probability that mercs are spawned when you destroy an enemy structure
	cmpTrigger.mercSpawnProbDecay = 0.9; //decay after each time

	//some state variables
	cmpTrigger.dariusDead = false;
	cmpTrigger.lastFoundation = 0;
	
	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//check for CCs by player 1
	cmpTrigger.DoAfterDelay(10 * 1000,"CheckForCC",null);
	
	//spawn patrol periodically
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnBessusPatrol",null);

	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnMercenarySquad",null);
	
	//set diplomacy
	for (let p of [1,2,5,6,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(4);
	}
	
	for (let p of [4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p2 of [1,2,5,6,7])
		{
			cmpPlayer.SetNeutral(p2);
		}
	}
	
	//assassins are neutral towards main enemy factions so they do not run away
	let cmpPlayer = QueryPlayerIDInterface(5);
	cmpPlayer.SetNeutral(2);
	cmpPlayer.SetNeutral(6);
	
	//for AI only
	cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetAlly(4);
	
	for (let p of [1,2,3,4,5,6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		
		if (p != 1) //disable civil centres
		{
			//disable buildings production
			//let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		
			//disable units as well
			//let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
			
			//disTemplates = disTemplates.concat(unit_templaes);
		
			let disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre"];
		
			cmpPlayer.SetDisabledTemplates(disTemplates);
			//warn("Disabling templates for player "+uneval(p));
		}
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		if (p != 1)
		{
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(100);
		}
		else if (p == 6)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
