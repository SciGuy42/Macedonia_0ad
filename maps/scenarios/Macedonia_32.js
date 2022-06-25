warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerCityKidnappers = "A";
var triggerPointAmbush = "B";
var triggerPointTradeOutpost = "K";
var triggerPointStables = "C";
var triggerPointTraders = "D";
var triggerPointTraderAmbush = "E";
var triggerPointMountainAttack = "F";
var triggerPointMountainAttackSpawn = "G";
var triggerPointTempleQuest = "H";
var triggerPointKidnapperGuardPatrol = "J";
var triggerPointStartAssault = "I";



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
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome/wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",
	
	//villagers
	//"units/" + civ + "/support_female_citizen"
];

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn(uneval(data));
	if (data.cmd.type == "dialog-answer" && this.currentDialog == "decision_assault")
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		
		if (data.cmd.answer == "button1")
		{
			//if we picked yes, start assault
			//warn("button 1 pressed");
			this.StartMainAttack();
		}
		
		this.currentDialog = "none";
	}
	
};


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



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [2,7,8])
	{
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//sentry towers
		let stowers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"SentryTower").filter(TriggerHelper.IsInWorld);
			
		for (let c of stowers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite",3,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//outposts
		/*let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
			
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite",1,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}*/
		
		
	}
	
	for (let p of [0,6])
	{
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"DefenseTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
	}
}	


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


Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [2,4,6,7])
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


Trigger.prototype.SpawnAssaultSquad = function(data)
{
	//warn("spawning attack squad "+uneval(this.mainAssaultCounter));
	
	//find spawn site
	let p = 4;
	let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		
	//how many soldiers
	let squad_size = 14;
	
	//what kinds
	let templates = ["units/athen/champion_ranged","units/athen/champion_marine","units/mace/champion_infantry_spearman","units/mace/champion_infantry_spearman","units/merc_thorakites","units/merc_thureophoros"];
	
	let attackers = [];
	for (let i = 0; i < squad_size; i++)
	{
			
		let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
			
	}
	
	//send attacking
	//set formation
		
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],2,unitTargetClass);
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
	
	//bonuses if subquests done
	if (this.templeQuestComplete == true)
	{
		let healers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Healer").filter(TriggerHelper.IsInWorld);
	
	
		if (healers.length < 10)
		{
			//warn("spawning healer");
			
			let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],"units/maur/support_healer_e",1,p);
			
			this.WalkAndFightClosestTarget(unit_i[0],2,unitTargetClass);
					
		}
	}
	
	if (this.mainAssaultCounter > 1)
	{
		if (this.tradersQuestComplete == true)
		{
			//spawn 2 melee cavalry
			let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],"units/pers/cavalry_axeman_e",4,p);
			
			this.WalkAndFightClosestTarget(unit_i[0],2,unitTargetClass);
			//warn("spawned cavalry");
		}
	}
	
	if (this.siegeEnginesCaptured == true)
	{
		let siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
	
		if (siege.length < 10)
		{
			//warn("spawning siege");
			
			let unit_i = TriggerHelper.SpawnUnits(spawn_sites[0],"units/mace/siege_oxybeles_packed",1,p);
	
			this.WalkAndFightClosestTarget(unit_i[0],2,unitTargetClass);
					
		}
	}
	
	//increment counter
	this.mainAssaultCounter = this.mainAssaultCounter + 1;
}


Trigger.prototype.KidnapperGuardDistracted = function(data)
{
	let p = 8;
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
	for (let u of units)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				
		if (cmpUnitAI)
		{
			//warn("Found idle soldier");
			this.WalkAndFightClosestTarget(u,4,unitTargetClass);
		}
	}
}

Trigger.prototype.StartMainAttack = function(data)
{
	//warn("Main attack starts!");
	this.mainAssaultStarted = true;
	
	//allies start attacking player 2
	let num_squads = 50;
	
	let interval_squads = 15;
	
	let delay = 75;
	
	for (let i = 0; i < num_squads; i ++)
	{
		this.DoAfterDelay((delay+(interval_squads * (i+1))) * 1000,"SpawnAssaultSquad",null);
	}
	
	let p = 1;
	let cmpPlayer = QueryPlayerIDInterface(p);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	if (this.tradersQuestComplete)
	{
		cmpTechnologyManager.ResearchTechnology("archery_tradition");	
	}
	
	if (this.templeQuestComplete)
	{
		cmpTechnologyManager.ResearchTechnology("health_regen_units");	
	}
	
	//set distraction
	this.DoAfterDelay(3 * delay * 1000,"KidnapperGuardDistracted",null);
}




