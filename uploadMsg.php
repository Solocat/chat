<?php
header("Content-Type: application/json; charset=UTF-8");

$post = json_decode($_POST["post"]);
$url = $_POST["url"];

$content = file_get_contents($url);
$decoded = json_decode($content);
array_push($decoded, $post);
file_put_contents($url, json_encode($decoded));

?>
