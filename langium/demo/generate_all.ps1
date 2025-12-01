Write-Host "=========================================="
Write-Host "Starting ArduinoML Generation Process"
Write-Host "=========================================="
Write-Host ""

$SUCCESS_COUNT = 0
$FAIL_COUNT = 0
$FAILED_FILES = @()

function Generate-File {
    param($file)
    
    $name = Split-Path -Leaf $file
    
    Write-Host "Generating: $name"
    node ..\ArduinoML\bin\cli generate $file
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SUCCESS: $name" -ForegroundColor Green
        $script:SUCCESS_COUNT++
    } else {
        Write-Host "✗ FAILED: $name" -ForegroundColor Red
        $script:FAIL_COUNT++
        $script:FAILED_FILES += $name
    }
    Write-Host ""
}

Write-Host "--- Basic Scenarios ---"
Generate-File ".\basic_scenarios\VerySimpleAlarm.aml"
Generate-File ".\basic_scenarios\DualCheckAlarm.aml"
Generate-File ".\basic_scenarios\StateBasedAlarm.aml"
Generate-File ".\basic_scenarios\MultiStateAlarm.aml"

Write-Host "--- Features ---"
Generate-File ".\feature_scenarios\DualCheckAlarm_pin_allocation.aml"
Generate-File ".\feature_scenarios\HandlingAnalogicalBricks_pin_allocation.aml"
Generate-File ".\feature_scenarios\HandlingAnalogicalBricks.aml"
Generate-File ".\feature_scenarios\MultiStateAlarm_pin_allocation.aml"
Generate-File ".\feature_scenarios\PrecedenceTest.aml"
Generate-File ".\feature_scenarios\ReversedPrecedenceTest.aml"
Generate-File ".\feature_scenarios\BuzzerTest.aml"
Generate-File ".\feature_scenarios\WhenTheImposterIsSus.aml"

Write-Host "=========================================="
Write-Host "Generation Summary"
Write-Host "=========================================="
Write-Host "Total Successful: $SUCCESS_COUNT"
Write-Host "Total Failed: $FAIL_COUNT"

if ($FAIL_COUNT -gt 0) {
    Write-Host ""
    Write-Host "Failed files:"
    foreach ($file in $FAILED_FILES) {
        Write-Host "  - $file"
    }
    exit 1
} else {
    Write-Host ""
    Write-Host "All files generated successfully! ✓" -ForegroundColor Green
    exit 0
}
