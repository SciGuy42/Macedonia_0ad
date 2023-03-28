warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "J";
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
	for (let p of [3,4,6])
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
	this.idleCheckCounter += 1;
	
	//check whether to spawn elephant soldiers for player 1
	let stables_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4),"ElephantStable").filter(TriggerHelper.IsInWorld);
	warn("found stable!");
	
	if (stables_p4.length > 0)
	{
		let ele_soldiers_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Elephant+Soldier");
		
		if (ele_soldiers_pl1.length < 6)
		{
			//spawn an elephant
			let ele = TriggerHelper.SpawnUnits(stables_p4[0],"units/maur/champion_elephant",1,1);
					
		}
	}
	
	if (this.warEnded == false && this.warStarted == true)
	{
		for (let p of [6])
		{
			let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						this.WalkAndFightClosestTarget(u,1,unitTargetClass);
					}
				}
			}
		}
	}
	
	
}


Trigger.prototype.SpawnTraders = function(data)
{
	//we spawn traders for player 6
	for (let p of [6])
	{
		//make list of own markets
		let markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);
	
		if (markets_p.length > 0)
		{
			//make list of traders
			let traders_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
			
			if (traders_p.length < 16)
			{
				//make list of others markets
				let markets_others = [];
				let trading_partners = [2,4,5];
				for (let p2 of trading_partners)
				{
					if (p2 != p)
					{
						let markets_p2 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p2), "Trade").filter(TriggerHelper.IsInWorld);
							
						markets_others = markets_others.concat(markets_p2);
					}
				}
				
				if (markets_others.length > 0)
				{
				
					let site = pickRandom(markets_p);
						
					//warn("Spawning trader for crete");
					let trader = TriggerHelper.SpawnUnits(site,"units/maur/support_trader",1,p);
						
					let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
					
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
						
				}
			}
		}
		
	}
	
	this.DoAfterDelay(30 * 1000, "SpawnTraders",null);
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	//nanda garrison
	for (let p of [2,5,6,7])
	{
		let owner = 6; //all garrison are player 6
		
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//fortresses
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",20,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//towers
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
	//mutiny garrison
	for (let p of [3])
	{
		let owner = p; //all garrison are player 6
		
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//fortresses
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",20,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//towers
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",5,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//outpost
		/*let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
		
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/mace/champion_infantry_spearman",1,owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}*/
	}
}	


 
Trigger.prototype.SpawnInterevalMutineersPatrol = function(data)
{
	
	let p = 3;
	
	//check if we have structure
	let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
	if (patrol_sites.length == 0)
	{
		return;
	}
	
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < 30)
	{
		let templates = ["units/athen/champion_ranged","units/athen/champion_marine","units/mace/champion_infantry_spearman","units/mace/champion_infantry_swordsman","units/merc_thorakites","units/merc_thureophoros"];
	
		//pick patrol sites
		let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(patrol_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
	}
	
	//repeat
	this.DoAfterDelay(10 * 1000,"SpawnInterevalMutineersPatrol",null);
}
 
 
Trigger.prototype.SpawnInterevalFortressPatrol = function(data)
{
	
	let p = 6;
	
	//check if we have structure
	let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
	
	if (spawn_sites.length == 0)
	{
		return;
	}
	
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < 60)
	{
		let templates = ["units/maur/champion_infantry_maceman","units/maur/infantry_archer_e","units/maur/champion_maiden","units/maur/champion_maiden_archer","units/maur/champion_infantry_maceman","units/maur/infantry_swordsman_e","units/maur/infantry_spearman_e"];
	
		//find all structures that aren't fortress
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure+!Fortress").filter(TriggerHelper.IsInWorld);

		if (patrol_sites.length == 0)
		{
			return;
		}
	
		//pick patrol sites
		let sites = [pickRandom(spawn_sites),pickRandom(patrol_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
	}
	
	//repeat
	this.DoAfterDelay(5 * 1000,"SpawnInterevalFortressPatrol",null);
}
 
 
Trigger.prototype.SpawnInterevalPatrol = function(data)
{
	
	let p = 7;
	
	//check if we have structure
	let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
	
	if (spawn_sites.length == 0)
	{
		return;
	}
	
	//check how many unitts we have
	let units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units_p.length < 300)
	{
		let templates = ["units/maur/champion_infantry_maceman","units/maur/infantry_archer_e","units/maur/champion_maiden","units/maur/champion_maiden_archer","units/maur/champion_infantry_maceman","units/maur/champion_elephant","units/maur/infantry_swordsman_e","units/maur/infantry_spearman_e"];
	
		//decide whether the patrol goes for Prasii or Gangaridai
		let patrol_sites_owner = null;
		let patrol_sites = null;
		
		let sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Structure").filter(TriggerHelper.IsInWorld);
		let sites_p5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Structure").filter(TriggerHelper.IsInWorld);
	
		if (sites_p2.length == 0 && sites_p5.length == 0)
		{
			return;
		}
		
		if (sites_p2.length == 0 && sites_p5.length > 0)
		{
			patrol_sites_owner = 5;
			patrol_sites = sites_p5;
		}
		else if (sites_p2.length > 0 && sites_p5.length == 0)
		{
			patrol_sites_owner = 2;
			patrol_sites = sites_p2;
		}
		else 
		{
			if (Math.random() < 0.5)
			{
				patrol_sites_owner = 2;
				patrol_sites = sites_p2;
			}
			else 
			{
				patrol_sites_owner = 5;
				patrol_sites = sites_p5;
			}	
		}
	
		//pick patrol sites
		let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(templates),1,p);
			
		this.PatrolOrderList(unit_i,p,sites);
	}
	
	//repeat
	this.DoAfterDelay(5 * 1000,"SpawnInterevalPatrol",null);
}



