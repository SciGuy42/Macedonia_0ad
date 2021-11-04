warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";



var triggerPointPatrol = "B";
var triggerPointCvilCentre = "J";
var triggerPointParolSpawn = "K";
var triggerPointAttackA = "I";
var triggerPointAttackB = "H";
var triggerPointAttackC = "G";




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
	//"units/" + civ + "_support_female_citizen"
];


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



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [2,5])
	{
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers_kardakes_hoplite",10,p);
			
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

Trigger.prototype.SpawnInitialPatrol = function(data)
{
	let p = 2;//which player
	
	let num_horsemen = 50;
	
	let sites = this.GetTriggerPoints(triggerPointPatrol);
	//warn("Found "+sites.length+" patrol sites");
	
	let sites_reversed = [];
	for (let i = sites.length-1; i >= 0; i --)
	{
		sites_reversed.push(sites[i]);
	}
	
	//templates, mostly archers
	let cav_templates = ["units/pers/champion_cavalry","units/pers/champion_cavalry_archer","units/pers_cavalry_javelinist_e","units/pers_cavalry_javelinist_a","units/pers_cavalry_swordsman_e","units/pers_cavalry_swordsman_a","units/pers_cavalry_spearman_e","units/pers_cavalry_spearman_a","units/pers_cavalry_spearman_b"];
	
	for (let i = 0; i < num_horsemen; i ++)
	{
		let sites_i = sites;
		if (Math.random() < 0.5)
			sites_i = sites_reversed;
		
		
		
		let index = Math.floor(Math.random()*sites_i.length);
		//warn("index = "+index);
		
		//spawn the unit
		let unit_i = TriggerHelper.SpawnUnits(sites_i[index],pickRandom(cav_templates),1,p);
		
		//make it patrol
		let patrol_sites_i = [];
		let k = index+1; 
		
		for (let j = 0; j < sites_i.length; j ++)
		{
			if (k >= sites_i.length)
				k = 0;
			
			patrol_sites_i.push(sites_i[k]);
			k = k + 1;
			
		}
		
		this.PatrolOrderList(unit_i,p,patrol_sites_i);
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

Trigger.prototype.SpawnFarmers = function(data)
{
	let p = 4;
	
	let farms = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Field").filter(TriggerHelper.IsInWorld);
		
	let num_farmers = 20;
	
	for (let i = 0; i < farms.length; i++)
	{
		//spawn the unit
		let farm_i = farms[i];
		let unit_i = TriggerHelper.SpawnUnits(farm_i,"units/pers_support_female_citizen",3,p);
		
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


Trigger.prototype.TransferFood = function(data)
{
	if (this.assetTransferTriggered == true)
	{
		//warn("food transfer");
		
		//find out how much food player 4 has
		let cmpPlayer4 = QueryPlayerIDInterface(4);
		let resources = cmpPlayer4.GetResourceCounts();
		
		//add it to player 1
		let cmpPlayer1 = QueryPlayerIDInterface(1);
		cmpPlayer1.AddResource("food",resources.food);
		
		//remove it from player 4
		cmpPlayer4.AddResource("food",-1*resources.food);
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
	for (let p of [2])
	{
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
		for (let u of units_cav)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI /*&& Math.random() < 1.05*/)
			{
				if (cmpUnitAI.IsIdle()){
					
					//get trigger points
					let sites = this.GetTriggerPoints(triggerPointPatrol);
					
					//find closest one
					let index = -1;
					let min_distance = 10000;
					
					for (let i = 0; i < sites.length; i ++)
					{
						let d_i = DistanceBetweenEntities(u, sites[i]);
						if (d_i < min_distance)
						{
							index = i;
							min_distance = d_i;
						}
					}
					
					//make patrol
					//make it patrol
					let patrol_sites_i = [];
					let k = index+1; 
					
					for (let j = 0; j < sites.length; j ++)
					{
						if (k >= sites.length)
							k = 0;
						
						patrol_sites_i.push(sites[k]);
						k = k + 1;
					}
					
					this.PatrolOrderList([u],p,patrol_sites_i);
					
					
					//warn("Found idle soldier");
					//this.WalkAndFightClosestTarget(u,1,"Unit");
				}
			}
		}
	}
	
	for (let p of [5])
	{
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		
		for (let u of units_cav)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,1,siegeTargetClass);
				}
			}
		}
	}
	
}

Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (this.finalAttackTriggered == false)
	{
		if (data.from == 2 && (data.to == -1 || data.to == 1))
		{
			//check if camp
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			
			if (id != null && id.classesList.indexOf("Structure") >= 0)
			{
				this.numCampsDestroyed ++;
				
				//warn("camp destroyed");
				
				//destroy the strucure				
				let health_s = Engine.QueryInterface(data.entity, IID_Health);
				health_s.Kill();
				
				//check if we've destroyed all camps
				if (this.numCampsDestroyed == 1)
				{
					this.ShowText("Great job! Now we just need to find the second camp and those horsemen will stop bothering us.","On it!","OK");
				}
				if (this.numCampsDestroyed == 2)
				{
					//schedule final attack
					//warn("camps destroyed");
					
					this.ShowText("Great! The horsemen's camps have been destroyed. We need to get back to our base as soon as we can. Our scouts report that Spitamenes' raiders are on their way for one last assault.","On it!","OK");
					
					//stop spawning of patrol cavalry
					this.finalAttackTriggered = true;
					
					//spaw final attack
					this.DoAfterDelay(15 * 1000,"RebelAttack",null);
					this.DoAfterDelay(35 * 1000,"RebelAttack",null);
					this.DoAfterDelay(70 * 1000,"RebelAttack",null);
					this.DoAfterDelay(145 * 1000,"RebelAttack",null);
					this.DoAfterDelay(175 * 1000,"RebelAttack",null);
					
					//start checking for victory
					this.DoAfterDelay(180 * 1000,"VictoryCheck",null);
	
				}
			}
			
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
			cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			cmpTechnologyManager.ResearchTechnology("ranged_inf_skirmishers");
	
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");

			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");

			cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");
	
			//give some trade gains
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
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

{
	//notes
	/* it takes about 5000 stone to build the wall
	 * another 1200 to get all tower upgrades
	 */
	
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants
	cmpTrigger.spawnPatrolInterval = 10;
	cmpTrigger.repeatAttackInterval = 480;

	//state variables
	cmpTrigger.assetTransferTriggered = false;
	cmpTrigger.numCampsDestroyed = 0;
	cmpTrigger.finalAttackTriggered = false;
	cmpTrigger.attackCounter = 0;

	//garrison entities
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//spawn patrol
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnInitialPatrol",null);
	
	//repeat spawn patrol
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnHorsemanPatrol",null);
	
	//spawn farmers
	cmpTrigger.DoAfterDelay(5 * 1000,"SpawnFarmers",null);
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);
	
	
	//debug
	//cmpTrigger.DoAfterDelay(5 * 1000,"RebelAttack",null);
	
	//disable templates and add some techs
	for (let p of [1,2,3,4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable templates
		let disTemplates = ["structures/" + cmpPlayer.GetCiv() + "_civil_centre","structures/" + cmpPlayer.GetCiv() + "_dock"];
		
		let hero_templates = TriggerHelper.GetTemplateNamesByClasses("Hero", cmpPlayer.GetCiv(), undefined, undefined, true);
		disTemplates = disTemplates.concat(hero_templates);
		
		if (p == 3)
			disTemplates = disTemplates.concat(disabledTemplates(cmpPlayer.GetCiv()));
		
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	//set diplomacy
	let cmpPlayer2 = QueryPlayerIDInterface(2);
	cmpPlayer2.SetNeutral(4);
	
	let cmpPlayer5 = QueryPlayerIDInterface(5);
	cmpPlayer5.SetNeutral(4);
	
	let cmpPlayer4 = QueryPlayerIDInterface(4);
	cmpPlayer4.SetNeutral(2);
	cmpPlayer4.SetAlly(1);
	cmpPlayer4.SetAlly(3);
	
	let cmpPlayer1 = QueryPlayerIDInterface(1);
	cmpPlayer1.SetAlly(4);
	cmpPlayer1.SetAlly(3);
	
	let cmpPlayer3 = QueryPlayerIDInterface(3);
	cmpPlayer3.SetAlly(4);
	cmpPlayer3.SetAlly(1);


	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "TransferFood", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 30 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 45 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionCivilCentre", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointCvilCentre), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

}
