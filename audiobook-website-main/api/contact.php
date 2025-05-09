<?php
// === НАСТРОЙКИ ОБРАБОТКИ ОШИБОК PHP ===
// Важно: запрещаем вывод ошибок в браузер, чтобы не ломать JSON.
// Ошибки будут писаться в лог сервера (если он настроен).
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// error_reporting(E_ALL); // Включаем логирование всех ошибок (можно оставить)
// Если знаешь путь к лог-файлу и есть права на запись, можно указать его:
// ini_set('error_log', dirname(__FILE__) . '/php_error.log');


header('Content-Type: application/json');

// Адрес, на который будут отправляться письма
$your_email_address = "shoxzadatajanov@gmail.com"; // <<<=== ЗАМЕНИ ЭТО НА СВОЙ РЕАЛЬНЫЙ EMAIL АДРЕС

$messages_file = 'messages.txt';
$response = ['success' => false, 'message' => 'Произошла неизвестная ошибка при отправке сообщения.']; // Более общее сообщение по умолчанию

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Проверка, если json_decode не удался
        if (json_last_error() !== JSON_ERROR_NONE && empty($input)) {
             $response['message'] = 'Ошибка: Неверный формат входящих данных (не JSON).';
             echo json_encode($response, JSON_UNESCAPED_UNICODE);
             exit;
        }

        $name = trim($input['name'] ?? '');
        $email_from = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        $message_text = trim($input['message'] ?? '');

        if (empty($name) || empty($email_from) || empty($message_text)) {
            $response['message'] = 'Пожалуйста, заполните все поля формы.';
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            exit;
        }

        // --- Сохранение в файл (оставляем для истории) ---
        $entry = "Дата: " . date("Y-m-d H:i:s") . "\n";
        $entry .= "Имя: " . htmlspecialchars($name) . "\n";
        $entry .= "Email: " . htmlspecialchars($email_from) . "\n";
        $entry .= "Сообщение: " . htmlspecialchars($message_text) . "\n";
        $entry .= "----------------------------------------\n\n";

        if (!file_put_contents($messages_file, $entry, FILE_APPEND | LOCK_EX)) {
            error_log("Failed to write to messages.txt for message from " . $email_from);
        }

        // --- Отправка Email ---
        $subject = "Новое сообщение с сайта NightReader от " . htmlspecialchars($name);
        $email_body = "Вы получили новое сообщение через контактную форму сайта NightReader.\n\n";
        $email_body .= "Имя: " . htmlspecialchars($name) . "\n";
        $email_body .= "Email отправителя: " . htmlspecialchars($email_from) . "\n";
        $email_body .= "Сообщение:\n" . htmlspecialchars($message_text) . "\n";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/plain;charset=UTF-8" . "\r\n";
        $from_email_header = "noreply@" . ($_SERVER['SERVER_NAME'] ?? 'yourdomain.com'); // Попытка использовать домен сервера
        // Проверка, чтобы $from_email_header был валидным email
        if (!filter_var($from_email_header, FILTER_VALIDATE_EMAIL)) {
            $from_email_header = "noreply@example.com"; // Запасной вариант, если SERVER_NAME невалиден
        }
        $headers .= "From: NightReader Contact Form <" . $from_email_header . ">" . "\r\n";
        $headers .= "Reply-To: " . htmlspecialchars($email_from) . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        if (mail($your_email_address, $subject, $email_body, $headers)) {
            $response['success'] = true;
            $response['message'] = 'Сообщение успешно отправлено!';
        } else {
            $response['message'] = 'Не удалось отправить email. Возможно, проблема с настройками почтового сервера. Пожалуйста, попробуйте позже.';
            // Более подробное логирование ошибки mail()
            $last_error = error_get_last();
            $mail_error_details = $last_error ? "; PHP Last Error: " . $last_error['message'] : "";
            error_log("Mail sending failed. To: $your_email_address, From: $email_from, Subject: $subject" . $mail_error_details);
        }

    } else {
        $response['message'] = 'Неверный метод запроса.';
    }

} catch (Throwable $e) { // Throwable ловит и Errors и Exceptions (для PHP 7+)
    // Логируем любую неожиданную ошибку
    error_log("Critical error in contact.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    $response['message'] = 'Произошла критическая серверная ошибка. Попробуйте позже.';
    // Не выводим $e->getMessage() пользователю напрямую из соображений безопасности, если там может быть чувствительная информация
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>