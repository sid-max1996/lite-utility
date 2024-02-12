---
sidebar_position: 2
---

# Retry timer

It is a retry timer that will delay function execution and repeat this delay execution until the function is called without error or reaches the _maxTryCount_ limit.

```js
import { LiteRetryTimer } from 'lite-utility/timers'

const timer1 = new LiteRetryTimer(
  () => {
    console.log("Retry timer1 worked");
  },
  5000,
  {
    instantStart: false,
    maxTryCount: 3,
  }
);
// After start call timer will work after 5s
timer1.start()

const timer2 = new LiteRetryTimer(
  () => {
    console.log("Retry timer2 worked");
  },
  {
    2: 10000, // 1 and 2 call after 10s
    6: 20000, // 3 - 6 calls after 20s
    7: 30000, // 7 call after 30s
  },
  {
    instantStart: false,
    maxTryCount: 7,
  },
);
// After start call timer will work after 10s
timer2.start()
```

## Constructor

```ts
constructor(
  fun: () => void, // function
  timeMs: number | RangeTimes, // function execution delay
  params: TimerParams, // extra params
) {}

type TimerParams = {
  instantStart: boolean; // should first function run be instant instead of waiting timeMs delay
  maxTryCount: number; // the max posible function run count after the start() call
  logError?: (...args: any[]) => void; // custom log error in fun
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

**runCount**: _number_ - The function run count after the start() call

## Methods

**start()**: _void_ - Start timer

:::warning

If you call start many times instead of restarting, it will lead to the loss of previous function execution control and possible logic errors.

:::

**stop()**: _void_ - Stop timer

**restart()**: _void_ - Restart timer
 