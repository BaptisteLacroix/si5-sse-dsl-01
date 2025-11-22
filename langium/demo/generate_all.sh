#!/bin/bash

echo "=========================================="
echo "Starting ArduinoML Generation Process"
echo "=========================================="
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_FILES=()

# Function to generate and track results
generate_file() {
    local file=$1
    local name=$(basename "$file")
    
    echo "Generating: $name"
    if node ../ArduinoML/bin/cli generate "$file"; then
        echo "✓ SUCCESS: $name"
        ((SUCCESS_COUNT++))
    else
        echo "✗ FAILED: $name"
        ((FAIL_COUNT++))
        FAILED_FILES+=("$name")
    fi
    echo ""
}

echo "--- Basic Scenarios ---"
generate_file "./basic_scenarios/VerySimpleAlarm.aml"
generate_file "./basic_scenarios/DualCheckAlarm.aml"
generate_file "./basic_scenarios/StateBasedAlarm.aml"
generate_file "./basic_scenarios/MultiStateAlarm.aml"

echo "--- Features ---"
generate_file "./features_scenarios/LCDDisplay.aml"

echo "=========================================="
echo "Generation Summary"
echo "=========================================="
echo "Total Successful: $SUCCESS_COUNT"
echo "Total Failed: $FAIL_COUNT"

if [ $FAIL_COUNT -gt 0 ]; then
    echo ""
    echo "Failed files:"
    for file in "${FAILED_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
else
    echo ""
    echo "All files generated successfully! ✓"
    exit 0
fi