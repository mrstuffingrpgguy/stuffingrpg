//===========================================================
// WeightGainSystem.js
//===========================================================


/*:
 * @plugindesc Weight gain system for actors.
 * @author grip5
 *
 * @help This plugin implements simple weight gain system.
 */

// I
// WEIGHT SYSTEM
//
// Plugins adds parameters: weight and weight_type per actor.
// weight is a number and weight_type is special modifier, like nude, fat_nude etc.
//
// Special class WeightManager is responsible for handling all system stuff
// Weight levels are based on dictionary: WeightManager._weight_tags
// In this dict pairs VALUE: TAG decides how players weight transaltes to thier weight level
// for example: dict like {
// 0: ""
// 100: "fat"
// 200: "max_fat"
//}
// 0 is base weight
// If weight reaches 100 player becomes "fat"
// If weight reaches 200 player becomes "max_fat" and cannot gain more
// These weight tags represents character sprites names, so fat Phage sprites will be $phage_fat.png


// II
// CHARACTER SPRITES
//
// All actors sprites must be named accordingly to template, or it won't work.
// Name convention also makes folder with character sprites more organized.
//
// <actors_name>_<weight>_<weight_type>
// for example:
// 1) adipie_overstuffed_fat_nude.png
// <actors_name> = adipie
// <weight> = overstuffed
// <weight_type> = fat_nude
// 2) lotta_fat.png
// <actors_name> = lotta
// <weight> = none, aka normal
// <weight_type> = fat
// 3) phage.png
// <actors_name> = lotta
// <weight> = none
// <weight_type> = none

// III
// EVENTS
//
// You can change weight of actors in events, just add a "plugin command" type
// line in event page script.
//
// Plugin Commands:
// 1# SetWeight ACTOR VARIABLE, i.e. SetWeight player +1
// 2# SetWeightType ACTOR TYPE, i.e. SetWeightType Adipe fat
// ACTOR - Lotta, Phage, etc.
// VARIABLE - change like +4, -1, constant like 10 or status like "stuffed"
// TYPE - normal, nude, fat, fat_nude
//
// 3# WeightSystemOff ACTOR
// 4# WeightSystemOn ACTOR
// ACTOR - Lotta, Phage, player, etc.
// These commands can turn on and of weight system for an actor, so weight value won't change anymore and
// sprites won't be loaded aoutomatically. Useful for cases like Phage on cart after milking, she has special
// sprite and it should not be changed by weight system

// IV
// ITEMS
//
// Using items can change weight just like events.
// You have to add note tags like below:
//
// <weight: +1> -> increase weight of item target/user by 1
// <weight: -1> -> increase weight of item target/user by 1
// <weight: 10> -> sets weight to 10
// <weight: stuffed> -> sets weight to certain lvl, like in _weight_tags dict below
// <weight: Adipie +999> -> fatten up this babe
// <weight_type: nude> -> change sprite modifier like nude, fat etc
// <weight_type: Phage fat_nude>

// V
// SKILLS
//
// Skills can change weight in the same exact formula like items, for example <weight: +1> for slime feeding attack
// Damage formula includes weight, so for example Belch's formula may look like: a.wg * 10 + a.mat - b.mdf * 2
// a.wg - attacker weight, b.wg - defender weight
//
// Skill's dependency on weight: skills can be active or disabled, based on weight
// note tag: <weight_skill OPERATOR VALUE>
// OPERATOR - one of those: > < == >= <=
// VALUE - name like stuffed, full or number like 666
// For example we want "Girthquake" to be active only if weight is above "engorged"
// note tag <weight_skill: > engorged>
// Actor still needs to learn skill in normal way, like from leveling or something.

// VI
// STATES
//
// Like skills, that are active when certain weight related condition evaluated true, states
// appear when note tag says so.
// note tag: <weight_state: OPERATOR VALUE>
// If state "stuffed" should be active if player's weight equals stuffed, tag like <weight_state == stuffed>
// needs to be added to states' notes
// EXAMPLES:
// state - Nausea: Ex-Parameter: HP Regeneration - 10%, duration: 1-3 turns
// Note: <weight_state: > glutted>
// state will appear if someone will try to rise player weight above glutted

// VII
// SPRITES INHERITANCE
//
// For like cutscenes purposes, events can copy actors sprites accordingly to thier weight,
// comment in events page: <sprite_inherit: Phage> - event will be copy of Phage


// -----------------------------------------------------------------