Trigger.prototype.SpawnHorsemanPatrol = function(data)
{
	if (this.finalAttackTriggered == false)
	{
		let p = 2; //which player
		
		//find how many cavalry we already have
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
		//find how many camps we have -- we need more than 1 to spawn
		let camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		
		if (units.length < 300 && camps.length > 1)
		{
			//templates, mostly archers
			let cav_templates = ["units/pers/champion_cavalry","units/pers/champion_cavalry_archer","units/pers_cavalry_javelinist_e","units/pers_cavalry_javelinist_a","units/pers_cavalry_swordsman_e","units/pers_cavalry_swordsman_a","units/pers_cavalry_spearman_e","units/pers_cavalry_spearman_a","units/pers_cavalry_spearman_b"];
		
			let sites = this.GetTriggerPoints(triggerPointPatrol);
			let sites_reversed = [];
			for (let i = sites.length-1; i >= 0; i --)
			{
				sites_reversed.push(sites[i]);
			}
			
			let spawn_site = this.GetTriggerPoints(triggerPointParolSpawn)[0];
			
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
			
			if (Math.random() < 0.5)
				this.PatrolOrderList(unit_i,p,sites);
			else 
				this.PatrolOrderList(unit_i,p,sites_reversed);
		}
		
		let next_spawn_interval = Math.round(Math.sqrt(units.length))+1;
		//warn("next spawn = "+next_spawn_interval);
		this.DoAfterDelay(next_spawn_interval * 1000,"SpawnHorsemanPatrol",null);
	}
}

Trigger.prototype.SpawnIntervalGuardPatrol = function(data)
{
	//find how many units we already have
	if (this.mainAssaultStarted == false)
	{
		
		let p = 8;
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		

		
		if (units.length < this.maxEnemyKidnappersPatrolSize)
		{
			
			//warn("Found this mane enemy units: "+uneval(units.length));
		
			//decide how many to spawn
			let difference = this.maxEnemyKidnappersPatrolSize - units.length;
			
			let spawn_size = 1;
			
			if (difference > 30)
			{
				spawn_size = 5;
			}
			else if (difference > 25)
			{
				spawn_size = 4;
			}
			else if (difference > 20)
			{
				spawn_size = 3;
			}
			else if (difference > 15)
			{
				spawn_size = 2;
			}
			
			// sites
			let spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		
			//patrol sites
			let trigger_sites = this.GetTriggerPoints(triggerPointKidnapperGuardPatrol);
		
		
			//templates
			let patrol_templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara","units/pers/infantry_archer_e","units/pers/infantry_archer_e"];

			
			if (spawn_sites.length > 0)
			{
				for (let i = 0; i < spawn_size; i ++)
				{
					let sites = [pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites)];

					//spawn the unit
					let unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites),pickRandom(patrol_templates),1,p);
					
					this.PatrolOrderList(unit_i,p,sites);
				}
			}
			
		}
		
		this.DoAfterDelay(10 * 1000,"SpawnIntervalGuardPatrol",null);
	}
}

Trigger.prototype.SpawnIntervalPatrol = function(data)
{
	//find how many units we already have
	let p = 2;
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
	

	
	if (units.length < this.maxEnemyPatrolSize)
	{
		//warn("Found this many enemy units of player 2: "+uneval(units.length));
	
		
		//decide how many to spawn
		let difference = this.maxEnemyPatrolSize - units.length;
		
		let spawn_size = 5;
		
		if (difference > 100)
		{
			spawn_size = 25;
		}
		else if (difference > 70)
		{
			spawn_size = 20;
		}
		else if (difference > 40)
		{
			spawn_size = 18;
		}
		else if (difference > 20)
		{
			spawn_size = 12;
		}
		
		//warn("spawning this many soldiers: "+uneval(spawn_size));
		
		// sites
		let outposts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
		let sentry_towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"SentryTower").filter(TriggerHelper.IsInWorld);
		
		//templates
		let patrol_templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara","units/pers/infantry_archer_e","units/pers/infantry_archer_e"];

		
		if (outposts.length > 0 && sentry_towers.length > 0)
		{
			for (let i = 0; i < spawn_size; i ++)
			{
				let sites = [pickRandom(outposts),pickRandom(sentry_towers)];

				//spawn the unit
				let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(patrol_templates),1,p);
				
				this.PatrolOrderList(unit_i,p,sites);
			}
		}
		
	}
	
	this.DoAfterDelay(this.intervalPatrol * 1000,"SpawnIntervalPatrol",null);
}

Trigger.prototype.SpawnInitialPatrol = function(data)
{
	let p = 2;//which player
	
	let num_patrols = this.enemyCampPatrolSize;
	
	//templates
	let patrol_templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara","units/pers/infantry_archer_e","units/pers/infantry_archer_e"];

	
	// sites
	let outposts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
	let sentry_towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"SentryTower").filter(TriggerHelper.IsInWorld);
		
	
	for (let i = 0; i < num_patrols; i ++)
	{
		let sites = [pickRandom(outposts),pickRandom(sentry_towers)];
		

		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(patrol_templates),1,p);
		
		this.PatrolOrderList(unit_i,p,sites);
	}
	
	//spawn patrol for player 8
	p = 8;
	
	let trigger_sites = this.GetTriggerPoints(triggerPointKidnapperGuardPatrol);
	
	//spawn site 
	let spawn_site = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
	
	for (let i = 0; i < this.kidnappersPatrolSize; i ++)
	{
		let patrol_sites = [pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites),pickRandom(trigger_sites)];
		

		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(patrol_templates),1,p);
		
		this.PatrolOrderList(unit_i,p,patrol_sites);
	}
}


