//-----------------------------------------------------------------------------
//  Galv"s Quest Log - UPGRADED
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_QuestLog.js
//-----------------------------------------------------------------------------
//  2017-06-04 - Version 2.0 - refactored how quests are written
//  2017-02-01 - Version 1.2 - added ability to show/hide quest categories
//                             during game
//  2016-12-12 - Version 1.1 - added setting to change seperator character for
//                             objectives and resolutions.
//  2016-11-10 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_QuestLog = true;

var Galv = Galv || {};                  // Galv"s main object
Galv.QUEST = Galv.QUEST || {};          // Galv"s stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.2) A system to track quests/sidequests in your RPG.
 *
 * @author Galv - galvs-scripts.com
 *
 * @param File
 * @desc The name of your quests json file (without .json).
 * @default Quests
 *
 * @param Folder
 * @desc The folder name in your project where the json file is located.
 * @default data
 *
 * @param - OPTIONS -
 * @desc
 * @default
 *
 * @param Font Size
 * @desc The font size for quest text in the quest log
 * Default: 28
 * @default 22
 *
 * @param Categories
 * @desc An ordered list of quest categories separated by commas with | to designate hex color code for each
 * @default Main Quests|#ffcc66,Side Quests|#ffff99,Crafting Quests|#ccccff
 *
 * @param -- ICONS --
 * @desc
 * @default
 *
 * @param Not Complete Icon
 * @desc Icon displayed next to objectives not completed yet
 * @default 163
 *
 * @param Complete Icon
 * @desc Icon displayed next to objectives that are completed
 * @default 164
 *
 * @param Failed Icon
 * @desc Icon displayed next to objectives that were failed
 * @default 162
 *
 * @param Tracked Quest Icon
 * @desc Icon displayed next to currently tracked quest
 * @default 88
 *
 * @param -- VOCAB --
 * @desc
 * @default
 *
 * @param Quest Command
 * @desc Text used for Quest command in menu. Leave blank to not use this.
 * @default Quest Log
 *
 * @param Active Cmd Txt
 * @desc The command to view active quests
 * @default Active
 *
 * @param Completed Cmd Txt
 * @desc The command to view completed quests
 * @default Complete
 *
 * @param Failed Cmd Txt
 * @desc The command to view failed quests
 * @default Failed
 *
 * @param Desc Txt
 * @desc The heading above the quest description
 * @default Details
 *
 * @param Objectives Txt
 * @desc The heading above the quest description
 * @default Objectives
 *
 * @param Difficulty Txt
 * @desc The text beside the level/difficulty value of the quest
 * @default Level
 *
 * @param No Tracked Quest
 * @desc Text displayed when no quest is being tracked
 * @default No Quest Selected
 *
 * @param -- EXTRA --
 * @desc The below settings are for Galv"s Timed Message Popups
 * @default
 *
 * @param Pop XY
 * @desc The X,Y position for the timed popup
 * @default 20,20
 *
 * @param Pop Time
 * @desc How many frames the popup stays on screen
 * @default 130
 *
 * @param Pop New Quest
 * @desc Text displayed before the name of the quest when it is activated
 * @default New Quest:
 *
 * @param Pop Complete Quest
 * @desc Text displayed before the name of the quest when it is completed
 * @default Quest Completed:
 *
 * @param Pop Fail Quest
 * @desc Text displayed before the name of the quest when it is failed
 * @default Quest Failed:
 *
 * @param Pop New Objective
 * @desc Text displayed before the name of an objective when it is activated
 * @default New Objective:
 *
 * @param Pop Complete Objective
 * @desc Text displayed before the name of an objective when it is completed
 * @default Objective Completed:
 *
 * @param Pop Fail Objective
 * @desc Text displayed before the name of an objective when it is failed
 * @default Objective Failed:
 *
 * @help
 *   Galv"s Quest Log
 * ----------------------------------------------------------------------------
 * Another quest log plugin for RPG Maker MV but written in Galv"s style. Help
 * the player keep track of multiple quests and give notification of when
 * quests are accepted, changed or completed.
 *
 * MAKING A QUEST
 * --------------
 * TODO: write some stuff
 *
 *
 * MODIFYING QUESTS
 * ----------------
 * Objectives in a quest or an entire quest"s status can be changed via script
 * calls (further down). This quest log does not automate anything, you will
 * need to do the script calls manually as quests are completed in your RPG.
 *
 * QUEST TRACKING
 * --------------
 * You can track a quest by calling a script call (further down) with the quest
 * id. If the quest is already complete or failed, the quest cannot be tracked.
 * By tracking a quest you can detect from within an evente which quest id is
 * being tracked and use that in conditional branches to change reactions.
 *
 * The tracked quest will also appear on the main quest screen when no other
 * quest is being tracked.
 *
 * QUEST POPUPS
 * ------------
 * This plugin doesn"t come with quest popup notifications, however if you use
 * Galv"s Timed Message Popup plugin, it will automatically make notifications
 * using those.
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT calls
 * ----------------------------------------------------------------------------
 *
 *    Galv.QUEST.viewLog();   // starts the quest log scene manually
 *
 *    Galv.QUEST.catStatus(id,status); // id is the index number of the quest
 *                                     // category you set up in the plugin
 *                                     // settings. 0 first, 1 second, etc
 *                                     // status can be true or false to set
 *                                     // if the category is visible or not.
 *                                     // Categories are all true by default
 *
 *    Galv.QUEST.track(id);   // set which quest is being tracked
 *
 *    Galv.QUEST.activate(id);   // Add a quest to the Quest log as active
 *    Galv.QUEST.fail(id);       // Fail a quest in the Quest Log.
 *    Galv.QUEST.complete(id);   // Complete a quest in the Quest Log
 *
 *    Galv.QUEST.resolution(id,i);  // set resolution text to resolution index
 *                                  // i = -1 for none, 0 is first resolution
 *
 *    Galv.QUEST.objective(id,objId,status); // Change a quest"s objective
 *                                           // id     = the quest"s id
 *                                           // objId  = the objective index
 *                                           //          (0 is first)
 *                                           // status can be...
 *                                           //  -1  or  "hide"
 *                                           //   0  or  "activate"
 *                                           //   1  or  "complete"
 *                                           //   2  or  "fail"
 * EXAMPLES
 * Galv.QUEST.objective(3,0,"complete");  // complete quest 3"s 1st objective
 * Galv.QUEST.objective(3,0,1);           // complete quest 3"s 1st objective
 * Galv.QUEST.complete(3);  // complete quest 3 (not changing any objectives)
 * Galv.QUEST.objective(1,2,"hide");      // hide quest 1"s 3rd objective
 *
 * EXTRA
 * If you have Galv"s Timed Message Popups installed, it will automatically
 * display popups as quests and objectives are gained, completed or failed.
 * You can prevent a popup by adding a true argument at the end of the script
 * call. eg, the following are examples of not displaying popups:
 * Galv.QUEST.objective(3,0,"complete",true);
 * Galv.QUEST.fail(2,true);
 * Galv.QUEST.activate(3,true);
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT for CONTROL VARIABLES
 * ----------------------------------------------------------------------------
 *
 *    Galv.QUEST.status(id)   // returns 0 incomplete, 1 complete, 2 failed
 *                            // returns -1 if quest was never activated.
 *
 *    Galv.QUEST.status(id,x) // x is the objective number to check status of
 *                            // (remember 0 is the first objective)
 *                            // returns same numbers as above
 *
 *    Galv.QUEST.isTracked()  // returns the id of the tracked quest.
 *                            // 0 if no quest is being tracked.
 *
 * ----------------------------------------------------------------------------
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

