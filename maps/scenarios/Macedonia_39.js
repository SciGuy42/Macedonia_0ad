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
	for (let p of [4])
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



Trigger.prototype.ResearchFinishedAction = function(data)
{
	//warn("The OnResearchFinished event happened with the following data:");
	//warn(uneval(data));
	
	if (data.player == 1)
	{
		if (data.tech != "phase_town_generic" && data.tech != "phase_city_generic")
		{
			let cmpPlayer = QueryPlayerIDInterface(3);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology(data.tech);
			
			//warn("Researching tech for ally");
		}
		
	}
};

Trigger.prototype.IdleUnitCheck = function(data)
{
	//warn("idle unit check");
	
	//colony militia
	for (let p of [3])
	{
		
		let inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of inf_units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					let trigger_sites = this.GetTriggerPoints(triggerPointsPatrol);
		
					//pick patrol sites
					let sites = [pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites)];

						
					this.PatrolOrderList([u],p,sites);
				}
			}
		}
	}
	
	//assault forces
	for (let p of [2])
	{
		let units = [];
		let inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let ele_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);
		
		units = units.concat(inf_units);
		units = units.concat(cav_units);
		units = units.concat(ele_units);
		
		for (let u of inf_units)
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
	
	this.DoAfterDelay(30 * 1000,"IdleUnitCheck",null);

}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (let p of [2])
	{
		let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		
		let tower = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4),"StoneTower").filter(TriggerHelper.IsInWorld)[0];
		
		for (let a of units)
		{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(tower,true);
		}
	}
	
	for (let p of [3])
	{
		let outposts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
		
		for (let c of outposts)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen_champion_ranged",1,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
	}


	for (let p of [1])
	{
		let owner = 3;
		let turrets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of turrets)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen_champion_ranged",2,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen_champion_ranged",10,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
	}

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


 
Trigger.prototype.SpawnInterevalPatrol = function(data)
{
	
	let p = 3;
	
	//check if we have structure
	let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
	
	if (spawn_sites.length == 0)
	{
		return;
	}
	
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Archer").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < 30)
	{
		let templates = ["units/athen_champion_ranged"];
	
		let trigger_sites = this.GetTriggerPoints(triggerPointsPatrol);

	
		
		//pick patrol sites
		let sites = [pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
		
		
	}
	
	//repeat
	this.DoAfterDelay(15 * 1000,"SpawnInterevalPatrol",null);
}



Trigger.prototype.SpawnAdvanceAttackSquadInterval = function(data)
{
	//which player
	let p = 6;
	
	//sites 
	let sites = this.GetTriggerPoints(triggerPointsAdvanceAttack);
	
	//templates
	let templates = ["units/maur_infantry_archer_a","units/maur_infantry_archer_b","units/maur_infantry_spearman_a","units/maur_infantry_spearman_b","units/maur_infantry_spearman_b","units/maur_infantry_swordsman_b","units/maur_infantry_swordsman_a","units/maur_infantry_swordsman_e","units/maur_infantry_spearman_e"];
	
	//how many
	let size = 1;
	while (Math.random() > this.advanceAttackStickBreakProb)
	{
		size = size + 1;
	}
	
	//warn("attack size = "+uneval(size));
	let attackers = [];	
	for (let i = 0; i < size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//make them attack
	let target_player = 3;
	
	//TODO: send to player 1 if player 3 has no structures
	
	let target = this.FindClosestTarget(attackers[0],target_player,"Structure");
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
	
	
	//decays
	this.advanceAttackStickBreakProb = this.advanceAttackStickBreakProb * this.advanceAttackStickBreakProbDecay;
	this.advanceAttackInterval = this.advanceAttackInterval * this.advanceAttackIntervalDecay;
	//warn(uneval(this.advanceAttackStickBreakProb) +"\t"+uneval(this.advanceAttackInterval))
	
	//increment level
	//warn("level = "+uneval(this.advanceAttackLevel));
	this.advanceAttackLevel = this.advanceAttackLevel + 1;
	
	//repeat
	if (this.advanceAttackLevel < this.advanceAttackMaxLevel)
	{
		let next_time = Math.round(this.advanceAttackInterval * 1000);
		//warn("spawning again in "+uneval(next_time));
		this.DoAfterDelay(next_time,"SpawnAdvanceAttackSquadInterval",null);
	}
	else  //if we run out of levels, main attack starts
	{
		//warn("advance attack done, main attack starts");
		this.eventAdvanceAttackEnded = true;
		this.StartMainAttack();
	}
	
}


Trigger.prototype.VictoryCheck = function(data)
{
	
	
	//check how many units player 2 has
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("found "+uneval(units.length) + " units");
	
	if (units.length == 0)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
		
	}
	else
	{
		this.DoAfterDelay(20 * 1000,"VictoryCheck",null);
	}
	
}



Trigger.prototype.SpawnMainAttackInterval = function(data)
{
	//which player 
	let p = 2;
	
	//templates
	let templates = ["units/maur_champion_infantry","units/maur_champion_maiden","units/maur_champion_maiden_archer","units/maur_elephant_archer_e","units/maur_infantry_swordsman_e","units/maur_infantry_spearman_e","units/maur_infantry_swordsman_e","units/maur_champion_elephant"];
	
	//sites 
	let sites = this.GetTriggerPoints(triggerPointsMainAttack);
	
	//spawn siege with certain probability
	let siege_prob = 0.05 * Math.pow(1.075,this.mainAttackLevel);
	if (siege_prob > 0.75)
		siege_prob = 0.75;
	//warn("siege prob = "+uneval(siege_prob));
		
	
	//for each squad
	for (let i = 0; i < Math.round(this.mainAttackNumSquads)+2; i ++)
	{
		let size = Math.round(this.mainAttackSquadSize)+2;
		
		//spawn squad
		let site_i = pickRandom(sites);
		this.SpawnAttackSquad(p,site_i,templates,size,"Structure",1);
		
		
		if (Math.random() < siege_prob)
		{
			//warn("spawning ram");
			let unit_i = TriggerHelper.SpawnUnits(site_i,"units/maur_mechanical_siege_ram",1,p);
		
			let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				//find closest strucure
				let target = this.FindClosestTarget(unit_i[0],1,"Structure");
				if (target)
				{
					//warn("sending elephant to attack structure");
					cmpUnitAI.Attack(target,false);
				}
				else
				{
					this.WalkAndFightClosestTarget(unit_i[0],1,unitTargetClass);
				}
			}
		}
		
		
		//spawn elephant specifically to attack building
		if (Math.random() < 0.75)
		{
			//spawning extra elephant
			//warn("spawning elephant");
			let unit_i = TriggerHelper.SpawnUnits(site_i,"units/maur_champion_elephant",1,p);
		
			let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				//find closest strucure
				let target = this.FindClosestTarget(unit_i[0],1,"Structure");
				if (target)
				{
					//warn("sending elephant to attack structure");
					cmpUnitAI.Attack(target,false);
				}
				else
				{
					this.WalkAndFightClosestTarget(unit_i[0],1,unitTargetClass);
				}
			}
			
		}
	}
	
	//process decays and increment level
	this.mainAttackInterval = this.mainAttackInterval * this.mainAttackIntervalDecay;
	this.mainAttackSquadSize = this.mainAttackSquadSize * this.mainAttackSquadSizeIncrease;
	this.mainAttackNumSquads = this.mainAttackNumSquads * this.mainAttackNumSquadsIncrease;
	
	
	//warn("main level = "+uneval(this.mainAttackLevel));
	this.mainAttackLevel = this.mainAttackLevel + 1;
	
	
	//check whether to start macedonian cavalry attack
	IID_StatisticsTracker
	
	let cmpPlayer = QueryPlayerIDInterface(p);
	let cmpStatsTracker = Engine.QueryInterface(cmpPlayer.entity, IID_StatisticsTracker);
	let units_lost = cmpStatsTracker.unitsLost.total;
	
	//warn("units lost = "+uneval(units_lost));
		
		
	if (units_lost > 1200) 
	{
		this.StartMaceAttack();
	}
		
	
	//repeat if macedonian attack hasn't started yet
	if (this.eventMacedonianCavalryArrived == false)
	{
		let next_time = Math.round(this.mainAttackInterval * 1000);
		//warn("spawning main attack again in "+uneval(next_time));
		this.DoAfterDelay(next_time,"SpawnMainAttackInterval",null);
	}
	else 
	{
		this.eventMainAttackEnded = true;
		//warn("end attacks");
	}
	
	
	
	/*if (this.mainAttackLevel < this.mainAttackMaxLevel)
	{
		let next_time = Math.round(this.mainAttackInterval * 1000);
		warn("spawning main attack again in "+uneval(next_time));
		this.DoAfterDelay(next_time,"SpawnMainAttackInterval",null);
	}
	else  //if we run out of levels, main attack starts
	{
		warn("main attack done");
		this.eventMainAttackEnded = true;
		this.eventMacedonianCavalryArrived = true;
	}*/
}