Trigger.prototype.FlipAssets = function(data)
{
	//get all structures except docks
	let structures_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Structure+!Dock").filter(TriggerHelper.IsInWorld);
	
	for (let u of structures_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	//get all units
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Unit");
	
	for (let u of units_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
}


Trigger.prototype.SpawnElephantBandits = function(data)
{
	//find site
	let site = pickRandom(this.GetTriggerPoints(triggerPointStables));
		
	//spawn elephant
	let templates = ["units/pers/champion_elephant"];
	let p = 0;
	let units_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
	
	//check each idle elephant and make it attack
	let units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);
		
	for (let u of units_ele)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				this.WalkAndFightClosestTarget(u,1,"Melee");
			}
		}
	}
	
	//increment counter
	this.numElephantsSpawned += 1;
	
	if (this.numElephantsSpawned < this.sizeElephants)
	{
		this.DoAfterDelay(this.elephantSpwanInterval * 1000,"SpawnElephantBandits",null);
		
		this.elephantSpwanInterval = this.elephantSpwanInterval * 0.925;
	}
	else {
		//warn("done with elephants!");
	}
}



Trigger.prototype.ActionTradersJourneyStart = function(data)
{
	//make traders move
		
	let p = 6;
		
	//find traders
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Trader").filter(TriggerHelper.IsInWorld);
		
	//find destination
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Dock").filter(TriggerHelper.IsInWorld);
		
	if (traders.length == 0 || docks.length == 0)
	{
		warn("[ERROR] Trader Script Trigger Failure");
		return;
	}
		
	//make traders move towards docks
	//give order to march
	for (let u of traders)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					
		cmpUnitAI.SwitchToStance("passive");
		cmpUnitAI.WalkToTarget(docks[0], false);
	}
	
}


Trigger.prototype.SpawnTradersAmbush = function(data)
{
	let sites = this.GetTriggerPoints(triggerPointTraderAmbush);
	
	let templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara"];
	
	let size = 30;
	
	for (let i = 0; i < size; i ++)
	{
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,0);
	}
	
}

Trigger.prototype.RangeActionTraders = function(data)
{
	if (this.rangeActionTradersTriggered == false)
	{
		//warn("RangeActionTraders triggered");
		this.rangeActionTradersTriggered = true;
		
		this.DoAfterDelay(20 * 1000,"ActionTradersJourneyStart",null);
		this.DoAfterDelay(5 * 1000,"SpawnTradersAmbush",null);
		
		this.ShowText("You happen upon a desparate caravan trying to reach the Dock to the south. The traders ask you to provide escort and in exchange, their horsemen will assist when the final battle comes. The caravans will rest a bit longer and then head out -- scout ahead of them towards the Dock by the camp to make sure the road is safe.","Got it!","Will do");
	}
}



Trigger.prototype.RangeActionStartAssault = function(data)
{
	//warn(uneval(data));
	
	if (this.mainAssaultStarted == false && this.dialogActive == true)
	{
		//ask the user if they want to start the assault
		let text = "Welcome back to camp! We have identified the kidnappers' base, it is just to the north-north-east of our position. We are ready to begin our assault -- our sources report that Alexander is being held in a tent further back in the camp.\n\n"
		
		if (this.tradersQuestComplete == true)
		{
			text = text + "The nomad traders you helped earlier have provided us with some horsemen to assist in the attack. ";
			
		}
		
		if (this.templeQuestComplete == true)
		{
			text = text + "The monks whose relic you found will provide healers over the course of the assault.";
			
		}
		
		if (this.siegeEnginesCaptured == true)
		{
			text = text + "We're lucky you rescued our siege equipment, it will come in handy.\n\n";
		}
		
		text = text + "Are you ready to start the assault? Hint: make sure you have scouted around the enemy base before proceeding, and that all side-quests are complete.";
		
		this.currentDialog = "decision_assault";
		this.ShowText(text,"Yes, let's go!", "No, not yet.");
		
		
		this.dialogActive = false; //disable for a while and schedule a toggle
		this.DoAfterDelay(30 * 1000,"EnableDialog",null);
	
	}
	
	
}

Trigger.prototype.EnableDialog = function(data)
{
	this.dialogActive = true;
}

Trigger.prototype.RangeActionTradersArrival = function(data)
{
	if (this.tradersQuestComplete == false && this.rangeActionTradersTriggered == true)
	{
	
		let num_caravans = 0;
		for (let e of data.currentCollection)
		{
			let id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.indexOf("Trader") >= 0)
			{
				num_caravans ++;
			}
		}
		
		//warn("Found "+num_caravans+" caravans");
		
		//check if this is greater then current estimate
		if (num_caravans > this.numCaravansArrived)
		{
			this.numCaravansArrived ++;
		}
		
		//if one arrive, schedule the completion in 20 seconds
		if (this.firstTraderArrived == false && num_caravans > 0)
		{
			this.firstTraderArrived = true;
			
			this.DoAfterDelay(15 * 1000,"QuestTradersEscortComplete",null);
	
		}
	}
	
}


Trigger.prototype.RangeActionStables = function(data)
{
	if (this.elephantAttackTriggered == false)
	{
		//warn("elephant attack triggered");
		this.elephantAttackTriggered = true;
		
		this.SpawnElephantBandits();
	}
	
	
}

