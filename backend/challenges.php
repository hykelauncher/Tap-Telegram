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

    $stmt = $conn->prepare('SELECT c.id, c.task, c.link_external, c.points_received, uc.completed_in, uc.colected
        FROM challenges c
        LEFT JOIN user_challenges uc ON c.id = uc.id_challenge AND uc.user_complete = ?');
    $stmt->bind_param('s', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $challenges = array();

    while ($row = $result->fetch_assoc()) {
            $challenges[] = $row;
    }

    echo json_encode(['challenges' => $challenges]);

}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getBody();
    $userId = $data['userId'];
    $challengeId = $data['challenge_id'];
    $points_add = $data['points_add'];
    $action = $data['action'];


    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: userId']);
        exit;
    }

    if (!$challengeId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: challengeId']);
        exit;
    }

    

    if (!$action) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: action']);
        exit;
    }

    if($action === "colect"){

        if (!$points_add) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing parameter: points_add']);
            exit;
        }

        
        $stmt = $conn->prepare('UPDATE user_challenges SET colected = 1 WHERE id = ? ');
        $stmt->bind_param('i', $challengeId);

        if ($stmt->execute()) {
            $stmt->close();

            $stmt = $conn->prepare('UPDATE users_points SET points = points + ?  WHERE userId = ? ');
            $stmt->bind_param('is', $points_add,  $userId);

            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
        } else {
            $stmt->close();
            echo json_encode(['success' => false]);
        }
    }else if($action === "complete"){
        $stmt = $conn->prepare('INSERT INTO user_challenges (user_complete, id_challenge, completed_in) VALUES (?,?,NOW())');
        $stmt->bind_param('si', $userId, $challengeId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
    }
}

$conn->close();