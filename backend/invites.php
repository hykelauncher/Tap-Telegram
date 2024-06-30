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
    $invite_code = $data['invite_code'];
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: userId']);
        exit;
    }
    
    if (!$invite_code) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameter: invite_code']);
        exit;
    }
    
    $stmt = $conn->prepare('INSERT INTO invites (user_invited, invite_code) VALUES (?, ?)');
    $stmt->bind_param('ss', $userId, $invite_code);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
    
    $stmt->close();
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = getParam('userId');
    if ($userId) {

        $stmt = $conn->prepare('SELECT used, invite_code FROM invites WHERE user_invited = ?');
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $invites = array();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $status = ($row['used'] === 0) ? 'Disponivel' : 'Usado';
                $inviteData = array(
                    'invite_code' => $row['invite_code'],
                    'status' => $status
                );
                $invites[] = $inviteData;
            }
        }else{
            $invites = [];
        }

        echo json_encode(['invites' => $invites]);
    }
}

$conn->close();
