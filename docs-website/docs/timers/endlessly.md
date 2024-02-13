---
sidebar_position: 4
---

# Endlessly timer

It is a endlessly timer to delay function execution by some time in milliseconds and repeat this endlessly.

## Example

```ts
import { LiteEndlesslyTimer } from 'lite-utility/timers'

const timer = new LiteEndlesslyTimer(() => {
  console.log('Endlessly timer worked')
}, 5000,
{
  instantStart: false,
})
// After start call timer will work after 5s, 10s, 15s, 20s...
timer.start()
```

## Constructor

```ts
constructor(
  fun: () => void, // function.
  timeMs: number, // function execution delay.
  params: TimerParams, // extra params.
) {}

type TimerParams = {
  instantStart: boolean; // should first function run be instant instead of waiting timeMs delay.
  logError?: (...args: any[]) => void; // custom log error in fun.
};
```

## Methods

**start**(): ```void``` - Start timer.

:::warning

If you call start many times instead of restarting, it will lead to the loss of previous function execution control and possible logic errors.

:::

**stop**(): ```void``` - Stop timer.

**restart**(): ```void``` - Restart timer.
 