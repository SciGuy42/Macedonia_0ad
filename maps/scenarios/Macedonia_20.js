warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

var triggerPointsGoat = "A";
var triggerPointsAttack = "B";
var triggerPointsElephantVillage = "C";
var triggerPointsArmyMessage = "D";
var triggerPointsTemple = "E";
var triggerPointsPyramid = "F";
var triggerPointsHolyGuardAttack = "G";
var triggerPointsSpy = "K";
var triggerPointsFieldBattleStart = "I";
var triggerPointsBanditGuards = "H";

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

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
	"structures/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",
	
	//villagers
	"units/" + civ + "/support_female_citizen"
];

var textQuestStart = "You have arrived at a small hamlet. The locals are stunned to see you in real life and bow to you as if you're a living God. \n\nAlas, not all is well in the hamlet! A band of brigands have kidnapped several villagers and have also raided the hamlet's food supply. The hamlet's elders humbly ask for your help -- the camp of the brigands shouldn't be far to the east from here. \n\nIn addition, the hamelet is starving. Should you be able to acquire some goats or other game, bring them to the hamlet.";
var textQuestGoatComplete = "The villagers thank you sincerely for helping them replenish their food supply. One of the villagers is a skilled blacksmith and immediately gets to work on your soldiers' resistance to improve it. The village elder shares some knowledge of surrounding areas -- go ahead and take a look.";
var textQuestRescueComplete = "Way to go! The brigands are now defeated. Several local warriors are so inspired that they decide to join you on your quest. They reveal some information about the local area that may be useful in your travels.";
var textQuestCaravanGiven = "You stumble upon a small village -- in dire need of help. The villagers ask for help securing good and supplies. They used to have a trading routing with a trading post far to the west -- perhaps you can find it and help the village secure some caravans. The trading post lies past a narrow mountain pass that is being occupied by bandits -- perhaps the villagers you encountered earlier already shared the location of that pass.";
var textQuestArchersGiven = "The villagers bow to you at the site of the supplies you have brought them. They now ask for help one more time. A local tribe, famous for its archers, continues to raid the village. Destroy them and in exchange, the village elder promises to give you a special gift -- a pair of elephants equipped with the best riders of the land.";
var textQuestArchersComplete = "Excellent! As promised, here are our elephants. Use them wisely, they are the only ones we can spare! We will also share our knowledge of an ancient temple. The priests there may decide to guide you in your quest. Another piece of knowledge that may come in useful: north of our village, there lies a hidden abandoned siege workshop -- it is rumored that it still holds useful equipment that may come in handy before you meet your allied forces.";
var textQuestTempleGiven = "Several priests walk out of the temple and greet you with pleasure and admiration. They humbly ask for your help -- not far from here, there is a pyramid complex. Grave robbers have gotten inside and are looting the tombs! Destroy them and we will share great knowledge with you and provide you with some of our holy warriors to aid you in your quest.";
var textQuestMessageGiven = "A messenger from our allied garrison approaches. He thankks the gods he found you and asks you to urgently head towards the army camp -- they are expecting an imminent attack and are requesting your help! If you have found any siege equipment, bring it, we'll need it! Arrive with all your army togeher!";
var textQuestMessageComplete = "After the battle, the commander thanks you for your help and several of his soldiers join you. The commander also reveals information revealed by one of his spies pertaining to the location of Amenhotep's hideout. The hideout is located past a narrow mountain pass, revealed by the spy who is now heading back to camp. Should you advance into the pass, you will encounter Amenhotep's guards, so be ready for battle! Good luck on your quest!";
var textQuestFinalEncounter = "Amenhotep's guards are dead. It is now time to finish him once and for all. As the Oracle demanded, you must face this encounter alone -- leave your troops behind and search the remaining desert for Amenhotep. He deserves nothing but death!";
	
	
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