Trigger.prototype.SpawnIntervalPtolemyAttack = function(data)
{
	//templates
	let templates = ["units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_marine", "units/mace/champion_infantry_spearman", "units/mace/champion_infantry_spearman_02", "units/mace/thorakites", "units/mace/thureophoros"];

	//how big each squad
	let squad_size = this.ptolAttackSize;
	
	//get all sites
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
	
	let sites_spawn = this.GetTriggerPoints(triggerPointsRandevouz);
	
	
	this.SpawnAttackSquad(3,sites_spawn[0],templates,squad_size,"Structure",2);
	
	
	this.DoAfterDelay(Math.round(this.ptolAttackInterval * 1000),"SpawnIntervalPtolemyAttack",null);
	
}




Trigger.prototype.SpawnAdvanceAttackSquadInterval = function(data)
{
	//which player
	let p = 6;
	
	//sites 
	let sites = this.GetTriggerPoints(triggerPointsAdvanceAttack);
	
	//templates
	let templates = ["units/maur/infantry_archer_a", "units/maur/infantry_archer_b", "units/maur/infantry_spearman_a", "units/maur/infantry_spearman_b", "units/maur/infantry_spearman_b", "units/maur/infantry_swordsman_b", "units/maur/infantry_swordsman_a", "units/maur/infantry_swordsman_e", "units/maur/infantry_spearman_e"];
	
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
	this.ShowText("Our scouts report that Porus' advance has arrived! They are hehaded towards the farmsteads!","So it begins","Great!");
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



Trigger.prototype.SpawnMainAttackInterval = function(data)
{
	//which player 
	let p = 2;
	
	//templates
	let templates = ["units/maur/champion_infantry", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/elephant_archer_e", "units/maur/infantry_swordsman_e", "units/maur/infantry_spearman_e", "units/maur/infantry_swordsman_e", "units/maur/champion_elephant"];
	
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
			let unit_i = TriggerHelper.SpawnUnits(site_i, "units/maur/siege_ram", 1, p);
		
			let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				//find closest structure
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
			let unit_i = TriggerHelper.SpawnUnits(site_i, "units/maur/champion_elephant", 1, p);
		
			let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				//find closest structure
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


// every function just logs when it gets fired, and shows the data
Trigger.prototype.StartWar = function(data)
{
	
	//show text
	this.ShowText("That's it. The Nanda will not tolerate us any longer. We are officially at war with them and we must prepare to defend ourselves. Your officers suggest you send them a message -- destroy two of their civil centres which will force them to negotiate. They also suggest that we take care of the Nanda fortress and garrison first, otherwise, defeating the vassals may be a difficult ordeal.","So it goes.","Oh my");
			
	//disable civil centre
	let cmpPlayer = QueryPlayerIDInterface(1);
		
	//disable templates -- nobody can build docks or civil centre
	let disTemplates = disabledTemplatesCCs(QueryPlayerIDInterface(1, IID_Identity).GetCiv())
	cmpPlayer.SetDisabledTemplates(disTemplates);
		
	//start war
	let nanda_empire_players = [2,5,6,7];
			
	//nanda are now our enemy
	for (let p of nanda_empire_players)
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
				
		for (let p2 of [1])
		{
			cmpPlayer_p.SetEnemy(p2);
		}
				
		cmpPlayer.SetEnemy(p);
	}
			
	this.warStarted = true;
	
	this.DoAfterDelay(20 * 1000,"IntervalCheckIndianCCs",null);
	
	
}

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	//warn("The OnStructureBuilt event happened with the following data:");
	//warn(uneval(data));
	
	//check if civil cenrte by player 1
	let id = Engine.QueryInterface(data.building, IID_Identity);
	if (id && id.classesList.indexOf("CivilCentre") >= 0)
	{
		this.numCCsBuilt += 1;
		if (this.numCCsBuilt >= 2 && this.warStarted == false)
		{
			this.StartWar();
			
			
		}
		else if (this.numCCsBuilt >= 1 && this.warStarted == false)
		{
		
			//show text
			this.ShowText("A messenger from the Nanda Empire has arrived. He explains that the local general in charge of the garrison is not very happy about you building a base in Nanda territory. While the Nanda will tolerate you for now, beware, any further expansion could result in war.","So it goes.","Oh my");
		}
		
	}
	
	//check if building by player 2 or 5
	var cmpOwnership = Engine.QueryInterface(data.building, IID_Ownership);
	//warn(uneval(cmpOwnership.GetOwner()));
	
	if (cmpOwnership.GetOwner() == 2 || cmpOwnership.GetOwner() == 5)
	{
		if (this.foundations == null)
		{
			this.foundations = [];
		}
		
		this.foundations.push(data.foundation);
		
		//warn(uneval(this.foundations)); 
	}
};


Trigger.prototype.SpawnStructureResponseAttack = function(data)
{
	//find out how many units we have already
	

	let attack_size = data.attack_size;
	let target_location = data.location;
		
	//site
	let site = pickRandom(this.GetTriggerPoints(triggerPointsStructureResponseAttack));
			
	//templates
	let templates = ["units/maur/champion_chariot","units/maur/cavalry_javelineer_e","units/maur/cavalry_swordsman_a","units/maur/cavalry_swordsman_e","units/maur/cavalry_swordsman_b"];
			
	let attackers = [];
	let p = 6;
	for (let i = 0; i < attack_size; i ++)
	{
		//spawn unit
		let units_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		attackers.push(units_i[0]);
	}
		

	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//send to attack
	ProcessCommand(p, {
			"type": "attack-walk",
			"entities": attackers,
			"x": target_location.x,
			"z": target_location.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
	});
	
}

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//check if elephant stables
	if (data.entity == 12900 && data.to == 1)
	{
		//spawn 3 worker elephants
		let elephants = TriggerHelper.SpawnUnits(data.entity,"units/maur/support_elephant",2,1);
		let elephants_war = TriggerHelper.SpawnUnits(data.entity,"units/maur/support_elephant",2,1);
			
		//building is now owned by neutral traders
		var cmpOwnership = Engine.QueryInterface(data.entity, IID_Ownership);
		cmpOwnership.SetOwner(4);
		
		this.ShowText("Great job! This stable will supply us with up to 6 war elephants. And a worker too!","Great","Also great");
		
		//kill building
		//	let health_s = Engine.QueryInterface(data.entity, IID_Health);
		//health_s.Kill();
	}
	
	//check if gaia market 12698
	if (data.entity == 12698 && data.to == 1)
	{
		//spawn traders
		let traders = TriggerHelper.SpawnUnits(data.entity,"units/maur/support_trader",5,1);
		
		//kill building
		//let health_s = Engine.QueryInterface(data.entity, IID_Health);
		//health_s.Kill();
		
		var cmpOwnership = Engine.QueryInterface(data.entity, IID_Ownership);
		cmpOwnership.SetOwner(4);
		
	}
	
	//check if gaia dock
	if (data.entity == 12684 && data.to == 1)
	{
		//spawn traders
		let traders = TriggerHelper.SpawnUnits(data.entity,"units/maur/ship_merchant",3,1);
		
	}
	
	//check if players 2 and 5 lost a structure
	if ((data.from == 2 || data.from == 5))
	{
		if (this.foundations && this.foundations.indexOf(data.entity) < 0)
		{
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			if (id != null && id.classesList.indexOf("Structure") >= 0 && Math.random() < 0.5 && this.warEnded == false)
			{
				//if player 6 is alive, possibly send an attack force
				let p = 6;
				let cmpPlayer = QueryPlayerIDInterface(p);
				//warn(uneval(cmpPlayer.GetState()));
				
				//check also if they have structures
				let structs_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
				
				if (cmpPlayer.GetState() == "active" && structs_p.length > 0)
				{
					let cavalry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
					if (cavalry.length < 150)
					{
						//spawn attack
						let data_attack = {};
						data_attack.attack_size = 15;
						
						var cmpTargetPosition = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
						data_attack.location = cmpTargetPosition;
						
						
						this.SpawnStructureResponseAttack(data_attack);
						
					}
					
				}
			}
		}
		else 
		{
			//warn("foundation destroyed");
		}
		
	}
	
	//check if we built a civil centre
	/*if (data.from == -1 && data.to == 1)
	{
		
		
	}*/
	
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
	
	
	/*if (data.from == 0 && data.to == 1) //we captured a gaia structure, there is only 1 so...
	{
		//spawn some bolt shooters
		let siege = TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_oxybeles_packed",5,1);
		
		//warn("spawned siege");
		//destroy building			
		let health_s = Engine.QueryInterface(data.entity, IID_Health);
		health_s.Kill();
	}*/
	
	//check if gaia soldier, if so, make his buddies attack
	if (data.from == 0 && data.to == -1)
	{
		//check if soldier
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id && id.classesList.indexOf("Soldier") >= 0)
		{
			//find out which cluster
			let target_cluster = -1;
			
			for (let i = 0; i < this.gaiaClusters.length; i ++)
			{
				if (this.gaiaClusters[i].includes(data.entity))
				{
					target_cluster = i; 
					break;
				}
			}
			
			//warn("target cluster = "+target_cluster);
			
			if (target_cluster != -1)
			{
				//go through every unit in cluster and if idle, order to attack
				for (let u of  this.gaiaClusters[target_cluster])
				{
					let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					if (cmpUnitAI)
					{
						if (cmpUnitAI.IsIdle())
						{
							this.WalkAndFightClosestTarget(u,1,"Unit");
						}
					}
				}
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
		/*cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
		
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
		cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
		cmpTechnologyManager.ResearchTechnology("armor_cav_01");
		cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");	*/
	}


	for (let p of [6,7]) //nanda garrison and patrols
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		
		//trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}


Trigger.prototype.SpawnMutinyInsurrectionSquad = function(data)
{
	
	if (this.numSquadsSpawned == null)
		this.numSquadsSpawned = 1;
	else 
		this.numSquadsSpawned = this.numSquadsSpawned + 1;
	
	//warn("Insurrection squad spawned: " + uneval(this.numSquadsSpawned));
	
	
	
	let p = 3;
	
	//decide spawn site
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
				
	let site = sites[0];
	
	//templates
	let templates = ["units/athen/champion_ranged","units/athen/champion_ranged","units/athen/champion_marine","units/athen/champion_marine","units/mace/champion_infantry_spearman","units/mace/champion_infantry_spearman_02","units/merc_thorakites","units/merc_thureophoros","units/spart/hero_agis","units/spart/champion_infantry_swordsman","units/mace/cavalry_javelineer_a"];
	
	//spawn
	let size = 20;
	
	let attackers = [];
	
	for (let i = 0; i < size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//decide whether to include siege
	let siege_templates = ["units/mace/siege_ram","units/mace/siege_lithobolos_packed","units/mace/siege_oxybeles_packed"];
	
	//set formation
	//TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//attack
	//make them attack
	let target_player = 1;
	let target_class = "Structure";
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
	
	//spawn siege
	let siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
	let siege_attackers = [];
	
	if (siege.length < 12)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(siege_templates),1,p);
		siege_attackers.push(unit_i[0]);
	}
	
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": siege_attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": siegeTargetClass
		},
		"allowCapture": false
	});
	
}