// Implement String.formatDict function
String.prototype.formatDict = function(placeholders) {
    var s = this;
    for(var propertyName in placeholders) {
        var re = new RegExp('{' + propertyName + '}', 'gm');
        if (placeholders[propertyName] === Object(placeholders[propertyName])) {
            s = s.replace(re, placeholders[propertyName]());
        } else {
            s = s.replace(re, placeholders[propertyName]);
        }
    }    
    return s;
};  



//-----------------------------------------------------------------------------
// GET JSON FILE
//-----------------------------------------------------------------------------

Galv.QUEST.file = {};
Galv.QUEST.file.getString = function(filePath) {
    var request = new XMLHttpRequest();
    request.open("GET", filePath);
    request.overrideMimeType("application/json");
    request.onload = function() {
        if (request.status < 400) {
            Galv.QUEST.createQuests(JSON.parse(request.responseText));
        }
    };
    request.send();
};

Galv.QUEST.createQuests = function(json_quests) {
    var bIndex = 0;
    var format_match = /\{(\d+)\}/g;
    var quest = {};
    Galv.QUEST.quests = {};

    for (var i = 0; i < json_quests.length; i++) {
        quest = json_quests[i];
        bIndex = quest.id;
        Galv.QUEST.quests[bIndex] = {};
        Galv.QUEST.quests[bIndex].name = quest.name || "???";
        Galv.QUEST.quests[bIndex].category = quest.type || 0;
        Galv.QUEST.quests[bIndex].difficulty = quest.lvl || "???";
        Galv.QUEST.quests[bIndex].objectives = quest.obj || [];
        Galv.QUEST.quests[bIndex].resolutions = quest.res || [];
        Galv.QUEST.quests[bIndex].desc = quest.desc;
        Galv.QUEST.quests[bIndex].variables =  quest.variables || {};
    }
};

