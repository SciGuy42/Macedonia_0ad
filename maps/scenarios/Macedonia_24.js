warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointSouth = "A";
var triggerPointArc = "K";
var triggerPointAch = "J";



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


Trigger.prototype.FindRandomTarget = function(attacker,target_player,target_class)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	return pickRandom(targets);
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

		let targetDistance = DistanceBetweenEntities(attacker, target);
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


Trigger.prototype.SpecialAchaeanAssault = function(data)
{
	let owner = 5;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 40;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointAch));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.achaeanAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}

Trigger.prototype.SpecialArcadianAssault = function(data)
{
	let owner = 6;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 30;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointArc));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.arcadiaAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}


Trigger.prototype.ReserveInfantryAttack = function(data)
{
	//get all cavalry by reserve forces
	let p = 4;
	let all_infantry = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	//see if we need to split them in two
	
	//get target
	let target = 1839; //alexander
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
	
	//TO DO: from now on, do idle check on cavalry
	
	
}

Trigger.prototype.ReserveCavalryAttack = function(data)
{
	//get all cavalry by reserve forces
	let p = 4;
	let attackers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
	
	//get target
	let target = 1839; //alexander
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
	
	//TO DO: from now on, do idle check on cavalry
	
	
}

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	if (data.from == 1 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id && id.classesList.indexOf("Outpost") >= 0)
		{
			//warn("Outpost destroyed!");
			//warn(uneval(data));
			
			if (data.entity == this.id_outpost_inf_left)
			{
				//find all infantry
				let p = 4;
				let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
				
				let attackers = [];
				
				//iterate through them
				let mod_k = 2-this.inf_reserve_counter;
				let i = 0;
				for (let u of units)
				{
					//check if idle
					let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					if (cmpUnitAI)
					{
						if (cmpUnitAI.IsIdle()){
							if (i % mod_k == 0)
							{
								attackers.push(u);
							}
							i = i + 1;
						}
					}
				}
				
				//send the attackers to creteros
				//put them in formation and attack
				let target = 3790;
				let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
				//set formation
				TriggerHelper.SetUnitFormation(p, attackers, "special/formations/battle_line");

				//attack walk
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
				
				this.inf_reserve_counter = this.inf_reserve_counter + 1;
				
			}
			else if (data.entity == this.id_outpost_inf_right)
			{
				//find all infantry
				let p = 4;
				let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
				
				let attackers = [];
				
				//iterate through them
				let mod_k = 2-this.inf_reserve_counter;
				let i = 0;
				for (let u of units)
				{
					//check if idle
					let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					if (cmpUnitAI)
					{
						if (cmpUnitAI.IsIdle()){
							if (i % mod_k == 0)
							{
								attackers.push(u);
							}
							i = i + 1;
						}
					}
				}
				
				//send the attackers to alexnader
				//put them in formation and attack
				let target = 1839;
				let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
				//set formation
				TriggerHelper.SetUnitFormation(p, attackers, "special/formations/battle_line");

				//attack walk
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
				
				this.inf_reserve_counter = this.inf_reserve_counter + 1;
				
				
			}
			else if (data.entity == this.id_outpost_cav)
			{
				//round up all cavalry of player 4 and send towards alexander
				
				
				//find all cavalry
				let p = 4;
				let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
				
				//put them in formation and attack
				let target = 1839;
				let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
				//set formation
				TriggerHelper.SetUnitFormation(p, units, "special/formations/battle_line");

				//attack walk
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
		}
		
	}
	
	

	
};




