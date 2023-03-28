warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsArrival = "B";
var triggerPointsArcherAmbush = "C";
var triggerPointsTemple = "D";
var triggerPointsMercs = "E";
var triggerPointsElephantTraders = "F";
var triggerPointsCaveRaiders = "G";
var triggerPointsCaveRaidersTargets = "H";
var triggerPointsCaveFortress = "I";



//var triggerPointsAdvanceAttack = "A";
//var triggerPointsMainAttack = "B";
//var triggerPointsMace = "C";
//var triggerPointsColonyAmbush = "G";
//var triggerPointsTemple = "H";
//var triggerPointsCavalryAttack = "A";
/*var triggerPointAmbush = "B";
var triggerPointTradeOutpost = "K";
var triggerPointStables = "C";
var triggerPointTraders = "D";
var triggerPointTraderAmbush = "E";
var triggerPointMountainAttack = "F";
var triggerPointMountainAttackSpawn = "G";
var triggerPointTempleQuest = "H";
var triggerPointKidnapperGuardPatrol = "J";
var triggerPointStartAssault = "I";*/



var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];


var disabledTemplatesCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Shoreline
	"structures/brit/crannog"
];

var disabledTemplatesDocksCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse"
];



var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",
	
	// military
	"structures/" + civ + "/barracks",
	"structures/" + civ + "/stable",
	"structures/" + civ + "/forge",
	"structures/" + civ + "/arsenal",
	"structures/" + civ + "/range",
	
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



Trigger.prototype.WalkAndFightRandomtTarget = function(attacker,target_player,target_class)
{
	let target = this.FindRandomTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindRandomTarget(attacker,target_player,siegeTargetClass);
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


Trigger.prototype.FindRandomTarget = function(attacker,target_player,target_class)
{
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	if (targets.length < 1)
	{
		//no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);
	
	}
	
	//if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}
	
	return pickRandom(targets);
}


Trigger.prototype.FindClosestTarget = function(attacker,target_player,target_class)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	if (targets.length < 1)
	{
		//no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);
	
	}
	
	//if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}
	
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

Trigger.prototype.SpawnAttackSquad = function(data)
{
	
	let p = data.p;
	let site = data.site;
	let templates = data.templates;
	let size = data.size; 
	let target_class = data.target_class;
	let target_player = data.target_player;
	let target_pos = data.target_pos;
	let use_formation = data.use_formation;
	
	
	//spawn the units
	let attackers = [];	
	for (let i = 0; i < size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//set formation
	if (use_formation == undefined || use_formation == true)
	{
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	}

	//make them attack
	let target = this.FindClosestTarget(attackers[0],target_player,target_class);
	
	if (target_pos == undefined)
		target_pos = TriggerHelper.GetEntityPosition2D(target);
	
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


//scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		
	//warn("targets: "+uneval(patrolTargets));
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

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [2,3,4,5,6])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
		//warn("checking decay");
		
		
		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				//warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
				//warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));
				
				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);

				}
				
			}
		}
	}
	
	//take care of slaves whose health seems to be decreasing all the time
	for (let p of [1,5])
	{
		let slaves = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Slave").filter(TriggerHelper.IsInWorld);
		
		for (let u of slaves)
		{
			let health_u = Engine.QueryInterface(u, IID_Health);
			
			let health_needed = health_u.GetMaxHitpoints() - health_u.GetHitpoints();
			
			/*let heal_amount = this.heal_rate_g;
			if (heal_amount > health_needed)
				heal_amount = health_needed;*/
				
			health_u.Increase(health_needed);
		}
		
	}
}




Trigger.prototype.IdleUnitCheck = function(data)
{
	//warn("idle unit check");
	
	for (let p of [2])
	{
		
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		//find patrol targets
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (structs.length > 5)
		{
	
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						//pick patrol sites
						let sites = [pickRandom(structs),pickRandom(structs),pickRandom(structs),pickRandom(structs),pickRandom(structs)];
							
								
						this.PatrolOrderList([u],p,sites);	

					}
				}
			}
		}
	
	}
	
	
	
	for (let p of [3])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u,1,"Structure");
				}
			}
		}
		
	}
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (let p of [2])
	{
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
	
		let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/arstibara",20,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
}	


 
Trigger.prototype.VictoryCheck = function(data)
{
	
	/*let fortresses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Fortress").filter(TriggerHelper.IsInWorld);

	if (fortresses.length == 0) 
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else
	{
		this.DoAfterDelay(30 * 1000,"VictoryCheck",null);
	}*/
	
	//check to see that player 2 has no units
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Soldier").filter(TriggerHelper.IsInWorld);
	//warn("victory check: " + units.length);
	
	if (units.length <= this.gaiaUnitsThreshold)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else
	{
		this.DoAfterDelay(15 * 1000,"VictoryCheck",null);
	}
}





