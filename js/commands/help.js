/**
 * Adds the help command to the game
 */

game.register('help', function() {
    return {
        load: function(file,callback) {
            game.get({
                url: 'resources/help/'+file+'.txt',
                dataType: 'text'
            }, callback);
        }
    };
})


cobra.register('help', function(args){
    var help = game.request('help');
    if(args.length === 0) {
        help.load('general',screen.println);
    }
    else {
        help.load('commands/'+args[0],screen.println);
    }
});

cobra.register('/?', function(args){
    var help = game.request('help');
    help.load('general',screen.println);
});