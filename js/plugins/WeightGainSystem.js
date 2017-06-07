//===========================================================
// WeightGainSystem.js
//===========================================================


/*:
 * @plugindesc Weight gain system for actors.
 * @author grip5
 *
 * @help This plugin implements simple weight gain system, allowing
 * automatic sprite change based on weight status. Items and statuses
 * can also increment/decrement weigth or set it on constant level.
 */
 
// sprite name template
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

// event plugin command template
// setWeight <actor> <variable>
// <actor> - Lotta, Phage, etc.
// <variable> - change like +4, -1, constant like 10 or status like "stuffed"
 
 
// -----------------------------------------------------------------
// WeightLevelsManager
//
// Simple class for matching sprites tags with fatness.
// Values in tags dictionary can easly be set for better weight
// gain system, like in kg/lbs or 0/10/20/...
function WeightLevelsManager() {
    throw new Error('This is a static class');
}

WeightLevelsManager._weight_tags = { // dictionary with sprites tags per level
        0: "",
        1: "full",
        2: "stuffed",
        3: "overstuffed",
        4: "engorged",
        5: "overengorged",
        6: "glutted"
}; 

WeightLevelsManager._weight_levels = [  // array with level values, must be sorted
        0, 1, 2, 3, 4, 5, 6
];

// Returns corresponding tag, for example weight=2 -> stuffed
WeightLevelsManager.getWeightTag = function(weight) {
    for (i = this._weight_levels.length - 1; i > 0; i--) {
        if (this._weight_levels[i] <= weight) {
            return this._weight_tags[ this._weight_levels[i] ];
        }
    }
    return "";
};

// Checks is weight equal/bigger than a threshold, for exmaple
// does "glutted" >= "overengorged"? true
WeightLevelsManager.isFatterOrEqual = function(weight, weight_treshold) {
    var weight_value, weight_treshold_value;
    for (var key in this._weight_tags) {
        if (this._weight_tags[key] == weight) {
            weight_value = key;
        }
        if (this._weight_tags[key] == weight_treshold) {
            weight_treshold_value = key;
        }
    }
    return weight_value >= weight_treshold_value;
};
 
 
(function() {
    
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
    };
    
    Game_Actor.prototype.weight = function() {
        return this._weight;
    };
    
    Game_Actor.prototype.setWeight = function(weight) {
        this._weight = weight;
    };
    
    Game_Actor.prototype.weight_type = function() {
        return this._weight_type;
    };
    
    Game_Actor.prototype.setWeightType = function(weight_type) {
        this._weight_type = weight_type;
    };
    
    Game_Actor.prototype.updateCharacterNameBasedOnWeight = function() {
        this._characterName = '$' + this._name.toLowerCase();
        if (this._weight > 0) {
            this._characterName = this._characterName + " " + WeightLevelsManager.getWeightTag(this._weight);
        }
        if (this._weight_type !== "normal") {
            this._characterName = this._characterName + " " + this._weight_type;
        }
        this._characterIndex = 0;
        $gamePlayer.refresh();
    };
    
    //-----------------------------------------------------------------
    // Game_Interpreter
    //
    // Added weight commands to events.
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SetWeight') this.setWeight(args);
    };
    
    Game_Interpreter.prototype.setWeight = function(args) {
        var actorId = args[0];
        if (actorId === 'player')
            actorId = $gameParty.leader().actorId();
        var patt1 = /(-|\+)[\d]+/; // setWeight <actorId> +10
        var patt2 = /[\d]+/; // setWeight <actorId> 120
        var patt3 = /\w/i; // setWeightLevel <actorId> stuffed
        if (patt1.test(args[1])) {
            var w = 1;
            if (args[0][0] === '-')
                w = -1;
            args[1] = args[1].substr(1);
            w = w * parseInt(args[1]);
            $gameActors.actor(actorId).setWeight($gameActors.actor(actorId).weight() + w);
            $gameActors.actor(actorId).updateCharacterNameBasedOnWeight();
        } else if (patt2.test(args[1])) {
            $gameActors.actor(actorId).setWeight(parseInt(args[1]));
            $gameActors.actor(actorId).updateCharacterNameBasedOnWeight();
        }
    };
    
})();