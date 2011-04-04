/**
 * The move command allows two variations. walk and run. Walk allows us to move from
 * one area to the next, run skips the area in the middle.
 */


var move = {
    directions: ' e s w n north south east west '
    , maps: {'n':'north', 'e':'east', 's':'south', 'w':'west'}
    , is_valid_direction: function(d) {
        return (directions.indexOf(' '+d+' ') > -1);
    }
    , get_real_direction: function(d) {
        if(maps[d] !== undefined) {
            return maps[d];
        }
        return d;
    }
};

cobra.register('walk',function(args){
    if(move.is_valid_direction(args[0])) {
        /**
         * Although logically this should be a post because, since we are 
         * not passing anything TO the server, lets just use a get.
         */
        game.get({url:'player/walk/'+move.get_real_direction(args[0])}, function(d){
            screen.println(d.message);
        });
    }
    else {
        screen.println('You tried to walk, but you failed');
    }
});

cobra.register('run',function(args){
    if(move.is_valid_direction(args[0])) {
        game.get({url:'player/run/'+move.get_real_direction(args[0])}, function(d){
            screen.println(d.message);
        });
    }
    else {
        screen.println('You tried to run, but you failed');
    }
});
