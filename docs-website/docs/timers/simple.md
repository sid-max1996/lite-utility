---
sidebar_position: 1
---

# Simple timer

It is a simple timer to delay function execution by some time in milliseconds.

```js
import { LiteTimer } from 'lite-utility/timers'

const timer = new LiteTimer(() => {
  console.log('Simple timer worked')
}, 5000)
// After start call timer will work after 5s
timer.start()
```

## Methods

**start()** - Start timer

**stop()** - Stop timer

**restart()** - Restart timer
 



