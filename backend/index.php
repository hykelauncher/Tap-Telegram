<?php


// Configurações do MySQL
$host = '198.12.240.20';
$user = 'tapuser';
$password = 'suasenhadev10';
$database = 'tap-final';

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



// Rota GET /api/points
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = getParam('userId');
    if ($userId) {
        $stmt = $conn->prepare('SELECT points, multiplicadorPontos, energy, max_energy, cooldown FROM users_points WHERE userId = ?');
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmtInsert = $conn->prepare('INSERT INTO users_points (userId, points, last_updated_datetime) VALUES (?, 0, NOW())');
            $stmtInsert->bind_param('s', $userId);
            $stmtInsert->execute();
            $stmtInsert->close();
            echo json_encode(['points' => 0, 'points_factor' => 12, 'energy' => 2532,  'max_energy' => 6500, 'cooldown' => 10]);
        } else {
            $row = $result->fetch_assoc();
            echo json_encode(['points' => $row['points'], 'points_factor' => $row['multiplicadorPontos'], 'energy' => $row['energy'], 'max_energy' => $row['max_energy'], 'cooldown' => $row['cooldown']]);
        }
        
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing userId parameter']);
    }
}

// Rota POST /api/points
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $data = getBody();
    $userId = $data['userId'];
    $points = $data['points'];
    
    if ($userId && $points !== null) {
        $stmt = $conn->prepare('UPDATE users_points SET points = ? WHERE userId = ?');
        $stmt->bind_param('is',  $points, $userId);
        $stmt->execute();
        $stmt->close();
        
        echo json_encode(['userId' => $userId, 'points' => $points]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing userId or points in request body']);
    }
}

$conn->close();