Trigger.prototype.OwnershipChangedAction = function(data)
{
	
	
	
	/*if (data.entity == 5896) //brit tower, used as debug trigger
	{
		this.LevelAdvance();
	}*/
	
	
	//warn(uneval(data));
	//check if we killed gaia infantry
	if (data.from == 0 && data.to == -1)
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
		
	}
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
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
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
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}


Trigger.prototype.SpawnInfantryWave = function(data)
{
	//get data
	let trigger_sites = data.trigger_sites;
	let templates = data.templates;
	let size = data.size; 
	let p = data.p;
	let target_player = data.target_player;
	
	//collect spawn sites
	let spawn_sites = [];
	for (let t_site of trigger_sites)
	{
		let spawn_sites_t = this.GetTriggerPoints(t_site);
		spawn_sites = spawn_sites.concat(spawn_sites_t);
	}
	
	//start spawning
	for (let i = 0; i < size; i ++)
	{		
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
		
		let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			cmpUnitAI.SwitchToStance("violent");
			
			//find target
			let target = this.FindRandomTarget(unit_i[0],target_player,"Structure");
			var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
			cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
		}
	}
}


Trigger.prototype.SpawnSiegeWave = function(data)
{
	//get data
	let trigger_sites = data.trigger_sites;
	let templates = data.templates;
	let size = data.size; 
	let p = data.p;
	let target_player = data.target_player;
	
	//collect spawn sites
	let spawn_sites = [];
	for (let t_site of trigger_sites)
	{
		let spawn_sites_t = this.GetTriggerPoints(t_site);
		spawn_sites = spawn_sites.concat(spawn_sites_t);
	}
	
	//start spawning
	for (let i = 0; i < size; i ++)
	{		
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
		
		let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			cmpUnitAI.SwitchToStance("violent");
			
			//find target
			let target = this.FindClosestTarget(unit_i[0],target_player,"Structure");
			cmpUnitAI.Attack(target);
		}
	}
}


