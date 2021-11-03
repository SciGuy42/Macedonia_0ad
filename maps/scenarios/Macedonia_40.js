warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "B";
var triggerPointsGiftUnit = "J";
var triggerPointsPatrol = "K";

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
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Shoreline
	"structures/brit_crannog"
];

var disabledTemplatesDocksCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Shoreline
	"structures/" + civ + "_dock",
	"structures/brit_crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse"
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

		let targetDistance = DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}
	
	return closestTarget;
}

Trigger.prototype.SpawnAttackSquad = function(p,site,templates,size,target_class,target_player)
{
	
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
			"x": targetPos.x-10.0+(Math.random()*20),
			"z": targetPos.y-10.0+(Math.random()*20),
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
	for (let p of [1,2,4,5])
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
		let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
		
		let inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of inf_units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
						
					//pick patrol sites
					let sites = [pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites)];

					this.PatrolOrderList([u],p,sites);
				}
			}
		}
	}
	
	//assault forces
	for (let p of [2])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
		
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					
					let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];

					this.PatrolOrderList([u],p,sites);
				}
			}
		}
		
	}
	
	this.DoAfterDelay(30 * 1000,"IdleUnitCheck",null);

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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur_champion_infantry",5,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur_champion_infantry",20,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}


	/*for (let p of [1])
	{
		let owner = 3;
		let turrets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of turrets)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",2,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",10,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
	}*/

	//nanda garrison
	/*for (let p of [8])
	{
		let owner = p; //all garrison are player 8
		
		//fortresses
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers_arstibara",20,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//stone towers
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers_arstibara",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//wall towers
		//wall tower
		let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		for (let e of towers_w)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_arstibara",2,owner);
				
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
	}*/
	
	
}	


 
Trigger.prototype.VictoryCheck = function(data)
{
	
	
	//check how many structures player 2 has
	let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Structure").filter(TriggerHelper.IsInWorld);
	
	//warn("found "+uneval(structs.length) + " structs");
	
	if (structs.length == 0)
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
	if (data.from == 5 && data.to == -1)
	{
		this.numBanditsKilled += 1;
		
		if (this.numBanditsKilled == 5)
		{
			//spawn cavalry attack
			let size = 45;
			let templates = ["units/pers_cavalry_swordsman_e","units/pers_cavalry_spearman_e","units/pers_cavalry_javelinist_e"];
			
			let spawn_sites = this.GetTriggerPoints("J");
			
			for (let i = 0; i < size; i ++)
			{
				let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,5);
		
				let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
				if (cmpUnitAI)
				{
					cmpUnitAI.SwitchToStance("violent");
					
					//find target
					let target = this.FindClosestTarget(unit_i[0],1,"Unit");
					var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
				
					cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
				}
				
			}
			
		}
	}
	
	//check if workshop
	if (data.entity == 7261)
	{
		//spawn some siege
		let unit_i = TriggerHelper.SpawnUnits(data.entity,"units/maur_mechanical_siege_ram",4,1);
			
	}
	
	//if we killed gaia infrantry
	if (data.from == 0 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Infantry") >= 0)
		{
			//warn("gaia attacks");
			
			//get all gaia units and make them attack
			let units_infantry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Infantry").filter(TriggerHelper.IsInWorld);
			
			for (let u of units_infantry)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						this.WalkAndFightClosestTarget(u,1,unitTargetClass);
					}
				}
			}
		}
		
	}
	
	
	//check if temple is captured before quest completed
	if (data.from == 0 && data.to == 1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Temple") >= 0 && this.questTempleComplete == false)
		{
			let health_s = Engine.QueryInterface(data.entity, IID_Health);
			health_s.Kill();
		}
		
	}
	
	/*if (data.entity == 5896) //brit tower, used as debug trigger
	{
		this.LevelAdvance();
	}*/
	
	
	//warn(uneval(data));
	//check if we killed gaia infantry
	/*if (data.from == 0 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Infantry") >= 0)
		{
			warn("gaia attacks");
			
			//get all gaia units and make them attack
			let units_infantry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Infantry").filter(TriggerHelper.IsInWorld);
			
			for (let u of units_infantry)
			{
				this.WalkAndFightClosestTarget(u,1,unitTargetClass);
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
		
		//visibility bonus
		cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
		
		//just to make cavalry faster
		cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");	
		cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
		
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		
		//skirmishers especially powerful
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");

			
		cmpTechnologyManager.ResearchTechnology("armor_hero_01");
		cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");	
		
		//trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");	
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");	
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");	
	}
	
	for (let p of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//visibility bonus
		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
		
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		
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

Trigger.prototype.IntervalSpawnGuards = function(data)
{
	let p = 2;
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
		
	
	//compute population limit based on what structures we have
	let barracks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Barracks").filter(TriggerHelper.IsInWorld);
	
	let ele_stables = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"ElephantStables").filter(TriggerHelper.IsInWorld);
	
	let temples = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Temple").filter(TriggerHelper.IsInWorld);
	
	let towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"DefenseTower").filter(TriggerHelper.IsInWorld);
	
	let forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
	
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Trader").filter(TriggerHelper.IsInWorld);
	
	//warn(uneval(barracks.length)+"\t"+uneval(temples.length)+"\t"+uneval(ele_stables.length)+"\t"+uneval(towers.length)+"\t"+uneval(forts.length));
	
	let pop_limit = 75 + barracks.length*20 + ele_stables.length*25+towers.length*3+forts.length*20;
	
	//warn("pop limit = "+pop_limit);
	
	//first check our current population
	
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	//warn("current pop = "+units.length);
	if (units.length < pop_limit)
	{
		let spawn_sites = towers.concat(forts);
		
		//generate list of patrol sites
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (spawn_sites.length < 0)
		{
			warn("no spawn sites, must be dead");
			return;
		}
		
		//how many infantry to spawn
		let spawn_size = 10 + barracks.length + ele_stables.length*3 + Math.round(traders.length/2);
		
		//warn("inf spawn size = "+spawn_size);
		
		let inf_templates = ["units/maur_champion_infantry","units/maur_infantry_spearman_e","units/maur_infantry_swordsman_e","units/maur_champion_maiden","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_maiden_archer"];
		for (let i = 0; i < spawn_size; i ++)
		{
		
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(spawn_sites)];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(inf_templates),1,p);
				
			this.PatrolOrderList(unit_i,p,sites);
		}
		
		//spawn healers
		let num_healers = temples.length*3;
		for (let i = 0; i < num_healers; i ++)
		{
		
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(spawn_sites)];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),"units/maur_support_healer_e",1,p);
				
			this.PatrolOrderList(unit_i,p,sites);
		}
		
		//spawn elephants
		let num_elephants = ele_stables.length*3;
		let ele_templates = ["units/maur_champion_elephant","units/maur_elephant_archer_e"];
		for (let i = 0; i < num_elephants; i ++)
		{
		
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(spawn_sites)];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(ele_templates),1,p);
				
			this.PatrolOrderList(unit_i,p,sites);
		}
		
		
	}
	
	
	this.DoAfterDelay(20 * 1000,"IntervalSpawnGuards",null);
	
	
	
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
		
		let trader = TriggerHelper.SpawnUnits(spawn_market,"units/maur_support_trader",1,e);	
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
		let templates = ["units/pers_champion_infantry","units/pers_infantry_archer_e","units/pers_infantry_javelinist_e","units/pers_kardakes_hoplite"];
		
		//pick patrol sites
		let sites = [pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites),pickRandom(spawn_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
	}
	
}




Trigger.prototype.QuestTempleComplete = function(data)
{
	this.questTempleComplete = true;
	
	let temples = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Temple").filter(TriggerHelper.IsInWorld);
	
	//change ownership
	var cmpOwnership = Engine.QueryInterface(temples[0], IID_Ownership);
	cmpOwnership.SetOwner(1);
	
	//show text
	this.ShowText("The monks thank you for your help. Their monastery is at your service.","Thanks!","OK");
		
	
		
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
		else {
			//give quest
			this.questTempleGiven = true;
			
			this.ShowText("You encounter a small monestary. The monks welcome you and promise to help you if you defeat the dessert raiders who have been harassing them for weeks now.\n\nNote: you only need to kill all units (not structures) to consider this task complete. Come back here once the task is done.","We'll see what we can.","OK");
		}
	}
	else if (this.questTempleComplete == false) {
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
				template = "units/pers_champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/mace_thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/mace_thureophoros";
			}
			
		}
		else if (template == "units/mace_cavalry_javelinist_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace_cavalry_javelinist_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace_cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace_infantry_javelinist_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace_infantry_pikeman_e";
		}
		else if (template == "units/mace_infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
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
			template = "units/pers_champion_cavalry_archer";
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


Trigger.prototype.RangeActionTeleportB = function(data)
{

	for (let u of data.added)
	{
		//find template
		let id = Engine.QueryInterface(u, IID_Identity);
		let template = id.template.SelectionGroupName;

		
		//make all citizen soldier templates elite
		if (template == undefined)
		{
			if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
			{
				template = "units/pers_champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/mace_thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/mace_thureophoros";
			}
			
		}
		else if (template == "units/mace_cavalry_javelinist_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace_cavalry_javelinist_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace_cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace_infantry_javelinist_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace_infantry_pikeman_e";
		}
		else if (template == "units/mace_infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
		{
			template = "units/mace/infantry_slinger_e";
		}
		else if (template == "units/mace/champion_infantry_spearman")
		{
			template = "units/mace/champion_infantry_spearman_02";
		}
		
		
		//kill this unit
		//let health_s = Engine.QueryInterface(u, IID_Health);
		//health_s.Kill();
		Engine.DestroyEntity(u);
		
		let data = {};
		data.site = this.tunnelOutlets[1];
		data.owner = 1;
		data.template = template;
		data.size = 1;
		
		this.DoAfterDelay(10 * 1000,"SpawnUnit",data);
	
	}
}

Trigger.prototype.RangeActionTeleportC = function(data)
{

	for (let u of data.added)
	{
		//find template
		let id = Engine.QueryInterface(u, IID_Identity);
		let template = id.template.SelectionGroupName;

		
		//make all citizen soldier templates elite
		if (template == undefined)
		{
			if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
			{
				template = "units/pers_champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/mace_thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/mace_thureophoros";
			}
			
		}
		else if (template == "units/mace_cavalry_javelinist_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace_cavalry_javelinist_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace_cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace_infantry_javelinist_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace_infantry_pikeman_e";
		}
		else if (template == "units/mace_infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
		{
			template = "units/mace/infantry_slinger_e";
		}
		else if (template == "units/mace/champion_infantry_spearman")
		{
			template = "units/mace/champion_infantry_spearman_02";
		}
		
		//kill this unit
		//let health_s = Engine.QueryInterface(u, IID_Health);
		//health_s.Kill();
		Engine.DestroyEntity(u);
		
		let data = {};
		data.site = this.tunnelOutlets[2];
		data.owner = 1;
		data.template = template;
		data.size = 1;
		
		this.DoAfterDelay(10 * 1000,"SpawnUnit",data);
	
	}
}

Trigger.prototype.RangeActionTeleportD = function(data)
{

	for (let u of data.added)
	{
		//find template
		let id = Engine.QueryInterface(u, IID_Identity);
		let template = id.template.SelectionGroupName;

		
		//make all citizen soldier templates elite
		if (template == undefined)
		{
			if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
			{
				template = "units/pers_champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/mace_thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/mace_thureophoros";
			}
			
		}
		else if (template == "units/mace_cavalry_javelinist_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace_cavalry_javelinist_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace_cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace_infantry_javelinist_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace_infantry_pikeman_e";
		}
		else if (template == "units/mace_infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
		{
			template = "units/mace/infantry_slinger_e";
		}
		else if (template == "units/mace/champion_infantry_spearman")
		{
			template = "units/mace/champion_infantry_spearman_02";
		}
		
		//kill this unit
		//let health_s = Engine.QueryInterface(u, IID_Health);
		//health_s.Kill();
		Engine.DestroyEntity(u);
		
		let data = {};
		data.site = this.tunnelOutlets[3];
		data.owner = 1;
		data.template = template;
		data.size = 1;
		
		this.DoAfterDelay(10 * 1000,"SpawnUnit",data);
	
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
	
	
	//state variables
	cmpTrigger.questTempleGiven = false;
	cmpTrigger.questTempleComplete = false;
	cmpTrigger.numBanditsKilled = 0;

	
	//decide on tunnel outlets
	let houses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"House").filter(TriggerHelper.IsInWorld);
	
	cmpTrigger.tunnelOutlets = [];
	for (let i = 0; i < 4; i ++)
	{
		cmpTrigger.tunnelOutlets.push(pickRandom(houses));
	}
	
	//warn("outlets: "+uneval(cmpTrigger.tunnelOutlets));
		
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	
	//start patrol spawns
	cmpTrigger.DoAfterDelay(3 * 1000,"SpawnDesertRaiders",null);
	
	cmpTrigger.DoAfterDelay(2 * 1000,"IntervalSpawnGuards",null);
	
	
	
	//debug
	//cmpTrigger.DoAfterDelay(20 * 1000,"QuestTempleComplete",null);
	
	//start traders
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTraders",null);
	
	//victory check
	cmpTrigger.DoAfterDelay(6 * 1000,"VictoryCheck",null);
	
	//disable templates
	
	//disable templates
	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build docks or civil centre
		
		
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv())
			
		if (p == 1)
		{
			disTemplates = disTemplates.concat(["units/mace_hero_alexander","units/mace_hero_craterus","units/mace/hero_philip_ii","units/mace_hero_demetrius","units/mace_hero_pyrhus"]);
			
			
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		
		//add some tech
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		//no pop limit
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	//diplomacy
	for (let p of [1])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//neutral towards player 3 and 4
		for (let p_other of [3,4])
		{
			cmpPlayer.SetNeutral(p_other);
			
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}
	
	//triggers
	let data = { "enabled": true };
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 15,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportA", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportB", {
		"entities": cmpTrigger.GetTriggerPoints("B"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportC", {
		"entities": cmpTrigger.GetTriggerPoints("C"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportD", {
		"entities": cmpTrigger.GetTriggerPoints("D"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	//cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalSpawnGoats", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 45 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 30 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