Trigger.prototype.ResearchQueuedAction = function(data)
{
	//warn("The OnResearchQueued event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	if (data.from == 0 && data.to == 1)
	{
		if (id.classesList.indexOf("Corral") >= 0)
		{
			warn("corral captured");
			
			//how to change ownership
			//var cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
			//cmpOwnership.SetOwner(bestPlayer);
			
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			
		
		}
		else if (data.entity == 6491)
		{
			warn("trading post captured");
			
			if (this.questCaravansSpawned == false && this.questCaravansGiven == true)
			{
				//spawn 4 caravans
				TriggerHelper.SpawnUnits(6491,"units/kush/support_trader",4,1);
				
				this.questCaravansSpawned = true;
			}
			
			//change ownership back
			var cmpOwnership = Engine.QueryInterface(6491, IID_Ownership);
			cmpOwnership.SetOwner(0);
		}
		else if (data.entity == 6839) //siege shop
		{
			if (this.ballistaCaptured == false)
			{
				let spawn_site = 6404; //alexander
				TriggerHelper.SpawnUnits(6839,"units/mace/siege_oxybeles_packed",4,1);
				this.ballistaCaptured = true;
				
				//add some siege tech
				let cmpPlayer = QueryPlayerIDInterface(1);
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				cmpTechnologyManager.ResearchTechnology("siege_attack");
				cmpTechnologyManager.ResearchTechnology("siege_health");
			}
			
			//change ownership back
			var cmpOwnership = Engine.QueryInterface(6839, IID_Ownership);
			cmpOwnership.SetOwner(0);
		}
		
	}
	else if (data.from == 2 && (data.to == 1 || data.to == -1) && id.classesList.indexOf("MercenaryCamp") >= 0)
	{
		//completes rescue quest
		this.questRescueComplete = true;
		
		this.QuestRescueReward();
		
		//expected loot - 739 food, 119 wood, 40 metal
	}
	
	
	//separate check
	if (data.from == 0 && data.entity == 6650) //archer tribe quest complete
	{
		this.questArcherTribeComplete = true;
		warn("conquered archer tribe");
		
		//lose siege towers, get some reward
		this.QuestArchersReward();
	}
	else if (data.from == 0  && data.entity == 6647) //siege tower
	{
		let spawn_site = 6404; //alexander
		TriggerHelper.SpawnUnits(spawn_site,"units/kush/siege_tower",1,1);
			
	}
	
	//check hero of player 8
	if (data.from == 8 && data.entity == 6919)
	{
		warn("YOU WIN");
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};



Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
	
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


Trigger.prototype.PatrolOrder = function(units,p)
{
	
	if (units.length <= 0)
		return;
	
	//make them patrol
	let patrolTargets = [];
	
	//list of ccs, gates, and docks
	let patrolTargetPool = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	

	if (patrolTargetPool.length < 3)
		return;

	//randomly pick 3 gates
	while (patrolTargets.length < 3)
	{
		let target_k = Math.floor(Math.random() * patrolTargetPool.length);
		if (patrolTargets.indexOf(patrolTargetPool[target_k]) < 1) 
			patrolTargets.push(patrolTargetPool[target_k]);
	}

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
			"queued": false,
			"allowCapture": false
		});
	}
}


//garison AI entities with archers
Trigger.prototype.SpawnSquad = function(data)
{
	//persia
	let p = 4; 
	
	//spawn random infantry next to a outpost
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
	let site_j = pickRandom(ccs);
	
	let pers_inf_templates = ["units/pers/arstibara","units/pers/champion_infantry","units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher","units/pers/infantry_archer_b"];
	
	let pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	
	let squad_size = 7;
	let ele_prob = 0.35; //probability of a squad having an elephant
	
	let units = [];
	
	//melee
	for (let i = 0; i < squad_size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(pers_inf_templates),1,p);
		units.push(unit_i[0]);
	}
		
	//maybe add elephant
	if (Math.random() < ele_prob)
	{
		let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(pers_ele_templates),1,p);
		units.push(unit_i[0]);
	}
		
	//set formation
	TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		
	//send to attack
	//find target
	let target = this.FindClosestTarget(units[0],6,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
		
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}


//garison AI entities with archers
Trigger.prototype.SpawnCavalrySquad = function(data)
{
	//persia
	let p = 4; 
	
	//spawn random infantry next to a outpost
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
	let site_j = pickRandom(ccs);
	
	let pers_cav_templates = ["units/pers/cavalry_javelineer_a","units/pers/cavalry_spearman_a","units/pers/cavalry_axeman_a","units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
	
	let pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	
	let squad_size = 7;
	let ele_prob = 0.5; //probability of a squad having an elephant
	
	let units = [];
	
	//melee
	for (let i = 0; i < squad_size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(pers_cav_templates),1,p);
		units.push(unit_i[0]);
	}
		
	//set formation
	TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

	//send to attack
	//find target
	let target = this.FindClosestTarget(units[0],6,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
		
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}


//garison AI entities with archers
Trigger.prototype.CheckHolyGuardBattleEnd = function(data)
{
	if (this.questHolyBattleComplete == false)
	{
		let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(7), "Unit").filter(TriggerHelper.IsInWorld);
		
		if (units_p.length == 0)
		{
			this.questHolyBattleComplete = true;
			
			this.ShowText(textQuestFinalEncounter,"Got it, only Alexnader may proceed.","Great!");
			
			
			this.DoAfterDelay(5 * 1000,"SeizePlayerTroops",0);

		}
		else 
		{
			this.DoAfterDelay(15 * 1000,"CheckHolyGuardBattleEnd",0);
		}
	}
	
}

