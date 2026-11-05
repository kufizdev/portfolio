<?php
// Ask KUFIZ AI: answers visitor questions using only the site's own content (js/data.js).
header('Content-Type: application/json');

function reply($status, $data) {
  http_response_code($status);
  echo json_encode($data);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, ['error' => 'POST only.']);

$input = json_decode(file_get_contents('php://input'), true);
$question = trim($input['question'] ?? '');
if ($question === '' || mb_strlen($question) > 500) reply(400, ['error' => 'Ask a question under 500 characters.']);

// Per-IP limit: 20 questions an hour, tracked in the server's temp folder.
// ponytail: behind a proxy/CDN REMOTE_ADDR is the proxy; read its client-IP header there.
$ipFile = sys_get_temp_dir() . '/kufiz-ask-' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.json';
$hourAgo = time() - 3600;
$hits = json_decode(@file_get_contents($ipFile) ?: '[]', true) ?: [];
$hits = array_values(array_filter($hits, fn($t) => $t > $hourAgo));
if (count($hits) >= 20) reply(429, ['error' => 'Too many questions this hour. Try again later or send an email.']);
$hits[] = time();
file_put_contents($ipFile, json_encode($hits), LOCK_EX);

// Key: GROQ_API_KEY env var, else a PHP file outside the web root
// (XAMPP: C:/xampp/secrets/kufiz-groq.php; cPanel: /home/<user>/secrets/kufiz-groq.php).
$key = getenv('GROQ_API_KEY');
if (!$key) {
  $keyFile = dirname(__DIR__, 3) . '/secrets/kufiz-groq.php';
  $key = is_file($keyFile) ? require $keyFile : '';
}
if (!$key) reply(500, ['error' => 'The AI is not configured yet.']);
$siteData = file_get_contents(__DIR__ . '/../js/data.js');

$system = "You are KUFIZ AI, the assistant on Tengku Mohamad Syafiz's portfolio (handle: kufiz). "
  . "Answer visitors' questions about him, his work, projects and skills using ONLY the data below. "
  . "Keep answers short: at most 3 sentences, plain text, no markdown. "
  . "If the data does not cover it, say you don't know and suggest emailing tengkusyafiz98@gmail.com. "
  . "Never invent facts, salaries, addresses or phone numbers. Politely decline unrelated tasks.\n\n"
  . "PORTFOLIO DATA:\n" . $siteData;

$body = json_encode([
  'model' => 'openai/gpt-oss-120b',
  'temperature' => 0.3,
  'max_completion_tokens' => 400,
  'reasoning_effort' => 'low',
  'messages' => [
    ['role' => 'system', 'content' => $system],
    ['role' => 'user', 'content' => $question],
  ],
]);

$context = stream_context_create(['http' => [
  'method' => 'POST',
  'header' => "Content-Type: application/json\r\nAuthorization: Bearer $key\r\n",
  'content' => $body,
  'timeout' => 30,
  'ignore_errors' => true,
]]);

$raw = @file_get_contents('https://api.groq.com/openai/v1/chat/completions', false, $context);
$result = $raw ? json_decode($raw, true) : null;
$answer = trim($result['choices'][0]['message']['content'] ?? '');

if ($answer === '') reply(502, ['error' => 'The AI is unavailable right now. Please try again.']);
reply(200, ['answer' => $answer]);
