warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsInner = "A";
var triggerPointsOuter = "B";
var triggerPointsRandevouz = "C";
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
	"structures/brit/crannog",
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
	for (let p of [1,2,3])
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
	
	for (let p of [2])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		//sites
		let sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
		let sites_inner = this.GetTriggerPoints(triggerPointsInner);
		let sites_outer = this.GetTriggerPoints(triggerPointsOuter);
	
	
		if (sites_p2.length >= 3)
		{
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						
						let sites = [pickRandom(sites_outer),pickRandom(sites_inner),pickRandom(sites_outer)];
						
						this.PatrolOrderList([u],p,sites);
											
					}
				}
			}
		}
	}
	
	if (this.eventRandevouz == true)
	{
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
						warn("Found idle pl 3 unit");
						this.WalkAndFightClosestTarget(u,2,unitTargetClass);	
					}
				}
			}
		}
	}
}



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	//ptolemy camp
	for (let p of [3])
	{
		//outposts
		let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
			
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/mace/champion_infantry_spearman",1,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
	//main enemy
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
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/maur_champion_infantry",20,p);
				
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
			let archers_e = TriggerHelper.SpawnUnits(e, "units/maur_champion_infantry",3,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
	}
}	


Trigger.prototype.FlipAssets = function(data)
{
	//get all structures except docks
	let structures_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Structure+!Outpost");
	
	for (let u of structures_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	//get all units
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Unit").filter(TriggerHelper.IsInWorld);
	
	for (let u of units_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	//set neutral so we don't try ot retreat
	let cmpPlayer3 = QueryPlayerIDInterface(3);
	cmpPlayer3.SetNeutral(1);	
}

 
 
 
Trigger.prototype.SpawnInterevalPatrol = function(data)
{
	//fortress 1 
	let p = 2;
	
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < this.maxPatrol)
	{
		let templates_p2 = ["units/maur_champion_infantry","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_maiden_archer","units/maur_champion_infantry","units/maur_champion_elephant","units/maur_infantry_swordsman_e","units/maur_infantry_spearman_e"];
	
		//TO DO: check if we have civil centre or fortress
		let sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
	
		let sites_inner = this.GetTriggerPoints(triggerPointsInner);
		let sites_outer = this.GetTriggerPoints(triggerPointsOuter);
	
		if (sites_p2.length >= 3)
		{
			let sites = [pickRandom(sites_outer),pickRandom(sites_inner),pickRandom(sites_inner)];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_inner),pickRandom(templates_p2),1,p);
			
			this.PatrolOrderList(unit_i,p,sites);
			
			
		}
		else {
			return; //no more respawns
		}
		
	}
	
	//repeat
	let next_time = Math.round(this.patrolInterval * 1000);
	//warn("spawning again in "+uneval(next_time));
	this.DoAfterDelay(next_time,"SpawnInterevalPatrol",null);
}


Trigger.prototype.SpawnInterevalPatrolOra = function(data)
{
	//fortress 2 but units are from 
	let sites_owenr = 6;
	let p = 7;
	
	//check to see if p is alive
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		warn("Player 7 must be dead.")
		return;
	}
		
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < this.maxPatrolOra)
	{
		//spawn a patrol unit
		let templates_p2 = ["units/maur_champion_infantry","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_maiden_archer","units/maur_champion_infantry","units/maur_champion_elephant","units/maur_elephant_archer_e"];
	
		//sites
		let sites_p6 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(sites_owenr),"Structure").filter(TriggerHelper.IsInWorld);
	
		if (sites_p6.length >= 3)
		{
			let sites = [pickRandom(sites_p6),pickRandom(sites_p6),pickRandom(sites_p6)];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p6),pickRandom(templates_p2),1,p);
			
			this.PatrolOrderList(unit_i,p,sites);
			
			//warn("Spawned patrol unit for Ora");
		}
		else {
			return; //no more respawns
		}
		
	}
	
	//repeat
	this.DoAfterDelay(this.patrolInervalOra * 1000,"SpawnInterevalPatrolOra",null);
}