Trigger.prototype.OwnershipChangedAction = function(data)
{
	//check if alexander
	if (data.entity == 2484 && data.to == -1)
	{
		this.LoseGame();
	}
	
	//check if structure
	if (data.to == 1 && data.from != -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null)
		{
			 if (id.classesList.indexOf("Structure") >= 0)
			{
				let health_s = Engine.QueryInterface(data.entity, IID_Health);
				if (health_s)
					health_s.Kill();
			}
		}
	}
	
	
	//check if main army lost soldier
	if (data.from == 3 && data.to == -1)
	{
		this.numTroopsDead += 1;
	}
	
	if (data.from == 2 && (data.to == -1 || data.to == 1))
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null)
		{
			 if (id.classesList.indexOf("Trader") >= 0)
			{
				//player 1 gets some food
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",75);
			}
			
			if (id.classesList.indexOf("StoneTower") >= 0)
			{
				//player 1 gets some food
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",300);
			}
			
			if (id.classesList.indexOf("Fortress") >= 0)
			{
				//warn("fort destroyed");
			
				//player 1 gets some food
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",1000);
				
				//spawn an attack
				let target_pos = TriggerHelper.GetEntityPosition2D(data.entity);
				this.SpawnStructureDestroyedResponseAttack(target_pos);
			}
		}
	}
	
	//check if pegasus relic
	if (data.entity == 2566)
	{
		//warn("relic taken!");
		
		//don't actually get metal
		let cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("metal",-1000);
		
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		
		this.questTempleRelicTaken = true;
		
		//trigger spawn waves
		let site = 2628;
		let templates = ["units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher"];
		
		//warn(uneval(id.classesList));
		
		let data_attack = {};
		data_attack.p = 0;
		data_attack.site = site;
		data_attack.templates = templates;
		data_attack.size = 15;
		data_attack.target_class = "Unit";
		data_attack.target_player = 1;
		data_attack.target_pos = TriggerHelper.GetEntityPosition2D(data.entity);
		data_attack.use_formation = false;
		
		this.DoAfterDelay(5 * 1000,"SpawnAttackSquad",data_attack);
		this.DoAfterDelay(17 * 1000,"SpawnAttackSquad",data_attack);
	}
	
	//check if player 5 guard
	if (data.from == 5 && data.to == -1)
	{
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Soldier").filter(TriggerHelper.IsInWorld);
		
		let barracks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Barracks").filter(TriggerHelper.IsInWorld);
				
		if (soldiers.length == 0 && barracks.length == 0 && this.slavesFreed == false)
		{
			this.FlipSlaveOwnership();
			
		}
	}
	
	
	//check if player 6 lost a soldier
	if (data.from == 6 && data.to == -1)
	{
		//go through all units
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6),"Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of soldiers)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.order)
				{
					if (cmpUnitAI.order.type)
					{
						if (cmpUnitAI.order.type == "Patrol")
						{
								//send to attack
								this.WalkAndFightClosestTarget(u,1,"Soldier");
							
							
						}
					}
					
				}
				
			
			}
		}
		
		//with a probability, launch a cavalry soldier attack if infantry was attacked
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null && id.classesList.indexOf("Infantry") >= 0)
		{
			if (Math.random() < 0.25)
			{
				//spawn cavalry man and send him to attack
				let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4),"House").filter(TriggerHelper.IsInWorld);
					
				let templates = ["units/pers/cavalry_javelineer_e","units/pers/cavalry_spearman_e","units/pers/cavalry_axeman_e"];
					
				let target_pos = TriggerHelper.GetEntityPosition2D(data.entity);
				
					
				let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,6);
				let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
				if (cmpUnitAI)
				{
					//find target
					cmpUnitAI.WalkAndFight(target_pos.x,target_pos.y,null);
						
					//TODO: this needs to happen at the start
					for (let p of [6])
					{
						let cmpPlayer = QueryPlayerIDInterface(p);
						for (let p_other of [2,3,4,5])
						{
							cmpPlayer.SetNeutral(p_other);
							let cmpPlayer_other = QueryPlayerIDInterface(p_other);
							cmpPlayer_other.SetNeutral(p);
						}
					}
				}
			}
		}
	}
	
	//check if workshop
	/*if (data.entity == 2711)
	{
		//spawn some siege
		let unit_i = TriggerHelper.SpawnUnits(data.entity,"units/brit/siege_ram",3,1);		
	}
	
	//check if player 2 lost building
	if (data.from == 2 && (data.to == 1 || data.to == -1))
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Structure") >= 0)
		{
			if (Math.random() < 0.2)
			{
				let target_pos = TriggerHelper.GetEntityPosition2D(data.entity);
				
				this.SpawnStructureDestroyedResponseAttack(target_pos);
				
			}
		}
	}
	else if (data.from == 1 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Champion") >= 0)
		{
			this.numLost += 1;
			
			if (this.numLost >= 15)
			{
				TriggerHelper.SetPlayerWon(2,this.VictoryTextFnEnemy,this.VictoryTextFnEnemy);	
				
			}
		}
			
		
	}*/
}




Trigger.prototype.ResearchTechs = function(data)
{
	//for playere 1
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		//just to make cavalry faster
		cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");	
		
		//better horses in general
		cmpTechnologyManager.ResearchTechnology("nisean_horses");
		
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
		
		//armor
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");
		
		//attack
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");
			
		//shared drop sites with player 4
		cmpTechnologyManager.ResearchTechnology("unlock_shared_dropsites");	
		
	}
	
	for (let p of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");

	}
	
	/*for (let p of [6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		
		
	}*/
}

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


Trigger.prototype.IntervalSpawnPersianGuards = function(data)
{
	for (let p of [6])
	{
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Soldier").filter(TriggerHelper.IsInWorld);
		//warn("found "+ soldiers.length + " soldiers");
		if (soldiers.length < 155)
		{
		
			let size = 3;
			
			for (let i = 0; i < size; i ++)
			{
				
				//find patrol/spawn sites
				let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
				
				//spawn sites
				let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
				
				if (patrol_sites.length >= 2 && spawn_sites.length > 0)
				{
					let inf_templates = ["units/pers/champion_infantry","units/pers/champion_elephant","units/pers/arstibara","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher"];
			
					
					//pick patrol sites
					let sites = [pickRandom(spawn_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
							
					//spawn the unit
					let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],pickRandom(inf_templates),1,p);
								
					this.PatrolOrderList(unit_i,p,sites);
				}
			}
		}
	}
	
	this.DoAfterDelay(10 * 1000,"IntervalSpawnPersianGuards",null);
	
}


