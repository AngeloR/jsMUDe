/*!
 *      ########################################
 *      #              jsMUDe - 2011           #
 *      # JavaScript Multi User Dungeon Engine #
 *      #                                      #
 *      # Developed: Angelo Rodrigues          #
 *      # Design:    Nick Wasylyk              #
 *      ########################################
 *
 * The jsMUD engine was developed by Angelo Rodrigues. It provides a standard
 * JavaScript interface for modifying the engine. The backend is run via PHP,
 * but as long as the outputs remain the same, no restriction on backend is
 * present.
 *
 * By providing a client-side version of the engine we offload a lot of the
 * resources of the server which in turn allow us to utilize multi-connection
 * open-source servers like Node.js or DBSlayer very easily.
 *
 * ------------
 *
 * some information about the game
 */

/**
 * This file contains all the controller logic for the gameboard. Subsequent 
 * actions register their commands with cobra (the command manager) which
 * verifies that they are valid before executing callbacks.
 *
 * The following names are reserved within the application
 */
var stdin = document.getElementById('stdin'),   
    viewport = document.getElementById('viewport')
    , baseurl = 'mock.php/'     // base url
    , log = {
        size: 150               // maximum size for each log
        , position: 0           // position of the commands pointer
        , commands: []          // logs all previous commands in order that they
                                //  were called
    }
    , game                      // object handler, event manager
    , screen                    // some standard screen features
    , player                    // provides various player utilities
    , cobra;                    // the command manager

// console fix for non-supporting browsers
if(!window.console){ console = {log: function(){}};}

/**
 * Screen provides all others with the ability to interact with the viewport
 * object. You can easily perform various options by using screen
 */
screen = function() {

    return {
        /**
         *Prints a single line to the screen.
         */
        print: function(s) {
            viewport.innerHTML += s;
        }
        /**
         *Print a new line to the screen
         */
        , println: function(s) {
            viewport.innerHTML += "\r\n"+s;
            viewport.scrollTop = viewport.scrollHeight;
        }
        /**
         *Print a block to the screen
         */
        , printblk: function(s) {
            viewport.innerHTML += "\r\n\r\n"+s+"\r\n\r\n";
            viewport.scrollTop = viewport.scrollHeight;
        }
        /**
         *Clear the screen
         */
        , clear: function() {
            viewport.innerHTML = '';
        }
    };
}();

/**
 * Game provides us some basic utilizies that are accessed in order to ensure
 * that things run smoothly
 */
game = function(){

    var objects = {}
        , events = {}
        , event_map = {};

    return {
        /**
         * Subroutine for loading files
         */
        require: function(what) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.setAttribute('src','js/'+what+'.js');
            document.getElementsByTagName('body')[0].appendChild(script);
        }
        /**
         *Provides a wrapper for ajax get calls
         */
        , get: function(opt, callback) {
            if(opt.url === undefined) {
                console.log('Failed to "get"',opt);
            }
            opt.data = opt.data || {};
            opt.dataType = opt.dataType || 'json';
            $.ajax({
                url: baseurl+opt.url,
                data: opt.data,
                dataType: opt.dataType,
                type: 'get',
                success: function(d){
                    callback(d);
                },
                error: function(e) {
                    screen.println('Ajax load error error on '+opt.url);
                    console.log(e.responseText);
                }
            });
        }
        /**
         *Provides a wrapper for ajax post calls
         */
        , post: function(opt, callback) {
            if(opt.url === undefined) {
                console.log('Undefined url: ',opt);
            }
            if(opt.data === undefined) {
                console.log('Can\'t post nothing',opt);
            }
            opt.dataType = opt.dataType || 'json';

            $.ajax({
                url: baseurl+opt.url,
                data: opt.data,
                type: 'post',
                dataType: opt.dataType,
                success: function(d) {
                    callback(d);
                },
                error: function(e) {
                    screen.println('Ajax load error error on '+opt.url);
                }
            });
        }
        /**
         *Initiates a connection to the game
         */
        , init: function() {
            game.get({url: 'resources/welcome.txt',dataType:'text'},screen.println);
        }

        /**
         *Registers an object with the game for later use. Can overwrite the
         *object if it already exists in the store.
         */
        , register: function(name,object,force) {
            if(objects[name] === undefined || force) {
                objects[name] = object;
            }
            else {

            }
        }

        /**
         *Allows to request the current copy of an object for use elsewhere
         */
        , request: function(name) {
            return objects[name];
        }

        /**
         *Sets up a custom event and event handler. When the event is triggered
         *via game.notify('event'); all callbacks that are currently watching
         *that event will be triggered.
         */
        , watch: function(event,callback) {
            if(!events[event]) {
                events[event] = true;
                event_map[event] = [];
            }
            event_map[event].push(callback);
        }

        /**
         *Allows us to trigger an event
         */
        , notify: function(event) {
            if(event_map[event] !== undefined) {
                for(var i = 0, l = event_map[event].length; i < l; i++) {
                    event_map[event][i]();
                }
            }
        }
    }
}();