Trigger.prototype.RangeActionTradeOutpost = function(data)
{
	if (this.tradeOutpostQuestGiven == false)
	{
		//warn("Trade quest given");
		//warn("Trade quest given");
		
		//TODO: add text
		this.ShowText("The small trading outpost welcomes you. The traders pledge their support in your cause to free Alexander but ask for help themselves -- a group of bandits based out of an old elephant stable have stolen their equipment, particularly materails needed to build boats. Should you defeat the bandits, the nomad traders will provide you with a boat that may come in handy. The bandit's outpost is located to the north east of here.","I'll try","OK");
		
		this.tradeOutpostQuestGiven = true;
	}
	
}


Trigger.prototype.RangeActionCivilCentre = function(data)
{
	if (this.assetTransferTriggered == false)
	{
		//warn("range action centre");
		this.ShowText("We made it! The town is now under your command. Our immediate task is to fortify it by building towers, fortresses and walls around our base. Meanwhile, we need to find the horsemen's camps and destroy them. ","On it!","OK");
					
		
		
		//flip player 3 to 1
		this.FlipAssets();
		this.assetTransferTriggered = true;
		
		//start rebel attacks
		this.DoAfterDelay(540 * 1000,"RebelAttackRepeat",null);
	}
}


Trigger.prototype.SpawnSquad = function(data)
{
	let p = data.p;
	let templates = data.templates;
	let size = data.size;
	let target_player = data.target_player;
	let target_class = data.target_class;
	let spawn_site = data.spawn_site;
	
	//spawn the units
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < size; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	
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

Trigger.prototype.RebelAttack = function(data)
{
	//warn("rebel attack");
	
	//decide which spawn sites should be used for attack
	let site_distract = pickRandom([triggerPointAttackA,triggerPointAttackB,triggerPointAttackC]);
	
	let site_main = -1;
	if (site_distract == triggerPointAttackA)
		site_main = pickRandom([triggerPointAttackB,triggerPointAttackC]);
	else if (site_distract == triggerPointAttackB)
		site_main = pickRandom([triggerPointAttackA,triggerPointAttackC]);
	else if (site_distract == triggerPointAttackC)
		site_main = pickRandom([triggerPointAttackA,triggerPointAttackB]);
		
	//warn("main = "+site_main);	
	//warn("distract = "+site_distract);	
		
	//find our population
	let cmpPlayer = QueryPlayerIDInterface(1);
	let pop = cmpPlayer.GetPopulationCount();	
		
	//spawn distractors
	let num_squads_distractors = 3;
	let squad_size_distractor = 3+Math.round(pop/25)+this.attackCounter;
	let templates_distractor = ["units/pers/champion_cavalry_archer","units/pers_cavalry_javelinist_e","units/pers_cavalry_javelinist_a","units/pers_cavalry_swordsman_e","units/pers_cavalry_swordsman_a","units/pers_cavalry_spearman_e","units/pers_cavalry_spearman_a","units/pers_cavalry_spearman_b"];
	
	for (let i = 0; i < num_squads_distractors; i ++)
	{
		let data_i = {};
		data_i.p = 5;
		data_i.templates = templates_distractor;
		data_i.size = squad_size_distractor;
		data_i.target_player = 1;
		data_i.target_class = siegeTargetClass;
		data_i.spawn_site = pickRandom(this.GetTriggerPoints(site_distract));
		
		this.DoAfterDelay(5 * 1000,"SpawnSquad",data_i);
	}
	
	//spawn main force
	let num_squads = 2;
	let squad_size = 10+Math.round(pop/18)+2*this.attackCounter;
	
	let templates = ["units/pers/champion_cavalry_archer","units/pers/champion_cavalry_archer","units/pers_cavalry_javelinist_a","units/pers_cavalry_spearman_e","units/pers_champion_cavalry","units/pers_champion_cavalry","units/pers_cavalry_swordsman_e","units/pers_infantry_archer_e","units/pers_infantry_spearman_e","units/pers_infantry_archer_e","units/pers/champion_infantry","units/pers_champion_infantry","units/pers_infantry_javelinist_e","units/pers_infantry_spearman_b","units/pers_infantry_spearman_b","units/pers_mechanical_siege_ram"];
	
	for (let i = 0; i < num_squads; i ++)
	{
		let data_i = {};
		data_i.p = 5;
		data_i.templates = templates;
		data_i.size = squad_size;
		data_i.target_player = 1;
		data_i.target_class = siegeTargetClass;
		data_i.spawn_site = pickRandom(this.GetTriggerPoints(site_main));
		
		this.DoAfterDelay(25 * 1000,"SpawnSquad",data_i);
	}
	
	this.attackCounter = this.attackCounter + 1;
}


Trigger.prototype.RebelAttackRepeat = function(data)
{
	
	this.RebelAttack(); //call the attack
	
	//see if we need to reschedule
	if (this.finalAttackTriggered == false)
	{
		//decrement interval
		this.repeatAttackInterval = Math.round((this.repeatAttackInterval * 0.975)) - 1;
		
		//warn("next attack in "+this.repeatAttackInterval);
		
		this.DoAfterDelay(this.repeatAttackInterval * 1000,"RebelAttackRepeat",null);

	}
	
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
	
}

Trigger.prototype.VictoryCheck = function(data)
{
	//check population level
	let cmpPlayer = QueryPlayerIDInterface(5);
	let pop = cmpPlayer.GetPopulationCount();
	
	//warn("pop = "+pop);
	
	if (pop == 10)
	{
		//victory!
		//warn("Victory!");
		
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
		
		//TriggerHelper.DefeatPlayer(1,markForTranslation("%(player)s has been defeated (lost hero)."));
	}
	else 
	{
		this.DoAfterDelay(15 * 1000,"VictoryCheck",null);
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


Trigger.prototype.IdleUnitCheck = function(data)
{
	
	for (let p of [7])
	{
		if (this.mountainAttackTriggered == true)
		{
		
			let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						//warn("Found idle soldier");
						this.WalkAndFightClosestTarget(u,1,unitTargetClass);
					}
				}
			}
		}
	}
	
	for (let p of [2])
	{
		
		{
		
			let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						
						if (this.mainAssaultStarted == true && this.mainAssaultCounter > 5)
						{
							//warn("Found idle soldier of player 2, attacking");
							if (Math.random() < 0.3)
								this.WalkAndFightClosestTarget(u,1,unitTargetClass);
							else 
								this.WalkAndFightClosestTarget(u,4,unitTargetClass);
						}
						else {
							//warn("Found idle soldier of player 2, patrolling");
							// sites
							let outposts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
							let sentry_towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"SentryTower").filter(TriggerHelper.IsInWorld);
							
							let sites = [pickRandom(outposts),pickRandom(sentry_towers)];
		
							//patrol
							this.PatrolOrderList([u],p,sites);
							
						}
					}
				}
			}
		}
	}
	
	for (let p of [4])
	{
		if (this.mainAssaultStarted == true)
		{
		
			let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						//warn("Found idle soldier");
						this.WalkAndFightClosestTarget(u,2,unitTargetClass);
					}
				}
			}
		}
		else {
			let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						let structures_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
						
						let num_targets = 3;
						let targets = [];
						
						while (targets.length < num_targets)
						{
							targets.push(pickRandom(structures_p));
						}
						
						this.PatrolOrderList([u],p,targets);
					}
				}
			}
		}
	}
}