Trigger.prototype.IntervalSpawnMountainVillageGuards = function(data)
{
	for (let p of [5])
	{
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Soldier").filter(TriggerHelper.IsInWorld);
		//warn("found "+ soldiers.length + " soldiers");
		if (soldiers.length < 85)
		{
		
			let size = 2;
			
			for (let i = 0; i < size; i ++)
			{
				
				//find patrol/spawn sites
				let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"House").filter(TriggerHelper.IsInWorld);
				
				//spawn sites
				let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Barracks").filter(TriggerHelper.IsInWorld);
				
				if (patrol_sites.length >= 2 && spawn_sites.length > 0)
				{
				
					let inf_templates = ["units/brit/champion_infantry_swordsman","units/gaul/champion_fanatic","units/brit/infantry_javelineer_e","units/brit/infantry_slinger_e","units/brit/war_dog","units/brit/infantry_spearman_e"];
					
					
					//pick patrol sites
					let sites = [pickRandom(spawn_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
							
					//spawn the unit
					let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],pickRandom(inf_templates),1,p);
								
					this.PatrolOrderList(unit_i,p,sites);
				}
			}
		}
	}
	
	this.DoAfterDelay(15 * 1000,"IntervalSpawnMountainVillageGuards",null);
	
}

Trigger.prototype.IntervalSpawnGoats = function(data)
{
	let p = 3;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState != "active")
	{
		return;
	}
	
	let animals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Animal").filter(TriggerHelper.IsInWorld);
	
	//warn("Found animals: "+animals.length);
	
	if (animals.length < 50)
	{
		let num_to_spawn = 50 - animals.length;
		
		//spawn sites
		let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Corral").filter(TriggerHelper.IsInWorld);
	
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),"gaia/fauna_goat_trainable",num_to_spawn,p);
		
	}
}


Trigger.prototype.CheckForCC = function(data)
{
	//check if player 1 has built structure
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+structures.length+" structures");
	
	if (structures.length > 3) //start after at least 2 structures
	{
		//warn("starting attacks");
		
		//start ship attacks
		this.DoAfterDelay(360 * 1000,"IntervalSpawnAttackShip",null);
	
		//start ground attacks
		this.DoAfterDelay(600 * 1000,"IntervalSpawnGroundAttack",null);
	
	}
	else 
	{
		this.DoAfterDelay(30 * 1000,"CheckForCC",null);
	}
}


Trigger.prototype.FinalAttack = function(data)
{
	let num_waves = 15;
	let interval_seconds = 34;
	let interval_decay = 0.975;
	
	//warn("final attack");
	
	//make player 1 neutral towards 3 as to not burden our healers
	/*for (let p of [1])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [3])
		{
			cmpPlayer.SetNeutral(p_other);
		}
	}*/
	
	//randomly pick spawn site
	let spawn_sites = [this.GetTriggerPoints(triggerPointsCaveRaiders)[0],this.GetTriggerPoints(triggerPointsCaveRaiders)[1]];
	this.finalSpawnSite = pickRandom(spawn_sites);
	
	//wave counter
	this.waveCounter = 0;
	
	for (let i = 0; i < num_waves; i ++)
	{
		
		//schedule
		this.DoAfterDelay(Math.round(interval_seconds * 1000)*(i+1),"SpawnDesertRaiders",null);
		
		if (i == num_waves -1)
		{
			let victory_check_delay = Math.round((1+interval_seconds) * 1000)*(i+1);
			//let victory_check_delay = 1000;
			this.DoAfterDelay(victory_check_delay,"VictoryCheck",null);
			warn("scheduling victory check in "+victory_check_delay);
			
			//count how many gaia soldiers exist
			let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Soldier").filter(TriggerHelper.IsInWorld);
			this.gaiaUnitsThreshold = soldiers.length;
	
			warn("gaia soldiers threshold = "+this.gaiaUnitsThreshold);
		}
		
		//more
		interval_seconds = interval_seconds * interval_decay;
	}
}

Trigger.prototype.FinalAttackWarning = function(data)
{
	this.ShowText("News about the destruction of the rebel fortifications has spread throughut the lands. We hear reports of rebel fighters gathering to assault our army as it crosses the desert.  We must be prepared to protect our army as the assault may come from anywhere and anytime.","OK","Fine");
}
	

Trigger.prototype.SpawnStructureDestroyedResponseAttack = function(target_pos)
{
	let p = 0;
	
	//warn("structure response attack");
		
	//check if targets exist
	let target_player = 1;
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player),"Unit").filter(TriggerHelper.IsInWorld);
	
	
	if (targets.length > 0)
	{
		//warn("starting attack in reesponse to structure destroyed");
		
		let num_waves = 5;
		
		
		for (let i = 0; i < num_waves; i ++)
		{
			
			let templates = ["units/pers/champion_infantry","units/pers/infantry_archer_e","units/pers/infantry_javelineer_e","units/pers/kardakes_hoplite","units/pers/arstibara"];
			
			let base_size = 18;
			let size_increase = 5;
			
			//decide how many
			let size = base_size + i*size_increase;
			
			let data = {};
			
			let spawn_site = this.GetTriggerPoints(triggerPointsCaveFortress)[0];

			
			
			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Unit";
			data.target_player = 1;
			data.site = spawn_site;
			data.target_pos = target_pos;
			//warn(uneval(data));
			
			this.DoAfterDelay((i+1) * 20 * 1000,"SpawnAttackSquad",data);
		}
	}
}

