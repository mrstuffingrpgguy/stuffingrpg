//=============================================================================
// Yanfly Engine Plugins - Passive Aura Effects
// YEP_X_PassiveAuras.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_X_PassiveAuras = true;

var Yanfly = Yanfly || {};
Yanfly.Aura = Yanfly.Aura || {};

//=============================================================================
 /*:
 * @plugindesc v1.01 (Requires YEP_AutoPassiveStates.js) Add aura effects
 * to various database objects.
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_AutoPassiveStates. Make sure this plugin is located
 * under YEP_AutoPassiveStates in the plugin list.
 *
 * Passive Aura Effects are commonly found in many online multiplayer games
 * with RPG elements. When a battler can give out an aura, it will affect other
 * nearby battlers, too, either ally and/or foe. This plugin will allow states
 * to generate aura effects for other party members, opponents, or specifically
 * for actor and/or enemy parties.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Use the following notetags to make a state generate auras.
 *
 * State Notetags:
 *
 *   <Ally Aura: x>
 *   <Ally Aura: x, x, x>
 *   <Ally Aura: x through y>
 *   - This will cause the battler's allies to gain state(s) x (through y)
 *   while the battler is affected by the current state.
 *   *Note: A state cannot use itself in an aura effect.
 *
 *   <Foe Aura: x>
 *   <Foe Aura: x, x, x>
 *   <Foe Aura: x through y>
 *   - This will cause the battler's foes to gain state(s) x (through y)
 *   while the battler is affected by the current state.
 *   *Note: A state cannot use itself in an aura effect.
 *
 *   <Party Aura: x>
 *   <Party Aura: x, x, x>
 *   <Party Aura: x through y>
 *   - This will cause the Actor Party to gain state(s) x (through y)
 *   while the battler is affected by the current state.
 *   *Note: A state cannot use itself in an aura effect.
 *
 *   <Troop Aura: x>
 *   <Troop Aura: x, x, x>
 *   <Troop Aura: x through y>
 *   - This will cause the Enemy Troop to gain state(s) x (through y)
 *   while the battler is affected by the current state.
 *   *Note: A state cannot use itself in an aura effect.
 *
 * ============================================================================
 * Lunatic Mode - Custom Aura Conditions
 * ============================================================================
 *
 * For those with JavaScript experience and would like to make conditional aura
 * effects, you can use these notetags. Keep in mind, this conditional effect
 * is for the target delivered state and not the origin aura itself.
 *
 * State Notetags:
 *
 *   <Custom Aura Condition>
 *    if (user.hpRate() > 0.50) {
 *      condition = true;
 *    } else {
 *      condition = false;
 *    }
 *   </Custom Aura Condition>
 *   - The 'condition' variable will determine whether or not the target aura
 *   state will appear. If the 'condition' variable is 'true', then it will
 *   appear. If the 'condition' variable is 'false', then it will not appear.
 *   Remember, this notetag has to be placed in the target delivered state and
 *   not the origin aura itself.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.01:
 * - Fixed a bug that would conflict with Taunt and Selection Core making some
 * aura effects randomly disappear.
 *
 * Version 1.00:
 * - Finished Plugin!
 */
//=============================================================================

if (Imported.YEP_AutoPassiveStates) {

//=============================================================================
// DataManager
//=============================================================================

Yanfly.Aura.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.Aura.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!Yanfly._loaded_YEP_X_PassiveAuras) {
    this.processAuraNotetags1($dataStates);
    Yanfly._loaded_YEP_X_PassiveAuras = true;
  }
  
  return true;
};