Trigger.prototype.StartMutinyInsurrection = function(data)
{
	//warn("Insurrection started!");
	
	this.ShowText("While we were busy with the Nanda, Coenus has secured an agreement with most of the soldiers -- they will rejoin the flock but we cannot proceed further East. However, a die-hard band of them are not ready to concede and are heading straightt for our camp. We must defend!","Great!","Well done!");
		
	
	//change diplomacy
	let cmpPlayer_3 = QueryPlayerIDInterface(3);
	let cmpPlayer_1 = QueryPlayerIDInterface(1);
	
	cmpPlayer_3.SetEnemy(1);
	cmpPlayer_1.SetEnemy(3);
	
	let num_squads = 35;
	
	for (let i = 0; i < num_squads; i++)
	{
		this.DoAfterDelay((20+i*8) * 1000,"SpawnMutinyInsurrectionSquad",null);
	}
	
	//start victory check
	this.DoAfterDelay(60 * 1000,"IntervalCheckMutinry",null);
	
}


Trigger.prototype.IntervalCheckMutinry = function(data)
{
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Unit").filter(TriggerHelper.IsInWorld);
	
	if (units.length < 1)
	{
		this.ShowText("We have defeated the mutineers!","Great!","Well done!");
		
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);

		
	}
	else 
	{
		this.DoAfterDelay(20 * 1000,"IntervalCheckMutinry",null);
	}
	
}

