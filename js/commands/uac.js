/**
 * This file provides the basic user access and profile manipulation commands
 * present in the MUD.
 */

game.register('uac',function(){
    var profile = {};

    return {
        login: function() {
            if(profile.username !== undefined && profile.password !== undefined) {
                profile.password = profile.password;//SHA1(profile.password);
                game.post({
                    url: 'user/login',
                    data: profile
                }, function(d){
                    if(d.uid !== undefined) {
                        screen.clear();
                        screen.println('You have logged in.');
                    }
                    else {
                        screen.println('Could not log you in, please try again.');
                    }
                });
            }
        },
        set: function(key,val) {
            profile[key] = val;
        },
        create: function(username) {
            profile.username = username;
            screen.println('Enter the password for this account by typing <b class="blue">password</b> followed by the password.');
        }
    };
}());

/**
 * Allows us to login with our account
 *
 * [login [username]]
 * Enter password
 * [password]
 * - get user info associated to account
 */
cobra.register('login',function(username){
    var uac = game.request('uac');
    uac.set('username',username);
    screen.println('Logging in user: <b>'+username+'</b>');
    screen.println('Please enter the password for this account.');
    // lets convert the box to a password box
    stdin.setAttribute('type','password');
    cobra.capture.start(function(password){
        var uac = game.request('uac');
        if(password !== undefined) {
            screen.println('Logging in....');
            uac.set('password',password);
            uac.login();

            // we now have our password, stop the capture process
            cobra.capture.stop();
            stdin.setAttribute('type','text');
        }
        else {
            screen.println('Please enter the password for this account.');
        }
    });
});

/**
 * This allows us to create a new character on the server. The process goes like
 * this.
 *
 * create new
 * Enter username
 * [username]
 * - check to see if username exists, if it does go back
 * Choose Race [table preview] help race racename for detailed information.
 * [enter race id or name]
 * Distribute stats
 * Enter Password to save
 * [password]
 * Please verify your password by entering it one more time.
 * [password]
 *
 * - System saves new profile
 */
cobra.register('create-new',function(args){
    console.log(args);

    if(args.length === 0) {
        screen.println('Enter a name for your character: ');
        cobra.capture.start(function(args) {
            if(args !== undefined) {
                game.get({url: 'user/'+args}, function(d){
                    var uac = game.request('uac');
                    if(d.uid === undefined) {
                        uac.set('username',args);

                        screen.print(' '+args);
                        screen.println('Please select a race:');
                        game.get({url: 'resources/racelist.txt'},screen.println);

                        cobra.capture.start(function(args){
                            screen.println('Enter the race id or name:');
                            cobra.capture.clear();
                        });
                    }
                    else {
                        screen.println('That name was already selected, please enter another name: ');
                    }
                });
            }
            else {
                screen.println('Please enter a name for your character: ');
            }
        });
    }
    else {
        /**
         * As admins, running create new -uprs [username] [password] [race_id] s
         * creates a new user and assigns them standard race stats as defined on
         * the server. 
         */
        switch(args[0]) {
            case '-uprs':
                
                break;
        }
    }
});