Trigger.prototype.LevelAdvance = function(data)
{
	//warn("starting level "+uneval(this.currentLevel));
	
	//dialogs
	if (this.currentLevel == 1)
	{
		this.ShowText("The first rebel army is approaching! Prepare for battle!","We're ready!","Oh NO!");
	}
	else if (this.currentLevel == 2)
	{
		this.ShowText("The second rebel army is approaching! Prepare for battle! We need to defeat them all!","We're ready!","Oh NO!");
	}
	
	//give player 1 some tech
	if (this.currentLevel == 1)
	{
		let cmpPlayer1 = QueryPlayerIDInterface(1);
		let cmpTechnologyManager1 = Engine.QueryInterface(cmpPlayer1.entity, IID_TechnologyManager);
		
		cmpTechnologyManager1.ResearchTechnology("mauryans/special_archery_tradition");
		cmpTechnologyManager1.ResearchTechnology("siege_bolt_accuracy");
		cmpTechnologyManager1.ResearchTechnology("siege_bolt_accuracy");
		cmpTechnologyManager1.ResearchTechnology("siege_attack");
		
		//start idle unit check
		this.DoAfterDelay(30 * 1000,"IdleUnitCheck",null);
	}
	
	
	
	//step 0:  determine constants based on level
	let wave_size_series = [60,80,85,110];
	let wave_cav_size_series = [0,22,25,40];
	let num_wave_series = [3,7,8,6];
	let num_cav_wave_series = [0,4,5,7];
	let num_siege_wave_series = [2,6,7,5];
	let siege_size_series = [8,10,12,14];
	
	//step 1: research some techs if needed
	let cmpPlayer = QueryPlayerIDInterface(2);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	if (this.currentLevel == 2)
	{
		//add armor
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
		
		cmpTechnologyManager.ResearchTechnology("siege_armor");
		cmpTechnologyManager.ResearchTechnology("siege_attack");
		cmpTechnologyManager.ResearchTechnology("siege_bolt_accuracy");
	}
	else if (this.currentLevel == 3)
	{

		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
	}
	/*else if (this.currentLevel == 4)
	{
		cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
		cmpTechnologyManager.ResearchTechnology("mauryans/special_archery_tradition");
	}*/
	
	//step 2: decide on templates
	let siege_templates = [];
	let wave_templates = [];
	let squad_templates = [];
	
	let cav_templates = ["units/maur_cavalry_javelinist_e","units/maur_champion_chariot","units/maur_cavalry_swordsman_e","units/maur_cavalry_swordsman_e","units/maur_cavalry_swordsman_e"];
	
	if (this.currentLevel == 1)
	{
		squad_templates = ["units/maur_infantry_spearman_a","units/maur_infantry_spearman_a","units/maur_infantry_swordsman_a","units/maur_infantry_swordsman_a","units/maur_infantry_archer_a"];
		wave_templates = squad_templates;
		siege_templates = ["units/maur_champion_elephant"];
	}
	else if (this.currentLevel == 2)
	{
		squad_templates = ["units/maur_infantry_spearman_e","units/maur_infantry_spearman_e","units/maur_infantry_swordsman_e","units/maur_infantry_swordsman_e","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_infantry","units/maur_elephant_archer_e","units/maur_cavalry_javelinist_e"];
		wave_templates = squad_templates;
		siege_templates = ["units/maur_champion_elephant","units/maur_champion_elephant","units/mace_mechanical_siege_oxybeles_packed"];
		
	}
	else if (this.currentLevel == 3)
	{
		squad_templates = ["units/maur_champion_infantry","units/maur_infantry_spearman_e","units/maur_infantry_swordsman_e","units/maur_champion_maiden","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_infantry","units/maur_champion_maiden_archer","units/maur_elephant_archer_e","units/maur_champion_elephant","units/maur_cavalry_javelinist_e","units/maur_cavalry_swordsman_e"];
		wave_templates = squad_templates;
		siege_templates = ["units/maur_champion_elephant","units/mace_mechanical_siege_oxybeles_packed","units/pers_mechanical_siege_ram"];
	}
	else {
		squad_templates = ["units/maur_champion_infantry","units/maur_infantry_spearman_e","units/maur_infantry_swordsman_e","units/maur_champion_maiden","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_infantry","units/maur_champion_maiden_archer","units/maur_elephant_archer_e","units/maur_champion_elephant","units/maur_cavalry_javelinist_e","units/maur_cavalry_swordsman_e","units/maur_champion_chariot","units/maur_champion_chariot"];
		wave_templates = squad_templates;
		siege_templates = ["units/maur_champion_elephant","units/mace_mechanical_siege_oxybeles_packed","units/pers_mechanical_siege_ram","units/mace_mechanical_siege_lithobolos_packed"];
	}
	
	//step 3 -- decide spawn sites
	let spawn_trigger_points = [];
	
	if (this.currentLevel == 1)
	{
		spawn_trigger_points = ["A"];
	}
	else if (this.currentLevel == 2)
	{
		spawn_trigger_points = ["B","A"];
	}
	else if (this.currentLevel == 3)
	{
		spawn_trigger_points = ["C","A","B"];
	}
	else 
	{
		spawn_trigger_points = ["A","B","C"];
	}
	
	let cav_wave_trigger_point = pickRandom(spawn_trigger_points);
	
	//step 4: schedule siege spawns
	let siege_time_delay = 0;
	let siege_wave_interval = 9;
	for (let i = 0; i < num_siege_wave_series[this.currentLevel-1]; i ++)
	{
		let data_siege_i = {};
		data_siege_i.trigger_sites = spawn_trigger_points;
		data_siege_i.templates = siege_templates;
		data_siege_i.size = siege_size_series[this.currentLevel-1];
		data_siege_i.p = 2;
		data_siege_i.target_player = 1;
		
		this.DoAfterDelay( (siege_time_delay + i * siege_wave_interval) * 1000 ,"SpawnSiegeWave",data_siege_i);
	}
	
	//step 5: waves
	let wave_time_delay = 10;
	let wave_interval = 13;
	
	for (let i = 0; i < num_wave_series[this.currentLevel-1]; i ++)
	{
		let data_siege_i = {};
		data_siege_i.trigger_sites = spawn_trigger_points;
		data_siege_i.templates = squad_templates;
		data_siege_i.size = wave_size_series[this.currentLevel-1]+i*4;
		data_siege_i.p = 2;
		data_siege_i.target_player = 1;
		
		this.DoAfterDelay( (wave_time_delay + i * wave_interval) * 1000 ,"SpawnInfantryWave",data_siege_i);
	}
	
	//step 6: some cavalry waves
	let wave_cav_time_delay = 50;
	for (let i = 0; i < num_cav_wave_series[this.currentLevel-1]; i ++)
	{
		let data_cav_i = {};
		data_cav_i.trigger_sites = [cav_wave_trigger_point];
		data_cav_i.templates = cav_templates;
		data_cav_i.size = wave_cav_size_series[this.currentLevel-1]+i*4;
		data_cav_i.p = 2;
		data_cav_i.target_player = 1;
		
		this.DoAfterDelay( (wave_cav_time_delay + i * wave_interval) * 1000 ,"SpawnInfantryWave",data_cav_i);
	}
	
	//step 6: repeat
	if (this.currentLevel < 2)
	{
		
		
		//cmpTrigger.DoAfterDelay((this.levelIntervalSecs) * 1000,"LevelAdvance",null);
		let next_level_time = (300 + (150 * (this.currentLevel))) * 1000;
		//warn("next level advance in: "+uneval(next_level_time));
		this.DoAfterDelay( (300 + (150 * (this.currentLevel))) * 1000,"LevelAdvance",null);
	
		this.currentLevel += 1;
	}
	else {
		//warn("starting victory check");
		this.DoAfterDelay(20 * 1000,"VictoryCheck",null);
	}
	
}