Trigger.prototype.IntervalCheckIndianCCs = function(data)
{
	let ccs_pl2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let ccs_pl5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let total = ccs_pl2.length + ccs_pl5.length;
	
	warn("enemy ccs = "+total);
	
	if (total <= 3)
	{
		this.ShowText("Great! We have sent the Nanda a message they will not forget! They have agreed to keep current borders and will no longer attack us. Trade can resume.","Great!","Well done!");
		
		//go back to neutral again
		this.warEnded = true;
		
		let nanda_empire_players = [2,5,6,7];
		let macedonian_players = [1,3];

		for (let p of nanda_empire_players)
		{
			let cmpPlayer_p = QueryPlayerIDInterface(p);
			
			for (let p2 of macedonian_players)
			{
				cmpPlayer_p.SetNeutral(p2);
				let cmpPlayer_p2 = QueryPlayerIDInterface(p2);
				cmpPlayer_p2.SetNeutral(p);
			}
		}
		
		//TO DO: start final insurrection
		this.DoAfterDelay(20 * 1000,"StartMutinyInsurrection",null);
	}
	else
	{
		this.DoAfterDelay(20 * 1000,"IntervalCheckIndianCCs",null);
	}
}


Trigger.prototype.ClusterUnits = function(units,num_clusters)
{
	let dataset = [];
	
	for (let u of units)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(u, IID_Position).GetPosition2D();
		
		dataset.push([cmpTargetPosition.x,cmpTargetPosition.y]);
	}
	
	//how many clusters
	let kmeans = new KMeans({
	  canvas: null,
	  data: dataset,
	  k: num_clusters
	});
	
	let num_iterations = 40;
	
	for (let i = 0; i < num_iterations; i ++)
	{
		kmeans.run();
		
	}
	
	let clustering = kmeans.assignments;
	
	//warn(uneval(clustering));
	
	let clusters = [];
	for (let k = 0; k < num_clusters; k++)
	{
		let cluter_k = [];
		
		for (let i = 0; i < units.length; i++)
		{
			
			if (clustering[i] == k)
			{
				cluter_k.push(units[i]);
			}
		}
		
		clusters.push(cluter_k);
	}
	
	return clusters;
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