DataManager.processAuraNotetags1 = function(group) {
  var note1 = /<(.*)[ ](?:AURA|STATE AURA):[ ]*(\d+(?:\s*,\s*\d+)*)>/i;
  var note2 = /<(.*)[ ](?:AURA|STATE AURA):[ ](\d+)[ ](?:THROUGH|to)[ ](\d+)>/i;
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.aura = {
      all:       [],
      friends:   [],
      opponents: [],
      party:     [],
      troop:     [],
    }
    var evalMode = 'none';
    obj.auraConditionEval = '';

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];
      if (line.match(note1)) {
        var type = this.getNotetagAuraType(String(RegExp.$1));
        var array = JSON.parse('[' + RegExp.$2.match(/\d+/g) + ']');
        obj.aura[type] = obj.aura[type].concat(array);
        Yanfly.Util.removeArrayElement(obj.aura[type], obj.id);
      } else if (line.match(note2)) {
        var type = this.getNotetagAuraType(String(RegExp.$1));
        var range = Yanfly.Util.getRange(parseInt(RegExp.$2),
          parseInt(RegExp.$3));
        obj.aura[type] = obj.aura[type].concat(range);
        Yanfly.Util.removeArrayElement(obj.aura[type], obj.id);
      } else if (line.match(/<(?:CUSTOM AURA CONDITION)>/i)) {
        var evalMode = 'custom aura condition';
      } else if (line.match(/<\/(?:CUSTOM AURA CONDITION)>/i)) {
        var evalMode = 'none';
      } else if (evalMode === 'custom aura condition') {
        obj.auraConditionEval = obj.auraConditionEval + line + '\n';
      }
    }
  }
};

DataManager.getNotetagAuraType = function(str) {
  switch (str.toUpperCase()) {
  case 'ALLY':
  case 'ALLIES':
  case 'FRIEND':
  case 'FRIENDS':
  case 'FRIENDLY':
    return 'friends';
    break;
  case 'FOE':
  case 'FOES':
  case 'OPPONENT':
  case 'OPPONENTS':
  case 'OPPOSING':
    return 'opponents';
    break;
  case 'ACTOR':
  case 'ACTORS':
  case 'PARTY':
  case 'PARTIES':
    return 'party';
    break;
  case 'ENEMY':
  case 'ENEMIES':
  case 'TROOP':
  case 'TROOPS':
    return 'troop';
    break;
  default:
    return 'all';
  }
};

DataManager.isAuraState = function(state) {
  if (!state) return false;
  if (!state.aura) return false;
  var array = ['all', 'friends', 'opponents', 'party', 'troop'];
  var length = array.length;
  for (var i = 0; i < length; ++i) {
    if (state.aura[array[i]].length > 0) return true;
  }
  return false;
};

//=============================================================================
// Game_BattlerBase
//=============================================================================

Yanfly.Aura.Game_BattlerBase_passiveStatesRaw =
  Game_BattlerBase.prototype.passiveStatesRaw;
Game_BattlerBase.prototype.passiveStatesRaw = function() {
  var array = Yanfly.Aura.Game_BattlerBase_passiveStatesRaw.call(this);
  if ($gameParty.inBattle()) {
    array = array.concat(this.validAuraStateIds());
  }
  return array.filter(Yanfly.Util.onlyUnique);
};

Game_BattlerBase.prototype.validAuraStateIds = function() {
  var array = [];
  var states = this.auraStateIds();
  var length = states.length;
  for (var i = 0; i < length; ++i) {
    var stateId = states[i];
    if (this.meetAuraStateCondition(stateId)) array.push(stateId);
  }
  return array;
};

Game_BattlerBase.prototype.auraStateIds = function() {
  if ($gameTemp._isGatheringAuraData) return [];
  var array = [];
  var friends = this.friendsUnit();
  var opponents = this.opponentsUnit();
  $gameTemp._isGatheringAuraData = true;
  array = array.concat(friends.auraStateTypeIds('all'));
  array = array.concat(opponents.auraStateTypeIds('all'));
  array = array.concat(friends.auraStateTypeIds('friends'));
  array = array.concat(opponents.auraStateTypeIds('opponents'));
  $gameTemp._isGatheringAuraData = false;
  return array;
};

Game_BattlerBase.prototype.getAuraStateTypeId = function(type) {
  var array = [];
  var states = this.states();
  var length = states.length;
  for (var i = 0; i < length; ++i) {
    var state = states[i];
    if (!state) continue;
    if (!DataManager.isAuraState(state)) continue;
    array = array.concat(state.aura[type]);
  }
  return array;
};

