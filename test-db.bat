@echo off
curl -X POST http://localhost:3003 -H "Content-Type: application/json" -d @test-request.json > response.json
type response.json