Trigger.prototype.InitGaiaClusters = function(data)
{
	//get all gaia soldiers
	let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Soldier+!Elephant+!Siege").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+soldiers.length+" gaia soldiers.");
	
	//cluster them
	let num_clusters = 2;
	
	
	let clusters = this.ClusterUnits(soldiers,num_clusters);
	//warn(uneval(clusters));
	
	//store so we can check when a unit is killed, who its buddies are
	this.gaiaClusters = clusters;
	
}

{
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants (that may change)
	
	//some state variables
	cmpTrigger.numCCsBuilt = 0;
	cmpTrigger.warStarted = false;
	cmpTrigger.warEnded = false;
	cmpTrigger.imperialCampDestroyed = false;
	cmpTrigger.imperialFortDestroyed = false;
	cmpTrigger.idleCheckCounter = 0;
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);

	//garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000,"GarrisonEntities",null);
	
	//start patrol spawns
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInterevalPatrol",null);
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInterevalFortressPatrol",null);
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInterevalMutineersPatrol",null);
	
	//start traders
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTraders",null);
	
	//init gaia clusters
	cmpTrigger.DoAfterDelay(1 * 1000,"InitGaiaClusters",null);

	
	//debug
	//cmpTrigger.DoAfterDelay(10 * 1000,"StartWar",null);
	
	//disable templates
	for (let p of [1,2,3,4,5,6,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates -- nobody can build docks or civil centre
		

		if (p == 6 || p == 7)
		{
			let disTemplates = disabledTemplatesDocksCCs(QueryPlayerIDInterface(p, IID_Identity).GetCiv())
			cmpPlayer.SetDisabledTemplates(disTemplates);
		}
		else if (p != 1)
		{
			let disTemplates = disabledTemplatesCCs(QueryPlayerIDInterface(p, IID_Identity).GetCiv())
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
	
	//set diplomacy
	let nanda_empire_players = [2,5,6,7];
	let macedonian_players = [1,3];
	let neutral_trader = 4;
	
	//nanda are neutral towards all macedonians and the traders
	for (let p of nanda_empire_players)
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		
		for (let p2 of macedonian_players)
		{
			cmpPlayer_p.SetNeutral(p2);
		}
		
		cmpPlayer_p.SetNeutral(neutral_trader);
	}
	
	//macedonians neutral towards nanda and the trader
	for (let p of macedonian_players)
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		
		for (let p2 of nanda_empire_players)
		{
			cmpPlayer_p.SetNeutral(p2);
		}
		
		cmpPlayer_p.SetNeutral(neutral_trader);
	}
	
	let cmpPlayer_trader = QueryPlayerIDInterface(neutral_trader);
	for (let p of macedonian_players)
	{
		cmpPlayer_trader.SetNeutral(p);
	}
	
	for (let p of nanda_empire_players)
	{
		cmpPlayer_trader.SetNeutral(p);
	}
	
	
	
	//triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
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