Trigger.prototype.RangeActionGiftUnit = function(data)
{
	
	let p = 3;
	for (let u of data.added)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(p);
		
		//make patrol
		let trigger_sites = this.GetTriggerPoints(triggerPointsPatrol);
		
		//pick patrol sites
		let sites = [pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites)];
			
		this.PatrolOrderList([u],p,sites);
		
	}
	
}

Trigger.prototype.KillCamp = function(data)
{
	let camp = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2),"MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
	
	let health_s = Engine.QueryInterface(camp, IID_Health);
	health_s.Kill();
		
	//let cmpPlayer = QueryPlayerIDInterface(2);
	//cmpPlayer.SetNeutral(4);
	
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
	cmpTrigger.currentLevel = 1;
	cmpTrigger.levelIntervalSecs = 180; //every three minutes
	cmpTrigger.squadsPerLevel = 5; //how many squads get spawned per level
	cmpTrigger.squadSize = 12; //units per squad
	cmpTrigger.siegeSize = 6;
	cmpTrigger.numSiegeWaves = 3;
	cmpTrigger.waveSize = 60;
	cmpTrigger.numWaves = 2;
	
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	//kill player 2 camp
	cmpTrigger.DoAfterDelay(6 * 1000,"KillCamp",null);
	
	//start patrol spawns
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnInterevalPatrol",null);
	
	
	//first wave starts 18 minutes in
	cmpTrigger.DoAfterDelay(18 * 60 * 1000,"LevelAdvance",null);
	
	//debug
	//cmpTrigger.DoAfterDelay(20 * 1000,"VictoryCheck",null);
	
	//start traders
	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTraders",null);
	
	//victory check
	//cmpTrigger.DoAfterDelay(20 * 1000,"VictoryCheck",null);
	
	//disable templates
	for (let p of [1,2,3,4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build docks or civil centre
		
		if (p == 2 || p == 3 || p == 3)
		{
			
			let disTemplates = disabledTemplates(cmpPlayer.GetCiv())
			cmpPlayer.SetDisabledTemplates(disTemplates);
			
		}
		
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
	for (let p of [1,2,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		if (p != 2)
			cmpPlayer.SetNeutral(4);
		else
			cmpPlayer.SetAlly(4);
		
		
		let cmpPlayer_traders = QueryPlayerIDInterface(4);
		if (p != 2)
			cmpPlayer_traders.SetNeutral(p);
		else 
			cmpPlayer_traders.SetAlly(p);
	}
	
	
	
	//triggers
	let data = { "enabled": true };
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionGiftUnit", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsGiftUnit), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
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