Trigger.prototype.IntervalSpawnGroundAttack = function(data)
{
	let p = 5;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	//check if we have merc camps
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		
	if (camps.length == 0)
	{
		return;
	}
	
	//check if targets exist
	let target_player = 1;
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player),"Structure").filter(TriggerHelper.IsInWorld);
	
	
	if (targets.length > 0)
	{
		//warn("starting ground attack");
		
		let num_waves = 3;
		
		
		for (let i = 0; i < num_waves; i ++)
		{
			
			let templates = undefined;
			let siege_templates = [];
			
			let base_size = 14+this.groundAttackCounter;
			let size_increase = 2*this.groundAttackCounter;
			
			if (i == 0)
			{
				templates = ["units/pers/infantry_spearman_a", "units/pers/infantry_spearman_a", "units/pers/infantry_javelinist_a", "units/pers/infantry_archer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_swordsman_a", "units/pers/cavalry_javelinist_a"];
			}
			else if (i == 1)
			{
				templates = ["units/pers/infantry_spearman_e", "units/pers/infantry_javelinist_e", "units/pers/infantry_archer_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_swordsman_e", "units/pers/cavalry_javelinist_e", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/cavalry_archer_a"];
				
				siege_templates = ["units/pers/champion_elephant"];
				
			}
			else if (i == 2)
			{
				templates = ["units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e", "units/pers/champion_cavalry", "units/pers/cavalry_swordsman_e", "units/pers/cavalry_javelinist_e", "units/pers/champion_infantry", "units/pers/cavalry_archer_e"];
				
				siege_templates = ["units/pers/champion_elephant", "units/pers/siege_ram"];
			}
			
			templates = templates.concat(siege_templates);
			
			//decide how many
			let size = base_size + i*size_increase;
			
			let data = {};
			
			/*let p = data.p;
			let site = data.site;
			let templates = data.templates;
			let size = data.size; 
			let target_class = data.target_class;
			let target_player = data.target_player;*/
			
			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Structure";
			data.target_player = 1;
			//data.site = pickRandom(camps);
			data.site = camps[0];
			
			this.DoAfterDelay((i+1) * 20 * 1000,"SpawnAttackSquad",data);
		}
	}
	
	
	//give some tech
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
	if (this.groundAttackCounter == 0)
	{
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
	}	
	else if (this.groundAttackCounter == 1)
	{
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
	}
	else if (this.groundAttackCounter == 2)
	{
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
	}
	else if (this.groundAttackCounter == 3)
	{
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
	}
	else if (this.groundAttackCounter == 4)
	{
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
	}
	else if (this.groundAttackCounter == 5)
	{
		cmpTechnologyManager.ResearchTechnology("attack_champions_elite");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
	}
	else if (this.groundAttackCounter == 6)
	{
		cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
	}
	
	let next_time = 420 + Math.floor(Math.random(180));
	//warn("spawning next attack in "+next_time+" seconds");
	this.DoAfterDelay(next_time * 1000,"IntervalSpawnGroundAttack",null);
	
	
	//increment counter
	this.groundAttackCounter += 1;
}





Trigger.prototype.IntervalSpawnTraders = function(data)
{
	let e = 2;
	
	let cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	//find how many traders we have
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader").filter(TriggerHelper.IsInWorld);
	
	if (traders.length < 6)
	{
		//make list of own markets
		let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Trade").filter(TriggerHelper.IsInWorld);
			
		for (let i = 0; i < 1; i ++)
		{
			let spawn_market = pickRandom(markets);
			let target_market = spawn_market;
			while (target_market == spawn_market)
			{
				target_market = pickRandom(markets);
			}
			
			let trader = TriggerHelper.SpawnUnits(spawn_market,"units/pers/support_trader",1,e);	
			let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
					
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_market,spawn_market,null,true);
		}
	}
	
	this.DoAfterDelay(90 * 1000,"IntervalSpawnTraders",data);
		
}