Galv.QUEST.fileName = function() {
    if (!Galv.QUEST.quests) {
        var filename = PluginManager.parameters("Galv_QuestLog")["File"];;
        var folder = PluginManager.parameters("Galv_QuestLog")["Folder"];
        if (folder !== "") folder = folder + "/";
        Galv.QUEST.file.getString(folder + filename + ".json");
    };
}();


// Options
Galv.QUEST.fontSize = Number(PluginManager.parameters("Galv_QuestLog")["Font Size"]);

var cats = PluginManager.parameters("Galv_QuestLog")["Categories"].split(",");
Galv.QUEST.categories = [];
for (var i = 0; i < cats.length; i++) {
    var data = cats[i].split("|");
    Galv.QUEST.categories[i] = {id:i,name:data[0],color:data[1]};
}

// Vocab
Galv.QUEST.menuCmd = PluginManager.parameters("Galv_QuestLog")["Quest Command"];
Galv.QUEST.questsCmdActive = PluginManager.parameters("Galv_QuestLog")["Active Cmd Txt"];
Galv.QUEST.questsCmdComplete = PluginManager.parameters("Galv_QuestLog")["Completed Cmd Txt"];
Galv.QUEST.questsCmdFailed = PluginManager.parameters("Galv_QuestLog")["Failed Cmd Txt"];
Galv.QUEST.questsDesc = PluginManager.parameters("Galv_QuestLog")["Desc Txt"];
Galv.QUEST.questsObj = PluginManager.parameters("Galv_QuestLog")["Objectives Txt"];
Galv.QUEST.questsDiff = PluginManager.parameters("Galv_QuestLog")["Difficulty Txt"];
Galv.QUEST.questsNoTrack = PluginManager.parameters("Galv_QuestLog")["No Tracked Quest"];


// Icons
Galv.QUEST.icon0 = Number(PluginManager.parameters("Galv_QuestLog")["Not Complete Icon"]);
Galv.QUEST.icon1 = Number(PluginManager.parameters("Galv_QuestLog")["Complete Icon"]);
Galv.QUEST.icon2 = Number(PluginManager.parameters("Galv_QuestLog")["Failed Icon"]);
Galv.QUEST.icon3 = Number(PluginManager.parameters("Galv_QuestLog")["Tracked Quest Icon"]);


// Extra
var txt = PluginManager.parameters("Galv_QuestLog")["Pop XY"].split(",");
Galv.QUEST.popXY = [Number(txt[0]),Number(txt[1])];

Galv.QUEST.popTime = Number(PluginManager.parameters("Galv_QuestLog")["Pop Time"]);
Galv.QUEST.questsPopQA = PluginManager.parameters("Galv_QuestLog")["Pop New Quest"];
Galv.QUEST.questsPopQC = PluginManager.parameters("Galv_QuestLog")["Pop Complete Quest"];
Galv.QUEST.questsPopQF = PluginManager.parameters("Galv_QuestLog")["Pop Fail Quest"];
Galv.QUEST.questsPopOA = PluginManager.parameters("Galv_QuestLog")["Pop New Objective"];
Galv.QUEST.questsPopOC = PluginManager.parameters("Galv_QuestLog")["Pop Complete Objective"];
Galv.QUEST.questsPopOF = PluginManager.parameters("Galv_QuestLog")["Pop Fail Objective"];





//-----------------------------------------------------------------------------
// FUNCTIONALITY
//-----------------------------------------------------------------------------


// change status of a category
Galv.QUEST.catStatus = function(id,status) {
    $gameSystem._quests.categoryActive[id] = status;
};

// remove quest from active, completed or failed lists. Quest will still exist as obtained, however.
Galv.QUEST.removeQuest = function(id) {
    if ($gameSystem._quests.quest[id]) {
        Galv.QUEST.sliceArray($gameSystem._quests.active,id);
        Galv.QUEST.sliceArray($gameSystem._quests.completed,id);
        Galv.QUEST.sliceArray($gameSystem._quests.failed,id);
        $gameSystem._quests.quest[id]._status = -1;
    }
};

