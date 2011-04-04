<?php
/**
 * This file exists as a mock until the server-side setup is complete. In the
 * mean time, thanks to a great php framework, mock can essentially do
 * everything that the server can, but with a higher overhead.. unnoticable for
 * debugging, but trying to use mock in production will probably kill it.
 *
 * The benefit of using Limonade is that until we completely port our system to
 * nodejs, mysql and dbslayer can STILL be accessed, and routes are simple and
 * easy to set up. Limonade essentially serves as our debugging area, while
 * features that make it are re-written for node utilizing express.
 *
 * RESTful Map
 *
 * HTTP Method |  Url Path          | Function
 * ------------+--------------------+-------------------------------------------
 *    GET      |  /resources/:file  | Serve the static resource as text
 *    POST     |  /user/login       | Log in a user
 *    GET      |  /user/:name       | Checks if that user exists
 * ------------+--------------------+-------------------------------------------
 * 
 *
 */

include('./lib/limonade.php');

function configure() {
    option('env',ENV_DEVELOPMENT);
    option('debug',true);
}

dispatch('/resources/:file',function($file) {
    return txt(file_get_contents('./resources/'.$file));
});


function user_model() {
    return array(
        'uid' => 1
    );
}

dispatch_post('/user/login', function(){
    $username = $_POST['username'];
    $password = $_POST['password'];

    $users = array(
        'xangelo' => array(
            'uid' => 1,
            'password' => 'test',
        ),
    );

    if($username != '' && $password != '') {
        if($users[$username]['password'] == $password) {
            return json($users[$username]);
        }
        else {
            return json(array());
        }
    }
    else {
        return json(array($username,$password));
    }
});

dispatch('/user/:name',function($name) {
    $tmp = array();
    if(in_array($name, array('xangelo','test'))) {
        $tmp = user_model();
    }

    return json($tmp);
});



run();