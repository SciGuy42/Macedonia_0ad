warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "B";
var triggerPointsGiftUnit = "J";
var triggerPointsShipPatrol = "K";

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
	
	
	//spawn the units
	let attackers = [];	
	for (let i = 0; i < size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//make them attack
	let target = this.FindClosestTarget(attackers[0],target_player,target_class);
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
	for (let p of [4,5])
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
}




Trigger.prototype.IdleUnitCheck = function(data)
{
	//warn("idle unit check");
	
	//colony militia
	for (let p of [5])
	{
		let land_units = [];
		let inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let siege_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		let ele_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);
		
		//find targets
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (structs.length > 0)
		{
			land_units = land_units.concat(inf_units);
			land_units = land_units.concat(cav_units);
			land_units = land_units.concat(siege_units);
			land_units = land_units.concat(ele_units);
			
			for (let u of land_units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
							
						//attack closest target
						this.WalkAndFightClosestTarget(u,1,"Structure");
					}
				}
			}
		}
		
		//ships - TODO
	}
	
	//disable civil centres
	for (let p of [1,2,3])
	{
		let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"CivilCentre").filter(TriggerHelper.IsInWorld);
		
		if (ccs.length >= 3)
		{
		
			let cmpPlayer = QueryPlayerIDInterface(p);
			
			let disTemplates = disabledTemplatesCCs(QueryPlayerIDInterface(p, IID_Identity).GetCiv())
			cmpPlayer.SetDisabledTemplates(disTemplates);
			
		}
	}
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (let p of [1,5,6])
	{
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",5,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",20,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		
		for (let c of camps)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
	//garisson ships
	let biremes = [17425,17426]; //20
	let triremes = [17427]; //30
	let trade_ships = [17428,17429]; //15
	
	for (let ship of biremes)
	{
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/champion_infantry_spearman",15,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/infantry_archer_e",5,1);
	}
	
	
	for (let ship of triremes)
	{
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/champion_infantry_spearman",5,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/champion_cavalry",15,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/merc_thureophoros",9,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/athen/hero_themistocles",1,1);
	}
	
	for (let ship of trade_ships)
	{
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/support_female_citizen",5,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/infantry_pikeman_b",5,1);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/infantry_javelineer_b",5,1);
	}
	
	
	/*for (let p of [2])
	{
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry",5,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry",20,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}*/



	
}	


 
Trigger.prototype.VictoryCheck = function(data)
{
	
	
	//check how many civil centres player 2 and 3 has
	let ccs_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let ccs_p3 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"CivilCentre").filter(TriggerHelper.IsInWorld);
	
	warn("found "+uneval(ccs_p3.length+ccs_p2.length) + " ccs");
	
	if (ccs_p2.length <= 1 && ccs_p3.length <= 1) 
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else
	{
		this.DoAfterDelay(30 * 1000,"VictoryCheck",null);
	}
	
}





Trigger.prototype.OwnershipChangedAction = function(data)
{

}