/**
 * Cobra is our Command manager. Any command that the user is allowed to execute
 * is registered with cobra which in turn allows us to assign unique callbacks.
 *
 * -3/24/2011   Updated to provide multiple capture points. Useless... except
 *              for proper code segmentation.
 *              Migrated capture to cobra.
 *
 * -3/28/2011   Provided "exec" command for getting the attributes of any
 *              command using it's id.
 */
cobra = function(){
    var commands = []
        , captures = [];

    return {
        /**
         *Check to see if the command being exectued is valid. Returns the id
         *of the command for future use
         */
        command_exists: function(command) {
            for(var i = 0, l = commands.length; i < l; i++) {
                if(commands[i].command === command) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * Calls cobra.commander which executes the command with the appropriate
         * arguments supplied. This is the method that should be used to execute
         * commands as it takes in to account the "capture" state.
         */
        , exec: function(command,args) {
            // check to see if capture is turned on
            if(cobra.capture.enabled()) {
                cobra.capture.execute(command,args);
            }
            else {
                if(log.commands.length > log.size) {
                    log.commands.pop();
                }
                if(log.commands[log.commands.length-1] !== command) {
                    log.commands.push(command);
                    log.position = log.commands.length;
                }

                cobra.commander(command,args);
            }
        }
        /**
         * Executes the appropriate command callbacks, bypassing capture mode
         */
        , commander: function(command,args) {
            var command_id = this.command_exists(command);
            if(command_id > -1) {
                commands[command_id].callback(args);
            }
            else {
                screen.println('Command doesn\'t exist');
            }
        }
        /**
         * Registers a new command and callback.
         * The force flag allows us to redefine new callbacks for existing
         * commands
         */
        , register: function(command,callback,force) {
            // disables space delimited commands
            command = command.split(' ').join('-');
            var command_id = this.command_exists(command);
            if(command_id < 0) {
                command_id = commands.length;
                commands[command_id] = {command: command, callback: callback};
            }
            else {
                if(force) {
                    commands[command_id] = {command: command, callback: callback};
                }
                else {
                    console.log(command+' already exists in cobra, if overwriting please force register.');
                }
            }

            
        }
        /**
         * This mechanism allows us to bypass cobra. By calling
         * cobra.capture.start, every time you enter some text, the game ignores
         * standard process and instead fires your callback. This is useful
         * for creating temporary commands
         */
        , capture: {
            /**
             *Starts the capture process and defines a callback that should be
             *executed
             *
             *@params function the callback that should be run when input is
             *          captured
             */
            start: function(callback) {
                captures.push(callback);
            }
            /**
             *Executes the callback
             *
             *@params mixed the arguments that were captured
             */
            , execute: function(args) {
                captures[captures.length-1](args);
            }
            /**
             *Stops the current capture callback. If there is another callback
             *in the list, it proceeds to that
             */
            , stop: function() {
                captures.pop();
            }
            /**
             *Provides a way to clear the entire capture callback chain
             */
            , clear: function() {
                captures = [];
            }
            /**
             *Checks to see if there are any callbacks enabled.
             *
             *@returns bool check to see if command capturing is enabled
             */
            , enabled: function() {
                return (captures.length > 0);
            }
        }
    };
}();

/**
 * Setup so that the gameboard sizes right. Ideally this would happen before
 * we loaded in our massive commands.min.js module.
 */
$(viewport).css('height',$(window).height());
$(window).resize(function(e){
    $(viewport).css('height',$(window).height());
});
stdin.focus();
game.init();


/**
 * This is our primary controller. Whenever you press enter in the text box,
 * this captures it and passes it to Cobra.
 */
$(stdin).keyup(function(e){
    var command, args;

    // pressed enter
    if(e.which === 13) {
        args = this.value.split(' ');
        command = args.shift();
        cobra.exec(command,args);
        this.value = '';
    }
});



/**
 * This section loads all the necessary files, for development. When complete,
 * all the javascript files should be amalgamated and compressed
 */
game.require('commands/help');
game.require('commands/move');
game.require('commands/uac');
game.require('commands/debug');