Game_BattlerBase.prototype.meetAuraStateCondition = function(stateId) {
  this._checkAuraStateCondition = this._checkAuraStateCondition || [];
  if (this._checkAuraStateCondition.contains(stateId)) return false;
  var state = $dataStates[stateId];
  if (!state) return false;
  if (state.auraConditionEval === '') return true;
  return this.auraStateConditionEval(state);
};

Game_BattlerBase.prototype.auraStateConditionEval = function(state) {
  this._checkAuraStateCondition = this._checkAuraStateCondition || [];
  this._checkAuraStateCondition.push(state.id);
  var condition = true;
  var a = this;
  var user = this;
  var subject = this;
  var b = this;
  var target = this;
  var s = $gameSwitches._data;
  var v = $gameVariables._data;
  eval(state.auraConditionEval);
  var index = this._checkAuraStateCondition.indexOf(state.id);
  this._checkAuraStateCondition.splice(index, 1);
  return condition;
};

Yanfly.Aura.Game_BattlerBase_addNewState =
  Game_BattlerBase.prototype.addNewState;
Game_BattlerBase.prototype.addNewState = function(stateId) {
  Yanfly.Aura.Game_BattlerBase_addNewState.call(this, stateId);
  this.updateAuras(stateId);
};

Yanfly.Aura.Game_BattlerBase_eraseState =
  Game_BattlerBase.prototype.eraseState;
Game_BattlerBase.prototype.eraseState = function(stateId) {
  Yanfly.Aura.Game_BattlerBase_eraseState.call(this, stateId);
  this.updateAuras(stateId);
};

Game_BattlerBase.prototype.updateAuras = function(stateId) {
  var state = $dataStates[stateId];
  if (!state) return;
  aura = state.aura;
  if ((aura.all.length + aura.friends.length > 0) || aura.party.length > 0) {
    $gameParty.refreshMembers();
  }
  if ((aura.all.length + aura.opponents.length > 0) || aura.troop.length > 0) {
    $gameTroop.refreshMembers();
  }
};

//=============================================================================
// Game_Actor
//=============================================================================

Game_Actor.prototype.auraStateIds = function() {
  if ($gameTemp._isGatheringAuraData) return [];
  var array = Game_Battler.prototype.auraStateIds.call(this);
  var friends = this.friendsUnit();
  var opponents = this.opponentsUnit();
  $gameTemp._isGatheringAuraData = true;
  array = array.concat(friends.auraStateTypeIds('party'));
  array = array.concat(opponents.auraStateTypeIds('party'));
  $gameTemp._isGatheringAuraData = false;
  return array;
};

//=============================================================================
// Game_Enemy
//=============================================================================

Game_Enemy.prototype.auraStateIds = function() {
  if ($gameTemp._isGatheringAuraData) return [];
  var array = Game_Battler.prototype.auraStateIds.call(this);
  var friends = this.friendsUnit();
  var opponents = this.opponentsUnit();
  $gameTemp._isGatheringAuraData = true;
  array = array.concat(friends.auraStateTypeIds('troop'));
  array = array.concat(opponents.auraStateTypeIds('troop'));
  $gameTemp._isGatheringAuraData = false;
  return array;
};

//=============================================================================
// Game_Unit
//=============================================================================

Game_Unit.prototype.allAliveMembers = function() {
  return this.members().filter(function(member) {
      return member.isAlive();
  });
};

Game_Unit.prototype.auraStateTypeIds = function(type) {
  var array = [];
  var members = this.allAliveMembers();
  var length = members.length;
  for (var i = 0; i < length; ++i) {
    var member = members[i];
    if (member) {
      array = array.concat(member.getAuraStateTypeId(type));
    }
  }
  return array;
};

//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util.removeArrayElement = function(array, element) {
  while (array.indexOf(element) >= 0) {
    array.splice(array.indexOf(element), 1);
  }
};

//=============================================================================
// End of File
//=============================================================================
}; // Imported.YEP_AutoPassiveStates