// -----------------------------------------------------------------
// WeightManager
//
// Simple class for matching sprites tags with fatness.
// Values in tags dictionary can easly be set for better weight
// gain system, like in kg/lbs or 0/10/20/...
function WeightManager() {
    throw new Error('This is a static class');
}

// Dictionary with sprites tags per level
WeightManager._weight_tags = {
        0: "",
        1: "full",
        2: "stuffed",
        3: "overstuffed",
        4: "engorged",
        5: "overengorged",
        6: "glutted"
};

// Should return max weight, in this case it's 6
WeightManager.maxWeight = function() {
    return 6;
}

// Array with level values, must be sorted cos javascript sucks
WeightManager._weight_levels = [
        0, 1, 2, 3, 4, 5, 6
];

// Returns corresponding tag, for example weight=2 -> stuffed
WeightManager.getWeightTag = function(weight) {
    for (i = this._weight_levels.length - 1; i > 0; i--) {
        if (this._weight_levels[i] <= weight) {
            return this._weight_tags[ this._weight_levels[i] ];
        }
    }
    return "";
};

// Function for getting value of tags, useful for calculations like "WeightManager.getValueByTag('full') <= 10"
WeightManager.getValueByTag = function(tag) {
    for (key in this._weight_tags) {
        if (this._weight_tags[key] === tag)
            return key;
    }
    return -1;
}


WeightManager.parseWeightTagValue = function(actor, tag){
    var patt1 = /^(-|\+)[\d]+$/; // setWeight <actor> +10
    var patt2 = /^[\d]+$/; // setWeight <actor> 120
    var patt3 = /^\w+$/i; // setWeightLevel <actor> stuffed
    
    if (patt1.test(tag)) {
        var w = 1;
        if (tag[0] === '-')
            w = -1;
        tag = tag.substr(1);
        w = w * parseInt(tag);
        actor.setWeight(actor.weight() + w);
    } else if (patt2.test(tag)) {
        actor.setWeight(parseInt(tag));
    } else if (patt3.test(tag)) {
        actor.setWeight(WeightManager.getValueByTag(tag));
    }
};

// Function for finding an actor, script like "WeightManager.actor('Phage').weight()" gets her weight (number)
// Can find player (party leader)
WeightManager.actor = function(actorName) {
    if (actorName === "player") {
        return $gameActors.actor($gameParty.leader().actorId());
    }
    var actors = $gameActors._data;
    for (var actor_key in actors) {
            if (actors.hasOwnProperty(actor_key))
                if (actors[actor_key].name() === actorName)
                    return actors[actor_key];
    }
    return null;
};


WeightManager.findActorIdByName = function(actorName) {
        var actors = $gameActors._data;
        for (var actor_key in actors) {
            if (actors.hasOwnProperty(actor_key))
                if (actors[actor_key].name() === actorName)
                    return actor_key;
        }

        return -1;
};


WeightManager.parseWeightTags = function(subject, note) {
    if (!subject.isActor()) {
        return;
    }
    regex1 = /<weight:\s+([\+|-]?)(\d+|\w+)>/i; // affects subject weight
    regex2 = /<weight_type:\s+(\w*)>/i;  // affects subject weight type
    regex3 = /<weight:\s+(\w+)\s+([\+|-]?)(\d+|\w+)>/i; // affects actor's weight
    regex4 = /<weight_type:\s+(\w+)\s+(\w+)>/i;  // affects actir's weight type
    res1 = regex1.exec(note);
    res2 = regex2.exec(note);
    res3 = regex3.exec(note);
    res4 = regex4.exec(note);
    
    if (res1) {
        for (i = 0; i < res1.length; i+=3) {
            WeightManager.parseWeightTagValue(subject, res1[i+1].concat(res1[i+2]));
        }
    }
    if (res2) {
        for (i = 0; i < res2.length; i+=2) {
            subject.setWeightType(res2[i+1]);
        }
    }
    if (res3) {
        for (i = 0; i < res3.length; i+=4) {
            var actor = $gameActors.actor(WeightManager.findActorIdByName(res3[i+1]));
            if (actor !== null) {
                WeightManager.parseWeightTagValue(actor, res3[i+2].concat(res3[i+3]));
            }
        }
    }
    if (res4) {
        for (i = 0; i < res4.length; i+=3) {
            var actor = $gameActors.actor(WeightManager.findActorIdByName(res4[i+1]));
            if (actor !== null) {
                actor.setWeightType(res4[i+2]);
            }

        }
    }
};