Galv.QUEST.sliceArray = function(array,element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
};

// create quest if doesn"t exist
Galv.QUEST.create = function(id) {
    if (!$gameSystem._quests.quest[id] && Galv.QUEST.quests[id]) {
        Galv.QUEST.removeQuest(id);
        $gameSystem._quests.quest[id] = new Game_Quest(id);
    }
};

Galv.QUEST.convStatus = {
    0: "active",
    1: "completed",
    2: "failed",
    "-1": "hidden",
    "hide": -1,
    "active": 0,
    "activate": 0,
    "completed": 1,
    "complete": 1,
    "failed": 2,
    "fail": 2,
};

// Change quest status
Galv.QUEST.put = function(id,status) {
    var status = status || 0;
    var place = Galv.QUEST.convStatus[status];

    if (status != 0) $gameSystem._quests.tracked = null;
    if ($gameSystem._quests.quest[id]) {
        Galv.QUEST.removeQuest(id);          // remove from all array
        $gameSystem._quests[place].unshift(id); // add to desired array
        $gameSystem._quests.quest[id]._status = status;  // set quest status
    }
};

Galv.QUEST.fail = function(id,hidePopup) {
    Galv.QUEST.create(id);
    Galv.QUEST.put(id,2);
    if (!hidePopup) Galv.QUEST.popup(id,2);
};

Galv.QUEST.complete = function(id,hidePopup) {
    Galv.QUEST.create(id);
    Galv.QUEST.put(id,1);
    if (!hidePopup) Galv.QUEST.popup(id,1);
};

Galv.QUEST.activate = function(id,hidePopup) {
    Galv.QUEST.create(id);
    Galv.QUEST.put(id,0);
    if (!hidePopup) Galv.QUEST.popup(id,0);
};

Galv.QUEST.popup = function(id,status,obj) {
    // plugin writers overwrite this if they want to use different notification/popup
    if (!Imported.Galv_MessageCaptions || !SceneManager._scene) return;
    var x = Galv.QUEST.popXY[0];
    var y = Galv.QUEST.popXY[1];
    var time = Galv.QUEST.popTime;
    switch (status) {
        case -1:
            return; // -1 is hiding an objective.
        case 0:
            var txt = obj != undefined ? Galv.QUEST.questsPopOA : Galv.QUEST.questsPopQA;
            break;
        case 1:
            var txt = obj != undefined ? Galv.QUEST.questsPopOC : Galv.QUEST.questsPopQC;
            break;
        case 2:
            var txt = obj != undefined ? Galv.QUEST.questsPopOF : Galv.QUEST.questsPopQF;
            break;
    }
    if (txt) {
        if (obj != undefined) {
            var name = $gameSystem._quests.quest[id].objectives()[obj];
        } else {
            var name = $gameSystem._quests.quest[id].name();
        }
        SceneManager._scene.createCaptionWindow([x,y],time,[txt + " " + name],[],0);
    }
    
};




// Change quest objective status
Galv.QUEST.objective = function(id,objId,status,hidePopup) {
    Galv.QUEST.create(id);
    if (isNaN(status)) var status = Galv.QUEST.convStatus[status];
    // status can be: 0 is not yet complete, 1 is completed, 2 is failed
    if ($gameSystem._quests.quest[id]) {
        $gameSystem._quests.quest[id]._objectives[objId] = status;
        if (!hidePopup) Galv.QUEST.popup(id,status,objId);
    }
};

Galv.QUEST.track = function(id) {
    if ($gameSystem._quests.quest[id] && $gameSystem._quests.quest[id]._status == 0) {
        $gameSystem._quests.tracked = id;
    } else {
        $gameSystem._quests.tracked = null;
    }
};

Galv.QUEST.variable = function(id, variable, value, item_count) {
    if ($gameSystem._quests.quest[id]) {
        if (value === undefined) {
            return Galv.QUEST.quests[id].variables[variable];
        }
        if (item_count === undefined) {
            Galv.QUEST.quests[id].variables[variable] = value;
        } else {
            Galv.QUEST.quests[id].variables[variable] = function() {
                var items = $gameParty.allItems();
                for (var i = 0; i < items.length; i++) {
                    if (items[i].name === value) {
                        return $gameParty.numItems(items[i]);
                    }
                }
                return 0;
            };
        }
    }        
};

Galv.QUEST.isTracked = function() {
    return $gameSystem._quests.tracked || 0;
};