Trigger.prototype.QuestTradersEscortComplete = function(data)
{
	this.tradersQuestComplete = true;
	
//	warn("Found " + this.numCaravansArrived + " safe caravans");
	
	this.ShowText("Thanks for escorting our caravans! We'll be sure to help when you need us!","Thanks!","OK");
	
}

Trigger.prototype.QuestTradePostComplete = function(data)
{
	this.tradeOutpostQuestComplete = true;
	
	//spawn a trade boat
	let docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6),"Dock").filter(TriggerHelper.IsInWorld);
	
	let unit_i = TriggerHelper.SpawnUnits(docks[0],"units/mace/ship_merchant",1,1);
	
	this.ShowText("Thanks for taking care of our problem! Here, perhaps this boat will be useful to you.","Thanks!","I hate the water...");
	
}

Trigger.prototype.QuestTempleComplete = function(data)
{
	//we can now heal in the temple
	let cmpPlayer6 = QueryPlayerIDInterface(6);
	for (let p of [1])
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		cmpPlayer_p.SetAlly(6);
		
		cmpPlayer6.SetAlly(p);
	}
	
	this.templeQuestComplete = true;
	
}

Trigger.prototype.QuestCityKidnappersComplete = function(data)
{
	this.cityKidnappersKilled = true;
	
	//all units of player 4 start patrolling their camp
	let p = 4;
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
	let structures_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
			
	for (let u of units_p)
	{
		let num_targets = 3;
		let targets = [];
		
		while (targets.length < num_targets)
		{
			targets.push(pickRandom(structures_p));
		}
		
		this.PatrolOrderList([u],p,targets);
	}
	
	this.ShowText("The commander of the city guard thanks you for your help. He is off to the camp to rally the troops and prepare for an assault. Alexander has been taken to a fortified rebel camp not too far to the north east from here.\n\nUnofrtunately, our siege engines have been captured and need rescuing. They are up the river, past a narrow pass. Hurry!","I am on it!","Oh my...");
	
	//siege units get revealed
	this.DoAfterDelay(1 * 1000,"SpawnSiegeAttackers",null);
}

