<?php
session_start();
header('Content-Type: application/json');

$users_file = 'users.json';
$response = ['success' => false, 'message' => 'Произошла ошибка входа.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        $response['message'] = 'Пожалуйста, заполните email и пароль.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!file_exists($users_file)) {
        $response['message'] = 'База пользователей не найдена. Зарегистрируйтесь.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $users = json_decode(file_get_contents($users_file), true);
    if ($users === null) $users = [];

    $found_user = null;
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            $found_user = $user;
            break;
        }
    }

    if ($found_user && password_verify($password, $found_user['password'])) {
        $_SESSION['user'] = [
            'id' => $found_user['id'],
            'name' => $found_user['name'],
            'email' => $found_user['email']
        ];
        $response['success'] = true;
        $response['message'] = 'Вход успешен!';
        $response['user'] = $_SESSION['user']; // Отправляем данные пользователя на фронт
    } else {
        $response['message'] = 'Неверный email или пароль.';
    }
} else {
    $response['message'] = 'Неверный метод запроса.';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>