Trigger.prototype.ResearchTechs = function(data)
{
	//for playere 1
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");
			
		//better horses in general
		cmpTechnologyManager.ResearchTechnology("nisean_horses");
		
		//just to make cavalry faster
		cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");	
		
		//trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	}
	
	for (let p of [5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
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
	
	warn("Found "+structures.length+" structures");
	
	if (structures.length > 3) //start after at least 2 structures
	{
		warn("starting attacks");
		
		
		//this.ShowText("Great job at establishing a base! Our scouts report that our success has not gone unnoticed -- the nearby tribes are bound to attack soon, we must prepare for battle!","OK","Looking forward to it!");
		
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
		warn("starting ground attack");
		
		let num_waves = 3;
		
		
		for (let i = 0; i < num_waves; i ++)
		{
			
			let templates = undefined;
			let siege_templates = [];
			
			let base_size = 14+this.groundAttackCounter;
			let size_increase = 2*this.groundAttackCounter;
			
			if (i == 0)
			{
				templates = ["units/pers/infantry_spearman_a","units/pers/infantry_spearman_a","units/pers/infantry_javelineer_a","units/pers/infantry_archer_a","units/pers/cavalry_spearman_a","units/pers/cavalry_axeman_a","units/pers/cavalry_javelineer_a"];
			}
			else if (i == 1)
			{
				templates = ["units/pers/infantry_spearman_e","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/cavalry_spearman_e","units/pers/cavalry_axeman_e","units/pers/cavalry_javelineer_e","units/pers/champion_infantry","units/pers/champion_infantry","units/pers/cavalry_archer_a"];
				
				siege_templates = ["units/pers/champion_elephant"];
				
			}
			else if (i == 2)
			{
				templates = ["units/pers/infantry_spearman_e","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/cavalry_spearman_e","units/pers/cavalry_axeman_e","units/pers/cavalry_javelineer_e","units/pers/champion_infantry","units/pers/champion_infantry","units/pers/cavalry_archer_e"];
				
				siege_templates = ["units/pers/champion_elephant","units/pers/siege_ram"];
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
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
	}	
	else if (this.groundAttackCounter == 1)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
	}
	else if (this.groundAttackCounter == 2)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	}
	else if (this.groundAttackCounter == 3)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
	}
	else if (this.groundAttackCounter == 4)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");
	}
	else if (this.groundAttackCounter == 5)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");
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


Trigger.prototype.IntervalSpawnAttackShip = function(data)
{
	//warn("spawning attack ship");
	
	let p = 5;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length == 0)
		return;
		
	let ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Ship").filter(TriggerHelper.IsInWorld);
	
	let ships_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Warship").filter(TriggerHelper.IsInWorld);
			
	let docks_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Dock").filter(TriggerHelper.IsInWorld);
			
	
	if (ships_pl1.length > 0 || docks_pl1.length > 0)
	{
		let ship_template = "units/maur/ship_bireme";
		let garrison_size = 8;
		
		if (Math.random() < 0.33)
		{
			ship_template = "units/maur/ship_trireme";
			garrison_size = 10;
		}
		
		let ship_spawned = TriggerHelper.SpawnUnits(pickRandom(docks), ship_template, 1, p);
	
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/maur/champion_infantry_maceman",garrison_size,p);
		
		
		
		let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;
			
			//find target
			let target = undefined;
			
			if (ships_pl1.length > 0)
			{
				target = pickRandom(ships_pl1);
			}
			else 
			{
				target = pickRandom(docks_pl1);
			}
			
			cmpUnitAI.Attack(target);
			
		
		}	
				
	}
	
	let next_attack_delay_secs = 180 + Math.floor(Math.random()*30);
	
	this.DoAfterDelay(next_attack_delay_secs * 1000,"IntervalSpawnAttackShip",null);
}

Trigger.prototype.IntervalSpawnPatrolShip = function(data)
{
	let p = 5;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length <= 1)
		return;
		
	let ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Ship").filter(TriggerHelper.IsInWorld);
	
	if (ships.length < 5)
	{
		let ship_template = "units/maur/ship_bireme";
		let garrison_size = 8;
		
		if (Math.random() < 0.25)
		{
			ship_template = "units/maur/ship_trireme";
			garrison_size = 10;
		}
		
		let ship_spawned = TriggerHelper.SpawnUnits(pickRandom(docks), ship_template, 1, p);
	
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/maur/champion_infantry_maceman",garrison_size,p);
		
		let trigger_sites = this.GetTriggerPoints(triggerPointsShipPatrol);

		//this.PatrolOrderList(ship_spawned,p,docks);
		
		let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;
			
			let patrol_sites = null;
			
			if (docks.length >= 2)
			{
				patrol_sites = docks;
			}
			else if (docks.length == 1)
			{
				patrol_sites = [docks[0],trigger_sites[0],trigger_sites[1]];
			}
			
			this.PatrolOrderList(ship_spawned,p,patrol_sites);
		
		}	
				
	}
	
	this.DoAfterDelay(105 * 1000,"IntervalSpawnPatrolShip",null);
}

Trigger.prototype.IntervalSpawnGuards = function(data)
{
	let p = 6;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
		
	
	//compute population limit
	let pop_limit = 150;
	
	//warn("pop limit = "+pop_limit);
	
	//first check our current population
	
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("current pop = "+units.length);
	if (units.length < pop_limit)
	{
		//spawn patrol unit
		
		//decide whether player 2 or player 3
		let allies = [];
		
		for (let a of [2,3])
		{
			let cmpPlayer_a = QueryPlayerIDInterface(a);
			if (cmpPlayer_a.GetState() == "active")
			{
				allies.push(a);
			}
		}
		
		let ally = pickRandom(allies);
		
		//find patrol/spawn sites
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(ally),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (patrol_sites.length > 4)
		{
			
			let inf_templates = ["units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/infantry_archer_e","units/pers/champion_infantry"];
				
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
				
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(inf_templates),1,p);
					
			this.PatrolOrderList(unit_i,p,sites);
		}
		
		
	}
	
	
	this.DoAfterDelay(20 * 1000,"IntervalSpawnGuards",null);
	
	
	
}


Trigger.prototype.SpawnInitialGuards = function(data)
{
	let p = 6;
	

	//decide whether player 2 or player 3
	for (let i = 0; i < 100; i ++)
	{
		let allies = [];
		
		for (let a of [2,3])
		{
			let cmpPlayer_a = QueryPlayerIDInterface(a);
			if (cmpPlayer_a.GetState() == "active")
			{
					allies.push(a);
			}
		}
		
		let ally = pickRandom(allies);
		
		//find patrol/spawn sites
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(ally),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (patrol_sites.length > 4)
		{
			
			let inf_templates = ["units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/infantry_archer_e","units/pers/champion_infantry","units/pers/infantry_spearman_e"];
				
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
				
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(inf_templates),1,p);
					
			this.PatrolOrderList(unit_i,p,sites);
		}
		
		
	}
}