//garison AI entities with archers
Trigger.prototype.CheckFieldAttackEnd = function(data)
{
	if (this.questArmyComplete == false)
	{
		//which player
		let p = 4; 
		
		//check how many units they have at start
		//spawn random infantry next to a cc
		let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		
		if (units_p.length <= this.persiaUnitsDefault)
		{
			
			this.questArmyComplete = true;
			warn("field attack defeated");
			
			this.QuestFieldBattleReward();
		}
		else
		{
			this.DoAfterDelay(15 * 1000,"CheckFieldAttackEnd",0);
			
		}
	}
	
}

//garison AI entities with archers
Trigger.prototype.SpawnFieldAttack = function(data)
{
	this.fialdAttackStarted = true;
	
	//which player
	let p = 4; 
	
	//check how many units they have at start
	//spawn random infantry next to a cc
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	this.persiaUnitsDefault = units_p.length;
	this.DoAfterDelay(30 * 1000,"CheckFieldAttackEnd",0);
			
	
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//calculate size of spawn units
	let num_squads_inf = 12;
	let num_squads_inf_wave_2 = 8;
	let num_squads_cav = 5;
	let ele_prob = 0.5; //probability of a squad having an elephant
	
	let pers_inf_templates = ["units/pers/arstibara","units/pers/champion_infantry","units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher","units/pers/infantry_archer_b"];
	let pers_cav_templates = ["units/pers/cavalry_javelineer_a","units/pers/cavalry_spearman_a","units/pers/cavalry_axeman_a","units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
	let pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	
	//spawn infantry
	for (let j = 0; j < num_squads_inf; j++)
	{
		this.SpawnSquad();
	}
	
	//spawn infantry wavev 2
	for (let j = 0; j < num_squads_inf_wave_2; j++)
	{
		this.DoAfterDelay(25 * 1000,"SpawnSquad",0);
	}
	
	//spawn cavalry
	for (let j = 0; j < num_squads_cav; j++)
	{
		this.DoAfterDelay(33 * 1000,"SpawnCavalrySquad",0);
	}
}


Trigger.prototype.SpawnPassSpy = function(data)
{
	//spawn unit
	let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointsSpy));
	let owner = 6;
	let u = TriggerHelper.SpawnUnits(triggerPoint, "units/kush/cavalry_javelineer_a", 1, owner);
	
	//give it order to walk away
	let target = this.FindClosestTarget(u[0],6,"Structure");
			
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
		
	ProcessCommand(owner, {
		"type": "attack-walk",
		"entities": u,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}

Trigger.prototype.SeizePlayerTroops = function(data)
{
	//check for alexander
	let alex = 6404;
	
	//get list of every unit id
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);
	
	//for each, change ownership and send them packing
	for (let u of units)
	{
		if (u != alex)
		{
			var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
			cmpOwnership.SetOwner(6);
			
			let target = this.FindClosestTarget(u,6,"Structure");
			
			var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
			
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			
			cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
		}
		
	}
   	
}