Trigger.prototype.QuestSiegeEnginesCapturedComplete = function(data)
{
	//warn("Siege quest complete!");
	
	//get the camp
	let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
	if (camps_p.length == 0)
	{
		warn("[ERROR] Ally should have a camp!");
		return;
	}
	
	let num_siege = 6; //how many to spawn
	
	//let unit_i = TriggerHelper.SpawnUnits(camps_p[0],"units/mace/siege_oxybeles_packed",num_siege,1);
	
	//destroy all siege by player 1
	let siege_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"Siege").filter(TriggerHelper.IsInWorld);
	for (let u of siege_p)
	{
		let health_s = Engine.QueryInterface(u, IID_Health);
		health_s.Kill();
		
	}
	
	this.ShowText("Great! We have our siege back! We will disassemble it and bring back to the camp view the river. Scout around more for a bit, then come back to the camp to decide when to start the assault.","Sounds good","OK");
	
	this.siegeEnginesCaptured = true;
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
	
}


Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (this.cityKidnappersSpawned == true && this.cityKidnappersKilled == false)
	{
		if (data.from == 2 && data.to == -1)
		{
			this.numKidnappersKilled += 1;
			
			//warn("kidnapper killed");
			
			if (this.numKidnappersKilled >= this.sizeCityKidnappers)
			{
				//warn("Kidnappers killed!");
				
				this.QuestCityKidnappersComplete();
			}
		}
		
	}
	
	//check to make sure the player isn't try to pick off the siege guards one by one -- if one gets killed, all attack
	if (this.siegeAttackersTriggered == false && data.from == 5 && data.to == -1)
	{
		//send all units by 5 to attack 1
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_cav)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					this.WalkAndFightClosestTarget(u,1,"Unit");
				}
			}
		}
		
		this.siegeAttackersTriggered = true;
	}
	
	//check to see if the human player has captured all 3 ballistas
	if (data.from == 5 && data.to == -1)
	{
		//check if siege
		let id = Engine.QueryInterface(data.entity, IID_Identity);
			
		if (id != null && id.classesList.indexOf("Siege") >= 0)
		{
		
			this.numSiegeCaptured += 1;
			
			if (this.numSiegeCaptured == 3)
			{
				//spawn some ballistas near the camp as the ones we captured can't actually be brought back
				this.QuestSiegeEnginesCapturedComplete();
			}
			
			//spawn siege
			//let unit_i = TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_oxybeles_unpacked",1,1);
		}
	}
	
	//check if we killed an elephant
	if (data.from == 0 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
			
		if (id != null && id.classesList.indexOf("Elephant") >= 0)
		{
			this.numElephantsKilled += 1;
			
			if (this.numElephantsKilled >= this.sizeElephants)
			{
				//warn("elephants killed!");
				this.QuestTradePostComplete();
			}
		}
	}
	
	//check if we captured the relic
	if (data.entity == this.pegasusId)
	{
		//warn("Pegasus ackquired!");
		this.hasPegasus = true;
		
		if (this.templeQuestGiven == true)
		{
			this.ShowText("The monks are more than happy that you have found their relic. They have pledged to assist you in the final battle against Alexander's kidnappers.","Sounds good","That was easy!"); 
			this.templeQuestComplete = true;
			this.QuestTempleComplete();
		}
		else 
		{
			this.ShowText("Among the treasure we just found, there is an odd-looking relic statue -- we'll take it along, perhaps it could be reunited with its rightful owner?","Sounds good","That was easy!"); 
		}
	}
	
	//check if tent with alexander got captured or killed
	if (data.entity == this.alexTentId && (data.to == 1 || data.to == -1 || data.to == 4))
	{
		//warn("Alex tent captured!");
		
		//spawn alexander
		let unit_i = TriggerHelper.SpawnUnits(data.entity,"units/mace/hero_alexander_iii",1,1);
		
		let text = "Great! We have found Alexander! We must now destroy the camp's headquarters!"
		
		//spawn 3 healers if we did temple test
		if (this.templeQuestComplete)
		{
			let healers = TriggerHelper.SpawnUnits(data.entity,"units/mace/support_healer_e",3,1);
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
			text = text + "\n\nWe have also found several captured healers from the nearby temple who will gladly help us!";
			//healer tech
			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
		}
		
		if (this.tradeOutpostQuestComplete == true)
		{
			text = text + "\n\nThere are also a few captives from the nomad traders' village who are eager to exact revenge!";
			
			let archers = TriggerHelper.SpawnUnits(data.entity,"units/maur/champion_maiden_archer",6,1);
			let soldiers = TriggerHelper.SpawnUnits(data.entity,"units/maur/champion_maiden",6,1);
		}
		
		this.alexRescued = true;
		
		
		this.ShowText("Great! We have found Alexander! We must now destroy the camp's headquarters!","On it!","Great!");
	}
	
	//check if we destroyed the camp of kidnappers
	if (data.from == 2 && data.entity == this.campId)
	{
		//warn("Camp destroyed!");
		
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);
	}
	
	if (data.from == 2 && (data.to == 1 || data.to == 4))
	{
		//if captured building, we destroy it
		let health_s = Engine.QueryInterface(data.entity, IID_Health);
		if (health_s)
			health_s.Kill();
	}
	
	//check if hero from player 1
	if (data.from == 1 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
			
		if (id != null && id.classesList.indexOf("Hero") >= 0)
		{
			TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);
		}
		
	}
}


Trigger.prototype.ResearchTechs = function(data)
{
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			//attack
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
			
			//armor
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");
			
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
			cmpTechnologyManager.ResearchTechnology("archer_attack_spread");
			cmpTechnologyManager.ResearchTechnology("nisean_horses");
			
			
			/*cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			
			//improve skirmisher hero
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
	
			//hero armor
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
			//melee attack
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			
			//archer attack
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");

			*/
		}
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


Trigger.prototype.SpawnSiegeAttackers = function(data)
{
	let p = 5;
	
	//find siege units
	let siege = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
	
	
	//spawn some units next to each siege unit
	let squad_size = 9;
	let templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara"];
	for (let site of siege)
	{
		for (let i = 0; i < squad_size; i ++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		}
	}
	
	//change ownership of siege units
	/*for (let u of siege)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(4);
	}
	
	this.DoAfterDelay(5 * 1000,"FlipSiegeUnits",null);*/
}

Trigger.prototype.FlipSiegeUnits = function(data)
{
	let siege = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4),"Siege").filter(TriggerHelper.IsInWorld);
	//change ownership of siege units
	
	for (let u of siege)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(5);
	}
	
}