//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [1,4])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_infantry",5,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		//outpost
		let outposts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);
			
		for (let c of outposts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",1,p);
				
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
	if (this.infIdleCheck == true && this.cavIdleCheck == true)
	{
		let target_p = 4;
		let p = 7;
		//main persia infantry and cavalry
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
		let units_all = units_inf.concat(units_cav);
		
		for (let u of units_all)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle persia inf or cav");
					this.WalkAndFightClosestTarget(u,target_p,unitTargetClass);
				}
			}
		}
	}
	
	if (this.charIdleCheck == true) //chariots
	{
		let owner = 2;
		let target_player = 4;
		
		//find all infantry
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Chariot+!Hero").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
				}
			}
		}
		
	}
	
	if (this.eleIdleCheck == true) // elephants
	{
		let owner = 6;
		let target_player = 4;
		
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Elephant").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
				}
			}
		}
		
	}
	
	if (this.indianCavIdleCheck == true) //indian cavalry
	{
		let p = 6;
		let target_player = 1;
		
		//find all cavalry
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,unitTargetClass);
				}
			}
		}
	}
	
	if (this.indianInfIdleCheck == true) //indian infantry
	{
		let p = 6;
		let target_player = 1;
		
		//find all cavalry
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,unitTargetClass);
				}
			}
		}
		
	}
	
	if (this.greekInfIdleCheck == true) //greek mercs
	{
		let p = 5;
		let target_player = 1;
	
		//find all cavalry
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,unitTargetClass);
				}
			}
		}
		
	}
	
	
	if (this.dariusdleCheck == true)
	{
		let owner = 2;
		let target_player = 1;
		
		//find all units
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Unit").filter(TriggerHelper.IsInWorld);
		
		for (let u of units)
		{
			//check if idle
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					
					//set to walk and attack
					this.WalkAndFightClosestTarget(u,target_player,unitTargetClass);
				}
			}
		}
	}
	
	/*for (let p of [6])
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
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,target_p,unitTargetClass);
				}
			}
		}
	}*/
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

Trigger.prototype.PlayerCommandAction = function(data)
{
	
	
	if (data.cmd.type == "dialog-answer")
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		
		if (data.cmd.answer == "button1") //easy
		{
			
			
		}
		else //hard
		{
			//add some techs to enemy
			let cmpPlayer = QueryPlayerIDInterface(7);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
			
			
			cmpPlayer = QueryPlayerIDInterface(6);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");	
			
			cmpPlayer = QueryPlayerIDInterface(5);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");	
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");	
		
			cmpPlayer = QueryPlayerIDInterface(2);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
			
			warn("Difficulty = hard");
		}
		
	}
};


Trigger.prototype.DifficultyOption = function(data)
{
	this.ShowText("The final showdown is at hand. Choose your difficulty level.","Easy","Hard(er)");
	
}


Trigger.prototype.PatrolOrder = function(units,p,A,B)
{
	
	if (units.length <= 0)
		return;
	
	
	//list of patrol targets
	let patrolTargets = [A,B];

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



Trigger.prototype.CavalryAttack = function(data)
{
	//check if we have structures left, if not, end
	let p = 5;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
	
	//pick spawn site
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));
	
	//how big should the attack be
	let min_size = 20;
	let units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);
	
	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;
	
	//types
	let cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry", "kush", undefined, undefined, true);
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//attack
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
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

Trigger.prototype.ArcadianAttack = function(data)
{
	//check if we have camps
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.arcadiaAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 1.0 - this.arcadiaSiegeProb)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.arcadiaAttackTemplates),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//siege
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/mace/siege_lithobolos_packed",1,p);
			attackers.push(units_i[0]);
		}
	}
	
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
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
	
	let next_attack_interval_sec = this.arcadiaAttackInterval + Math.floor(Math.random() * 120);
	warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 2;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"ArcadianAttack",null);
}



Trigger.prototype.CheckAssault = function(data)
{
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(7), "Unit").filter(TriggerHelper.IsInWorld);
	
	warn("Found "+uneval(units.length) +" units");
	
	if (units.length == 0)
	{
		//flip assets
		this.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
		warn("Assault over!");
	}
	else {
		this.DoAfterDelay(15 * 1000,"CheckAssault",null);
	
	}
}

