<?php

$hostname = "localhost";
$bancodedados = "";  // Adicione o nome do banco de dados aqui
$usuario = "root";
$senha = "projetoSimter";  // Adicionando ponto e vírgula no final

$mysqli = new mysqli($hostname, $usuario, $senha, $bancodedados);

if ($mysqli->connect_errno) {
    die("Falha ao conectar: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
} else {
    echo "Conectado ao banco de dados";
}


