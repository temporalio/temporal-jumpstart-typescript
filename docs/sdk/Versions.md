# SDK:Versions

The TypeScript SDK has some subtle differences in what constitutes a non-deterministic change.

Review the code-change docs [here](https://docs.temporal.io/workflows#non-deterministic-change). 

### Timers

A Timer `duration` can change without triggering a Non-Determinism Exception (NDE).

