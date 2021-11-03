warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsAdvanceAttack = "A";
var triggerPointsMainAttack = "B";
var triggerPointsMace = "C";
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


var disabledTemplatesDocksCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Shoreline
	"structures/" + civ + "_dock",
	"structures/brit_crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse",
	
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
	for (let p of [1,2,3,4,5])
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
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit+!Elephant").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
						
					this.WalkAndFightClosestTarget(u,1,unitTargetClass);
				}
			}
		}
		
		//also check for elephants
		let units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant+Melee").filter(TriggerHelper.IsInWorld);
		
		let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		
		let units_se = units_ele.concat(units_siege);
		
		//warn("found "+uneval(units_ele.length) + " melee elephants or siege");
		for (let u of units_se)
		{
			//list classes
			/*let id = Engine.QueryInterface(u, IID_Identity);
			if (id)
			{
				warn(uneval(id.classesList));
			}*/
			
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			
			//check if idle
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("idle elephant");
					this.WalkAndFightClosestTarget(u,1,siegeTargetClass,false);
				}
			}
			
			if (cmpUnitAI)
			{
				//print order
				let orders = cmpUnitAI.GetOrders();
				
				if (orders && orders.length > 0)
				{
					//warn(uneval(orders));
					
					//check if it is attack
					if (orders[0].type == "Attack")
					{
						let target = orders[0].data.target;
						let id = Engine.QueryInterface(target, IID_Identity);
						if (id)
						{
							//warn("target's classes: "+uneval(id.classesList));
							
							//if attacking unit, possibly switch to structure
							if (id.classesList.indexOf("Unit") >= 0)
							{
								
								//find distance to target
								let distance = DistanceBetweenEntities(u, target);
								//warn("distance to targe = "+uneval(distance));
								
								if (distance > 20)
								{
									//change order to attack nearest structure 
									
									let target = this.FindClosestTarget(u,1,"Structure");
									cmpUnitAI.orders = [];
									cmpUnitAI.Attack(target,false,false);
									
									
									//warn("swtiching target to "+uneval(target)+", new orders:");
									//let orders_new = cmpUnitAI.GetOrders();
									//warn(uneval(orders_new));
									
									//cmpUnitAI.StopMoving();
									//cmpUnitAI.FinishOrder();
									//cmpUnitAI.orderQueue = [];
									//cmpUnitAI.order = undefined;
									//cmpUnitAI.isIdle = true;
								}
							}
							else 
							{
								//set allow capture to false
								orders[0].data.allowCapture = false;
							}
							
						}
					}
				}
			}
			
		}
		
		
	}
	
	for (let p of [6])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		//check if player 3 still alive
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
		//warn("Found this many structures: "+uneval(structs.length));
		
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
						
					if (structs.length > 0)
					{
						this.WalkAndFightClosestTarget(u,3,siegeTargetClass);
					}
					else
					{
						this.WalkAndFightClosestTarget(u,1,unitTargetClass);
					}
					
				}
			}
		}
	}
	
}



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	//macedonian cavalry camp
	for (let p of [5])
	{
		//camps
		let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/mace/champion_infantry_spearman",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
	//main enemy
	for (let p of [2,6])
	{
		//camps
		let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur_champion_infantry",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
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




Trigger.prototype.SpawnMaceAttackInterval = function(data)
{
	//which player
	let p = 5;
	
	//sites
	let sites = this.GetTriggerPoints(triggerPointsMace);
	
	//templates
	let templates = ["units/mace_champion_cavalry","units/mace_cavalry_javelinist_e","units/mace_cavalry_spearman_e","units/athen_cavalry_swordsman_e"];
	
	//spawn
	let attackers = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,p);
	
	//make attack
	let target_player = 2;
	let target = this.FindClosestTarget(attackers[0],target_player,"Unit");
	
	if (target)
	{
		let target_pos = TriggerHelper.GetEntityPosition2D(target);
		
		//set stance to violent
		let cmpUnitAI = Engine.QueryInterface(attackers[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			cmpUnitAI.SwitchToStance("violent");
		}
		
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
	
	//increment
	this.maceAttackLevel = this.maceAttackLevel + 1;
	
	//repeat
	if (this.maceAttackLevel < this.maceAttackMaxSpawn)
	{
		this.DoAfterDelay(Math.round(this.maceAttackSpawnInterval * 1000),"SpawnMaceAttackInterval",null);
	
	}
	
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
	
	warn("attack size = "+uneval(size));
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
	warn(uneval(this.advanceAttackStickBreakProb) +"\t"+uneval(this.advanceAttackInterval))
	
	//increment level
	warn("level = "+uneval(this.advanceAttackLevel));
	this.advanceAttackLevel = this.advanceAttackLevel + 1;
	
	//repeat
	if (this.advanceAttackLevel < this.advanceAttackMaxLevel)
	{
		let next_time = Math.round(this.advanceAttackInterval * 1000);
		warn("spawning again in "+uneval(next_time));
		this.DoAfterDelay(next_time,"SpawnAdvanceAttackSquadInterval",null);
	}
	else  //if we run out of levels, main attack starts
	{
		warn("advance attack done, main attack starts");
		this.eventAdvanceAttackEnded = true;
		this.StartMainAttack();
	}
	
}

Trigger.prototype.StartAdvanceAttack = function(data)
{
	this.eventAdvanceAttackStarted = true;
	this.SpawnAdvanceAttackSquadInterval();
	this.ShowText("Our scouts report that Porus' advance has arrived! They are hehaded towards teh farmsteads!","So it begins","Great!");
	//warn("advance attack started!!!");
}


Trigger.prototype.StartMainAttack = function(data)
{
	this.eventMainAttackStarted = true;
	this.SpawnMainAttackInterval();
	//warn("main attack started");
}


Trigger.prototype.VictoryCheck = function(data)
{
	
	
	//check how many units player 2 has
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Unit").filter(TriggerHelper.IsInWorld);
	
	warn("victory check "+uneval(units.length));
	
	if (units.length == 0)
	{
		//victory
		let cmpPlayer = QueryPlayerIDInterface(5);
		cmpPlayer.SetAlly(1);
	
		
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
	}
	
	this.DoAfterDelay(10 * 1000,"VictoryCheck",null);
	
}


Trigger.prototype.StartMaceAttack = function(data)
{
	//give some tech
	let cmpPlayer = QueryPlayerIDInterface(5);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
	cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");	
	cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
	cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
	cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
	cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
	cmpTechnologyManager.ResearchTechnology("armor_cav_01");
	cmpTechnologyManager.ResearchTechnology("armor_cav_02");
	cmpTechnologyManager.ResearchTechnology("armor_cav_02");
	cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");	
	
	//make neutral towards towards player 1 so we don't retreat all the time
	cmpPlayer.SetNeutral(1);
	
	//main attack now stops
	this.eventMacedonianCavalryArrived = true; // turns of repeat of main attack
	
	//start victory check
	this.DoAfterDelay(10 * 1000,"VictoryCheck",null);
	
	this.ShowText("Alexander's cavalary has advance! Thanks the Gods! Now let's finish off the atackers!","Great!","Awesome!");
	
	this.SpawnMaceAttackInterval();
	warn("mace attack started");
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

	/*if (data.entity == 5251 && this.eventAdvanceAttackStarted == false) //brit tower, used as debug trigger
	{
		this.eventAdvanceAttackStarted = true;
		this.StartAdvanceAttack();
	}
	else if (data.entity == 5252 && this.eventMacedonianCavalryArrived == false) //brit tower, used as debug trigger
	{
		this.eventMacedonianCavalryArrived = true;
		this.StartMaceAttack();
	}*/
	
	
	if (data.from == 0 && data.to == 1) //we captured a gaia structure, there is only 1 so...
	{
		//spawn some bolt shooters
		let siege = TriggerHelper.SpawnUnits(data.entity,"units/mace_mechanical_siege_oxybeles_packed",5,1);
		
		//warn("spawned siege");
		//destroy building			
		let health_s = Engine.QueryInterface(data.entity, IID_Health);
		health_s.Kill();
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
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		
		//armor and attack
		cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
			
		cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
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

Trigger.prototype.TransferFood = function(data)
{
	
	//warn("food transfer");
		
	//find out how much food player 4 has
	let cmpPlayer4 = QueryPlayerIDInterface(3);
	let resources = cmpPlayer4.GetResourceCounts();
		
	//add it to player 1
	let cmpPlayer1 = QueryPlayerIDInterface(1);
	cmpPlayer1.AddResource("food",resources.food);
		
	//remove it from player 4
	cmpPlayer4.AddResource("food",-1*resources.food);
	
}

Trigger.prototype.SpawnFarmers = function(data)
{
	let p = 3;
	
	let farms = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Field").filter(TriggerHelper.IsInWorld);
		
	
	for (let i = 0; i < farms.length; i++)
	{
		//spawn the unit
		let farm_i = farms[i];
		let unit_i = TriggerHelper.SpawnUnits(farm_i,"units/pers_support_female_citizen",5,p);
		
		//give order
		for (let u of unit_i)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				cmpUnitAI.Gather(farm_i,false);	
			}
		}
	}
}


{
	/* 11 minutes in, walled in
	 * 13 minutes start advance attack
	 * need to speed up advance attack, more troops and idle check
	 * 
	 */
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants (that may change)
	cmpTrigger.advanceAttackInterval = 6.0;
	cmpTrigger.advanceAttackIntervalDecay = 0.9825;
	cmpTrigger.maxNumAdvanceAttackers = 100;
	cmpTrigger.advanceAttackStickBreakProb = 0.85;
	cmpTrigger.advanceAttackStickBreakProbDecay = 0.999;
	cmpTrigger.advanceAttackMaxLevel = 250; //debug
	
	cmpTrigger.mainAttackMaxLevel = 1000;
	cmpTrigger.mainAttackNumSquads = 5;
	cmpTrigger.mainAttackNumSquadsIncrease = 1.025;
	cmpTrigger.mainAttackSquadSize = 7;
	cmpTrigger.mainAttackSquadSizeIncrease = 1.05;
	cmpTrigger.mainAttackInterval = 45;
	cmpTrigger.mainAttackIntervalDecay = 0.995;
	
	cmpTrigger.maceAttackSpawnInterval = 0.5;
	cmpTrigger.maceAttackMaxSpawn = 600;
	
	//some state variables
	cmpTrigger.eventAdvanceAttackStarted = false;
	cmpTrigger.eventAdvanceAttackEnded = false;
	cmpTrigger.eventMainAttackStarted = false;
	cmpTrigger.eventMainAttackEnded = false;
	cmpTrigger.eventMacedonianCavalryArrived = false;
	
	cmpTrigger.advanceAttackLevel = 1;
	cmpTrigger.mainAttackLevel = 1;
	cmpTrigger.maceAttackLevel = 1;
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	//initial farners
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnFarmers",null);
	
	//schedule the advance attack in 19 minutes
	cmpTrigger.DoAfterDelay(1140 * 1000,"StartAdvanceAttack",null);
	
	//repeat patrols
	
	//disable templates
	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build docks or civil centre
		let disTemplates = disabledTemplatesDocksCCs(cmpPlayer.GetCiv())
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
	
	//everyone is neutral towards 4
	for (let p of [1,2,3,5])
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		cmpPlayer_p.SetNeutral(4);
		
		let cmpPlayer_4 = QueryPlayerIDInterface(4);
		cmpPlayer_4.SetNeutral(p);
	}
	
	
	//triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	cmpTrigger.RegisterTrigger("OnInterval", "TransferFood", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 20 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 20 * 1000,
		"interval": 20 * 1000,
	});
	
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