//-----------------------------------------------------------------
// Conditional_Object
//
// A base class for statuses or skills that should be avaiable for
// actors then certain weight related condition evaluates true
function Conditional_Object() {
    this.initialize.apply(this, arguments);
};

Conditional_Object.prototype.initialize = function(id, operator, threshold) {
    this.id = id;
    this.threshold = threshold;
    switch (operator) {
        case '==':
            this.evaluate = function (value) {return value == this.threshold;};
            break;
        case '>=':
            this.evaluate = function (value) {return value >= this.threshold;};
            break;
        case '<=':
            this.evaluate = function (value) {return value <= this.threshold;};
            break;
        case '<':
            this.evaluate = function (value) {return value < this.threshold;};
            break;
        case '>':
            this.evaluate = function (value) {return value > this.threshold;};
            break;
        default:
            this.evaluate = function (value) {return false;};
    }
};
 
 
(function() {
    //-----------------------------------------------------------------
    // Game_BattlerBase
    //
    // Added property weight, for skills dmg formula calculation
    Object.defineProperties(Game_BattlerBase.prototype, {
       wg: { get: function() {if(this.isActor() == true) return this._weight; return 0;}, configurable: true}
    });


    //-----------------------------------------------------------------
    // Game_Actor
    //
    // Added all necessery attributes and functions for weight
    // system. Function updateSpriteBasedOnWeight() is responsible
    // for updating the actor's sprite. Name convenction for sprites'
    // like examples above.
    var parameters = PluginManager.parameters('WeightGainSystem');
    
    var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._weight_system = true;
        this._weight = 0;
        this._weight_type = "normal";
        this._weight_skills = [];
        this._weight_states = [];
        $dataStates.forEach(function(status) {
            if (status == null) return;
            var regex1 = /<weight_state:\s+(>=|==|<=|<|>)\s+(\w+|\d+)>/i;
            var match = regex1.exec(status.note);
            if (match && this._weight_states.indexOf(status.id) === -1) {
                var weight = parseInt(match[2]);
                if (isNaN(weight))
                    weight = WeightManager.getValueByTag(match[2]);
                this._weight_states.push(new Conditional_Object(
                    status.id, match[1], weight));
            }
        }, this);
    };

    Game_Actor.prototype.weight_system = function () {
      return this._weight_system;
    };

    Game_Actor.prototype.weightSystemOn = function () {
        this._weight_system = true;
    };

    Game_Actor.prototype.weightSystemOff = function () {
      this._weight_system = false;
    };

    Game_Actor.prototype.weight = function() {
        return this._weight;
    };
    
    Game_Actor.prototype.weightLvl = function() {
        return WeightManager.getWeightTag(this._weight)
    }
    
    Game_Actor.prototype.setWeight = function(weight) {
        if (this._weight_system == false)
            return;
        weight = parseInt(weight);
        if (isNaN(weight))
            return;
        if (weight < 0)
            weight = 0;
        
        this._weight = weight;

        this.updateCharacterNameBasedOnWeight();
        this.checkWeightRelatedSkills();
        this.checkWeightRelatedStates();
        this.checkWeightRelatedItems();
        
        if (this._weight > WeightManager.maxWeight())
             this._weight = WeightManager.maxWeight();
    };
    
    Game_Actor.prototype.weight_type = function() {
        return this._weight_type;
    };
    
    Game_Actor.prototype.setWeightType = function(weight_type) {
        if (this._weight_system == false)
            return;
        this._weight_type = weight_type;
        this.updateCharacterNameBasedOnWeight();
    };
    
    Game_Actor.prototype.updateCharacterNameBasedOnWeight = function() {
        this._characterName = '$' + this._name.toLowerCase();
        if (this._weight > 0) {
            this._characterName = this._characterName + " " + WeightManager.getWeightTag(this._weight);
        }
        if (this._weight_type !== "normal") {
            this._characterName = this._characterName + " " + this._weight_type;
        }
        this._characterIndex = 0;
        $gamePlayer.refresh();
    };
    
    var _Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
    Game_Actor.prototype.learnSkill = function(skillId) {
        _Game_Actor_learnSkill.call(this, skillId);
        var regex1 = /<weight_skill:\s+(>=|==|<=|<|>)\s+(\w+|\d+)>/i;
        var match = regex1.exec($dataSkills[skillId].note);
        if (match) {
            for (var i = 0; i < this._weight_skills.length; i++)
                if (this._weight_skills[i].id === skillId)
                    return;
            var weight = parseInt(match[2]);
            if (isNaN(weight))
                weight = WeightManager.getValueByTag(match[2]);
            var cond = new Conditional_Object(skillId, match[1], weight);
            this._weight_skills.push(cond);
            if (cond.evaluate(this._weight) == false) {
                this.forgetSkill(cond.id);
            }
        }
    }
    
    Game_Actor.prototype.checkWeightRelatedSkills = function() {
        this._weight_skills.forEach(function(weight_skill_checker) {
            if (weight_skill_checker.evaluate(this._weight)) {
                this.learnSkill(weight_skill_checker.id);
            }
            else {
                this.forgetSkill(weight_skill_checker.id);
            }
        }, this);
    };
    
    Game_Actor.prototype.checkWeightRelatedStates = function() {
        this._weight_states.forEach(function(weight_state_checker) {
            if (weight_state_checker.evaluate(this._weight)) {
                this.addState(weight_state_checker.id);
            }
            else {
                this.removeState(weight_state_checker.id);
            }
        }, this);
    };
    
    Game_Actor.prototype.checkWeightRelatedItems = function() {
        
    };
    
    
    //-----------------------------------------------------------------
    // Game_Event
    //
    // Events can inherit weight/sprite from actors, i.e. add
    // <sprite_inherit: Phage> as a comment in event page, so the event will look
    // like Phage actor
    // This command will work for event pages separately. Actors must exist in game
    // for command to work correctly.
    var _Game_Event_initMembers = Game_Event.prototype.initMembers;

    var _Game_Event_page = Game_Event.prototype.page;
    Game_Event.prototype.page = function() {
        var page = _Game_Event_page.call(this);
        var regex1 = /<sprite_inherit:\s+(\w+)>/gi;

        // Functionality of sprites inheritance works per event page.
        // Comment like <sprite_inherit: Phage>
        // should be in event page.
        for (var i = 0; i < page.list.length; i++) {
          var command = page.list[i];
          /* if command is a comment add to comments var */
          if (command.code === 108 || command.code === 408) {
              var res = regex1.exec(command.parameters[0]);
              if (res) {
                  if (res[1] === 'Adipe')
                      res[1] = 'Adipe';
                  var actorId = WeightManager.findActorIdByName(res[1]);
                  if (actorId !== -1) {
                      var gameActor = $gameActors.actor(actorId);
                      page.image.characterName = gameActor._characterName;
                  }
              }
          }
        }

        return page;
    };

    
    //-----------------------------------------------------------------
    // Game_Action
    // 
    // Allows items, skills etc. to change weight
    
    var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;  
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        WeightManager.parseWeightTags(target, this.item().note)
    };
    
    
    //-----------------------------------------------------------------
    // Game_Interpreter
    //
    // Added weight commands to events.
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SetWeight') this.setWeight(args);
        if (command === 'SetWeightType') this.setWeightType(args);
        if (command === 'WeightSystemOn') this.switchWeightSystem(true, args);
        if (command === 'WeightSystemOff') this.switchWeightSystem(false, args);
    };
    
    Game_Interpreter.prototype.setWeight = function(args) {
        var actorName = args[0];
        var actorId = 0;
        if (actorName === 'player')
            actorId = $gameParty.leader().actorId();
        else
            actorId = WeightManager.findActorIdByName(actorName);
        if (actorId !== -1)
            WeightManager.parseWeightTagValue($gameActors.actor(actorId), args[1]);
    };
    
    Game_Interpreter.prototype.setWeightType = function(args) {
        var actorName = args[0];
        var actorId = 0;
        if (actorName === 'player')
            actorId = $gameParty.leader().actorId();
        else
            actorId = WeightManager.findActorIdByName(actorName);
        var patt = /^\w*$/i; // SetWeight <actor> fat_nude
        if (patt.test(args[1])) {
            var actor = $gameActors.actor(actorId);
            if (actor !== null) {
                $gameActors.actor(actorId).setWeightType(args[1]);
                $gameActors.actor(actorId).updateCharacterNameBasedOnWeight();
            }
        }
    };

    Game_Interpreter.prototype.switchWeightSystem = function (flag, args) {
         var actorName = args[0];
        var actorId = 0;
        if (actorName === 'player')
            actorId = $gameParty.leader().actorId();
        else
            actorId = WeightManager.findActorIdByName(actorName);
        var actor = $gameActors.actor(actorId);
        if (actor.isActor()) {
            if (flag) actor.weightSystemOn();
            else actor.weightSystemOff();
        }
    }
    
})();