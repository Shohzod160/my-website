<?php
session_start();
header('Content-Type: application/json');

$users_file = 'users.json';
$response = ['success' => false, 'message' => 'Произошла ошибка регистрации.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = trim($input['password'] ?? '');

    if (empty($name) || empty($email) || empty($password)) {
        $response['message'] = 'Пожалуйста, заполните все поля.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (strlen($password) < 6) {
        $response['message'] = 'Пароль должен быть не менее 6 символов.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $users = [];
    if (file_exists($users_file)) {
        $users = json_decode(file_get_contents($users_file), true);
        if ($users === null) $users = []; // Если файл пуст или поврежден
    }

    // Проверка на существующего пользователя
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            $response['message'] = 'Пользователь с таким email уже существует.';
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $new_user = [
        'id' => uniqid(), // Простой уникальный ID
        'name' => htmlspecialchars($name), // Защита от XSS
        'email' => $email,
        'password' => $hashed_password
    ];

    $users[] = $new_user;

    if (file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        // Автоматический вход после регистрации
        $_SESSION['user'] = [
            'id' => $new_user['id'],
            'name' => $new_user['name'],
            'email' => $new_user['email']
        ];
        $response['success'] = true;
        $response['message'] = 'Регистрация успешна! Вы вошли в систему.';
        $response['user'] = $_SESSION['user']; // Отправляем данные пользователя на фронт
    } else {
        $response['message'] = 'Не удалось сохранить данные пользователя.';
    }
} else {
    $response['message'] = 'Неверный метод запроса.';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>