//pyramid warriors quest
Trigger.prototype.SpawnPyramidWarrior = function(data)
{
	let pyramids = [6619,6620,6621];
	let count_limit = 40; //only up to some number
	
	warn("pyramid warrior " +uneval(this.pyramidSpawnCounter));
	
	if (this.pyramidSpawnCounter > this.pyramidSpawnLimit)
	{
		this.templeQuestComplete = true;
		
		this.QuestTempleReward();
		
		//done
		return;
	}
	
	let fraction_index = Math.floor((this.pyramidSpawnCounter / this.pyramidSpawnLimit) * (this.kush_inf_ordered.length - this.pyramidWaveSize));
	warn("index = "+uneval(fraction_index));
	
	//set order in terms of difficulty
	this.kush_inf_ordered = ["units/kush/infantry_archer_b","units/kush/infantry_spearman_b","units/kush/infantry_archer_a","units/kush/infantry_spearman_a","units/kush/infantry_swordsman_b","units/kush/infantry_archer_e","units/kush/infantry_pikeman_b","units/kush/infantry_swordsman_a","units/kush/infantry_maceman_merc_b","units/kush/champion_infantry_archer","units/kush/infantry_pikeman_a","units/kush/cavalry_javelineer_merc_b","units/kush/infantry_javelineer_merc_b","units/kush/infantry_spearman_e","units/kush/infantry_maceman_merc_a","units/kush/cavalry_javelineer_merc_a","units/kush/infantry_pikeman_e","units/kush/infantry_javelineer_merc_a","units/kush/infantry_swordsman_e","units/kush/cavalry_javelineer_merc_a","units/kush/infantry_javelineer_merc_e","units/kush/champion_infantry_archer","units/kush/infantry_maceman_merc_e","units/kush/champion_infantry_amun","units/kush/champion_cavalry","units/kush/champion_infantry_apedemak","units/kush/champion_elephant"];
	
	
	let unit_list_length = this.kush_inf_ordered.length;
	warn(uneval(unit_list_length));
	
	//spawn units
	for (let i = 0; i < this.pyramidWaveSize; i ++)
	{
		let site_i = pickRandom(pyramids);
		let unit_i = TriggerHelper.SpawnUnits(site_i,this.kush_inf_ordered[i+fraction_index],1,0);
	}
	
	this.pyramidSpawnCounter += 1;
	this.DoAfterDelay(6 * 1000,"SpawnPyramidWarrior",0);
	
}



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	warn("garrisoning entities");
	
	for (let p of [0,2,4,5,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		

		for (let e of towers_p)
		{
			
			if (p == 0)
			{
				let archers_e = TriggerHelper.SpawnUnits(e, "units/kush/champion_infantry_amun",3,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
			else
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",5,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
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
		/*let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		for (let e of towers_w)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,p);
				
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}*/
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/kush/champion_infantry_amun",1,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		if (p == 6 || p == 4)
		{
			let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
			
			for (let c of camps_p)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(c, "units/kush/infantry_archer_a",1,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(c,true);
				}
			}
		}
		
		if (p == 5)
		{
			let embs_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Embassy").filter(TriggerHelper.IsInWorld);
			
			for (let c of embs_p)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(c, "units/kush/champion_infantry_amun",5,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(c,true);
				}
			}
		}
	}
}	



Trigger.prototype.RangeActionHolyGuard = function(data)
{
	
	if (this.holyGuardAttackStarted == false)
	{


		this.ShowText("The Cult's guards are attacking...get ready!","Yes, Sir!","Oh boy...");
		
		
		warn("Holy guard attack");
		
		let p = 7;
		let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_p)
		{
			this.WalkAndFightClosestTarget(u,1,unitTargetClass);
		}
		this.holyGuardAttackStarted = true;
		
		this.DoAfterDelay(30 * 1000,"CheckHolyGuardBattleEnd",0);
	}
	
}

Trigger.prototype.RangeActionTriggerAttack = function(data)
{
	//warn(uneval(data));
	//warn(this.questGoatComplete +"\t"+this.suddenAttackComplete);
	
	if (this.questGoatComplete == true && this.suddenAttackComplete == false)
	{
		warn("starting attack!");
		//find spawn point
		let spawn_site = 6493;
		let spawn_size = 30;
		let owner = 4;
		
		for (let i = 0; i < spawn_size; i++)
		{
			//decide what to spawn
			let unit_type = pickRandom(["units/pers/arstibara","units/pers/champion_infantry","units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher","units/pers/infantry_archer_e","units/pers/infantry_spearman_a", "units/pers/infantry_spearman_a","units/pers/infantry_spearman_a","units/pers/infantry_javelineer_a","units/pers/infantry_javelineer_a",]);
			let spawned_units = TriggerHelper.SpawnUnits(spawn_site,unit_type,1,owner);
			
			//issue orders
			for (let u of spawned_units)
			{
				this.WalkAndFightClosestTarget(u,3,"Structure");
			}
		}
		
		this.suddenAttackComplete = true;
	}


	if (this.questCaravanAttack == false && this.questCaravansGiven == true)
	{
		//check if a caravan has moved close
		let num_caravans = 0;
		let caravans = [];
		for (let e of data.currentCollection)
		{
			let id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.indexOf("Trader") >= 0)
			{
				num_caravans ++;
				caravans.push(e);
			}
		}
		
		if (num_caravans >= 1)
		{
			let spawn_site = 6645;
			let spawn_size = 12;
			let owner = 4;
			
			for (let i = 0; i < spawn_size; i++)
			{
				//decide what to spawn
				let unit_type = pickRandom(["units/pers/cavalry_spearman_e","units/pers/cavalry_spearman_b","units/pers/cavalry_spearman_e","units/pers/cavalry_axeman_a","units/pers/cavalry_javelineer_b","units/pers/cavalry_archer_b"]);
				let spawned_units = TriggerHelper.SpawnUnits(spawn_site,unit_type,1,owner);
				
				//issue orders
				for (let u of spawned_units)
				{
					this.WalkAndFightClosestTarget(u,1,unitTargetClass);
				}
			}
			
			
			this.questCaravanAttack = true;
		}
	}
}