Trigger.prototype.SpawnDesertRaiders = function(data)
{
	//warn("desert spawn"+this.waveCounter);
	this.waveCounter += 1;
	let p = 0;
	
	//target sites
	let target_sites = this.GetTriggerPoints(triggerPointsCaveRaidersTargets);

	let spawn_sites = this.GetTriggerPoints(triggerPointsCaveRaiders);
	

	let attackers = [];
	for (let i = 0; i < 28; i ++)
	{
		let templates = ["units/pers/champion_infantry","units/pers/infantry_archer_a","units/pers/infantry_javelineer_a","units/pers/kardakes_hoplite","units/pers/infantry_spearman_e","units/pers/kardakes_skirmisher","units/pers/arstibara","units/pers/infantry_spearman_b"];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	
	//send to target
	let target_pos = TriggerHelper.GetEntityPosition2D(pickRandom(target_sites));
	
	
	
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




Trigger.prototype.QuestTempleComplete = function(data)
{
		
		this.ShowText("The monks thank you for saving their relic. Their healers are at your service, and also, here is some spare food, we see you need it!","Great!","OK");
		
		let site = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Temple").filter(TriggerHelper.IsInWorld)[0];
		let unit_i = TriggerHelper.SpawnUnits(site,"units/pers/support_healer_e",7,1);
		
		//give some food as well
		let cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("food",300);
		
		this.questTempleComplete = true;
}


Trigger.prototype.RangeActionTemple = function(data)
{
//	warn("range action temple");
	
	
	if (this.questTempleGiven == false && this.questTempleComplete == false)
	{
		this.questTempleGiven = true;
		
		
		//check if relic is picked up
	
		if (this.questTempleRelicTaken == true)
		{
			//complete quest
			this.QuestTempleComplete();
		}
		else
		{
			//give quest
			
			
			this.ShowText("The small monastary you encounter welcomes you. They are willing to help you with healing but first ask that you seek out an ancient relic stolen by thieves. The relic looks like a pegasus -- you won't miss it. Should you ackquire it, come back to the temple, the monks will be forever grateful.","We'll see what we can do.","OK");
		}
	}
	else if (this.questTempleComplete == false)
	{
		if (this.questTempleRelicTaken == true)
		{
			//complete quest
			this.QuestTempleComplete();
		}
	}
}

Trigger.prototype.SpawnUnit = function(data)
{
	let site = data.site; 
	let template = data.template;
	let owner = data.owner;
	let num = data.size;
	
	//warn("spawning unit: "+uneval(data));
	
	let unit_i = TriggerHelper.SpawnUnits(site,template,num,owner);
		
}


Trigger.prototype.PlayerCommandAction = function(data)
{
	
	//warn(uneval(data));
	if (data.cmd.type == "dialog-answer")
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		//warn("dialog state = "+this.dialogState);
		
		if (this.dialogState == "mercs")
		{
				if (data.cmd.answer == "button1")
				{
					//spend the money
					let cmpPlayer = QueryPlayerIDInterface(1);
					cmpPlayer.AddResource("metal",-2500);
		
					//get the units
					let site = this.GetTriggerPoints(triggerPointsMercs)[0];
					
					let mercs = TriggerHelper.SpawnUnits(site,"units/pers/champion_cavalry_archer",10,1);
	
					//warn("yes selected");
				}
				else 
				{
					//turn on mercs in 45 seconds
					this.DoAfterDelay(45 * 1000,"ToggleMercs",null);
	
					//warn("no selected");
					
				}
				
				this.dialogState  = "none";
		}
		else if (this.dialogState == "elephant_traders")
		{
			if (data.cmd.answer == "button1")
			{
				//spend the money
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("stone",-500);
		
				//get the units
				let site = this.GetTriggerPoints(triggerPointsElephantTraders)[0];
					
				let mercs = TriggerHelper.SpawnUnits(site,"units/pers/champion_elephant",3,1);
				let support_elephant = TriggerHelper.SpawnUnits(site,"units/maur/support_elephant",1,1);
	
				//warn("yes selected");
			}
			else 
			{
				//turn on mercs in 45 seconds
				this.DoAfterDelay(45 * 1000,"ToggleElephantTraders",null);
	
				//warn("no selected");
					
			}
				
			this.dialogState  = "none";
			
		}
	
		
		
	}
};

Trigger.prototype.ToggleMercs = function(data)
{
	if (this.mercsAvailable == true)
	{
		this.mercsAvailable = false;
	}
	else
	{
		this.mercsAvailable = true;
		//warn("mercs ara available now.");
	}
		
}

Trigger.prototype.ToggleElephantTraders = function(data)
{
	if (this.elephantsAvailable == true)
	{
		this.elephantsAvailable = false;
	}
	else
	{
		this.elephantsAvailable = true;
		//warn("elephants ara available now.");
	}
		
}




Trigger.prototype.RangeActionElephantTraders = function(data)
{
	//warn("range action triggered");
	//warn(uneval(data));

	if (this.elephantsAvailable == true && data.added.length > 0)
	{
		
	
		//decide on offer
		let total_cost_stone = 500;
		
		//check if the player has enough
		let cmpPlayer = QueryPlayerIDInterface(1);
		let resources = cmpPlayer.GetResourceCounts();
		//set the flag to false
		this.elephantsAvailable = false;
			
		if (resources.stone >= total_cost_stone)
		{

		
			let offer_text = "The traders in this outposts have some elephants for sale. They are willing to part with some for the price of 500 stone. What do you say?";
		
			this.ShowText(offer_text,"Yes, we need elephants","Perhaps later");
			
			
			//set the dialog state variable
			this.dialogState = "elephant_traders";
		}
		else
		{
			this.ShowText("The traders in this village are willing to see you some elephants for 500 stone. Alas, we do not have the resources","Very well","We'll come back later");
			
			//turn on mercs in 45 seconds
			this.DoAfterDelay(45 * 1000,"ToggleElephantTraders",null);
	
		}
		
		
		
	}
	
}

Trigger.prototype.RangeActionMercs = function(data)
{
	//warn("range action triggered");
	//warn(uneval(data));

	if (this.mercsAvailable == true && data.added.length > 0)
	{
		let templates = ["units/pers/champion_cavalry_archer"];
		
	
		//decide on offer
		let total_cost_metal = 1500;
		
		//check if the player has enough
		let cmpPlayer = QueryPlayerIDInterface(1);
		let resources = cmpPlayer.GetResourceCounts();
		
		//set the flag to false
		this.mercsAvailable = false;
		
		if (resources.metal >= total_cost_metal)
		{

		
			let offer_text = "You encounter a small camp used by local mercenaries.  A number of horse-riding archers are available for hire but it will cost us 1500 metal. ";
		
			this.ShowText(offer_text,"Yes, we need you","Perhaps later");
			
		
			
			//set the dialog state variable
			this.dialogState = "mercs";
		}
		else 
		{
			this.ShowText("This small camp often has mercenaries available for hire. Unfortunaately we do not have enough metal to entice an offer","Bummer","We'll be back");
			
			//turn on mercs in 45 seconds
			this.DoAfterDelay(45 * 1000,"ToggleMercs",null);
		}
		
		
		
	}
	
}


Trigger.prototype.RangeActionArrival = function(data)
{
	for (let u of data.added)
	{
		//warn("arrived!");
		
		Engine.DestroyEntity(u);
		
		this.numTroopsArrived += 1;
	}
}


Trigger.prototype.KillStarvingSoldier = function(data)
{
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Soldier+!Elephant").filter(TriggerHelper.IsInWorld);
	
	let u = pickRandom(units);
	let health_s = Engine.QueryInterface(u, IID_Health);
	health_s.Kill();
	
	this.numStarved += 1;
}
	
	

Trigger.prototype.IntervalAttritionCheck = function(data)
{
	
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Soldier+!Elephant").filter(TriggerHelper.IsInWorld);
	
	//decide how many units die based on how much food we have
	let num_dead = 3;
	
	//check how much food we have
	let food_loss = 125; // food every 20 seconds
	
	let cmpPlayer = QueryPlayerIDInterface(1);
	let resources = cmpPlayer.GetResourceCounts();
	
	if (resources.food > 1000)
	{
		let food_loss_added = (resources.food / 1000) * 50;
		food_loss += Math.round(food_loss_added);
	}
	
	//warn("food loss = "+food_loss);
		
	if (resources.food < food_loss)
	{
		num_dead += 6;
		//cmpPlayer.AddResource("food",-1*resources.food);
	}
	else
	{
		cmpPlayer.AddResource("food",-1*food_loss);
	}
	
	
	for (let i = 0; i < num_dead; i ++)
	{	
		this.DoAfterDelay((2+Math.round(Math.random()*6)) * 1000,"KillStarvingSoldier",null);
	}
	
	this.DoAfterDelay(20 * 1000,"IntervalAttritionCheck",null);
	
}


Trigger.prototype.SpawnPersianRebelGuards = function(data)
{
	for (let p of [6])
	{
		let size = 125;
		
		for (let i = 0; i < size; i ++)
		{
			
			//find patrol/spawn sites
			let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
			let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
			let inf_templates = ["units/pers/champion_infantry","units/pers/champion_elephant","units/pers/arstibara","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher"];
			
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
					
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(inf_templates),1,p);
						
			this.PatrolOrderList(unit_i,p,sites);
		}
	}
	
}

