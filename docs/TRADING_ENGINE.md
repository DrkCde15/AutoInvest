# Trading engine

This MVP provides a paper-trading execution model.

## Operational principles

- Orders are accepted only in a simulation mode.
- Strategy execution is deterministic and local.
- Risk checks are placeholder logic prepared for future expansion.

## Current capabilities

- Simulated buy/sell order entry.
- Strategy naming and order metadata.
- Execution log flags indicating the operation is simulated.

## Out of scope

- real brokerage integration
- live market order routing
- cash movement from bank accounts