Trigger.prototype.SpawnInitialPatrol = function(data)
{
	//which player
	let p = 6; 
	
	//targets A
	let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
	
		
	if (targets_A.length == 0 || targets_B.length == 0)
		return;
		
	//calculate size of spawn units
	let num_patrols = 38;
	let patrol_size = 3;
	
	let inf_templates = ["units/mace/champion_infantry_spearman_02", "units/mace/champion_infantry_spearman","units/mace/champion_infantry_swordsman","units/mace/infantry_archer_e","units/mace/infantry_javelineer_e","units/mace/infantry_pikeman_e","units/mace/infantry_slinger_e","units/merc_thorakites", "units/merc_thureophoros","units/athen/champion_ranged","units/athen/champion_marine"];
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(targets_B);
		
		//melee
		for (let i = 0; i < patrol_size; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		//TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		
		//send to patrol
		let patrol_sites_j = [pickRandom(targets_A), pickRandom(targets_B), pickRandom(targets_A),pickRandom(targets_B)];
		this.PatrolOrderList(units,p,patrol_sites_j);
		
	}
	
}

Trigger.prototype.RangeActionPyramid = function(data)
{
	if (this.templeQuestGiven == true && this.pyramidSpawningStarted == false)
	{
		warn("starting pyramid spawn");
		this.pyramidSpawningStarted = true;
		this.DoAfterDelay(8 * 1000,"SpawnPyramidWarrior",0);
	}
	
}



Trigger.prototype.RangeActionTemple = function(data)
{
	if (this.templeQuestGiven == false)
	{
		//start temple quest
		warn("temple quest starts");

		this.templeQuestGiven = true;
		
		this.ShowText(textQuestTempleGiven,"I suppose!","We're on it!");
		
		//debug -- spawn some ballistas cause they couldn't get there
		let spawn_site = 6404; //alexander
		TriggerHelper.SpawnUnits(6404,"units/mace/siege_oxybeles_packed",4,1);
	}
}


Trigger.prototype.RangeActionFieldBattleStart = function(data)
{
	if (this.questFieldBattleStarted == false)
	{
		this.questFieldBattleStarted = true;
		warn("field battle start");
		
		this.ShowText("The enemy is approaching! Prepare for battle!","We're ready!","Oh boy...");
		
		this.DoAfterDelay(30 * 1000,"SpawnFieldAttack",null);
	}
	
}


Trigger.prototype.RangeActionArmyMessage = function(data)
{
	if (this.questArmyGiven == false)
	{
		this.questArmyGiven = true;
		warn("given army quest");
		
		this.ShowText(textQuestMessageGiven,"Sure thing, heading over now","Oh boy...");
		
		this.DoAfterDelay(10 * 1000,"SpawnInitialPatrol",null);
		this.DoAfterDelay(20 * 1000,"FlipAssets",null);
	}
}

Trigger.prototype.RangeActionElephantVillage = function(data)
{
	if (this.questCaravansGiven == true && this.questCaravansComplete == false)
	{
		//check for caravans to see if quest is completed
		//warn(uneval(data));
		let num_caravans = 0;
		let caravans = [];
		for (let e of data.currentCollection)
		{
			let id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.indexOf("Trader") >= 0)
			{
				num_caravans ++;
				caravans.push(e);
			}
		}
		warn("Found "+num_caravans+" caravans!");
		
		if (num_caravans >= 4)
		{
			this.questCaravansComplete = true; //finish caravan quest
			
			for (let e of caravans)
			{
				var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
				cmpOwnership.SetOwner(5);
			}
			
			//reward
			this.QuestCaravanReward();
			
			//give next quest
			this.questArcherTribeGiven = true;
			
			this.ShowText(textQuestArchersGiven,"Sure thing","The reward better be worth it");

		}
	}
	else if (this.questCaravansGiven == false)
	{
		//start caravan quest
		this.questCaravansGiven = true;
		warn("Starting caravan quest");
		
		this.ShowText(textQuestCaravanGiven,"Sure thing","Again?");
	}
}