Galv.QUEST.status = function(id,obj) {
    if ($gameSystem._quests.quest[id]) {
        if (obj != undefined) {
            return $gameSystem._quests.quest[id]._objectives[obj];
        } else {
            return $gameSystem._quests.quest[id]._status;
        }
    } else {
        return -1;
    }
};

Galv.QUEST.resolution = function(id,index) {
    if ($gameSystem._quests.quest[id]) $gameSystem._quests.quest[id]._resolution = index;
};

Galv.QUEST.viewLog = function() {
    SceneManager.push(Scene_QuestLog);
};


//-----------------------------------------------------------------------------
//  GAME SYSTEM
//-----------------------------------------------------------------------------

Galv.QUEST.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    Galv.QUEST.Game_System_initialize.call(this);
    this._quests = {
        tracked: null,
        quest: {},        // id: Game_Quest  - to store obtained quest objects
        active: [],       // array of quest id"s player has activated
        completed: [],    // array of quest id"s player has completed
        failed: [],       // array of quest id"s player has failed
        categoryHide: {active:[],completed:[],failed:[]},  // arrays containing data if category id is expanded or not (0/null for open, 1/true for closed)
        categoryActive: [],
    };
    
    // set all cats to true
    for (var i = 0; i < Galv.QUEST.categories.length; i++) {
        this._quests.categoryActive[i] = true;
    }
};

})();


//-----------------------------------------------------------------------------
//  GAME QUEST
//-----------------------------------------------------------------------------

function Game_Quest() {
    this.initialize.apply(this, arguments);
}

Game_Quest.prototype.initialize = function(id,cat) {
    this._id = id;
    this._cat = cat || 0;
    this._objectives = []; // indexes can be 0,1,2 to store the status of objectives. 0 (or undefined/null) is not yet complete, 1 is completed, 2 is failed
    this._resolution = -1; // the selected resolution to display under the quest description in the quest log. -1 for none.
    this._status = 0;      // 0 is not yet completed, 1 is completed, 2 is failed
};

Game_Quest.prototype.desc = function() {
    return Galv.QUEST.quests[this._id].desc;
};

Game_Quest.prototype.name = function() {
    return Galv.QUEST.quests[this._id].name;
};

Game_Quest.prototype.difficulty = function() {
    return Galv.QUEST.quests[this._id].difficulty;
};

Game_Quest.prototype.category = function() {
    return Galv.QUEST.quests[this._id].category;
};

Game_Quest.prototype.objectives = function() {
    return Galv.QUEST.quests[this._id].objectives;
};

Game_Quest.prototype.variables = function() {
    return Galv.QUEST.quests[this._id].variables;
};

Game_Quest.prototype.resolutions = function() {
    return Galv.QUEST.quests[this._id].resolutions;
};

Game_Quest.prototype.hasResolution = function() {
    return this._resolution >= 0;
};


//-----------------------------------------------------------------------------
//  SCENE QUESTLOG
//-----------------------------------------------------------------------------

function Scene_QuestLog() {
    this.initialize.apply(this, arguments);
}

Scene_QuestLog.prototype = Object.create(Scene_ItemBase.prototype);
Scene_QuestLog.prototype.constructor = Scene_QuestLog;

Scene_QuestLog.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_QuestLog.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createCategoryWindow();
    this.createQuestListWindow();
    this.createInfoWindow();
};

