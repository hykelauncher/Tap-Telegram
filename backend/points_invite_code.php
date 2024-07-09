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

    // Função para obter parâmetros da requisição POST
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
        $response = []; // Array para armazenar a resposta

        $data = getBody();
        $userId = isset($data['userId']) ? $data['userId'] : null;
        $invite = isset($data['invite']) ? $data['invite'] : null;

        if (!$userId) {
            $response['error'] = 'Missing parameters: userId ';
            http_response_code(400);
            echo json_encode($response);
            exit;
        }

        if(!$invite){
            $response['error'] = 'Missing parameters: invite ';
            http_response_code(400);
            echo json_encode($response);
            exit;
        }

        // Verificar se o usuário já tem um referal_id definido
        $stmt = $conn->prepare('SELECT referal_id FROM users_points WHERE userId = ?');
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if (!$result) {
            $response['error'] = 'Database error';
            http_response_code(500);
            echo json_encode($response);
            exit;
        }

        $userPoint = $result->fetch_assoc();

        if ($userPoint['referal_id'] !== NULL) {
            $response['message'] = 'User is already referred';
            http_response_code(200);
            echo json_encode($response);
            exit;
        }

        // Verificar se o código de convite é válido
        $stmt = $conn->prepare('SELECT * FROM invites WHERE invite_code = ?');
        $stmt->bind_param('s', $invite);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $response['error'] = 'Invite code is invalid';
            http_response_code(400);
            echo json_encode($response);
            exit;
        }

        $inviteData = $result->fetch_assoc();

        if ($inviteData['user_invited'] === $userId) {
            $response['error'] = 'User cannot invite themselves';
            http_response_code(400);
            echo json_encode($response);
            exit;
        }

        if ($inviteData['used'] === 1) {
            $response['error'] = 'Invite code has already been used';
            http_response_code(400);
            echo json_encode($response);
            exit;
        }

        // Atualizar o referal_id para o usuário atual
        $stmt = $conn->prepare('UPDATE users_points SET referal_id = ? WHERE userId = ?');
        $stmt->bind_param('ss', $inviteData['user_invited'], $userId);
        $stmt->execute();

        // Adicionar pontos ao usuário que convidou
        $stmt = $conn->prepare('UPDATE users_points SET referal_counts = referal_counts + 1, points = points + 5000 WHERE userId = ?');
        $stmt->bind_param('s', $inviteData['user_invited']);
        $stmt->execute();

        // Marcar o convite como usado
        $stmt = $conn->prepare('UPDATE invites SET used = 1 WHERE invite_code = ?');
        $stmt->bind_param('s', $invite);
        $stmt->execute();

        $response['message'] = 'User successfully referred and points added';
        http_response_code(200);
        echo json_encode($response);
        exit;
    }
?>