Trigger.prototype.QuestFieldBattleReward = function(data)
{
	
	
	//some additional troops
	let spawn_site = 6404; //alexander
	
	let spawn_sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (spawn_sites.length > 0)
		spawn_site = pickRandom(spawn_sites);		
	
	//spawn some special guards
	TriggerHelper.SpawnUnits(spawn_site,"units/mace/champion_infantry_spearman_02",8,1);
	TriggerHelper.SpawnUnits(spawn_site,"units/merc_thureophoros",8,1);
	
	//some priests
	TriggerHelper.SpawnUnits(spawn_site,"units/kush/support_healer_e",6,1);
	//they only stick around for a bit...
	
	//no need, this is the battle before the last battle
	//this.DoAfterDelay(90 * 1000,"RemovePriests",null);
	
	//some tech
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	//improve cav resistance and ranged weapons
	cmpTechnologyManager.ResearchTechnology("archery_tradition");
	
	//inspire troops
	cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
	
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");

	cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
	cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");

	this.ShowText(textQuestMessageComplete,"Thanks!","Oh boy...");
		
	//spawn spy that reveals the hideout
	this.DoAfterDelay(5 * 1000,"SpawnPassSpy",0);
	
}


Trigger.prototype.QuestSiegeReward = function(data)
{
	if (this.ballistaCaptured == false)
	{
		let spawn_site = 6404; //alexander
		TriggerHelper.SpawnUnits(6404,"units/mace/siege_oxybeles_packed",4,1);
		this.ballistaCaptured = true;
	}

}

Trigger.prototype.QuestArchersReward = function(data)
{
	//lose siege towers
	let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"SiegeTower").filter(TriggerHelper.IsInWorld);
	for (let e of units_siege)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(5);
	}
	
	//get some elephants
	TriggerHelper.SpawnUnits(6404,"units/kush/champion_elephant",2,1);
	
	//some intelligence -- temple
	var cmpOwnership = Engine.QueryInterface(6594, IID_Ownership);
	cmpOwnership.SetOwner(1);
	
	this.ShowText(textQuestArchersComplete,"Excellent!","Also excellent!");
}

Trigger.prototype.QuestGoatReward = function(data)
{
	
	//some intelligence
	let outpost_id = 6489;
	var cmpOwnership = Engine.QueryInterface(outpost_id, IID_Ownership);
	cmpOwnership.SetOwner(1);

	//some resistance
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
	cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			
	this.questGoatComplete = true;		
	
	this.ShowText(textQuestGoatComplete,"I was glad to be of help","That's it?");
}


Trigger.prototype.QuestCaravanReward = function(data)
{
	//some intelligence
	
	//some swords
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
	
	this.ShowText(textQuestArchersGiven,"As you say","Fine");
}


Trigger.prototype.RemovePriests = function(data)
{
	let healers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Healer").filter(TriggerHelper.IsInWorld);
	
	for (let e of healers)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
}

Trigger.prototype.QuestTempleReward = function(data)
{
	//some tech
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	cmpTechnologyManager.ResearchTechnology("heal_rate");
	cmpTechnologyManager.ResearchTechnology("heal_rate_2");
	cmpTechnologyManager.ResearchTechnology("heal_range");
	cmpTechnologyManager.ResearchTechnology("heal_range_2");
	
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
	cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
	cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
	cmpTechnologyManager.ResearchTechnology("cavalry_health");
	
	cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
	
	
	//spawn some healers
	//let spawn_site = 6594; temple
	let spawn_site = 6404; //alexander
	
	//TriggerHelper.SpawnUnits(spawn_site,"units/kush/support_healer_e",4,1);
	
	//they only stick around for a bit...
	//this.DoAfterDelay(60 * 1000,"RemovePriests",null);
	
	//spawn some special guards
	TriggerHelper.SpawnUnits(spawn_site,"units/kush/champion_infantry_apedemak",5,1);
	TriggerHelper.SpawnUnits(spawn_site,"units/kush/cavalry_javelineer_merc_e",5,1);
		
	this.ShowText("Thank you for clearing the tombs of grave robbers! We are all in your debt! Please accept these warriors as a token of our thanks. We have also blessed your armor and weapons so that they may serve you even better!","Happy to help","Oh boy...");

}

Trigger.prototype.QuestRescueReward = function(data)
{
	
	//some intelligence
	//spawn some warriors who join alexander
	TriggerHelper.SpawnUnits(6404,"units/kush/champion_infantry_archer",5,1);
		
	//some intelligence is revealed
	let outpost_id = 6622;
	var cmpOwnership = Engine.QueryInterface(outpost_id, IID_Ownership);
	cmpOwnership.SetOwner(1);

	//improved range weaposn
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			
	this.ShowText(textQuestRescueComplete,"Happy to help","Oh boy...");
}