Trigger.prototype.SpawnArcherAmbush = function(data)
{
	let p = 0;
	
	let squad_size = 8;
	let hero_size = 4;
	
	let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
	
	for (let site of towers)
	{
		TriggerHelper.SpawnUnits(site,"units/pers/infantry_archer_e",squad_size,p);
		
		TriggerHelper.SpawnUnits(site,"units/pers/hero_xerxes_i",hero_size,p);
	}
}


Trigger.prototype.SpawnMountainSquads = function(data)
{
	//see if we still have camp
	let p = 7;
	
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	let triggerSites = this.GetTriggerPoints(triggerPointMountainAttackSpawn);
	
	if (camps.length == 0)
	{
		return;//done
	}
	
	//site for each unit will be chosen randomly from this list
	let sites = [camps[0],camps[0],triggerSites[0]];
	
	//templates to use
	let templates = ["units/maur/infantry_archer_e","units/maur/infantry_spearman_e","units/maur/infantry_swordsman_e","units/maur/champion_infantry_maceman","units/maur/champion_maiden"];
	
	//spawn some units near the camp and a trigger point
	let size = Math.floor(this.mountainSquadSize);
	for (let i = 0; i < size; i ++)
	{
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,p);
		
		let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				this.WalkAndFightClosestTarget(unit_i[0],1,"Melee");
			}
		}
	}
	
	//increment counters
	this.mountainSquadSize *= this.mtGrowthFactor;
	//warn("New squad size = "+this.mountainSquadSize);
	
	this.mountainAttackLevel ++;
	
	//schedule next attack
	if (this.mountainAttackLevel < 15/*this.mountainAttackLevelMax*/)
	{
		this.DoAfterDelay(this.mountainAttackInterval * 1000,"SpawnMountainSquads",null);
	}
	else 
	{
		//warn("End of mt attacks");
	
	
	
	}
	
}

Trigger.prototype.RangeActionTempleQuest = function(data)
{
	if (this.templeQuestGiven == false)
	{
		
		if (this.hasPegasus == false)
		{
			
			//warn("Temple Quest Given");
			this.ShowText("You encounter an ancient monestary next to the mountains. The head monk greets you with respect and shares the story of how recently, a group of bandits from up in the mountains stole a relic from the monks. Should you rerieve it, they'll offer their support in your quest to free Alexander.","We'll do what we can.","Perhaps.")
			
			this.templeQuestGiven = true;
		}
		else {
			this.ShowText("You encounter an ancient monestary next to the mountains. The head monk greets you with respect and shares the story of how recently, a group of bandits from up in the mountains stole a relic from the monks. As you have already found the relic, you give it to the monks and in exchange, they agree to help you in your final battle against Alexander's kidnappers","Great!","Thanks!")
			
			this.templeQuestGiven = true;
			this.templeQuestComplete = true;
			this.QuestTempleComplete();
		}
	}
	
	
}

Trigger.prototype.RangeActionMountainAttack = function(data)
{
	if (this.mountainAttackTriggered == false)
	{
		//start spawn attacks from player 7
		this.DoAfterDelay(this.mountainAttackInterval * 1000,"SpawnMountainSquads",null);
		
		//warn("Mountain attack started");
		
		this.ShowText("As you make it down this narrow pass, you suddenly spot a look out bandit making a get-away. We have been spotted and must prepared for battle!","Great","OK");
		
		
		this.mountainAttackTriggered = true;
	}
	
	
}

Trigger.prototype.RangeActionArcherAmbush = function(data)
{
	//warn("archer trigger point");
	if (this.archerAmbushStarted == false)
	{
		this.archerAmbushStarted = true;
		
		//warn("archer ambush started now");
		this.DoAfterDelay(1 * 1000,"SpawnArcherAmbush",null);
	
	}
}

Trigger.prototype.SpawnCityKidnappers = function(data)
{
	let p = 2;
	let size = this.sizeCityKidnappers;
	
	
	let templates = ["units/pers/champion_infantry","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher","units/pers/arstibara"];
	
	let sites = this.GetTriggerPoints(triggerCityKidnappers);
	
	for (let i = 0; i < size; i ++)
	{
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(templates),1,p);
	}
	
	this.cityKidnappersSpawned = true;
}

