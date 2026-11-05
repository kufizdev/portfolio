<?php
// Profile visit counter for XAMPP. On Cloudflare, functions/api/[[path]].js serves this path from KV.
header('Content-Type: application/json');

$file = sys_get_temp_dir() . '/kufiz-visits.txt';
$count = (int) @file_get_contents($file);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $count++;
  file_put_contents($file, (string) $count, LOCK_EX);
}
echo json_encode(['count' => $count]);