Trigger.prototype.RangeActionTriggerGoat = function(data)
{
	//warn(uneval(data));
	
	if (this.questGoatComplete == false && this.questGoatGiven == true)
	{
		//warn("checking goats");
		
		//warn(uneval(data));
		let num_goats = 0;
		let goats = [];
		for (let e of data.currentCollection)
		{
			let id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.indexOf("Animal") >= 0)
			{
				num_goats ++;
				goats.push(e);
			}
		}
		warn("Found "+num_goats+" goats!");
		if (num_goats >= 5)
		{
			warn("5 goats!");
			for (let e of goats)
			{
				var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
				cmpOwnership.SetOwner(3);
				
				this.questGoatComplete = true;
				
				//prize 6622
				
			}
			this.QuestGoatReward();
		}
	}
}

//this function is need so that player 6 doesn't constantly try to retreat to 3 or 5's bases
Trigger.prototype.FlipAssets = function(data)
{
	
	warn("fliping teams");
	//let cmpPlayer = QueryPlayerIDInterface(3);
	//cmpPlayer.SetLockTeams(false);
	//cmpPlayer.SetTeam(3);
	
	//cmpPlayer = QueryPlayerIDInterface(5);
	//cmpPlayer.SetLockTeams(false);
	//cmpPlayer.SetTeam(3);
	
	
	let cmpPlayer = QueryPlayerIDInterface(6);
	cmpPlayer.SetNeutral(3);
	cmpPlayer.SetNeutral(5);
	
	/*let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Unit").filter(TriggerHelper.IsInWorld);
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Structure").filter(TriggerHelper.IsInWorld);
	
	for (let e of units)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
	
	for (let e of structures)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
	
	units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Unit").filter(TriggerHelper.IsInWorld);
	structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"Structure").filter(TriggerHelper.IsInWorld);
	
	for (let e of units)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
	
	for (let e of structures)
	{
		var cmpOwnership = Engine.QueryInterface(e, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}*/
}


Trigger.prototype.SpawnBanditGuards = function(data)
{
	let size = 20;
	let p = 2;
	let templates = ["units/kush/infantry_spearman_e","units/kush/infantry_swordsman_a","units/kush/infantry_javelineer_merc_a","units/kush/infantry_spearman_b"];
	
	let patrol_sites = this.GetTriggerPoints(triggerPointsBanditGuards);
	
	for (let i = 0; i < size; i ++)
	{
		let spawn_site = pickRandom(patrol_sites);
		
		let units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(templates), 1, p);
		
		//make patrol
		this.PatrolOrderList(units_i,p,patrol_sites);
		
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.BossHealerSpawn = function(data)
{
	let healers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(8), "Healer").filter(TriggerHelper.IsInWorld);
		
	let heroes = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(8), "Hero").filter(TriggerHelper.IsInWorld);
		
		
	if (healers.length <= 2 && heroes.length >= 1)
	{
		TriggerHelper.SpawnUnits(6919,"units/kush/support_healer_e",2,8);
	}	
	
	this.DoAfterDelay(30 * 1000,"BossHealerSpawn",0);
			
}