Scene_QuestLog.prototype.createCategoryWindow = function() {
    this._categoryWindow = new Window_QuestCategory();
    this._categoryWindow.setHandler("ok",     this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_QuestLog.prototype.createQuestListWindow = function() {
    var wy = this._categoryWindow.y + this._categoryWindow.height;
    var ww = Graphics.boxWidth / 2;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_QuestList(0, wy, ww, wh);
    this._itemWindow.setHandler("ok",     this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow.setItemWindow(this._itemWindow);
};

Scene_QuestLog.prototype.createInfoWindow = function() {
    var ww = this._itemWindow.width;
    var wh = this._itemWindow.height;
    var wx = this._itemWindow.x + ww;
    var wy = this._itemWindow.y;
    this._helpWindow = new Window_QuestInfo(wx,wy,ww,wh);
    this.addWindow(this._helpWindow);
    
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.setHelpWindow(this._helpWindow);
};

Scene_QuestLog.prototype.onCategoryOk = function() {
    this._itemWindow.activate();
    this._itemWindow.select(0);
};

Scene_QuestLog.prototype.onItemOk = function() {
    this._itemWindow.setTracking();
    this._itemWindow.refresh();
    this._helpWindow.refresh();
    this._itemWindow.activate();
};

Scene_QuestLog.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    this._categoryWindow.activate();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTCATEGORY
//-----------------------------------------------------------------------------

function Window_QuestCategory() {
    this.initialize.apply(this, arguments);
}

Window_QuestCategory.prototype = Object.create(Window_HorzCommand.prototype);
Window_QuestCategory.prototype.constructor = Window_QuestCategory;

Window_QuestCategory.prototype.initialize = function() {
    Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_QuestCategory.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_QuestCategory.prototype.maxCols = function() {
    return 3;
};

Window_QuestCategory.prototype.update = function() {
    Window_HorzCommand.prototype.update.call(this);
    if (this._itemWindow) {
        this._itemWindow.setCategory(this.currentSymbol());
    }
};

Window_QuestCategory.prototype.makeCommandList = function() {
    this.addCommand(Galv.QUEST.questsCmdActive,    "active");
    this.addCommand(Galv.QUEST.questsCmdComplete,  "completed");
    this.addCommand(Galv.QUEST.questsCmdFailed,   "failed");
};

Window_QuestCategory.prototype.setItemWindow = function(itemWindow) {
    this._itemWindow = itemWindow;
    this.update();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTCATEGORY
//-----------------------------------------------------------------------------

function Window_QuestList() {
    this.initialize.apply(this, arguments);
}

Window_QuestList.prototype = Object.create(Window_Selectable.prototype);
Window_QuestList.prototype.constructor = Window_QuestList;

Window_QuestList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._category = "none";
    this._data = [];
};

Window_QuestList.prototype.setCategory = function(category) {
    if (this._category !== category) {
        this._category = category;
        this.refresh();
        this.resetScroll();
    }
};

Window_QuestList.prototype.maxCols = function() {
    return 1;
};

Window_QuestList.prototype.spacing = function() {
    return 48;
};

Window_QuestList.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
};

Window_QuestList.prototype.item = function(index) {
    var index = index == undefined ? this.index() : index;
    var obj = isNaN(this._data[index]) ? this._data[index] : $gameSystem._quests.quest[this._data[index]];

    return this._data && index >= 0 ? obj : null;
};

Window_QuestList.prototype.setTracking = function() {
    if (!this.item()) return;
    if (this.item().categoryTitle != undefined) {
        // hide/show category
        var catId = this.item().categoryTitle;
        $gameSystem._quests.categoryHide[this._category][catId] = !$gameSystem._quests.categoryHide[this._category][catId];
    } else {
        // Track quest
        if (this.item()._id == Galv.QUEST.isTracked()) {
            Galv.QUEST.track();
        } else {
            Galv.QUEST.track(this.item()._id);
        }
    }
};

Window_QuestList.prototype.makeItemList = function() {
    this._data = [];
    this.buildQuestList();
    switch (this._category) {
        case "active":
            this._data = this.buildQuestList($gameSystem._quests.active);
            break;
        case "completed":
            this._data = this.buildQuestList($gameSystem._quests.completed);
            break;
        case "failed":
            this._data = this.buildQuestList($gameSystem._quests.failed);
            break;
    }
};

Window_QuestList.prototype.buildQuestList = function(questList) {
    var list = [];
    var questList = questList || [];
    
    // setup lists for categories
    for (var i = 0; i < Galv.QUEST.categories.length; i++) {
        if ($gameSystem._quests.categoryActive[i]) list[i] = [{categoryTitle:i,count:0}];
    }

    // put quests into categories
    for (var i = 0; i < questList.length; i++) {
        var cat = $gameSystem._quests.quest[questList[i]].category();
        if (!$gameSystem._quests.categoryActive[cat]) continue;
        list[cat][0].count += 1;

        if (!$gameSystem._quests.categoryHide[this._category][cat]) { // only add it if category isn"t hidden
            list[cat].push(questList[i]);
        }
    }

    // concat lists
    var final = [];
    for (var i = 0; i < list.length; i++) {
        final = final.concat(list[i]);
    }
    final = final.filter(function(n){ return n != undefined });

    return final;
};

Window_QuestList.prototype.drawItem = function(index) {
    var item = this.item(index);
    if (item) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
            
        if (item.categoryTitle != undefined) {
            var cat = Galv.QUEST.categories[item.categoryTitle]
            var txt = cat.name;
            this.changeTextColor(cat.color);
            this.drawText(txt,rect.x + 4,rect.y,rect.width);
            this.drawText("(" + item.count + ")",rect.x,rect.y,rect.width,"right");
            this.changeTextColor(this.normalColor());
        } else {
            var icon = item._id == $gameSystem._quests.tracked ? Galv.QUEST.icon3 : Galv.QUEST["icon" + item._status];
            this.drawIcon(icon,rect.x,rect.y);
            this.drawText(item.name(),rect.x + 40,rect.y,rect.width);
        }
    }
};

Window_QuestList.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.item());
};

