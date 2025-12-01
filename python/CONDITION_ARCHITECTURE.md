# Condition Architecture

## Class Structure (Matches PlantUML)

### LogicalExpression (Interface)
- **Purpose**: Base interface for all logical expressions
- **PlantUML**: `interface LogicalExpression { }`
- **Implementation**: Abstract base class with `evaluate()` method

### BinaryExpression (Composite)
- **Purpose**: Represents AND/OR operations on two expressions
- **PlantUML Attributes**: 
  - `operator: String <<and/or>>`
- **PlantUML Relations**:
  - `left: LogicalExpression` (1:1)
  - `right: LogicalExpression` (1:1)
- **Implementation**:
  ```python
  def __init__(self, operator, left, right):
      self.operator = operator  # "and" or "or"
      self.left = left          # LogicalExpression
      self.right = right        # LogicalExpression
  ```

### PrimaryExpression (Leaf)
- **Purpose**: Represents sensor conditions (leaf nodes)
- **PlantUML Attributes**:
  - `brick: Integer`
  - `value: Signal`
- **PlantUML Relations**:
  - `inner: LogicalExpression` (0..1 - optional for negation)
- **Implementation**:
  ```python
  def __init__(self, brick, value, inner=None):
      self.brick = brick    # Sensor brick
      self.value = value    # SIGNAL.HIGH or SIGNAL.LOW
      self.inner = inner    # Optional for NOT support
  ```

## Key Features

### 1. Proper Inheritance
- `BinaryExpression` implements `LogicalExpression`
- `PrimaryExpression` implements `LogicalExpression`
- Both can be used interchangeably in composite structures

### 2. Operator Pattern
- Single `BinaryExpression` class handles both AND and OR
- Operator is a string property: `"and"` or `"or"`
- Matches PlantUML specification: `operator: String <<and/or>>`

### 3. Composite Structure
- `BinaryExpression` holds two `LogicalExpression` children (left/right)
- `PrimaryExpression` can hold optional inner expression for negation
- Enables arbitrary nesting depth

### 4. Backward Compatibility
- Legacy classes (`AndCondition`, `OrCondition`, `SensorCondition`) maintained
- They now internally use the new `BinaryExpression` and `PrimaryExpression`
- Existing code continues to work without changes

## Usage Examples

### Direct API (New Style)
```python
from pyArduinoML.model.Condition import BinaryExpression, PrimaryExpression
from pyArduinoML.model.SIGNAL import SIGNAL

# Create primary expressions
sensor1_check = PrimaryExpression(sensor1, SIGNAL.HIGH)
sensor2_check = PrimaryExpression(sensor2, SIGNAL.HIGH)

# Create binary expression
and_expr = BinaryExpression("and", sensor1_check, sensor2_check)

# Nested example
sensor3_check = PrimaryExpression(sensor3, SIGNAL.LOW)
complex_expr = BinaryExpression("or", and_expr, sensor3_check)
```

### Legacy API (Still Works)
```python
from pyArduinoML.model.Condition import AndCondition, SensorCondition

cond1 = SensorCondition(sensor1, SIGNAL.HIGH)
cond2 = SensorCondition(sensor2, SIGNAL.HIGH)
and_cond = AndCondition(cond1, cond2)
```s