Trigger.prototype.SpawnTraders = function(data)
{
	let e = 2;
	
	let cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	//make list of own markets
	let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Market").filter(TriggerHelper.IsInWorld);
		
	for (let i = 0; i < 20; i ++)
	{
		let spawn_market = pickRandom(markets);
		let target_market = spawn_market;
		while (target_market == spawn_market)
		{
			target_market = pickRandom(markets);
		}
		
		let trader = TriggerHelper.SpawnUnits(spawn_market, "units/maur/support_trader", 1, e);
		let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
		cmpUnitAI.UpdateWorkOrders("Trade");
		cmpUnitAI.SetupTradeRoute(target_market,spawn_market,null,true);
				
			
			
		
	}
}


Trigger.prototype.SpawnDesertRaiders = function(data)
{
	
	let p = 5;
	
	//check if we have structure
	let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	

	for (let i = 0; i < 90; i ++)
	{
		let templates = ["units/pers/champion_infantry", "units/pers/infantry_archer_e", "units/pers/infantry_javelinist_e", "units/pers/kardakes_hoplite"];
		
		//pick patrol sites
		let sites = [pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
	}
	
}




Trigger.prototype.RangeActionTemple = function(data)
{
	if (this.questTempleGiven == false && this.questTempleComplete == false)
	{
		//check if player 5 has units left
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Unit").filter(TriggerHelper.IsInWorld);
		
		if (units.length == 0)
		{
			//complete quest
			this.QuestTempleComplete();
			
		}
		else
		{
			//give quest
			this.questTempleGiven = true;
			
			this.ShowText("You encounter a small monastery. The monks welcome you and promise to help you if you defeat the dessert raiders who have been harassing them for weeks now.\n\nNote: you only need to kill all units (not structures) to consider this task complete. Come back here once the task is done.","We'll see what we can.","OK");
		}
	}
	else if (this.questTempleComplete == false)
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Unit").filter(TriggerHelper.IsInWorld);
		
		if (units.length == 0)
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
	
		if (data.cmd.answer == "button1")
		{
			//subtract resources
			let cmpPlayer = QueryPlayerIDInterface(1);
			//warn(uneval(this.mercOffer));
			cmpPlayer.AddResource("food",-1*this.mercOffer.total_cost_food);
			cmpPlayer.AddResource("stone",-1*this.mercOffer.total_cost_stone);
			cmpPlayer.AddResource("metal",-1*this.mercOffer.total_cost_metal);
		
			
			//spawm mercs
			
			let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Barracks").filter(TriggerHelper.IsInWorld);
			
			if (sites.length == 0)
			{
				return;
			}
			
			let spawn_site = sites[0];
	
			let units = TriggerHelper.SpawnUnits(spawn_site,this.mercOffer.template,this.mercOffer.size,1);
	
			//warn("spawned mercs");
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
	}
		
}

Trigger.prototype.RangeActionMercs = function(data)
{
	warn("range action triggered");
	warn(uneval(data));

	if (this.mercsAvailable == true && data.added.length > 0)
	{
		let sizes = [5,10];
		let templates = ["units/pers/champion_cavalry_archer","units/pers/cavalry_archer_e","units/maur/champion_chariot"];
		
		let costs_stone = [50,75,100];
		let costs_food = [25,50,75];
		let costs_metal = [10,20,30];
		
		//decide on offer
		let offer_size = pickRandom(sizes);
		let offer_cost_stone = pickRandom(costs_stone);
		let offer_cost_food = pickRandom(costs_food);
		let offer_cost_metal = pickRandom(costs_metal);
		let template = pickRandom(templates);
		
		let total_cost_stone = offer_size*offer_cost_stone;
		let total_cost_food = offer_size*offer_cost_food;
		let total_cost_metal = offer_size*offer_cost_metal;
		
		//check if the player has enough
		let cmpPlayer = QueryPlayerIDInterface(1);
		let resources = cmpPlayer.GetResourceCounts();
		
		if (resources.food > total_cost_food && resources.stone > total_cost_stone && resources.metal > total_cost_metal)
		{
		
			//save offer information
			this.mercOffer.size = offer_size;
			this.mercOffer.total_cost_stone = total_cost_stone;
			this.mercOffer.total_cost_food = total_cost_food;
			this.mercOffer.total_cost_metal = total_cost_metal;
			this.mercOffer.template = template;
			
		
			let offer_text = "You encounter a small camp used by local mercenaries. There are currently "+(offer_size)+" mounted archers available for a total price of "+(total_cost_food)+" food, "+(total_cost_stone)+" stone, and "+(total_cost_metal)+" metal. Would you be willing to hire them?";
		
			this.ShowText(offer_text,"Yes, we need you","Perhaps later");
		
		}
		
		//set the flag to false
		this.mercsAvailable = false;
		
		//schedule next available trade
		this.DoAfterDelay(45 * 1000,"ToggleMercs",null);
	
	}
	
}

Trigger.prototype.RangeActionTeleportA = function(data)
{

	for (let u of data.added)
	{
		//find template
		let id = Engine.QueryInterface(u, IID_Identity);
		
		//warn(uneval(id));
		//warn(uneval(id.template));
		let template = id.template.SelectionGroupName;
		
		//make all citizen soldier templates elite
		if (template == undefined)
		{
			if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
			{
				template = "units/pers/champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/mace/thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/mace/thureophoros";
			}
			
		}
		else if (template == "units/mace/cavalry_javelinist_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace/cavalry_javelineer_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace/cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace/infantry_javelineer_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace/infantry_pikeman_e";
		}
		else if (template == "units/mace/infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
		{
			template = "units/mace/infantry_slinger_e";
		}
		else if (template == "units/mace/champion_infantry_spearman")
		{
			template = "units/mace/champion_infantry_spearman_02";
		}
		
		
		//ok templates : healer
		
		//not ok templates GenericName:"Heavy Skirmisher" -> merc skirmisher
		//  GenericName:"Armored Swordsman" -> merc swordsman
		// GenericName:"Bactrian Heavy Cavalry Archer" -> horese archer
		
		//need to check Rank, can be "Elite", "Advanced"
		
		/*if (template == undefined)
		{
			warn("overriding template");
			template = "units/pers/champion_cavalry_archer";
		}*/
		
		//warn(template);
		
		//kill this unit
		//let health_s = Engine.QueryInterface(u, IID_Health);
		//health_s.Kill();
		Engine.DestroyEntity(u);
		
		let data = {};
		data.site = this.tunnelOutlets[0];
		data.owner = 1;
		data.template = template;
		data.size = 1;
		
		this.DoAfterDelay(10 * 1000,"SpawnUnit",data);
	
		
		//spawn the same template somewhere else
		//let unit_i = TriggerHelper.SpawnUnits(this.tunnelOutlets[0],template,1,1);
		
	}
	
}

/* Random maps:
 * 	India - lake in middle, mostly dry empty
 *  Kerala - sea on one side, green
 *  Ratumacos - windy river
 *  Field of Meroe -- one straight river on the side, need to get rid of african animalsn
 *  Belgian Uplands -- need to add india trees, has 2 tiny lakes
 * 
 * Skirmish:
 *  Deccan Plateau (2)
 *  Gambia River (3) rivers and desert
 *  Golden Island (2) -- island surround by river
 *  Two Seas (6) big but symmetrical
 *  Punjab (2)
 * 
 */


{
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants (that may change)
	
	
	//some state variables
	cmpTrigger.groundAttackCounter = 0;
	cmpTrigger.mercsAvailable = true;
	cmpTrigger.mercOffer = {};
	

	
	//start techs
	cmpTrigger.DoAfterDelay(2 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	//spawn initial patrols
	
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInitialGuards",null);

	
	//start patrol spawns
	cmpTrigger.DoAfterDelay(120 * 1000,"IntervalSpawnPatrolShip",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"IntervalSpawnGuards",null);
	
	
	//every 30 seconds, check for civil centres
	cmpTrigger.DoAfterDelay(30 * 1000,"CheckForCC",null);
	
	
	//debug
	//cmpTrigger.DoAfterDelay(20 * 1000,"QuestTempleComplete",null);
	
	//start traders
	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTraders",null);
	
	//victory check
	cmpTrigger.DoAfterDelay(6 * 1000,"VictoryCheck",null);
	
	//disable templates
	
	//disable templates
	for (let p of [1,2,3,4,5,6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build docks or civil centre
		
		
		//let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		let disTemplates = [];
			
		if (p == 1)
		{
			//disTemplates = disTemplates.concat(["units/mace/hero_alexander_iii","units/mace/hero_craterus","units/mace/hero_philip_ii","units/mace/hero_demetrius","units/mace/hero_pyrhus"]);
			//cmpPlayer.SetDisabledTemplates(disTemplates);
		}
		else if (p == 4 || p == 5 || p == 6)
		{
			disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
			cmpPlayer.SetDisabledTemplates(disTemplates);
		}
		
		
		
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
	for (let p of [4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//neutral towards all
		for (let p_other of [1,2,3])
		{
			cmpPlayer.SetNeutral(p_other);
			
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}
	
	//triggers
	let data = { "enabled": true };
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionMercs", {
		"entities": cmpTrigger.GetTriggerPoints("J"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