Window_QuestList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.contents.fontSize = Galv.QUEST.fontSize;
    this.drawAllItems();
};


//-----------------------------------------------------------------------------
//  WINDOW QUESTINFO
//-----------------------------------------------------------------------------

function Window_QuestInfo() {
    this.initialize.apply(this, arguments);
}

Window_QuestInfo.prototype = Object.create(Window_Base.prototype);
Window_QuestInfo.prototype.constructor = Window_QuestInfo;

Window_QuestInfo.prototype.initialize = function(x,y,width,height) {
Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._quest = null;
    this.refresh();
};

Window_QuestInfo.prototype.clear = function() {
    this.setItem();
};

Window_QuestInfo.prototype.setItem = function(quest) {
    if (this._quest !== quest) {
        this._quest = quest;
        this.refresh();
    }
};

Window_QuestInfo.prototype.refresh = function() {
    this.contents.clear();
    if (this._quest) {
        this.drawQuest(this._quest);
    } else if ($gameSystem._quests.tracked) {
        this.drawQuest($gameSystem._quests.quest[$gameSystem._quests.tracked]);
    } else {
        this.drawNoQuest();
    }
};

Window_QuestInfo.prototype.drawHorzLine = function(y) {
    var lineY = y + this.lineHeight() / 2 - 1;
    this.contents.paintOpacity = 48;
    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.normalColor());
    this.contents.paintOpacity = 255;
};

Window_QuestInfo.prototype.standardFontSize = function() {
    return Galv.QUEST.fontSize;
};

Window_QuestInfo.prototype.lineHeight = function() {
    return Galv.QUEST.fontSize + 6;
};

Window_QuestInfo.prototype.drawQuest = function(quest) {
    if (quest.categoryTitle != undefined) return;
    this.changeTextColor(this.normalColor());
    // quest heading
    var icon = quest._id == $gameSystem._quests.tracked ? Galv.QUEST.icon3 : Galv.QUEST["icon" + quest._status];
    this.drawIcon(icon,0,0);
    var oy = Math.max((28 - this.standardFontSize()) / 2,0);
    this.drawText(quest.name(),40,oy,this.contentsWidth() - 40);
    var lineY = Math.max(32,this.lineHeight());
    this.drawHorzLine(lineY);
    
    var line = this.lineHeight();
    var y = lineY + line;
    var w = this.contentsWidth();

    // quest difficulty
    this.drawText(Galv.QUEST.questsDiff + " " + quest.difficulty(),0,y,w,"right");
    
    // quest desc
    this.changeTextColor(this.systemColor());
    this.drawText(Galv.QUEST.questsDesc,0,y,w);
    
    this.changeTextColor(this.normalColor());
    var desc = quest.desc();
    
    if (quest.hasResolution()) {
        // if quest has a selected resolution, add it
        desc.push("");
        desc = desc.concat(quest.resolution()[quest._resolution].join("\n")); // add resolution txt
    }
    
    y += 10;
    for (var i = 0; i < desc.length; i++) {
        y += line;
        this.drawTextEx(desc[i], 0, y);
    }
    y += line * 2;
    
    // quest objectives
    var objs = quest.objectives();
    var variables = quest.variables();
    if (objs.length > 0) {
        this.changeTextColor(this.systemColor());
        this.drawText(Galv.QUEST.questsObj,0,y,w);
        this.changeTextColor(this.normalColor());
        y += line + 10;

        // list objectives
        for (var i = 0; i < objs.length; i++) {
            var status = quest._objectives[i] || 0;
            if (status >= 0) {
                var icon = Galv.QUEST["icon" + status];
                this.drawIcon(icon,0,y);
                if (Array.isArray(objs[i]))
                    this.drawTextEx(objs[i].join("\n").formatDict(variables),40,y + oy);
                else
                    this.drawTextEx(objs[i].formatDict(variables),40,y + oy);
                y += line + 8;
            }
        }
    }
};

Window_QuestInfo.prototype.drawNoQuest = function() {
    var y = this.contentsHeight() / 2 - this.standardFontSize() / 2 - this.standardPadding();
    this.drawText(Galv.QUEST.questsNoTrack,0,y,this.contentsWidth(),"center");
};