{
	//notes
	/* it takes about 5000 stone to build the wall
	 * another 1200 to get all tower upgrades
	 */
	 
	//brit cata: speed and vision for soldiers, range for javelins
	//iber cata: health for soldiers
	//rome cata: +1 armor
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants
	cmpTrigger.sizeCityKidnappers = 60;
	cmpTrigger.sizeElephants = 20;
	cmpTrigger.elephantSpwanInterval = 5; //seconds
	
	//difficulty related constants
	cmpTrigger.enemyCampPatrolSize = 80;
	cmpTrigger.kidnappersPatrolSize = 30; //initail
	cmpTrigger.maxEnemyPatrolSize = 130;
	cmpTrigger.maxEnemyKidnappersPatrolSize = 70; //max
	cmpTrigger.intervalPatrol = 3;
	
	//relic
	cmpTrigger.pegasusId = 3737;
	
	//tent with alexander
	cmpTrigger.alexTentId = 3859;
	
	//id of camp to be destroyed
	cmpTrigger.campId = 3492;
	
	//state variables
	cmpTrigger.currentDialog = "none";
	cmpTrigger.dialogActive = true;
	
	cmpTrigger.mainAssaultCounter = 0;
	
	cmpTrigger.cityKidnappersSpawned = false;
	cmpTrigger.cityKidnappersKilled = false;
	cmpTrigger.numKidnappersKilled = 0;
	
	cmpTrigger.archerAmbushStarted = false;
	
	cmpTrigger.siegeAttackersTriggered = false;
	cmpTrigger.numSiegeCaptured = 0;
	cmpTrigger.siegeEnginesCaptured = false;
	
	cmpTrigger.tradeOutpostQuestGiven = false;
	cmpTrigger.tradeOutpostQuestComplete = false;
	cmpTrigger.elephantAttackTriggered = false;
	cmpTrigger.numElephantsSpawned = 0;
	cmpTrigger.numElephantsKilled = 0;
	
	cmpTrigger.rangeActionTradersTriggered = false;
	cmpTrigger.tradersQuestComplete = false;
	cmpTrigger.numCaravansArrived = 0;
	cmpTrigger.firstTraderArrived = false;
	
	cmpTrigger.templeQuestGiven = false;
	cmpTrigger.templeQuestComplete = false;
	cmpTrigger.hasPegasus = false;
	cmpTrigger.mountainAttackTriggered = false;
	cmpTrigger.mountainSquadSize = 12;
	cmpTrigger.mountainAttackLevel = 1;
	cmpTrigger.mountainAttackLevelMax = 30;
	cmpTrigger.mountainAttackInterval = 7;
	cmpTrigger.mtGrowthFactor = 1.075;
	
	cmpTrigger.mainAssaultStarted = false;
	cmpTrigger.alexRescued = false;
	
	//garrison entities
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//initial patrol
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInitialPatrol",null);
	
	//interval patrol spawn for player 2 and 8
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnIntervalPatrol",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnIntervalGuardPatrol",null);
	
	//start techs
	cmpTrigger.DoAfterDelay(2,"ResearchTechs",null);
	
	//city kidnappers
	cmpTrigger.DoAfterDelay(2,"SpawnCityKidnappers",null);
	
	
	
	//debug
	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnArcherAmbush",null);
	//cmpTrigger.DoAfterDelay(5 * 1000,"SpawnSiegeAttackers",null);
	
	//test main attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"StartMainAttack",null);
	
	
	//mark some quests as already complete for debugging
	//cmpTrigger.DoAfterDelay(10 * 1000,"QuestTempleComplete",null);
	//cmpTrigger.DoAfterDelay(5 * 1000,"QuestCityKidnappersComplete",null);
	//cmpTrigger.DoAfterDelay(15 * 1000,"QuestSiegeEnginesCapturedComplete",null);
	//cmpTrigger.DoAfterDelay(12 * 1000,"QuestTradersEscortComplete",null);
	//cmpTrigger.DoAfterDelay(13 * 1000,"QuestSiegeEnginesCapturedComplete",null);
	
	//disable templates and add some techs
	let cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);

	for (let p of [1,2,3,4,5,6,7,8])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates
		let disTemplates = ["structures/" + cmpPlayer.GetCiv() + "/civil_centre","structures/" + cmpPlayer.GetCiv() + "/dock"];
		
		let hero_templates = TriggerHelper.GetTemplateNamesByClasses("Hero", cmpPlayer.GetCiv(), undefined, undefined, true);
		disTemplates = disTemplates.concat(hero_templates);
		
		if (p == 3)
			disTemplates = disTemplates.concat(disabledTemplates(cmpPlayer.GetCiv()));
		
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
			
			//some modifiers
			//hero bonuses
			cmpModifiersManager.AddModifiers("Hero Piercing Armor Bonus", {
							"Resistance/Entity/Damage/Pierce": [{ "affects": ["Hero"], "add": 6}],
						}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Hero Hack Armor Bonus", {
							"Resistance/Entity/Damage/Hack": [{ "affects": ["Hero"], "add": 6}],
						}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Hero Crush Armor Bonus", {
							"Resistance/Entity/Damage/Crush": [{ "affects": ["Hero"], "add": 10}],
						}, cmpPlayer.entity);
						
			cmpModifiersManager.AddModifiers("Hero Ranged Rate Bonus", {
							"Attack/Ranged/RepeatTime": [{ "affects": ["Ranged+Hero"], "multiply": 0.5}],
						}, cmpPlayer.entity);
		}
	}
	
	//set diplomacy
	
	//player 6 is neutral to all
	let cmpPlayer6 = QueryPlayerIDInterface(6);
	for (let p of [1,2,3,4,5,8])
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		cmpPlayer_p.SetNeutral(6);
		
		cmpPlayer6.SetNeutral(p);
	}
	
	//player 4 is neutral towards 3
	let cmpPlayer4 = QueryPlayerIDInterface(4);
	cmpPlayer4.SetNeutral(3);
	
	
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTradersArrival", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointTradeOutpost), // central points to calculate the range circles
		"players": [6], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTradeOutpost", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointTradeOutpost), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionStables", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointStables), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionArcherAmbush", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointAmbush), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTraders", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointTraders), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionMountainAttack", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointMountainAttack), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTempleQuest", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointTempleQuest), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionStartAssault", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointStartAssault), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	

}