Trigger.prototype.SpawnAssault = function(data)
{
	let owner = 7;
	let target_player = 3;
	
	//north side -- some rams, cavalry, and ballistas
	let num_rams = 5;
	let num_cav = 20;
	let num_ballistas = 3;
	
	for (let i = 0; i < num_rams; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart_mechanical_siege_ram", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	for (let i = 0; i < num_cav; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/cavalry_spearman_a", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	for (let i = 0; i < num_ballistas; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/athen/siege_oxybeles_packed", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	//south side -- some infantry
	let num_infantry = 30;
	
	let inf_templates = ["units/spart/champion_infantry_pike","units/spart/champion_infantry_swordsman", "units/spart/champion_infantry_spear","units/spart/infantry_javelineer_a"];
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointSouth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	this.DoAfterDelay(15 * 1000,"CheckAssault",null);
	
}



Trigger.prototype.AttackCavalryWave = function(data)
{
	let p = 7;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+uneval(units.length) +" cavalry");
	
	//iterate through them
	let mod_k = this.numCavWaves+1-this.waveCavIndex;
	let i = 0;
	
	let attackers = [];
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				if (i % mod_k == 0)
				{
					attackers.push(u);
					
					//set to walk and attack
					//this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
				}
				
				i = i + 1;
			}
		}
	}
	
	//cluster attackers
	//warn("Attackers = "+uneval(attackers));
	let clusters = this.ClusterUnits(attackers,12);
	
	//warn(uneval(clusters.length));
	
	//for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{
		
			//find target
			let target = this.FindClosestTarget(clusters[k][0],target_player,siegeTargetClass);
			
			
			let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
			//warn(uneval(target_pos));
			
			//set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			//attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": true,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}
	}
	
	if (this.waveCavIndex < this.numCavWaves)
	{
		this.waveCavIndex = this.waveCavIndex + 1;
		this.DoAfterDelay(this.cavWaveInterval * 1000,"AttackCavalryWave",null);	
	}
	else {
		this.cavIdleCheck = true;
	}
}

Trigger.prototype.AttackInftanryWave = function(data)
{
	let p = 7;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	let attackers = [];
	
	//iterate through them
	let mod_k = this.numWaves+1-this.waveIndex;
	let i = 0;
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				if (i % mod_k == 0)
				{
					attackers.push(u);
					
					
					//this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
				}
				
				i = i + 1;
			}
		}
	}
	
	let clusters = this.ClusterUnits(attackers,20);
	
	//warn(uneval(clusters.length));
	
	//for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{
		
			//find target
			let target = this.FindClosestTarget(clusters[k][0],target_player,siegeTargetClass);
			
			
			let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
			//warn(uneval(target_pos));
			
			//set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			//attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": true,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}
	}
	
	
	if (this.waveIndex < this.numWaves)
	{
		this.waveIndex = this.waveIndex + 1;
		this.DoAfterDelay(this.infantryWaveInterval * 1000,"AttackInftanryWave",null);	
	}
	else {
		this.infIdleCheck = true;
	}
}





Trigger.prototype.AttackDarius = function(data)
{
	let p = 2;
	let target_player = 1;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	let attackers = [];
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				//set to walk and attack
				//this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
				attackers.push(u);
			}
		}
	}
	
	//find target
	let target = this.FindRandomTarget(attackers[0],target_player,unitTargetClass);	
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, "special/formations/battle_line");

	//attack walk
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
	
	this.dariusdleCheck = true;
}

Trigger.prototype.AttackGreekInfantry = function(data)
{
	let owner = 5;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Infantry").filter(TriggerHelper.IsInWorld);
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				//set to walk and attack
				this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}
	
	this.greekInfIdleCheck = true;
}


