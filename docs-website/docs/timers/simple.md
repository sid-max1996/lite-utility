---
sidebar_position: 1
---

# Simple timer

It is a simple timer to delay function execution by some time in milliseconds.

## Example

```ts
import { LiteTimer } from 'lite-utility/timers'

const timer = new LiteTimer(() => {
  console.log('Simple timer worked')
}, 5000)
// After start call timer will work after 5s.
timer.start()
```

## Constructor

```ts
constructor(
  fun: () => void, // function.
  timeMs: number, // function execution delay.
  params?: TimerParams, // extra params.
) {}

type TimerParams = {
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
 