Trigger.prototype.SpawnMountainVillageGuards = function(data)
{
	for (let p of [5])
	{
		let size = 85;
		
		for (let i = 0; i < size; i ++)
		{
			
			//find patrol/spawn sites
			let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"House").filter(TriggerHelper.IsInWorld);
			
			let inf_templates = ["units/brit/champion_infantry_swordsman","units/gaul/champion_fanatic","units/brit/infantry_javelineer_e","units/brit/infantry_slinger_e","units/brit/war_dog","units/brit/infantry_spearman_e"];
			
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
					
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(inf_templates),1,p);
						
			this.PatrolOrderList(unit_i,p,sites);
		}
	}
	
}


Trigger.prototype.SpawnTowerGuards = function(data)
{
	for (let p of [2])
	{
		let size = 20;

		//decide whether player 2 or player 3
		for (let i = 0; i < size; i ++)
		{
			
			//find patrol/spawn sites
			let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
			
		
			let inf_templates = ["units/pers/champion_infantry"];
					
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
					
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(inf_templates),1,p);
						
			this.PatrolOrderList(unit_i,p,sites);
			
		}
	}

}


Trigger.prototype.LoseGame = function(data)
{
	TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);	
		
	
}

Trigger.prototype.SpawnArcherAmbush = function(data)
{
	let p = 2;
	let size = 20;
	let site = this.GetTriggerPoints(triggerPointsArcherAmbush)[0];
	
	let archers = TriggerHelper.SpawnUnits(site,"units/pers/infantry_archer_e",size,p);
	
	for (let u of archers)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			cmpUnitAI.SwitchToStance("standground");
		}
	}
}
	