Trigger.prototype.SpawnInitialPatrol = function(data)
{

	//main enemy  
	let p = 2;
	let total_unit_count_p2 = this.initPatrol;
	
	let templates_p2 = ["units/maur_champion_infantry","units/maur_infantry_archer_e","units/maur_champion_maiden","units/maur_champion_maiden_archer","units/maur_champion_infantry","units/maur_champion_elephant","units/maur_infantry_swordsman_e","units/maur_infantry_spearman_e"];
	
	//sites
	let sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
	
	let sites_inner = this.GetTriggerPoints(triggerPointsInner);
	let sites_outer = this.GetTriggerPoints(triggerPointsOuter);
	
	for (let i = 0; i < total_unit_count_p2; i ++)
	{
		let sites = [pickRandom(sites_inner),pickRandom(sites_outer),pickRandom(sites_inner),pickRandom(sites_outer)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_inner),pickRandom(templates_p2),1,p);
		
		this.PatrolOrderList(unit_i,p,sites);
	}
}



Trigger.prototype.SpawnIntervalPtolemyAttack = function(data)
{
	//templates
	let templates = ["units/athen/champion_ranged","units/athen/champion_marine","units/athen/champion_marine","units/mace/champion_infantry_spearman","units/mace/champion_infantry_spearman_02","units/mace_thorakites","units/mace_thureophoros"];

	//how big each squad
	let squad_size = this.ptolAttackSize;
	
	//get all sites
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
	
	let sites_spawn = this.GetTriggerPoints(triggerPointsRandevouz);
	
	
	this.SpawnAttackSquad(3,sites_spawn[0],templates,squad_size,"Structure",2);
	
	
	this.DoAfterDelay(Math.round(this.ptolAttackInterval * 1000),"SpawnIntervalPtolemyAttack",null);
	
}

Trigger.prototype.OwnershipChangedAction = function(data)
{

	//check if house or tower
	if (data.from == 2 && (data.to == -1 || data.to == 1))
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("House") >= 0)
			{
									
				//increase spawn interval
				this.patrolInterval = this.patrolInterval * 1.1;
				warn("new patrol spawn interval = "+uneval(this.patrolInterval));
			}
			else if (id.classesList.indexOf("GarrisonTower") >= 0)
			{
				
				//our allies spawn faster
				this.ptolAttackInterval = this.ptolAttackInterval * 0.95;
			}
		}
		
		if (data.to == 1)
		{
			//destroy building			
			let health_s = Engine.QueryInterface(data.entity, IID_Health);
			health_s.Kill();
		}
	}
	
	
	//give extra loot
	if (data.from == 2 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("Infantry") >= 0)
			{
				//warn("infantry killed");
				
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",8);
				cmpPlayer.AddResource("wood",6);
				cmpPlayer.AddResource("stone",5);
				cmpPlayer.AddResource("metal",3);
			}
			else if (id.classesList.indexOf("Elephant") >= 0)
			{
				//warn("Elephant killed");
				
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",40);
				cmpPlayer.AddResource("wood",10);
				cmpPlayer.AddResource("metal",5);
			}
			else if (id.classesList.indexOf("Structure") >= 0)
			{
				//warn("Elephant killed");
				
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("food",40);
				cmpPlayer.AddResource("wood",200);
				cmpPlayer.AddResource("stone",50);
			}
		}
	}
	
	//check if hero from player 1 
	if (data.from == 1 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("Hero") >= 0)
			{
				//TODO: lose game
				//warn("hero dead");
				TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);
			}
		}
	}
	
	//check if civil centre from player 2
	if (data.from == 2 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("CivilCentre") >= 0)
			{
				//TODO: lose game
				warn("cc dead");
				TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
			}
		}
	}
	
}




Trigger.prototype.RangeActionTemple = function(data)
{
	
	if (this.questTempleGiven == false)
	{
		this.ShowText("The monks in this temple greet you with welcome. They are happy to assist you in your cause, but immediately they face another problem. Recently, the monastary was raided by bandits, many who are elephant riders, who are camped out on a hill not too far from here. Should you recover our stolen goods, we will help you.","Sounds good","I'll get on it");
		
		
		this.questTempleGiven = true;
	}
	
}

