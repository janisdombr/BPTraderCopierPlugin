<?PHP 
ini_set('display_errors',1);
error_reporting(E_ALL);
try {
	//require_once 'HTTP/Request2.php';
    if (isset($_POST)) {
		try {
			//print_r($_POST);
			$method = $_POST['method'];
			$url = $_POST['url'];
			$body = $_POST['body'];
			$expires = $_POST['expires'];
			$keys = $_POST['keys'];
			$signatures = $_POST['signatures'];
			$multi = curl_multi_init();
			$channels = array();
			for ($i = 0; $i < count($keys); $i++)
			{
				$headers = array( 
					"Content-type: application/json", 
					"Accept: application/json", 
					"X-Requested-With: XMLHttpRequest", 
					"api-expires: ".$expires, 
					"api-key: ".$keys[$i], 
					"api-signature: ".$signatures[$i]
				); 
				$ch = curl_init($url);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $body[$i]);
				curl_setopt($ch, CURLOPT_HTTPHEADER, $headers); 
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
				curl_multi_add_handle($multi, $ch);
				$channels[$i] = $ch;
			}
			$running = null;
			do {
				curl_multi_exec($multi, $running);
				curl_multi_select($multi);
			} while ($running > 0);
			$str = "{\"status\": \"OK\", \"responses\": [";
			$str .= "{\"key\": \"".$keys[0]."\", \"response\": ".curl_multi_getcontent($channels[0])."}";
			curl_multi_remove_handle($multi, $channels[0]);
			for ($i = 1; $i < count($channels); $i++)
			{			
				$str .= ",{\"key\": \"".$keys[$i]."\", \"response\": ".curl_multi_getcontent($channels[$i])."}";
				curl_multi_remove_handle($multi, $channels[$i]);
			} 
			$str .= "]}";
			curl_multi_close($multi);
			echo $str;
			
        } catch (Exception $ex) {
            echo $ex;
        }
    } else {
        echo 'XUY';
    }
} catch (Exception $ex) {
    echo $ex;
}

?>