//-----------------------------------------------------------------------------
//  HUD WINDOW WITH QUICK QUEST INFO
//-----------------------------------------------------------------------------
function QuestHUDWindow() {
  this.initialize.apply(this, arguments);  
};

QuestHUDWindow.prototype = Object.create(Window_Base.prototype);
QuestHUDWindow.prototype.constructor = QuestHUDWindow;

QuestHUDWindow.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.setBackgroundType(2);
};

QuestHUDWindow.prototype.windowWidth = function() {
    return 350;
};

QuestHUDWindow.prototype.windowHeight = function() {
    var y = 0;
    if ($gameSystem._quests.tracked !== null) {
        var line = this.lineHeight()
        y = this.lineHeight();
        var quest = $gameSystem._quests.quest[$gameSystem._quests.tracked];
        var objs = quest.objectives();
        if (objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                var status = quest._objectives[i] || 0;
                if (status == 0) {
                    if (Array.isArray(objs[i])) {
                        for (var j = 0; j < objs[i].length; j++) {
                            y += line + 8; 
                        }
                    } else {
                        y += line + 8; 
                    }    
                }
            }
        }
        y += this.standardPadding() * 2;
    }
    return y; 
};

QuestHUDWindow.prototype.standardFontSize = function() {
    return 16;
};

QuestHUDWindow.prototype.lineHeight = function() {
    return 24;
};

QuestHUDWindow.prototype.refresh = function() {
      if ($gameSystem._quests.tracked === null || !ConfigManager["showTrackedQuest"]) {
        this.hide();
      } else {
        this.show();
        var quest = $gameSystem._quests.quest[$gameSystem._quests.tracked];
        this.drawTextEx('★ '+quest.name()+': lvl '+quest.difficulty(),0,0);
        
        var variables = quest.variables();
        var objs = quest.objectives();
        var line = this.lineHeight()
        var y = this.lineHeight();
        var oy = Math.max((28 - this.standardFontSize()) / 2,0);
        var w = this.contentsWidth();
        var objs = quest.objectives();
        if (objs.length > 0) {
            // list objectives
            for (var i = 0; i < objs.length; i++) {
                var status = quest._objectives[i] || 0;
                if (status >= 0) {
                    if (status == 0)
                        this.drawTextEx("->",0,y + oy);
                    if (status == 1)
                        this.drawTextEx("✓",0,y + oy);
                    if (status == 2)
                        this.drawTextEx("✗",0,y + oy);
                    if (Array.isArray(objs[i]))
                        this.drawTextEx(objs[i].join("\n").formatDict(variables),20,y + oy);
                    else
                        this.drawTextEx(objs[i].formatDict(variables),20,y + oy);
                    y += line + 8;
                }
            }
        }
      }
};

// QuestHUDWindow.prototype.standardBackOpacity = function() {
    // return 0;
// };
(function() {
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        this._QuestHUDWindow = new QuestHUDWindow(0, 0);
        this.addWindow(this._QuestHUDWindow);
    };
    
    
    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        
        this._QuestHUDWindow.refresh();
    };
    
    document.addEventListener("keydown", showQuestHUDWindow);
    
    function showQuestHUDWindow(event) {
        if (event.keyCode === 9) {
            if (ConfigManager["showTrackedQuest"])
                ConfigManager["showTrackedQuest"] = false;
            else ConfigManager["showTrackedQuest"] = true;
        }
    }
    
    var _Window_Options_prototype_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function() {
        _Window_Options_prototype_makeCommandList.call(this);
        this.addCommand("Show Tracked Quest", "showTrackedQuest");
    };
    ConfigManager["showTrackedQuest"] = true;
    
})();


//-----------------------------------------------------------------------------
//  ADD MENU COMMAND
//-----------------------------------------------------------------------------

if (Galv.QUEST.menuCmd) { // only add this if there"s menu command text
    Galv.QUEST.Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        Galv.QUEST.Window_MenuCommand_addOriginalCommands.call(this);
        this.addQuestCommand();
    };
    
    Window_MenuCommand.prototype.addQuestCommand = function() {
        var enabled = true;
        this.addCommand(Galv.QUEST.menuCmd, "quest", enabled);
    };
    
    Galv.QUEST.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        Galv.QUEST.Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("quest",      this.commandQuestLog.bind(this));
    };
    
    Scene_Menu.prototype.commandQuestLog = function() {
        Galv.QUEST.viewLog();
    };
};
