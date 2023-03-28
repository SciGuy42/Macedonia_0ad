warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointInf = "I";
var triggerPointPersInf = "K";
var triggerPointCav = "C";
var triggerPointEle = "E";
var triggerPointSiege = "A";



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
	
	//military
	"structures/" + civ + "/barracks",
	"structures/" + civ + "/apartment",
	"structures/" + civ + "/defense_tower",
	"structures/" + civ + "/tower_bolt",
	"structures/" + civ + "/tower_artilery",
	"structures/" + civ + "/elephant_stable",
	"structures/" + civ + "/forge",
	"structures/" + civ + "/arsenal",
	"structures/" + civ + "/fortress",
	"structures/" + civ + "/range",
	"structures/" + civ + "/stable",
	"structures/" + civ + "/temple",
	"structures/" + civ + "/outpost",
	
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
	"units/" + civ + "/support_female_citizen",
	
	//embasies
	"structures/cart/embassy_celtic",
	"structures/cart/embassy_italic",
	"structures/cart/embassy_iberian"
];


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

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	//let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	if (data.from == 0 && data.to == 1)
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
			
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			//cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			//cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			//cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
				
		}
	}
	
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
			
			warn("target cluster = "+target_cluster);
			
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
	

	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [2,3])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",5,p);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		if (p == 5)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",10,p);
			
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
	this.idleCheckCounter += 1;
	
	warn("status counter = "+this.idleCheckCounter);
	
	if (this.idleCheckCounter == 50) //25 minutes in
	{
		this.DoAfterDelay(5 * 1000,"StartNextAttack",null);
	}
	
	
	for (let p of [2,3])
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
}


Trigger.prototype.RandomTemplatePers= function(data)
{
	let r = Math.random();
	
	if (r < 0.925)
		return pickRandom(this.pers_inf_templates);
	else if (r < 0.975)
		return pickRandom(this.pers_cav_templates);
	else 
		return pickRandom(this.pers_ele_templates);
}


Trigger.prototype.RandomTemplateMace= function(data)
{
	let r = Math.random();
	
	if (r < 0.9)
		return pickRandom(this.mace_inf_templates);
	else if (r <= 1.0)
		return pickRandom(this.mace_cav_templates);
	else 
		return pickRandom(this.mace_siege_templates);
}



Trigger.prototype.StartNextAttack = function(data)
{
	warn("Starting attack "+uneval(this.attack_index));
	
	if (this.attack_index == 0)
	{
		this.ShowText("The enemy forces are in sight! Prepare for battle!","We're readdy!","May the Gods help us!");
	}
	else if (this.attack_index == 1)
	{
		this.ShowText("A second wave is approaching! Prepare!","We're readdy!","May the Gods help us!");
	}
	else if (this.attack_index == 2)
	{
		this.ShowText("The last of the enemy forfes are approaching! If we survive this assault, we win!","We're readdy!","May the Gods help us!");
	}
	
	//spawn pers infantry
	let owner = 3;
	for (let i = 0; i < this.attack_level; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointPersInf));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.pers_inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn kush infantry
	owner = 2;
	for (let i = 0; i < this.attack_level; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointInf));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.kush_inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn elephants
	owner = 2;
	for (let i = 0; i < Math.floor(this.eleRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointEle));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.kush_ele_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn kush cavalry
	owner = 2;
	for (let i = 0; i < Math.floor(this.cavRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.kush_cav_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn pers cavalry
	owner = 3;
	for (let i = 0; i < Math.floor(this.cavRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.pers_cav_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	//spawn pers siege
	owner = 3;
	for (let i = 0; i < Math.floor(this.siegeRatio*this.attack_level); i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointCav));
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.pers_siege_templates),1,owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],1,siegeTargetClass);
	}
	
	
	//increment variables
	this.attack_level = this.attack_level + 20;
	this.attack_index = this.attack_index + 1;
	this.eleRatio = this.eleRatio * 1.15;
	
	if (this.attack_index == 2)
	{
		this.pers_siege_templates.push("units/mace/siege_lithobolos_packed");
	}
	
	if (this.attack_index < 3)
		this.DoAfterDelay(300 * 1000,"StartNextAttack",null);
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


Trigger.prototype.InitGaiaClusters = function(data)
{
	//get all gaia soldiers
	let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Soldier+!Elephant").filter(TriggerHelper.IsInWorld);
	
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

	// Activate all possible triggers
	let data = { "enabled": true };
	/*cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/

	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//cluster gaia units
	cmpTrigger.DoAfterDelay(1 * 1000,"InitGaiaClusters",null);

	
	cmpTrigger.pers_inf_templates = ["units/pers/arstibara", "units/pers/champion_infantry","units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a","units/pers/infantry_spearman_a", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"]
	
	cmpTrigger.pers_cav_templates = ["units/pers/cavalry_archer_a","units/pers/cavalry_javelineer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a","units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
	
	cmpTrigger.pers_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "pers", undefined, undefined, true);
	
	cmpTrigger.kush_inf_templates = ["units/kush/champion_infantry_archer", "units/kush/champion_infantry_amun", "units/kush/champion_infantry_apedemak","units/kush/infantry_archer_a","units/kush/infantry_maceman_merc_a","units/kush/infantry_javelineer_merc_a", "units/kush/infantry_javelineer_merc_b", "units/kush/infantry_pikeman_a", "units/kush/infantry_spearman_a", "units/kush/infantry_swordsman_a"];
	
	cmpTrigger.kush_cav_templates = ["units/kush/cavalry_javelineer_a", "units/kush/cavalry_javelineer_merc_a","units/kush/cavalry_spearman_a", "units/kush/champion_cavalry"];
	
	cmpTrigger.kush_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "kush", undefined, undefined, true);
	
	//some variables
	cmpTrigger.attack_index = 0;
	cmpTrigger.attack_level = 100;
	
	cmpTrigger.cavRatio = 0.45;
	cmpTrigger.eleRatio = 0.06;
	cmpTrigger.siegeRatio = 0.05;
	
	cmpTrigger.idleCheckCounter = 0;
	
	
	for (let p of [1,2,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		cmpPlayer.SetPopulationBonuses(300);
		
		//disable troop production
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		
		if (p == 2 || p == 3)
			cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("siege_health");
			cmpTechnologyManager.ResearchTechnology("siege_attack");
			cmpTechnologyManager.ResearchTechnology("siege_bolt_accuracy");
		}
		
	}
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
	//22 minutes in, it starts
	//cmpTrigger.DoAfterDelay(1320 * 1000,"StartNextAttack",null);
	//cmpTrigger.DoAfterDelay(5 * 1000,"StartNextAttack",null);
	
	//then 27 and 32 minutes for next 2 attacks
	
	//40 minutes in, if we survive, we win
	
	//triggers
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
};