Trigger.prototype.StatusCheck = function(data)
{
	//warn("num squads spawned = "+this.armySquadCounter);
	//warn("num lost = "+this.numTroopsDead);
	//warn("num arrived = "+this.numTroopsArrived);
	//warn("num starved = "+this.numStarved);
	
	let num_actual_dead = this.numTroopsDead - this.numTroopsArrived;
	warn("num dead = "+num_actual_dead);
	let ratio = (this.numTroopsArrived - num_actual_dead)/(28 * this.armySquadCounter);
	//warn("ratio = "+ratio);
		
	//keep track of time
	this.elapsedMinutes += 0.5; //every 30 seconds
	//warn("elapsedMinutes = "+this.elapsedMinutes );
	this.DoAfterDelay(30 * 1000,"StatusCheck",null);


	if (num_actual_dead > 1300)
	{
		this.ShowText("We have lost too many troops. We lose. ","Bummer","Nooo!");
		
		this.DoAfterDelay(4 * 1000,"LoseGame",null);
	
	}


	
	//check for idle troops
	for (let p of [6])
	{
		
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					
					let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
					
					//pick patrol sites
					let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
					
					this.PatrolOrderList([u],p,sites);	
				}
			}
		}
	}
	
	for (let p of [3])
	{
		
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					
						let target_site = this.GetTriggerPoints("B")[0];
						let target_pos = TriggerHelper.GetEntityPosition2D(target_site);
						
						//make walk
						ProcessCommand(p, {
							"type": "walk",
							"entities": [u],
							"x": target_pos.x,
							"z": target_pos.y,
							"queued": true
						});
				}
			}
		}
	}
	
	//check if green's troops are stuck
	for (let p of [3])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				//check how close the unit is to a trigger point
				
				//get unit position
				var cmpUnitPosition = Engine.QueryInterface(u, IID_Position).GetPosition2D();
				
				//get trigger point position
				let trigger_site = this.GetTriggerPoints(triggerPointsArrival)[0];
				var cmpTriggerPosition = Engine.QueryInterface(trigger_site, IID_Position).GetPosition2D();
				
				//look at distance between positions
				let targetDistance = PositionHelper.DistanceBetweenEntities(u, trigger_site);
				
				if (targetDistance < 60)
				{
					cmpUnitAI.WalkToTarget(trigger_site,false);
				}
			}
		}
	}
	
	//check if fortress and towers are destroyed
	if (this.finalAttackScheduled == undefined)
	{
		this.finalAttackScheduled = false;
	}
	
	if (this.finalAttackScheduled == false)
	{
		let forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Fortress").filter(TriggerHelper.IsInWorld);
		let towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		if (forts.length == 0 && towers.length == 0)
		{
			warn("scheduling final attack");
			this.ShowText("Final attack scheduuled","Bummer","Noooo");
				
			
			//schedule warning
			this.DoAfterDelay(4 * 60 * 1000,"FinalAttackWarning",null);
			
			//schedule attack
			this.DoAfterDelay(6 * 60 * 1000,"FinalAttack",null);
			
			//schedule final victory check

			this.finalAttackScheduled = true;
		}
		else
		{
			//if too much time has passed, lose the game
			if (this.elapsedMinutes > 60)
			{
				this.ShowText("Unfortunately, we have not been able to destroy the rebel fortifications in time. We lose.","Bummer","Noooo");
				
				this.DoAfterDelay(4 * 1000,"LoseGame",null);
	
				
			}
		}
	}
	
	/*else if (this.finalAttackScheduled == true)
	{
		
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//attack closes soldier
					this.WalkAndFightClosestTarget(u,1,"Hero");
				}
			}
		}
		
	}*/
		
		
	
}

Trigger.prototype.SpawnTravelingArmySquad = function(data)
{
	let p = 3;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
		
	if (cmpPlayer.GetState() == "defeated")
		return;
	
	
	//spawn site
	let site = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
			
	let squad_units = [];
			
	//melee
	let melee_template = pickRandom(["units/mace/infantry_pikeman_e","units/mace/champion_infantry_spearman","units/merc_thorakites"]);		
	let units_melee = TriggerHelper.SpawnUnits(site,melee_template,10,p);
	squad_units = squad_units.concat(units_melee);
	
	//ranged
	let ranged_template = pickRandom(["units/mace/infantry_slinger_e","units/mace/infantry_javelineer_e","units/mace/infantry_archer_e"]);		
	let units_ranged= TriggerHelper.SpawnUnits(site,ranged_template,10,p);
	squad_units = squad_units.concat(units_ranged);
	
	//cavalry
	let cav_template = pickRandom(["units/mace/champion_cavalry","units/mace/cavalry_javelineer_e","units/mace/cavalry_spearman_e"]);		
	let units_cav= TriggerHelper.SpawnUnits(site,cav_template,6,p);
	squad_units = squad_units.concat(units_cav);
	
	//some slow units
	let units_support= TriggerHelper.SpawnUnits(site,"units/sele/champion_elephant",2,p);
	squad_units = squad_units.concat(units_support);
	
	//all have little health
	for (let u of squad_units)
	{
		let health_s = Engine.QueryInterface(u, IID_Health);
		health_s.SetHitpoints(5+Math.round(Math.random()*10));
	}
	
	//make formation
	TriggerHelper.SetUnitFormation(p, squad_units, pickRandom(unitFormations));
	
	//target site
	let target_site = this.GetTriggerPoints("B")[0];
	let target_pos = TriggerHelper.GetEntityPosition2D(target_site);
	
	//make walk
	ProcessCommand(p, {
		"type": "walk",
		"entities": squad_units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true
	});
	
	
	this.armySquadCounter += 1;

	
	
	
	this.DoAfterDelay(15 * 1000,"SpawnTravelingArmySquad",null);
	
}


Trigger.prototype.FlipSlaveOwnership = function(data)
{
	let slaves = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Support+Worker").filter(TriggerHelper.IsInWorld);
	
	for (let u of slaves)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	let goats = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Animal").filter(TriggerHelper.IsInWorld);
	
	for (let u of goats)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	this.slavesFreed = true;
	
	this.ShowText("You have freed a number of slaves held by the mountain folk. They are at your service.","Great!","OK");
}

/* Quests:
 * 
 * 1. A few random spots with food and some gaia soldiers
 * 
 * 2. Mercenaries available for hire: 8 horse archers for metal DONE
 * 
 * 3. A monastery that seeks help -- retrieve their stolen relic, get priests DONE
 * 
 * 4. A desert trading post with a worker + fighter elephants for sale for stone DONE
 * 
 * 5. Periodic ambushes on the column of moving soldiers
 * 
 * 6. Ambush on the marching soldiers, their health should be minimal, player gets warning; one ambush by cavalry archers, another at the end of their journey by spawned archers DONE
 * 
 * 7. enemy caravans which re-spawn periodically, produce food when killed DONE
 * 
 * 8. rescue prisoners from a pen, they become slaves that can be used to kill the rabbits
 * 
 * 10. some type of archer ambush in the mountains DONE
 * 
 * 
 * //food gains from battle
 * 1. persian rebels ~ 1600
 * 
 * 
 * AIs:
 * 
 * 2: desert bandits
 * 3: macedon army
 * 4: hostile traders -- only hostile to player 1, neutral/friend to 3
 * 5: desert nomans (neutral, includes all trading post and monastary)
 * 6,7,8: desert bandits




 */ 