Trigger.prototype.RangeActionRandevouz = function(data)
{
	if (this.eventRandevouz == false)
	{
		//warn(uneval(data));
		
		if (data.added.length >= 1 && data.currentCollection.length >= 4)
		{
		
			//flip flag
			this.eventRandevouz = true;
			
			//show text
			this.ShowText("You have made it to the camp! The attack will commence!","So it goes.","Oh my");
			
			//flip assets
			this.FlipAssets();
			
			//start attacks
			this.DoAfterDelay(this.ptolAttackInterval * 1000,"SpawnIntervalPtolemyAttack",null);
	
			//schedule warn and end game messages
			this.DoAfterDelay(this.warnMessageTime * 1000,"WarnMessage",null);
			this.DoAfterDelay(this.timeLeft * 1000,"FailMessage",null);
			this.DoAfterDelay((this.timeLeft+2) * 1000,"EndGame",null);
	
		}
	}
}



Trigger.prototype.RewardQuestTemple = function(data)
{
	//warn("reward for temple quest");
	
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
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
		
		//just to make alexander faster
		cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");	
		cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
		
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
		
		//armor and attack
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
			
		cmpTechnologyManager.ResearchTechnology("armor_hero_01");
		cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");	
	}
	
	//main enemy
	for (let p of [2])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		//healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");	
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
		
		//armor and attack
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
		
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");	
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}


Trigger.prototype.WarnMessage = function(n)
{
	//show text
	this.ShowText("Our scouts report that Indian reinforcements are on their way! We must destroy their civil centre immediately!\n\nNote: You have 5 game minutes time to do so in order to win.","So it goes.","Oh my");
}


Trigger.prototype.FailMessage = function(n)
{
	//show text
	this.ShowText("We have failed to destroy the enemy. We must retreat","So it goes.","Oh my");
				
}


Trigger.prototype.EndGame = function(n)
{
	TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);
			
}

Trigger.prototype.IntervalVictoryCheck = function(data)
{
	//check how many cc's Ora has
	let ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6),"CivilCentre").filter(TriggerHelper.IsInWorld);
	//warn("player 6 has "+uneval(ccs.length)+" ccs");
	
	//check how many towers pl 2 has
	let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2),"GarrisonTower").filter(TriggerHelper.IsInWorld);
	//warn("player 2 has "+uneval(towers.length)+" towers");
	
	if (ccs.length <= 0 && towers.length <= 0)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
	}
		
	//check if we still have hero
	let heros = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"Hero").filter(TriggerHelper.IsInWorld);
	
	if (heros.length <= 0 /*&& towers.length <= 0*/)
	{
		TriggerHelper.SetPlayerWon(6,this.VictoryTextFn,this.VictoryTextFn);
	}
}
	

/* Random maps:
 * 	India - lake in middle, mostly dry empty
 *  Kerala - sea on one side, green
 *  Ratumacos - windy river
 * 
 * Skirmish:
 *  Deccan Plateau (2)
 *  Gambia River (3) rivers and desert
 *  Golden Island (2) -- island surround by river
 *  Two Seas (6) big but symmetrical
 * 
 * 
 */


{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants (that may change)
	cmpTrigger.initPatrol = 70;
	cmpTrigger.maxPatrol = 200;
	cmpTrigger.patrolInterval = 1.75; //initially every 2 seconds, later it increases
	
	
	cmpTrigger.ptolAttackSize = 5;
	cmpTrigger.ptolAttackInterval = 8;
	
	cmpTrigger.timeLeft = 1500;
	cmpTrigger.warnMessageTime = 1200;
	
	
	//some state variables
	cmpTrigger.eventRandevouz = false;
	
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	//initial patrol
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInitialPatrol",null);
	
	//repeat patrols
	cmpTrigger.DoAfterDelay((20+cmpTrigger.patrolInterval) * 1000,"SpawnInterevalPatrol",null);
	

	//disable templates
	for (let p of [1,2,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build buildings
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv())
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
	
	//set diplomacy
	
	
	//triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 20 * 1000,
		"interval": 20 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionRandevouz", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsRandevouz), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalVictoryCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
