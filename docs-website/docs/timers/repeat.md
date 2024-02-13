---
sidebar_position: 3
---

# Repeat timer

It is a repeat timer that will delay function execution and repeat this delay execution _runCount_ times.

## Example

```ts
import { LiteRepeatTimer } from 'lite-utility/timers'

const timer1 = new LiteRepeatTimer(
  () => {
    console.log("Repeat timer1 worked " + timer1.runCount + ' times.');
  },
  5000,
  {
    instantStart: false,
    runCount: 3,
  }
);
// After start call timer will work after 5s.
timer1.start()

const timer2 = new LiteRepeatTimer(
  () => {
    console.log("Repeat timer2 worked " + timer2.runCount + ' times.');
  },
  {
    2: 10000, // 1 and 2 call after 10s.
    6: 20000, // 3 - 6 calls after 20s.
    7: 30000, // 7 call after 30s.
  },
  {
    instantStart: false,
    maxTryCount: 7,
  },
);
// After start call timer will work after 10s.
timer2.start()
```

## Constructor

```ts
constructor(
  fun: () => void, // function.
  timeMs: number | RangeTimes, // function execution delay.
  params: TimerParams, // extra params.
) {}

type TimerParams = {
  instantStart: boolean; // should first function run be instant instead of waiting timeMs delay.
  runCount: number; // the final number of function run count after the start() call.
  logError?: (...args: any[]) => void; // custom log error in fun.
};

/*
dictionary <max call count : function execution delay>
@example
{
  2: 10000, // 1 and 2 call after 10s
  6: 20000, // 3 - 6 calls after 20s
  7: 30000, // 7 call after 30s
}
*/
type RangeTimes = Record<number, number>;
```

## Fields

**runCount**: ```number``` - The function run count after the start() call.

## Methods

**start**(): ```void``` - Start timer.

:::warning

If you call start many times instead of restarting, it will lead to the loss of previous function execution control and possible logic errors.

:::

**stop**(): ```void``` - Stop timer.

**restart**(): ```void``` - Restart timer.
 