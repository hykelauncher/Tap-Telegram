<?php
// Habilitar CORS (para permitir requisições de origens diferentes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Função para escrever no arquivo de log
function writeToLog($message) {
    global $fp;
    $logMessage = "[" . date('Y-m-d H:i:s') . "] " . $message . "\n";
    fwrite($fp, $logMessage);
}

// Função para formatar o tempo decorrido de forma legível
function formatElapsedTime($secondsPassed) {
    $formats = array(
        array(86400, 'dia', 'dias'),
        array(3600, 'hora', 'horas'),
        array(60, 'minuto', 'minutos'),
        array(1, 'segundo', 'segundos')
    );

    $result = array();
    foreach ($formats as $format) {
        $unit = $format[0];
        $singular = $format[1];
        $plural = $format[2];

        if ($secondsPassed >= $unit) {
            $numUnits = floor($secondsPassed / $unit);
            $secondsPassed %= $unit;
            $result[] = $numUnits . ' ' . ($numUnits == 1 ? $singular : $plural);
        }
    }

    return implode(', ', $result);
}

// Verificar se o userId foi fornecido via GET
if (!isset($_GET['userId'])) {
    die(json_encode(array('error' => 'Parâmetro userId não encontrado')));
}



$userId = $_GET['userId'];


$host = '198.12.240.20';
$user = 'tap';
$password = 'ocarinhadapolo';
$database = 'taptelegram';

// Conexão com o MySQL
$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die(json_encode(array('error' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error)));
}

// Prepare a consulta SQL usando um prepared statement
$queryPoints = "SELECT points, last_updated_datetime 
                FROM users_points 
                WHERE userId = ?";
$stmt = $conn->prepare($queryPoints);
$stmt->bind_param("s", $userId); 
$stmt->execute();
$resultPoints = $stmt->get_result();

if ($resultPoints->num_rows > 0) {
    $row = $resultPoints->fetch_assoc();
    $points = $row['points'];
    $lastUpdated = new DateTime($row['last_updated_datetime']);

    // Calcular tempo decorrido em segundos
    $now = new DateTime();
    $interval = $now->diff($lastUpdated);
    $secondsPassed = $interval->s + $interval->i * 60 + $interval->h * 3600 + $interval->days * 86400;

    // Obter ganho por segundo do usuário
    $queryBonus = "SELECT b.gainpersecond
                   FROM user_bonus ub
                   INNER JOIN bonuses b ON ub.bonusId = b.id
                   WHERE ub.userId = ?";
    $stmtBonus = $conn->prepare($queryBonus);
    $stmtBonus->bind_param("s", $userId); // "s" indica um parâmetro de string
    $stmtBonus->execute();
    $resultBonus = $stmtBonus->get_result();

    if ($resultBonus->num_rows > 0) {
        $bonusRow = $resultBonus->fetch_assoc();
        $gainPerSecond = $bonusRow['gainpersecond'];

        // Calcular pontos a adicionar
        $pointsToAdd = $secondsPassed * $gainPerSecond;
        $newPoints = $points + $pointsToAdd;

        // Atualizar pontos e última atualização na tabela users_points
        $updateQuery = "UPDATE users_points 
                        SET points = ?, last_updated_datetime = NOW() 
                        WHERE userId = ?";
        $stmtUpdate = $conn->prepare($updateQuery);
        $stmtUpdate->bind_param("is", $newPoints, $userId); // "is" indica um inteiro e uma string
        if ($stmtUpdate->execute() !== TRUE) {
            writeToLog("Erro ao atualizar pontos para o usuário $userId: " . $conn->error);
        }

        // Formatar mensagem de retorno
        $elapsedTimeMessage = formatElapsedTime($secondsPassed);
        $response = array(
            'userId' => $userId,
            'pointsGained' => round($pointsToAdd, 2),
            'elapsedTime' => $elapsedTimeMessage
        );
        echo json_encode($response);
    } else {
        echo json_encode(array('error' => "Nenhum bônus ativo encontrado para o usuário $userId"));
    }
} else {
    echo json_encode(array('error' => "Usuário com ID $userId não encontrado"));
}

// Fechar conexões e statements
$stmt->close();
$stmtBonus->close();
$stmtUpdate->close();
$conn->close();
?>
