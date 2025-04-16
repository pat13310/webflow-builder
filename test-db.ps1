$headers = @{
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest -Uri "http://localhost:3003" -Method Post -Headers $headers -Body (Get-Content -Raw test-request.json)
$content = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
Write-Host $content