Trigger.prototype.BossHealersCheck = function(data)
{
	let healers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(8), "Healer").filter(TriggerHelper.IsInWorld);
		
	for (let h of healers)
	{
		let cmpUnitAI = Engine.QueryInterface(h, IID_UnitAI);
		cmpUnitAI.Heal(6919,false);
	}
	
	this.DoAfterDelay(10 * 1000,"BossHealersCheck",0);
			
}

Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//process difficulty levels
		if (ai_mult == 1.25)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		}
		else if (ai_mult >= 1.5)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		}
	}
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	cmpTrigger.enemies = [2];
	
	
	//garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//spawn red guards
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnBanditGuards",null);
	
	
	//some state variables
	
	
	//quests related to first settlement
	cmpTrigger.questGoatGiven = true;
	cmpTrigger.questGoatComplete = false;
	cmpTrigger.questRescueComplete = false;
	
	//quests related to second settlement you encounter -- start false by default
	cmpTrigger.questCaravansGiven = false;
	cmpTrigger.questCaravansSpawned = false;
	cmpTrigger.questCaravanAttack = false; //cavalry attack on caravan
	cmpTrigger.questCaravansComplete = false;
	
	cmpTrigger.questArcherTribeGiven = false;
	cmpTrigger.questArcherTribeComplete = false;
	
	//temple quests
	cmpTrigger.templeQuestGiven = false;
	cmpTrigger.templeQuestComplete = false;
	cmpTrigger.pyramidSpawningStarted = false;
	cmpTrigger.pyramidSpawnCounter = 0;
	cmpTrigger.pyramidSpawnLimit = 25;
	cmpTrigger.pyramidWaveSize = 5;
	
	//battle quest
	cmpTrigger.questArmyGiven = false;
	cmpTrigger.fialdAttackStarted = false;
	cmpTrigger.questArmyComplete = false;
	cmpTrigger.questFieldBattleStarted = false;
	cmpTrigger.persiaUnitsDefault = -1; //used to check when persia attack defeated
	
	//persian assassin attack happens after goat quest
	cmpTrigger.suddenAttackComplete = false; //false by default

	//holy guard attack
	cmpTrigger.holyGuardAttackStarted = false;
	cmpTrigger.questHolyBattleComplete = false;
	
	//whether balistas were capturred or not
	cmpTrigger.ballistaCaptured = false;

	//ordered list of kush infantry 
	cmpTrigger.kush_inf_ordered = ["units/kush/infantry_archer_b", "units/kush/infantry_spearman_b", "units/kush/infantry_archer_a", "units/kush/infantry_spearman_a", "units/kush/infantry_swordsman_b", "units/kush/infantry_archer_e", "units/kush/infantry_pikeman_b", "units/kush/infantry_swordsman_a", "units/kush/infantry_clubman_b", "units/kush/champion_infantry", "units/kush/infantry_pikeman_a", "units/kush/cavalry_javelinist_merc_b", "units/kush/infantry_javelinist_merc_b", "units/kush/infantry_spearman_e", "units/kush/infantry_clubman_a", "units/kush/cavalry_javelinist_merc_a", "units/kush/infantry_pikeman_e", "units/kush/infantry_javelinist_merc_a", "units/kush/infantry_swordsman_e", "units/kush/cavalry_javelinist_merc_a", "units/kush/infantry_javelinist_merc_e", "units/kush/champion_infantry", "units/kush/infantry_clubman_e", "units/kush/champion_infantry_amun", "units/kush/champion_cavalry", "units/kush/champion_infantry_apedemak", "units/kush/champion_elephant"];


	//debug
	/*cmpTrigger.DoAfterDelay(2 * 1000,"QuestGoatReward",null);
	cmpTrigger.DoAfterDelay(4 * 1000,"QuestRescueReward",null);
	cmpTrigger.DoAfterDelay(6 * 1000,"QuestCaravanReward",null);
	cmpTrigger.DoAfterDelay(8 * 1000,"QuestArchersReward",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"QuestTempleReward",null);
	cmpTrigger.DoAfterDelay(15 * 1000,"QuestFieldBattleReward",null);*/
	
	cmpTrigger.DoAfterDelay(20 * 1000,"BossHealersCheck",0);
	cmpTrigger.DoAfterDelay(20 * 1000,"BossHealerSpawn",0);
	
	
	//test for field battle, give all rewards beforehand
	/*cmpTrigger.DoAfterDelay(2 * 1000,"QuestGoatReward",null);
	cmpTrigger.DoAfterDelay(4 * 1000,"QuestRescueReward",null);
	cmpTrigger.DoAfterDelay(6 * 1000,"QuestCaravanReward",null);
	cmpTrigger.DoAfterDelay(8 * 1000,"QuestArchersReward",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"QuestTempleReward",null);
	cmpTrigger.DoAfterDelay(12 * 1000,"QuestSiegeReward",null);*/
	
	

	/* -- this should happen when field battle starts
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnInitialPatrol",null);
	cmpTrigger.DoAfterDelay(20 * 1000,"SpawnFieldAttack",null);
	*/
	
	for (let p of [1,2,3,5,6,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//cmpPlayer.SetPopulationBonuses(300);
		
		//disable troop production
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		
		if (p == 3)
		{
			let unit_templates = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
			disTemplates = disTemplates.concat(unit_templates);	
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		if (p == 3)
		{
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		}
		else if (p == 7)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");

			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		
			
			
		}
		else if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpTechnologyManager.ResearchTechnology("siege_bolt_accuracy");
			
		}
		
	}
	
	warn("registering trigger");
	
	// register trigger for goats quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerGoat", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsGoat), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerAttack", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsAttack), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionElephantVillage", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsElephantVillage), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsTemple), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionPyramid", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsPyramid), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionArmyMessage", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsArmyMessage), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 60,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register trigger for surprise attack after goat quest complete
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionFieldBattleStart", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsFieldBattleStart), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 60,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionHolyGuard", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsHolyGuardAttack), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});


	cmpTrigger.ShowText(textQuestStart,"I will gladly help","I suppose I have no other chocie");

	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/
	
	
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "LevelUpPers", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 300 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	*/
	
	
	
};
