<?php
session_start();
header('Content-Type: application/json');

session_unset(); // Удаляет все переменные сессии
session_destroy(); // Уничтожает сессию

echo json_encode(['success' => true, 'message' => 'Вы вышли из системы.']);
?>