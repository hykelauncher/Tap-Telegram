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


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = getParam('userId');
    if ($userId) {
        $stmt = $conn->prepare('SELECT booster_1, booster_2, booster_3, points FROM users_points WHERE userId = ?');
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $row = $result->fetch_assoc();
        echo json_encode(['booster_1' => $row['booster_1'], 'booster_2' => $row['booster_2'], 'booster_3' => $row['booster_3'], 'points' => $row['points']]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getBody();
    $userId = $data['userId'];
    $booster = $data['booster'];
    $level = $data['level'];
    $cost = $data['cost'];
    $factor = $data['factor'];


    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: userId']);
        exit;
    }

    if (!$level) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: level']);
        exit;
    }


    if (!$booster) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: booster']);
        exit;
    }

    if (!$factor) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: booster']);
        exit;
    }

    if ($booster !== "booster_1" && $booster !== "booster_2" && $booster !== "booster_3") {
        http_response_code(400);
        echo json_encode(['error' => 'Parameter invalid: booster not within range of three boosters']);
        exit;
    }
    

    if (!$cost) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: cost']);
        exit;
    }


    if($booster === "booster_1"){
        $stmt = $conn->prepare('UPDATE users_points SET booster_1 = ?, points = points - ?, multiplicadorPontos = multiplicadorPontos + ? WHERE userId = ? ');
        $stmt->bind_param('iiis', $level, $cost, $factor, $userId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
    }else  if($booster === "booster_2"){
        $stmt = $conn->prepare('UPDATE users_points SET booster_2 = ?, points = points - ?, max_energy = max_energy + ? WHERE userId = ? ');
        $stmt->bind_param('iiis', $level, $cost, $factor, $userId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
    }else  if($booster === "booster_3"){
        $stmt = $conn->prepare('UPDATE users_points SET booster_3 = ?, points = points - ?, cooldown = ?  WHERE userId = ? ');
        $stmt->bind_param('iiis', $level, $cost, $factor, $userId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
    }
}

