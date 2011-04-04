/**
 * This file provides some basic debugging commands so that you can test out
 * file formatting for when you're building various .txt files
 */
game.register('debug', function() {

}());

cobra.register('debug',function(args){
    switch(args[0]) {
        case '-show':
            args.shift();
            game.get({url: args[0], dataType: 'text'}, screen.println);
            break;
    }
});