Trigger.prototype.AttackIndianInfantry = function(data)
{
	let p = 6;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	let attackers = [];
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				attackers.push(u);
				//set to walk and attack
				//this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}
	
	//find target
	let target = this.FindRandomTarget(attackers[0],target_player,siegeTargetClass);
			
			
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
	//warn(uneval(target_pos));
			
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, "special/formations/battle_line");

	//attack walk
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
	
	this.indianInfIdleCheck = true;
}

Trigger.prototype.AttackIndianCavalry = function(data)
{
	let p = 6;
	let target_player = 4;
	
	//find all cavalry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
	
	let attackers = [];
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				attackers.push(u);
				
				//set to walk and attack
				//this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}
	
	let clusters = this.ClusterUnits(attackers,2);
	
	//warn(uneval(clusters.length));
	
	//for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{
		
			//find target
			let target = this.FindRandomTarget(clusters[k][0],target_player,siegeTargetClass);
			
			
			let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
			//warn(uneval(target_pos));
			
			//set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			//attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": true,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}
	}
	
	this.indianCavIdleCheck = true;
}

Trigger.prototype.AttackChariots = function(data)
{
	let owner = 2;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Chariot+!Hero").filter(TriggerHelper.IsInWorld);
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				//set to walk and attack
				this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}
	
	this.charIdleCheck = true;
}


Trigger.prototype.AttackElephants = function(data)
{
	let owner = 6;
	let target_player = 4;
	
	//find all infantry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Elephant").filter(TriggerHelper.IsInWorld);
	
	for (let u of units)
	{
		//check if idle
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				
				//set to walk and attack
				this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}
	
	this.eleIdleCheck = true;
}


Trigger.prototype.ResearchTechs = function(data)
{
	for (let p of [1,3,4])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
		
		if (p == 1)
		{
			
			cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			
			cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");
			cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
			cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			
			cmpTechnologyManager.ResearchTechnology("armor_cav_02");
		}
		else if (p == 3 || p == 4)
		{
			
		}
	}
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	
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
	for (let k = 0; k < num_clusters; k ++){
		let cluter_k = [];
		
		for (let i = 0; i < units.length; i ++){
			
			if (clustering[i] == k)
			{
				cluter_k.push(units[i]);
			}
		}
		
		clusters.push(cluter_k);
	}
	
	return clusters;
}


Trigger.prototype.SetDiplomacy = function(data)
{
	//everyone is neutral towards 8
	
	for (let p of [1,2,3,4,5,6,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(8);
	}
	
	let cmpPlayer = QueryPlayerIDInterface(8);
	for (let p of [1,2,3,4,5,6,7])
	{
		cmpPlayer.SetNeutral(p);
	}
}

Trigger.prototype.ClusterAttackGreeks = function(data)
{
	let p = 5;
	
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	
	/*let dataset = [];
	
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
	  k: 2
	});
	
	let clustering = kmeans.assignments;
	
	let clusters = [];
	for (let k = 0; k < 2; k ++){
		let cluter_k = [];
		
		for (let i = 0; i < units.length; i ++){
			
			if (clustering[i] == k)
			{
				cluter_k.push(units[i]);
			}
		}
		
		clusters.push(cluter_k);
	}*/
	
	let clusters = this.ClusterUnits(units,2);
	
	//for each cluster, send attack
	let target_player = 3;
	for (let k = 0; k < clusters.length; k++)
	{
		//find target
		let target = null;
		
		if (k == 0)
		{
			target = this.FindClosestTarget(clusters[k][0],1,unitTargetClass);
		}
		else {
			let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), unitTargetClass).filter(TriggerHelper.IsInWorld);
			target = pickRandom(targets);
		}
		
		let target_pos = TriggerHelper.GetEntityPosition2D(target);
		
		//set formation
		TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/box");

		//attack walk
		ProcessCommand(p, {
			"type": "attack-walk",
			"entities": clusters[k],
			"x": target_pos.x,
			"z": target_pos.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});
	}
}


