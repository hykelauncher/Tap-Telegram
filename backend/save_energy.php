<?php


// Configurações do MySQL
$host = '198.12.240.20';
$user = 'tap';
$password = 'ocarinhadapolo';
$database = 'taptelegram';

// Conexão com o MySQL
$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Habilitar CORS (para permitir requisições de origens diferentes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Função para obter parâmetros da requisição GET
function getParam($param) {
    return isset($_GET[$param]) ? $_GET[$param] : null;
}

// Função para obter dados do corpo da requisição POST
function getBody() {
    return json_decode(file_get_contents('php://input'), true);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    http_response_code(200);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $data = getBody();
    $userId = $data['userId'];
    $energy = $data['energy'];
    
    if ($userId && $energy !== null) {
        $stmt = $conn->prepare('UPDATE users_points SET energy = ? WHERE userId = ?');
        $stmt->bind_param('is', $energy,  $userId);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['userId' => $userId, 'energy' => $energy]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing userId or energy in request body']);
    }
}

$conn->close();