{
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants (that may change)
	
	
	//some state variables
	cmpTrigger.armySquadCounter = 0;
	cmpTrigger.numTroopsArrived = 0;
	cmpTrigger.numTroopsDead = 0;
	cmpTrigger.numStarved = 0;
	cmpTrigger.elapsedMinutes = 0;
	
	cmpTrigger.dialogState  = "none";
	
	cmpTrigger.questTempleGiven = false;
	cmpTrigger.questTempleComplete = false;
	cmpTrigger.questTempleRelicTaken = false;
	
	cmpTrigger.mercsAvailable = true;
	cmpTrigger.elephantsAvailable = true;

	cmpTrigger.slavesFreed = false;
	
	//start techs
	cmpTrigger.DoAfterDelay(2 * 1000,"ResearchTechs",null);
	
	//garrisons
	cmpTrigger.DoAfterDelay(4 * 1000,"GarrisonEntities",null);

	//army starts moving
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTravelingArmySquad",null);
	
	//archer ambush starts shortly after first squad makes it to the destination
	cmpTrigger.DoAfterDelay(Math.round(4.75*60) * 1000,"SpawnArcherAmbush",null);
	
	//attrition check
	cmpTrigger.DoAfterDelay(60 * 1000,"IntervalAttritionCheck",null);
	
	//traders spawn
	cmpTrigger.DoAfterDelay(5 * 1000,"IntervalSpawnTraders",null);
	
	//spawn initial patrols
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTowerGuards",null);
	cmpTrigger.DoAfterDelay(6 * 1000,"SpawnMountainVillageGuards",null);
	cmpTrigger.DoAfterDelay(7 * 1000,"SpawnPersianRebelGuards",null);
	
	//some repeat patrols
	cmpTrigger.DoAfterDelay(5 * 1000,"IntervalSpawnMountainVillageGuards",null);
	cmpTrigger.DoAfterDelay(5 * 1000,"IntervalSpawnPersianGuards",null);
	
	//interval
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnDesertRaiders",null);
	cmpTrigger.DoAfterDelay(30 * 1000,"StatusCheck",null);
	
	 



	//disable templates
	for (let p of [1,2,3,4,5,6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
	
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		
		if (p == 1)
		{
			disTemplates = disTemplates.concat(["units/mace/hero_alexander_iii", "units/mace/hero_craterus", "units/mace/hero_philip_ii", "units/mace/hero_demetrius", "units/mace/hero_pyrhus"]);
		}
			
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		//add some tech
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		//no pop limit
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	//diplomacy
	
	//player 3 is neutral towards a few players, even if they attack him
	for (let p of [3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [2,4,5,6])
		{
			cmpPlayer.SetAlly(p_other);
		}
	}
	
	//player 4 is neutral towards all, all are neutral towards 4
	for (let p of [4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [1,2,3,5])
		{
			cmpPlayer.SetNeutral(p_other);
			
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}
	
	//players 1 and 4 are allies as to use shared drop sites
	for (let p of [1])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [4])
		{
			cmpPlayer.SetAlly(p_other);
			
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetAlly(p);
		}
	}
	
	//player 6 doesn't attack player 2, 3 or 4 or 5
	for (let p of [6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [2,3,4,5])
		{
			cmpPlayer.SetAlly(p_other);
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetAlly(p);
		}
	}
	
	
	/*for (let p of [3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//neutral towards all
		for (let p_other of [1,2,4,5,6])
		{
			cmpPlayer.SetNeutral(p_other);
			
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}
	
	for (let p of [6]) //neutral towards allis so doesn't retreat
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//neutral towards all
		for (let p_other of [2,3,4,5])
		{
			cmpPlayer.SetNeutral(p_other);
		}
	}*/
	
	//triggers
	let data = { "enabled": true };
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionArrival", {
		"entities": cmpTrigger.GetTriggerPoints("B"), // central points to calculate the range circles
		"players": [3], // only count entities of player 1
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	//temple
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsTemple), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	//mercs
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionMercs", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsMercs), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 18,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	//elephant traders
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionElephantTraders", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsElephantTraders), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 18,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
	
	//cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	
	/*cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});*/
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}

/*
 - get rid of extra trigger point D next to cave

-------------------

min 1:30     1100 food (temple)
min 2:00 	1210 food after horsemen killled
min 3:00    1521 food after pegasus and a trader
min 5:30	1914 food after archer ambush and 2 traders
min 8:30 	3060 food after 3 crates from gaia hoplites and archers
min 12:30	3294 food before attack on first village
min 14:19	4273 food (1500 metal) after defeating village
min 15:30 5203 food (after loot + a few goats)
min 21:30 8500 food after getting mercs and all goats
min 26		11175 food after persian rebels destroyed 
min 28		12228 food
min 30		13590 food begin attack on towers
min 34 		15947 food
min 3630	18700 food after stash of 5 food bins and towers
min 40		19962
min 48		24400
*/

/*
WARNING: food loss = 267
WARNING: found 0 soldiers
WARNING: found 0 soldiers
WARNING: victory check: 53
WARNING: found 0 soldiers
WARNING: food loss = 260
WARNING: found 0 soldiers
WARNING: found 0 soldiers
WARNING: victory check: 49
WARNING: num squads spawned = 198
WARNING: num lost = 5315
WARNING: num arrived = 4468
WARNING: num starved = 486
WARNING: num dead = 847
WARNING: ratio = 0.6531385281385281
WARNING: elapsedMinutes = 49.5
* 
* 179 dead from player stats
*/