Trigger.prototype.DariusFlees = function(data)
{
	//get Darius
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Hero").filter(TriggerHelper.IsInWorld);
	let darius = units[0];
	
	//get target location
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Dock").filter(TriggerHelper.IsInWorld);
	let dock = docks[1];
	
	//make him walk there
	let cmpUnitAI = Engine.QueryInterface(darius, IID_UnitAI);
	let target_pos = TriggerHelper.GetEntityPosition2D(dock);
		
	cmpUnitAI.SwitchToStance("passive");
	//cmpUnitAI.Walk(target_pos.x, target_pos.y, false);
	cmpUnitAI.WalkToTarget(dock, false);
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/*let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);*/
	/*cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/
	
	/*
	 * some notes: 6:30 in, spart starts firt attack, 2 dozen troops + 2 rams (moderate + balanced)
	 * 
	 * 
	 */
	
	//console.log(clusterMaker.clusters());
	
	//some constants and variables
	cmpTrigger.waveIndex = 1;
	cmpTrigger.numWaves = 4;
	cmpTrigger.infantryWaveInterval = 5;
	cmpTrigger.infIdleCheck = false;
	
	cmpTrigger.waveCavIndex = 1;
	cmpTrigger.numCavWaves = 2;
	cmpTrigger.cavWaveInterval = 5;
	cmpTrigger.cavIdleCheck = false;


	cmpTrigger.charIdleCheck = false;
	cmpTrigger.eleIdleCheck = false;
	cmpTrigger.indianCavIdleCheck = false;
	cmpTrigger.indianInfIdleCheck = false;
	cmpTrigger.greekInfIdleCheck = false;
	cmpTrigger.dariusdleCheck = false;

	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//ids for outposts
	cmpTrigger.id_outpost_inf_left = 3792;
	cmpTrigger.id_outpost_inf_right = 3770;
	cmpTrigger.id_outpost_cav = 3771;
	cmpTrigger.inf_attack_triggered = false;
	cmpTrigger.inf_reserve_counter = 0;
	
	//give extra tech
	cmpTrigger.DoAfterDelay(5 * 1000,"ResearchTechs",null);
	
	//set diplomacy so that everyone is neutral with the village
	cmpTrigger.DoAfterDelay(2 * 1000,"SetDiplomacy",null);
	
	//difficulty option
	cmpTrigger.DoAfterDelay(2 * 1000,"DifficultyOption",null);
	
	//debug
	
	//cmpTrigger.DoAfterDelay(10 * 1000,"DariusFlees",null);
	
	//start attackes
	
	cmpTrigger.DoAfterDelay(15 * 1000,"AttackInftanryWave",null);	
	cmpTrigger.DoAfterDelay(40 * 1000,"AttackCavalryWave",null);
	cmpTrigger.DoAfterDelay(46 * 1000,"AttackElephants",null);	
	cmpTrigger.DoAfterDelay(60 * 1000,"AttackChariots",null);	
	cmpTrigger.DoAfterDelay(75 * 1000,"AttackIndianCavalry",null);	
	cmpTrigger.DoAfterDelay(90 * 1000,"AttackIndianInfantry",null);	
	cmpTrigger.DoAfterDelay(100 * 1000,"ClusterAttackGreeks",null);	
	cmpTrigger.DoAfterDelay(115 * 1000,"AttackDarius",null);
	
	
	//start spawning traders
	/*cmpTrigger.DoAfterDelay(5 * 1000, "SpawnCretanTraders",null);
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnArcadianTraders",null);
	
	//start spawning patrols
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnArcadianPatrol",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnAchaeanPatrol",null);
	
	//schedule assault
	cmpTrigger.DoAfterDelay(15 * 1000,"SpawnAssault",null);*/
	
	
	//cmpTrigger.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
	
	
	
	//spawn patrols of forts
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressPatrol",null);
	
	//invasion sea attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);




	for (let p of [1,2,3,4,5,6,7,8])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		
		//disable buildings production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		//disable units as well
		let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			
		disTemplates = disTemplates.concat(unit_templaes);
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		warn("Disabling templates for player "+uneval(p));
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 1 || p == 3 || p == 4)
		{
		
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			
			cmpPlayer.AddStartingTechnology("armor_hero_01");
			cmpPlayer.AddStartingTechnology("armor_cav_01");
			cmpPlayer.AddStartingTechnology("armor_cav_02");
			cmpPlayer.AddStartingTechnology("attack_cavalry_melee_01");
			cmpPlayer.AddStartingTechnology("attack_cavalry_melee_02");
			cmpPlayer.AddStartingTechnology("attack_soldiers_will");
			cmpPlayer.AddStartingTechnology("attack_infantry_ranged_01");
			cmpPlayer.AddStartingTechnology("attack_infantry_ranged_02");
			cmpPlayer.AddStartingTechnology("armor_infantry_01");
			cmpPlayer.AddStartingTechnology("armor_infantry_02");
			cmpPlayer.AddStartingTechnology("attack_infantry_melee_01");
			cmpPlayer.AddStartingTechnology("attack_infantry_melee_02");
			cmpPlayer.AddStartingTechnology("heal_rate");
			cmpPlayer.AddStartingTechnology("heal_rate_2");
			cmpPlayer.AddStartingTechnology("heal_range");
			cmpPlayer.AddStartingTechnology("heal_range_2");
			cmpPlayer.AddStartingTechnology("attack_champions_elite");
			cmpPlayer.AddStartingTechnology("ranged_inf_skirmishers");
			cmpPlayer.AddStartingTechnology("ranged_inf_irregulars");
			cmpPlayer.AddStartingTechnology("siege_bolt_accuracy");
			cmpPlayer.AddStartingTechnology("mauryans/special_archery_tradition");
		}
		else if (p == 2)
		{
			cmpPlayer.AddStartingTechnology("armor_hero_01");
			cmpPlayer.AddStartingTechnology("armor_cav_01");
			//cmpPlayer.AddStartingTechnology("armor_cav_02");
			cmpPlayer.AddStartingTechnology("attack_cavalry_melee_01");
			cmpPlayer.AddStartingTechnology("attack_cavalry_melee_02");
			cmpPlayer.AddStartingTechnology("armor_infantry_01");
			//cmpPlayer.AddStartingTechnology("armor_infantry_02");
			cmpPlayer.AddStartingTechnology("attack_soldiers_will");
			cmpPlayer.AddStartingTechnology("attack_infantry_melee_01");
			//cmpPlayer.AddStartingTechnology("attack_infantry_melee_02");
		}
		else if (p == 5)
		{
			cmpPlayer.AddStartingTechnology("armor_infantry_01");
			//cmpPlayer.AddStartingTechnology("armor_infantry_02");
			cmpPlayer.AddStartingTechnology("attack_infantry_melee_01");
			//cmpPlayer.AddStartingTechnology("attack_infantry_ranged_01");

		}
		else if (p == 6)
		{
			cmpPlayer.AddStartingTechnology("armor_infantry_01");
			//cmpPlayer.AddStartingTechnology("armor_infantry_02");
			cmpPlayer.AddStartingTechnology("attack_infantry_melee_01");
			cmpPlayer.AddStartingTechnology("attack_infantry_ranged_01");

			//cmpPlayer.AddStartingTechnology("armor_cav_01");
			//cmpPlayer.AddStartingTechnology("attack_cavalry_melee_01");
		}
		else if (p == 7)
		{
			//cmpPlayer.AddStartingTechnology("armor_infantry_01");
			//cmpPlayer.AddStartingTechnology("attack_infantry_melee_01");
			cmpPlayer.AddStartingTechnology("attack_infantry_ranged_01");
		}
		
		
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 20 * 1000,
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
